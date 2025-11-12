"""Pricing recommendation module."""

from __future__ import annotations

import logging
from typing import Dict, Sequence

from ..utils.browser import SeleniumBrowser
from ..utils.parser import parse_pricing

LOGGER = logging.getLogger(__name__)


def get_pricing_strategy(
    cost: float,
    target_profit_pct: int,
    competitors: Sequence[str] | None,
    *,
    headless: bool = True,
    retries: int = 2,
) -> Dict[str, str]:
    """Generate a pricing strategy recommendation based on inputs."""
    if cost <= 0:
        raise ValueError("Cost must be a positive number")
    if target_profit_pct <= 0:
        raise ValueError("Target profit percentage must be positive")

    competitor_list = [comp.strip() for comp in (competitors or []) if comp and comp.strip()]

    last_error: Exception | None = None
    for attempt in range(1, retries + 2):
        try:
            with SeleniumBrowser(headless=headless) as browser:
                browser.open_cto_new()
                browser.send_prompt(_build_prompt(cost, target_profit_pct, competitor_list))
                response = browser.extract_response()
            return parse_pricing(response)
        except Exception as exc:  # pragma: no cover - dependent on live service
            last_error = exc
            LOGGER.exception("Pricing advisor attempt %s failed", attempt)
    raise RuntimeError("Unable to obtain pricing strategy via cto.new") from last_error


def _build_prompt(cost: float, target_profit_pct: int, competitors: Sequence[str]) -> str:
    competitor_section = "\n".join(f"- {comp}" for comp in competitors) or "- None provided"
    return (
        "You are BizAutoGen's pricing strategist.\n"
        "Evaluate the product economics and craft a pricing recommendation.\n\n"
        f"Production Cost per Unit: ${cost:.2f}\n"
        f"Target Profit Margin: {target_profit_pct}%\n"
        "Competitors:\n"
        f"{competitor_section}\n\n"
        "Respond with clear headings including Recommended Price, Pricing Strategy, and Rationale.\n"
        "Quote a specific price (or range) and justify it considering cost-plus and competitive positioning.\n"
    )
