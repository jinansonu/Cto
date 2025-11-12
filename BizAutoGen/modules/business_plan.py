"""Business plan generation module."""

from __future__ import annotations

import logging
from typing import Sequence

from ..utils.browser import SeleniumBrowser
from ..utils.parser import parse_plan

LOGGER = logging.getLogger(__name__)


def generate_business_plan(
    business_name: str,
    goals: Sequence[str],
    *,
    headless: bool = True,
    retries: int = 2,
) -> str:
    """Generate a comprehensive business plan document."""
    if not business_name or not business_name.strip():
        raise ValueError("Business name must be provided")
    goal_items = [goal.strip() for goal in goals if goal and goal.strip()]
    if not goal_items:
        raise ValueError("At least one business goal must be supplied")

    last_error: Exception | None = None
    for attempt in range(1, retries + 2):
        try:
            with SeleniumBrowser(headless=headless) as browser:
                browser.open_cto_new()
                browser.send_prompt(_build_prompt(business_name, goal_items))
                response = browser.extract_response()
            return parse_plan(response)
        except Exception as exc:  # pragma: no cover - relies on live interaction
            last_error = exc
            LOGGER.exception("Business plan attempt %s failed", attempt)
    raise RuntimeError("Unable to build business plan via cto.new") from last_error


def _build_prompt(business_name: str, goals: Sequence[str]) -> str:
    goal_section = "\n".join(f"- {goal}" for goal in goals)
    return (
        "You are BizAutoGen, a world-class business consultant.\n"
        "Create a concise but comprehensive business plan using the structure below.\n\n"
        f"Business Name: {business_name.strip()}\n"
        "Primary Goals:\n"
        f"{goal_section}\n\n"
        "Respond with clearly labelled sections including Executive Summary, Market Analysis, Product/Service Offering, Marketing Strategy, Operations Plan, Financial Projections, and Key Milestones.\n"
        "Each section should contain 2-4 sentences or bullet points with actionable detail.\n"
    )
