"""Parsing utilities for BizAutoGen responses."""

from __future__ import annotations

import re
from typing import Dict, List, Optional


def clean_output(text: str) -> str:
    """Normalise whitespace and line endings in AI responses."""
    if not text:
        return ""
    normalised = text.replace("\r\n", "\n").replace("\r", "\n")
    normalised = re.sub(r"[\t ]+$", "", normalised, flags=re.MULTILINE)
    normalised = re.sub(r"\n{3,}", "\n\n", normalised)
    return normalised.strip()


def parse_swot(raw_text: str) -> Dict[str, object]:
    """Parse SWOT analysis, market potential, and recommendations."""
    text = clean_output(raw_text)
    swot = {
        "strengths": _extract_list_section(text, ("Strengths",)),
        "weaknesses": _extract_list_section(text, ("Weaknesses", "Limitations")),
        "opportunities": _extract_list_section(text, ("Opportunities",)),
        "threats": _extract_list_section(text, ("Threats", "Risks")),
    }
    market_potential = _extract_paragraph_section(text, ("Market Potential", "Market Outlook"))
    recommendations = _extract_list_section(text, ("Recommendations", "Next Steps", "Action Items"))

    # Ensure defaults when sections are missing.
    for key, default in swot.items():
        if not default and text:
            swot[key] = _fallback_list(text)

    return {
        "swot": swot,
        "market_potential": market_potential or text,
        "recommendations": recommendations[:3] if recommendations else _fallback_list(text)[:3],
    }


def parse_marketing(raw_text: str) -> Dict[str, str]:
    """Parse marketing content into ad copy, social caption, and blog intro."""
    text = clean_output(raw_text)
    return {
        "ad_copy": _extract_paragraph_section(text, ("Ad Copy", "Advertisement", "Promo")) or text,
        "social_caption": _extract_paragraph_section(text, ("Social Caption", "Social Media Caption", "Caption")) or text,
        "blog_intro": _extract_paragraph_section(text, ("Blog Intro", "Blog Introduction", "Article Intro")) or text,
    }


def parse_pricing(raw_text: str) -> Dict[str, str]:
    """Parse pricing recommendation details."""
    text = clean_output(raw_text)
    recommended_price = _extract_value(text, ("Recommended Price", "Target Price", "Price Point"))
    strategy = _extract_paragraph_section(text, ("Strategy", "Pricing Strategy", "Approach"))
    rationale = _extract_paragraph_section(text, ("Rationale", "Justification", "Why"))

    return {
        "recommended_price": recommended_price or "Pending further analysis",
        "strategy": strategy or text,
        "rationale": rationale or text,
    }


def parse_plan(raw_text: str) -> str:
    """Return a cleaned business plan document."""
    return clean_output(raw_text)


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------


def _extract_section(text: str, headings: tuple[str, ...]) -> Optional[str]:
    pattern = r"|".join(re.escape(heading) for heading in headings)
    regex = re.compile(rf"(?:^|\n)(?:{pattern})\s*:?(.*?)(?=\n[A-Z][^\n]*:|\Z)", re.IGNORECASE | re.DOTALL)
    match = regex.search(text)
    if not match:
        return None
    return clean_output(match.group(1))


def _extract_list_section(text: str, headings: tuple[str, ...]) -> List[str]:
    section = _extract_section(text, headings)
    if not section:
        return []
    items: List[str] = []
    for line in section.splitlines():
        cleaned = line.strip()
        if not cleaned:
            continue
        cleaned = re.sub(r"^[\-*•\d\.\)\(]+\s*", "", cleaned)
        if cleaned:
            items.append(cleaned)
    return items


def _extract_paragraph_section(text: str, headings: tuple[str, ...]) -> Optional[str]:
    section = _extract_section(text, headings)
    if not section:
        return None
    return section


def _extract_value(text: str, headings: tuple[str, ...]) -> Optional[str]:
    regex = re.compile(rf"(?:^|\n)({'|'.join(re.escape(h) for h in headings)})\s*:?\s*(.+)", re.IGNORECASE)
    match = regex.search(text)
    if match:
        return match.group(2).strip()
    return None


def _fallback_list(text: str) -> List[str]:
    """Provide a fallback list by taking the first few sentences."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [sentence.strip() for sentence in sentences if sentence.strip()][:3]
