"""Selenium browser utilities for interacting with cto.new."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import List, Optional, Sequence

from selenium import webdriver
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver import ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager

LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class _Selector:
    by: str
    value: str


class SeleniumBrowser:
    """Wrapper around Selenium WebDriver tailored for cto.new interactions."""

    CTO_NEW_URL = "https://cto.new/"
    PROMPT_SELECTORS: Sequence[_Selector] = (
        _Selector(By.CSS_SELECTOR, "textarea[data-testid='prompt-input']"),
        _Selector(By.CSS_SELECTOR, "textarea[placeholder*='Enter']"),
        _Selector(By.CSS_SELECTOR, "textarea#prompt"),
        _Selector(By.TAG_NAME, "textarea"),
    )
    SUBMIT_SELECTORS: Sequence[_Selector] = (
        _Selector(By.CSS_SELECTOR, "button[data-testid='send-button']"),
        _Selector(By.CSS_SELECTOR, "button[type='submit']"),
        _Selector(By.XPATH, "//button[contains(translate(., 'RUN', 'run'), 'run')]"),
        _Selector(By.XPATH, "//button[contains(translate(., 'SEND', 'send'), 'send')]"),
        _Selector(By.XPATH, "//button[contains(., 'Generate')]"),
    )
    RESPONSE_SELECTORS: Sequence[_Selector] = (
        _Selector(By.CSS_SELECTOR, "[data-testid='response-output']"),
        _Selector(By.CSS_SELECTOR, "div.markdown"),
        _Selector(By.CSS_SELECTOR, "article"),
        _Selector(By.CSS_SELECTOR, "pre"),
        _Selector(By.CSS_SELECTOR, "div[class*='response']"),
    )

    def __init__(
        self,
        headless: bool = False,
        browser: str = "chrome",
        timeout: int = 60,
    ) -> None:
        self.headless = headless
        self.browser = browser.lower()
        self.timeout = timeout
        self._driver = self._initialise_driver()
        self._wait = WebDriverWait(self._driver, timeout)
        self._previous_response_snapshot: List[str] = []
        LOGGER.debug(
            "Initialized SeleniumBrowser (browser=%s, headless=%s)",
            self.browser,
            headless,
        )

    def __enter__(self) -> "SeleniumBrowser":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    def _initialise_driver(self) -> webdriver.Remote:
        LOGGER.debug("Setting up WebDriver for browser '%s'", self.browser)
        if self.browser == "edge":
            options = EdgeOptions()
            options.use_chromium = True
            if self.headless:
                options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            service = EdgeService(EdgeChromiumDriverManager().install())
            driver = webdriver.Edge(service=service, options=options)
        else:
            options = ChromeOptions()
            if self.headless:
                options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--window-size=1440,900")
            service = ChromeService(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
        driver.set_page_load_timeout(self.timeout)
        return driver

    def open_cto_new(self) -> None:
        """Navigate to cto.new and wait for the prompt input to be ready."""
        LOGGER.info("Opening cto.new")
        self._driver.get(self.CTO_NEW_URL)
        self._wait_for_prompt()
        self._previous_response_snapshot = self._collect_response_texts()

    def send_prompt(self, prompt: str, wait_time: Optional[int] = None) -> None:
        """Send a prompt to cto.new and wait for the request to start processing."""
        if not prompt.strip():
            raise ValueError("Prompt cannot be empty")

        wait = WebDriverWait(self._driver, wait_time or self.timeout)
        self._wait_for_prompt(wait=wait)
        prompt_area = self._locate_first_visible(self.PROMPT_SELECTORS)
        if prompt_area is None:
            raise TimeoutException("Prompt input could not be located on cto.new")

        self._previous_response_snapshot = self._collect_response_texts()
        LOGGER.debug("Sending prompt (%s characters)", len(prompt))
        prompt_area.clear()
        prompt_area.send_keys(prompt)

        if not self._click_submit_button(wait):
            LOGGER.debug("Falling back to keyboard submission")
            key_combinations = (
                (Keys.CONTROL, Keys.RETURN),
                (Keys.CONTROL, Keys.ENTER),
                (Keys.COMMAND, Keys.RETURN),
            )
            for combo in key_combinations:
                try:
                    prompt_area.send_keys(*combo)
                except Exception:  # pragma: no cover - defensive fallback
                    LOGGER.debug("Key combination %s failed during submission", combo)
            prompt_area.send_keys(Keys.ENTER)

        wait.until(self._response_started())

    def extract_response(self, wait_time: Optional[int] = None) -> str:
        """Extract the latest response text from cto.new."""
        wait = WebDriverWait(self._driver, wait_time or self.timeout)
        try:
            response_text = wait.until(self._response_ready())
        except TimeoutException as exc:  # pragma: no cover - depends on live site
            LOGGER.error("Timed out waiting for response from cto.new")
            raise exc
        LOGGER.debug("Received response with %s characters", len(response_text))
        return response_text

    def close(self) -> None:
        """Close the browser session."""
        if getattr(self, "_driver", None):
            try:
                self._driver.quit()
            except WebDriverException:  # pragma: no cover - defensive cleanup
                LOGGER.warning("Failed to quit WebDriver cleanly", exc_info=True)
            finally:
                self._driver = None

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _wait_for_prompt(self, wait: Optional[WebDriverWait] = None) -> None:
        (wait or self._wait).until(self._prompt_available())

    def _prompt_available(self):
        def _condition(driver):
            element = self._locate_first_visible(self.PROMPT_SELECTORS)
            return element if element is not None else False

        return _condition

    def _response_started(self):
        def _condition(driver):
            current_snapshot = self._collect_response_texts()
            return current_snapshot != self._previous_response_snapshot

        return _condition

    def _response_ready(self):
        def _condition(driver):
            current_texts = self._collect_response_texts()
            for text in current_texts:
                if text and text not in self._previous_response_snapshot:
                    return text
            return False

        return _condition

    def _locate_first_visible(self, selectors: Sequence[_Selector]):
        for selector in selectors:
            elements = self._driver.find_elements(selector.by, selector.value)
            for element in elements:
                if element.is_displayed() and element.is_enabled():
                    return element
        return None

    def _click_submit_button(self, wait: WebDriverWait) -> bool:
        for selector in self.SUBMIT_SELECTORS:
            try:
                button = wait.until(EC.element_to_be_clickable((selector.by, selector.value)))
                button.click()
                return True
            except TimeoutException:
                continue
        return False

    def _collect_response_texts(self) -> List[str]:
        texts: List[str] = []
        for selector in self.RESPONSE_SELECTORS:
            elements = self._driver.find_elements(selector.by, selector.value)
            for element in elements:
                if not element.is_displayed():
                    continue
                text = element.text.strip()
                if text:
                    texts.append(text)
        return texts
