from pages.base_page import BasePage


class HomePage(BasePage):
    def open_page(self):
        self.open("/")

    def search(self, value):
        self.type_testid("products-search-input", value)
        self.click_testid("products-filter-button")

    def add_first_product_to_cart(self):
        self.click_testid("product-add-cart-1")

    def open_first_product_view(self):
        self.click_testid("product-view-1")
