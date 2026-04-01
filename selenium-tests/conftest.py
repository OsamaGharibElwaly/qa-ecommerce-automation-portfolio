import os
from datetime import datetime

import pytest
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.firefox.service import Service as FirefoxService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager

load_dotenv()


def _is_headless():
    return os.getenv("HEADLESS", "true").lower() == "true"


def _browser_name():
    return os.getenv("BROWSER", "chrome").lower()


@pytest.fixture(scope="session")
def base_url():
    return os.getenv("BASE_URL", "http://localhost:3001")


@pytest.fixture(scope="session")
def api_url():
    return os.getenv("API_URL", "http://localhost:5000/api")


@pytest.fixture
def driver():
    browser = _browser_name()
    headless = _is_headless()

    if browser == "firefox":
        options = FirefoxOptions()
        if headless:
            options.add_argument("--headless")
        web_driver = webdriver.Firefox(
            service=FirefoxService(GeckoDriverManager().install()),
            options=options,
        )
    else:
        options = ChromeOptions()
        options.add_argument("--window-size=1440,900")
        options.add_argument("--disable-gpu")
        if headless:
            options.add_argument("--headless=new")
        web_driver = webdriver.Chrome(
            service=ChromeService(ChromeDriverManager().install()),
            options=options,
        )

    web_driver.implicitly_wait(6)
    yield web_driver
    web_driver.quit()


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item):
    outcome = yield
    report = outcome.get_result()
    setattr(item, f"rep_{report.when}", report)


@pytest.fixture(autouse=True)
def screenshot_on_failure(request, driver):
    yield
    if request.node.rep_call.failed:
        os.makedirs("reports/screenshots", exist_ok=True)
        name = request.node.name.replace("/", "_").replace(" ", "_")
        stamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        driver.save_screenshot(f"reports/screenshots/{name}-{stamp}.png")
