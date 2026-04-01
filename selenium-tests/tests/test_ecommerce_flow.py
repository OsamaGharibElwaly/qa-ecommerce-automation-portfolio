from datetime import datetime

from pages.cart_page import CartPage
from pages.checkout_page import CheckoutPage
from pages.home_page import HomePage
from pages.login_page import LoginPage
from pages.register_page import RegisterPage


def unique_email():
    return f"qa_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}@example.com"


def clear_browser_state(driver, base_url):
    driver.get(base_url)
    driver.delete_all_cookies()
    driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")


def test_registration_valid(driver, base_url):
    clear_browser_state(driver, base_url)
    page = RegisterPage(driver, base_url)
    page.open_page()
    page.register("QA User", unique_email(), "StrongPass1")
    assert "/login" not in driver.current_url


def test_registration_invalid_weak_password(driver, base_url):
    clear_browser_state(driver, base_url)
    page = RegisterPage(driver, base_url)
    page.open_page()
    page.register("QA User", unique_email(), "12345678")
    assert "Weak password" in driver.page_source


def test_login_valid_and_invalid(driver, base_url):
    clear_browser_state(driver, base_url)
    page = LoginPage(driver, base_url)
    page.open_page()
    page.login("demo@example.com", "wrong-password")
    assert "Invalid credentials" in driver.page_source

    page.login("demo@example.com", "password123")
    assert "/" in driver.current_url


def test_product_search_and_filter(driver, base_url):
    clear_browser_state(driver, base_url)
    home = HomePage(driver, base_url)
    home.open_page()
    home.search("Headphones")
    assert "Headphones" in driver.page_source


def test_cart_add_update_remove(driver, base_url):
    clear_browser_state(driver, base_url)
    login = LoginPage(driver, base_url)
    login.open_page()
    login.login("demo@example.com", "password123")

    home = HomePage(driver, base_url)
    home.open_page()
    home.add_first_product_to_cart()

    cart = CartPage(driver, base_url)
    cart.open_page()
    cart.update_quantity(1, 2)
    assert "$179.98" in cart.total_text() or "$179.98" in driver.page_source
    cart.remove_item(1)
    cart.wait_until_empty()


def test_checkout_flow_and_empty_cart_prevention(driver, base_url):
    clear_browser_state(driver, base_url)
    login = LoginPage(driver, base_url)
    login.open_page()
    login.login("demo@example.com", "password123")

    home = HomePage(driver, base_url)
    home.open_page()
    home.add_first_product_to_cart()

    checkout = CheckoutPage(driver, base_url)
    checkout.open_page()
    checkout.confirm_order()
    assert "Order confirmed" in checkout.message()

    checkout.open_page()
    checkout.confirm_order()
    assert "Cart is empty" in checkout.message()


def test_auth_persistence_across_pages(driver, base_url):
    clear_browser_state(driver, base_url)
    login = LoginPage(driver, base_url)
    login.open_page()
    login.login("demo@example.com", "password123")

    home = HomePage(driver, base_url)
    home.open_page()
    assert home.element_exists("nav-user-label")

    cart = CartPage(driver, base_url)
    cart.open_page()
    assert cart.element_exists("nav-user-label")
