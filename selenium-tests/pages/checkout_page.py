from pages.base_page import BasePage


class CheckoutPage(BasePage):
    def open_page(self):
        self.open("/checkout")

    def confirm_order(self):
        self.click_testid("checkout-confirm-button")

    def message(self):
        return self.text_testid("checkout-message")
