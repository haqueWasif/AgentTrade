import re
from copy import deepcopy


FOREX_LEVEL_PATTERN = re.compile(r"\b\d\.\d{3,6}\b")


def as_float(value):
    try:
        if value is None or value == "":
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def format_level(value, decimals=5):
    number = as_float(value)

    if number is None:
        return None

    return f"{number:.{decimals}f}".rstrip("0").rstrip(".")


def get_snapshot(market_context):
    if not isinstance(market_context, dict):
        return {}

    snapshot = market_context.get("snapshot") or {}

    if not isinstance(snapshot, dict):
        return {}

    return snapshot


def get_allowed_levels(market_context):
    snapshot = get_snapshot(market_context)

    level_keys = [
        "current_price",
        "day_open",
        "day_high",
        "day_low",
        "day_close",
        "previous_day_high",
        "previous_day_low",
        "recent_swing_high",
        "recent_swing_low",
        "buy_side_liquidity",
        "sell_side_liquidity",
    ]

    allowed = {}

    for key in level_keys:
      value = snapshot.get(key)
      numeric = as_float(value)

      if numeric is not None:
          allowed[key] = numeric

    return allowed


def get_allowed_level_strings(market_context):
    allowed = get_allowed_levels(market_context)
    strings = set()

    for value in allowed.values():
        for decimals in [3, 4, 5, 6]:
            formatted = format_level(value, decimals=decimals)
            if formatted:
                strings.add(formatted)

    return strings


def exact_levels_available(market_context):
    snapshot = get_snapshot(market_context)

    freshness = snapshot.get("data_freshness")
    liquidity_source = snapshot.get("liquidity_source")

    if freshness != "fresh":
        return False

    if liquidity_source != "intraday_candles":
        return False

    required = [
        snapshot.get("current_price"),
        snapshot.get("buy_side_liquidity"),
        snapshot.get("sell_side_liquidity"),
    ]

    return all(as_float(value) is not None for value in required)


def contains_unapproved_forex_levels(text, market_context):
    if not text:
        return False, []

    allowed_strings = get_allowed_level_strings(market_context)
    found = FOREX_LEVEL_PATTERN.findall(str(text))

    unapproved = []

    for level in found:
        normalized = format_level(level, decimals=5)

        if normalized not in allowed_strings and level not in allowed_strings:
            unapproved.append(level)

    return bool(unapproved), sorted(set(unapproved))


def sanitize_text(text, market_context):
    if not isinstance(text, str):
        return text

    has_bad_levels, bad_levels = contains_unapproved_forex_levels(text, market_context)

    if not has_bad_levels:
        return text

    cleaned = text

    for level in bad_levels:
        cleaned = cleaned.replace(
            level,
            "[removed: ungrounded level]",
        )

    return cleaned


def sanitize_nested(value, market_context):
    if isinstance(value, str):
        return sanitize_text(value, market_context)

    if isinstance(value, list):
        return [sanitize_nested(item, market_context) for item in value]

    if isinstance(value, dict):
        return {
            key: sanitize_nested(item, market_context)
            for key, item in value.items()
        }

    return value


def level_or_unavailable(snapshot, key):
    value = snapshot.get(key)
    formatted = format_level(value)

    return formatted if formatted is not None else "unavailable"


def enforce_grounded_report(report, market_context):
    """
    Makes sure the final report cannot display AI-invented market levels.
    This runs AFTER OpenRouter/web-search AI returns JSON.
    """

    if not isinstance(report, dict):
        report = {}

    report = deepcopy(report)
    snapshot = get_snapshot(market_context)

    freshness = snapshot.get("data_freshness", "missing")
    provider = snapshot.get("provider") or "unavailable"
    timestamp = snapshot.get("timestamp") or "unavailable"

    current_price = level_or_unavailable(snapshot, "current_price")
    bsl = level_or_unavailable(snapshot, "buy_side_liquidity")
    ssl = level_or_unavailable(snapshot, "sell_side_liquidity")
    pdh = level_or_unavailable(snapshot, "previous_day_high")
    pdl = level_or_unavailable(snapshot, "previous_day_low")
    day_high = level_or_unavailable(snapshot, "day_high")
    day_low = level_or_unavailable(snapshot, "day_low")

    levels_available = exact_levels_available(market_context)

    report["data_status"] = {
        "freshness": freshness,
        "source": provider,
        "timestamp": timestamp,
        "warning": (
            "Exact levels are grounded in fresh MarketSnapshot data."
            if levels_available
            else (
                "Exact liquidity levels are unavailable because the candle data "
                "is stale, missing, or incomplete. Use current price only."
            )
        ),
    }

    report["current_data"] = {
        "symbol": snapshot.get("symbol") or market_context.get("symbol") or "unknown",
        "current_price": current_price,
        "buy_side_liquidity": bsl,
        "sell_side_liquidity": ssl,
        "previous_day_high": pdh,
        "previous_day_low": pdl,
    }

    technical = report.get("technical_analysis") or {}
    if not isinstance(technical, dict):
        technical = {}

    technical["support"] = [
        f"Previous day low: {pdl}",
        f"Session/day low: {day_low}",
        f"Nearest sell-side liquidity: {ssl}",
    ]

    technical["resistance"] = [
        f"Previous day high: {pdh}",
        f"Session/day high: {day_high}",
        f"Nearest buy-side liquidity: {bsl}",
    ]

    report["technical_analysis"] = technical

    smc = report.get("smart_money_analysis") or {}
    if not isinstance(smc, dict):
        smc = {}

    smc["sell_side_liquidity_ssl"] = ssl
    smc["buy_side_liquidity_bsl"] = bsl
    smc["liquidity_zones"] = [
        f"BSL: {bsl}",
        f"SSL: {ssl}",
        f"PDH: {pdh}",
        f"PDL: {pdl}",
    ]

    if not levels_available:
        smc["ict_notes"] = [
            "Exact SMC/ICT levels are unavailable or incomplete because market data is not fully grounded.",
            "Wait for fresh market data before using liquidity levels.",
        ]

    report["smart_money_analysis"] = smc

    # Remove any remaining unapproved numeric forex levels from all AI text fields.
    report = sanitize_nested(report, market_context)

    return report


def build_grounded_level_table(market_context):
    snapshot = get_snapshot(market_context)

    return {
        "symbol": snapshot.get("symbol") or market_context.get("symbol") or "unknown",
        "freshness": snapshot.get("data_freshness", "missing"),
        "provider": snapshot.get("provider") or "unavailable",
        "timestamp": snapshot.get("timestamp") or "unavailable",
        "current_price": level_or_unavailable(snapshot, "current_price"),
        "buy_side_liquidity": level_or_unavailable(snapshot, "buy_side_liquidity"),
        "sell_side_liquidity": level_or_unavailable(snapshot, "sell_side_liquidity"),
        "previous_day_high": level_or_unavailable(snapshot, "previous_day_high"),
        "previous_day_low": level_or_unavailable(snapshot, "previous_day_low"),
        "day_high": level_or_unavailable(snapshot, "day_high"),
        "day_low": level_or_unavailable(snapshot, "day_low"),
    }


def enforce_grounded_chat_answer(answer, market_context):
    """
    Prevents copilot from returning made-up forex levels.
    If the answer contains an unapproved price-like level, we replace it with
    a safe grounded response.
    """

    has_bad_levels, bad_levels = contains_unapproved_forex_levels(answer, market_context)

    if not has_bad_levels:
        return answer

    table = build_grounded_level_table(market_context)

    return f"""
## Grounding Guard Triggered

The AI response included price levels that were **not present in the stored MarketSnapshot**, so AgentTrade removed that answer to prevent ungrounded analysis.

### Approved Grounded Levels

| Field | Value |
|---|---:|
| Symbol | {table["symbol"]} |
| Data Freshness | {table["freshness"]} |
| Provider | {table["provider"]} |
| Timestamp | {table["timestamp"]} |
| Current Price | {table["current_price"]} |
| Buy-Side Liquidity | {table["buy_side_liquidity"]} |
| Sell-Side Liquidity | {table["sell_side_liquidity"]} |
| Previous Day High | {table["previous_day_high"]} |
| Previous Day Low | {table["previous_day_low"]} |
| Day High | {table["day_high"]} |
| Day Low | {table["day_low"]} |

### Removed Ungrounded Levels

{", ".join(bad_levels)}

### Safe Rule

AgentTrade will only show exact SSL, BSL, support, resistance, current price, PDH, or PDL when those values come from the backend `MarketSnapshot`.

$Risk = AccountSize \\times RiskPercent$
""".strip()