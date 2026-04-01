from pages.base_page import BasePage


class LoginPage(BasePage):
    def open_page(self):
        self.open("/login")

    def login(self, email, password):
        self.type_testid("login-email-input", email)
        self.type_testid("login-password-input", password)
        self.click_testid("login-submit-button")
