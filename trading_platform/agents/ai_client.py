import json
import re
from typing import Any, Dict, List, Optional

import requests
from django.conf import settings
from django.utils import timezone


DEFAULT_WEB_SEARCH_URL = "https://iyjzibfpgvzlwvsjhvnr.supabase.co/functions/v1/web-search"
DEFAULT_MODEL = "google/gemini-3-flash-preview"


def current_utc_date() -> str:
    return timezone.now().strftime("%Y-%m-%d")


def extract_json_from_text(text: str) -> Optional[Dict[str, Any]]:
    if not text:
        return None

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return None

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def looks_stale_market_answer(text: str) -> bool:
    if not text:
        return True

    lower = text.lower()
    today_year = timezone.now().year

    stale_phrases = [
        "as of november 11, 2024",
        "as of nov 11, 2024",
        "as of 2024",
        "november 2024",
        "2024",
    ]

    if any(phrase in lower for phrase in stale_phrases):
        return True

    years = re.findall(r"\b(20\d{2})\b", text)
    for year in years:
        if int(year) < today_year:
            return True

    return False


class WebSearchClient:
    def __init__(self):
        self.url = getattr(settings, "WEB_SEARCH_URL", DEFAULT_WEB_SEARCH_URL)
        self.api_key = getattr(settings, "WEB_SEARCH_API_KEY", "")
        self.model = getattr(settings, "WEB_SEARCH_MODEL", DEFAULT_MODEL)

    def is_configured(self):
        return bool(self.api_key)

    def search(self, query: str, model: Optional[str] = None) -> Dict[str, Any]:
        if not query:
            return {
                "ok": False,
                "answer": "",
                "error": "Missing search query.",
            }

        if not self.api_key:
            return {
                "ok": False,
                "answer": "",
                "error": "WEB_SEARCH_API_KEY is missing in backend .env.",
            }

        try:
            response = requests.post(
                self.url,
                headers={
                    "x-api-key": self.api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "query": query,
                    "model": model or self.model,
                },
                timeout=45,
            )

            response.raise_for_status()
            data = response.json()

            return {
                "ok": True,
                "answer": data.get("answer", ""),
                "raw": data,
                "error": "",
            }

        except requests.RequestException as exc:
            return {
                "ok": False,
                "answer": "",
                "error": str(exc),
            }

        except ValueError:
            return {
                "ok": False,
                "answer": "",
                "error": "Web-search API returned invalid JSON.",
            }

    def search_fresh_market_context(self, symbol: str, extra_query: str = "") -> Dict[str, Any]:
        today = current_utc_date()

        strict_query = f"""
Today is {today} UTC.

Find CURRENT, live or most recent market information for {symbol}.

Requirements:
- Use information from today or the most recent available market session.
- Do not use 2024 or old historical snapshots unless explicitly comparing history.
- Include the timestamp/date of every price or market claim.
- If current data is unavailable, say current data is unavailable.
- Focus on current price, 24h range, trend, volume/liquidity, catalysts, support/resistance, and risks.

Additional user context:
{extra_query}
"""

        first = self.search(strict_query)

        if first.get("ok") and not looks_stale_market_answer(first.get("answer", "")):
            return first

        retry_query = f"""
Today is {today} UTC.

The previous result may have been stale. Search again for ONLY current {symbol} market data.

Hard rules:
- Do NOT answer with November 2024, 2024, or old market snapshots.
- Do NOT claim a price unless the source is current or dated today/recent session.
- Return a current timestamp/date.
- If current data cannot be found, clearly say that.

Query:
current {symbol} price today {today} UTC latest market analysis live
"""

        retry = self.search(retry_query)

        if retry.get("ok"):
            retry["was_retry"] = True
            retry["previous_answer_rejected_as_stale"] = first.get("answer", "")
            return retry

        return first


class OpenRouterClient:
    def __init__(self):
        self.url = "https://openrouter.ai/api/v1/chat/completions"
        self.api_key = getattr(settings, "OPENROUTER_API_KEY", "")
        self.model = getattr(settings, "OPENROUTER_MODEL", DEFAULT_MODEL)

    def is_configured(self):
        return bool(self.api_key)

    def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 1800,
    ) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "ok": False,
                "content": "",
                "error": "OPENROUTER_API_KEY is missing.",
            }

        try:
            response = requests.post(
                self.url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "AgentTrade",
                },
                json={
                    "model": model or self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
                timeout=75,
            )

            response.raise_for_status()
            data = response.json()

            content = (
                data.get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
            )

            return {
                "ok": True,
                "content": content,
                "raw": data,
                "error": "",
            }

        except requests.RequestException as exc:
            return {
                "ok": False,
                "content": "",
                "error": str(exc),
            }

        except ValueError:
            return {
                "ok": False,
                "content": "",
                "error": "OpenRouter returned invalid JSON.",
            }


def fallback_report(local_results, web_answer=""):
    signals = [
        result.get("signal")
        for result in local_results
        if result.get("signal")
    ]

    buy_count = signals.count("buy")
    sell_count = signals.count("sell")

    if buy_count > sell_count:
        recommendation = "buy"
        confidence = min(72 + buy_count * 5, 92)
    elif sell_count > buy_count:
        recommendation = "sell"
        confidence = min(72 + sell_count * 5, 92)
    else:
        recommendation = "neutral"
        confidence = 55

    return {
        "recommendation": recommendation,
        "confidence": confidence,
        "thesis": "Generated from local trading agents and available fresh-market context.",
        "risks": [
            "Fresh AI synthesis may be limited if providers are unavailable.",
            "Market conditions can change quickly.",
            "Confirm current price, liquidity, and risk manually before trading.",
        ],
        "invalidation": "The idea is invalidated if trend, sentiment, or price structure contradicts the selected direction.",
        "action_plan": [
            "Review the agent signals.",
            "Check position size and maximum loss.",
            "Wait for confirmation before execution.",
        ],
        "positioning": {},
        "agent_summary": local_results,
        "web_context_summary": web_answer[:1200] if web_answer else "No web context available.",
    }