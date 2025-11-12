"""Marketing content generation module."""

from __future__ import annotations

import logging
from typing import Dict

from ..utils.browser import SeleniumBrowser
from ..utils.parser import parse_marketing

LOGGER = logging.getLogger(__name__)


def generate_marketing_content(
    product: str,
    tone: str,
    *,
    headless: bool = True,
    retries: int = 2,
) -> Dict[str, str]:
    """Generate marketing collateral for a product in a requested tone."""
    if not product or not product.strip():
        raise ValueError("Product or service name must be provided")
    if not tone or not tone.strip():
        raise ValueError("Tone must be provided")

    last_error: Exception | None = None
    for attempt in range(1, retries + 2):
        try:
            with SeleniumBrowser(headless=headless) as browser:
                browser.open_cto_new()
                browser.send_prompt(_build_prompt(product, tone))
                response = browser.extract_response()
            return parse_marketing(response)
        except Exception as exc:  # pragma: no cover - interactions are live
            last_error = exc
            LOGGER.exception("Content generator attempt %s failed", attempt)
    raise RuntimeError("Unable to generate marketing content via cto.new") from last_error


def _build_prompt(product: str, tone: str) -> str:
    clean_product = product.strip()
    clean_tone = tone.strip()
    return (
        "You are BizAutoGen's marketing specialist.\n"
        "Create compelling marketing content for the product described below.\n\n"
        f"Product or Service: {clean_product}\n"
        f"Desired Tone: {clean_tone}\n\n"
        "Respond with three clearly labelled sections and replace all placeholders with original copy:\n"
        "Ad Copy:\nProvide a short persuasive paragraph suitable for a paid advertisement.\n\n"
        "Social Caption:\nWrite a 1-2 sentence caption with an appropriate call-to-action and emoji only if it fits the tone.\n\n"
        "Blog Intro:\nCompose an engaging introductory paragraph for a blog article about the offering.\n"
    )
