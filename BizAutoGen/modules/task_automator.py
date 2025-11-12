"""Automation planning module."""

from __future__ import annotations

import logging
import re
from typing import Dict, List

from ..utils.browser import SeleniumBrowser
from ..utils.parser import clean_output

LOGGER = logging.getLogger(__name__)


def create_automation_plan(
    task_description: str,
    *,
    headless: bool = True,
    retries: int = 2,
) -> Dict[str, object]:
    """Create an automation plan and execution guide for a business task."""
    if not task_description or not task_description.strip():
        raise ValueError("Task description must be provided")

    last_error: Exception | None = None
    for attempt in range(1, retries + 2):
        try:
            with SeleniumBrowser(headless=headless) as browser:
                browser.open_cto_new()
                browser.send_prompt(_build_prompt(task_description))
                response = browser.extract_response()
            return _parse_response(response)
        except Exception as exc:  # pragma: no cover - relies on live interaction
            last_error = exc
            LOGGER.exception("Task automation attempt %s failed", attempt)
    raise RuntimeError("Unable to create automation plan via cto.new") from last_error


def _build_prompt(task_description: str) -> str:
    return (
        "You are BizAutoGen, an automation architect.\n"
        "Analyse the task description below and propose a realistic automation solution for execution within cto.new or similar browser-based tools.\n\n"
        f"Task Description:\n{task_description.strip()}\n\n"
        "Respond using the following structure, replacing all placeholders with concrete steps:\n"
        "Automation Plan:\nProvide a concise overview of the automation approach, required integrations, and expected outcomes.\n\n"
        "Step-by-Step Execution:\nList numbered steps that detail how to accomplish the automation, including human reviews where necessary.\n"
    )


def _parse_response(raw_text: str) -> Dict[str, object]:
    text = clean_output(raw_text)
    plan = _extract_section(text, "Automation Plan") or text
    steps = _extract_steps(text) or _fallback_steps(text)
    return {
        "automation_plan": plan,
        "execution_steps": steps,
    }


def _extract_section(text: str, heading: str) -> str | None:
    pattern = re.compile(rf"(?:^|\n){re.escape(heading)}\s*:?(.*?)(?=\n[A-Z][^\n]*:|\Z)", re.IGNORECASE | re.DOTALL)
    match = pattern.search(text)
    if not match:
        return None
    return clean_output(match.group(1))


def _extract_steps(text: str) -> List[str]:
    section = _extract_section(text, "Step-by-Step Execution")
    if not section:
        return []
    steps: List[str] = []
    for line in section.splitlines():
        cleaned = line.strip()
        if not cleaned:
            continue
        cleaned = re.sub(r"^[\d]+[.)]\s*", "", cleaned)
        cleaned = re.sub(r"^[\-*•]\s*", "", cleaned)
        if cleaned:
            steps.append(cleaned)
    return steps


def _fallback_steps(text: str) -> List[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [sentence.strip() for sentence in sentences if sentence.strip()][:5]
