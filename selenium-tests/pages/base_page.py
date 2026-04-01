from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class BasePage:
    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 10)

    def open(self, path=""):
        self.driver.get(f"{self.base_url}{path}")

    def click_testid(self, testid):
        self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, f"[data-testid='{testid}']"))).click()

    def type_testid(self, testid, value):
        element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"[data-testid='{testid}']")))
        element.clear()
        element.send_keys(value)

    def text_testid(self, testid):
        element = self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, f"[data-testid='{testid}']")))
        return element.text

    def element_exists(self, testid):
        elements = self.driver.find_elements(By.CSS_SELECTOR, f"[data-testid='{testid}']")
        return len(elements) > 0
