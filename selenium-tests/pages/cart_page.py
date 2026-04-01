from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from pages.base_page import BasePage


class CartPage(BasePage):
    def open_page(self):
        self.open("/cart")

    def update_quantity(self, product_id, quantity):
        input_testid = f"cart-quantity-{product_id}"
        update_testid = f"cart-update-{product_id}"
        self.type_testid(input_testid, str(quantity))
        self.click_testid(update_testid)

    def remove_item(self, product_id):
        self.click_testid(f"cart-remove-{product_id}")

    def total_text(self):
        return self.text_testid("cart-total-value")

    def wait_until_empty(self):
        self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='cart-empty-label']")))
