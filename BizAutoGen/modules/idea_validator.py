"""Business idea validation module."""

from __future__ import annotations

import logging
from typing import Dict

from ..utils.browser import SeleniumBrowser
from ..utils.parser import parse_swot

LOGGER = logging.getLogger(__name__)


def run_idea_validator(idea: str, *, headless: bool = True, retries: int = 2) -> Dict[str, object]:
    """Validate a business idea using cto.new and return structured insights."""
    if not idea or not idea.strip():
        raise ValueError("Business idea must be provided")

    last_error: Exception | None = None
    for attempt in range(1, retries + 2):
        try:
            with SeleniumBrowser(headless=headless) as browser:
                browser.open_cto_new()
                browser.send_prompt(_build_prompt(idea))
                response = browser.extract_response()
            return parse_swot(response)
        except Exception as exc:  # pragma: no cover - defensive logging for live interactions
            last_error = exc
            LOGGER.exception("Idea validator attempt %s failed", attempt)
    raise RuntimeError("Unable to complete idea validation via cto.new") from last_error


def _build_prompt(idea: str) -> str:
    clean_idea = idea.strip()
    return (
        "You are BizAutoGen, an expert business strategist.\n"
        "Analyze the business concept below and produce a concise, structured response.\n\n"
        "Business Idea:\n"
        f"{clean_idea}\n\n"
        "Respond using the exact headings and bullet format shown here, filling each line with specific insights."
        " Replace every placeholder with concrete, relevant details.\n"
        "SWOT:\n"
        "Strengths:\n- <strength insight>\n- <strength insight>\n"
        "Weaknesses:\n- <weakness insight>\n- <weakness insight>\n"
        "Opportunities:\n- <opportunity insight>\n- <opportunity insight>\n"
        "Threats:\n- <threat insight>\n- <threat insight>\n\n"
        "Market Potential:\nProvide one paragraph covering demand, market size, and growth outlook.\n\n"
        "Recommendations:\n1. <actionable recommendation>\n2. <actionable recommendation>\n3. <actionable recommendation>\n"
    )
