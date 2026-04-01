from pages.base_page import BasePage


class RegisterPage(BasePage):
    def open_page(self):
        self.open("/register")

    def register(self, name, email, password):
        self.type_testid("register-name-input", name)
        self.type_testid("register-email-input", email)
        self.type_testid("register-password-input", password)
        self.click_testid("register-submit-button")
