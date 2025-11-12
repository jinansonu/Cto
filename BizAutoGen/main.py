"""Command line interface for the BizAutoGen automation toolkit."""

from __future__ import annotations

import argparse
import logging
import sys
from typing import List

from modules import (
    create_automation_plan,
    generate_business_plan,
    generate_marketing_content,
    get_pricing_strategy,
    run_idea_validator,
)

LOGGER = logging.getLogger(__name__)


MENU_OPTIONS = {
    "1": "Run Idea Validator",
    "2": "Generate Marketing Content",
    "3": "Get Pricing Advice",
    "4": "Create Business Plan",
    "5": "Build Automation Plan",
    "q": "Quit",
}


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="BizAutoGen: automate business tasks through cto.new",
    )
    parser.add_argument(
        "--visible",
        action="store_true",
        help="Display the browser window instead of running headless",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        help="Logging level (DEBUG, INFO, WARNING, ERROR)",
    )
    return parser.parse_args(argv)


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    )


def main(argv: List[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    configure_logging(args.log_level)
    headless = not args.visible

    print("\nWelcome to BizAutoGen! Automate your business workflows using cto.new.\n")

    while True:
        try:
            _print_menu()
            choice = input("Select an option: ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting BizAutoGen. Goodbye!")
            return 0

        if choice == "q":
            print("Thanks for using BizAutoGen. Goodbye!")
            return 0
        elif choice == "1":
            _handle_idea_validator(headless)
        elif choice == "2":
            _handle_marketing_content(headless)
        elif choice == "3":
            _handle_pricing_advice(headless)
        elif choice == "4":
            _handle_business_plan(headless)
        elif choice == "5":
            _handle_automation_plan(headless)
        else:
            print("Invalid choice. Please try again.\n")


def _print_menu() -> None:
    print("Please choose an option:")
    for key in ("1", "2", "3", "4", "5", "q"):
        print(f"  {key}. {MENU_OPTIONS[key]}")


def _handle_idea_validator(headless: bool) -> None:
    try:
        idea = input("Describe your business idea: ").strip()
        print("\nValidating idea. Please wait...\n")
        result = run_idea_validator(idea, headless=headless)
        _display_swot_result(result)
    except Exception as exc:
        LOGGER.error("Idea validation failed: %s", exc)
        print(f"Error: {exc}\n")


def _display_swot_result(result: dict) -> None:
    swot = result.get("swot", {})
    print("SWOT Analysis:")
    for key in ("strengths", "weaknesses", "opportunities", "threats"):
        print(f"  {key.title()}:")
        for item in swot.get(key, []):
            print(f"    - {item}")
    print("\nMarket Potential:")
    print(f"  {result.get('market_potential', 'Not available')}")
    print("\nTop Recommendations:")
    for idx, item in enumerate(result.get("recommendations", []), start=1):
        print(f"  {idx}. {item}")
    print()


def _handle_marketing_content(headless: bool) -> None:
    try:
        product = input("Product or service name: ").strip()
        tone = input("Desired tone (e.g., professional, casual, funny): ").strip()
        print("\nGenerating marketing content. Please wait...\n")
        result = generate_marketing_content(product, tone, headless=headless)
        print("Ad Copy:\n" + result.get("ad_copy", ""))
        print("\nSocial Caption:\n" + result.get("social_caption", ""))
        print("\nBlog Intro:\n" + result.get("blog_intro", "") + "\n")
    except Exception as exc:
        LOGGER.error("Marketing content generation failed: %s", exc)
        print(f"Error: {exc}\n")


def _handle_pricing_advice(headless: bool) -> None:
    try:
        cost = float(input("Production cost per unit: $"))
        profit_pct = int(input("Target profit percentage: "))
        competitors = _collect_list("Enter a competitor (leave blank to finish)")
        print("\nGenerating pricing strategy. Please wait...\n")
        result = get_pricing_strategy(cost, profit_pct, competitors, headless=headless)
        print(f"Recommended Price: {result.get('recommended_price')}")
        print("\nPricing Strategy:\n" + result.get("strategy", ""))
        print("\nRationale:\n" + result.get("rationale", "") + "\n")
    except ValueError as exc:
        print(f"Invalid input: {exc}\n")
    except Exception as exc:
        LOGGER.error("Pricing advice failed: %s", exc)
        print(f"Error: {exc}\n")


def _handle_business_plan(headless: bool) -> None:
    try:
        name = input("Business name: ").strip()
        print("Enter business goals (leave blank when finished):")
        goals = _collect_list("Goal")
        print("\nGenerating business plan. Please wait...\n")
        plan = generate_business_plan(name, goals, headless=headless)
        print("Business Plan:\n" + plan + "\n")
    except Exception as exc:
        LOGGER.error("Business plan generation failed: %s", exc)
        print(f"Error: {exc}\n")


def _handle_automation_plan(headless: bool) -> None:
    try:
        description = input("Describe the business tasks to automate: ").strip()
        print("\nBuilding automation plan. Please wait...\n")
        result = create_automation_plan(description, headless=headless)
        print("Automation Plan:\n" + result.get("automation_plan", ""))
        print("\nExecution Steps:")
        for idx, step in enumerate(result.get("execution_steps", []), start=1):
            print(f"  {idx}. {step}")
        print()
    except Exception as exc:
        LOGGER.error("Automation planner failed: %s", exc)
        print(f"Error: {exc}\n")


def _collect_list(prompt_label: str) -> List[str]:
    items: List[str] = []
    counter = 1
    while True:
        entry = input(f"{prompt_label} #{counter}: ").strip()
        if not entry:
            break
        items.append(entry)
        counter += 1
    return items


if __name__ == "__main__":
    sys.exit(main())
