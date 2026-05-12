from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_client import (
    OpenRouterClient,
    WebSearchClient,
    extract_json_from_text,
    fallback_report,
    current_utc_date
)
from .orchestrator import Orchestrator



def safe_float(value, default):
    try:
        if value in ["", None]:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def parse_prices(value):
    if isinstance(value, list):
        parsed = []
        for item in value:
            try:
                parsed.append(float(item))
            except (TypeError, ValueError):
                pass
        return parsed

    if isinstance(value, str):
        parsed = []
        for item in value.split(","):
            try:
                parsed.append(float(item.strip()))
            except (TypeError, ValueError):
                pass
        return parsed

    return []


def default_price_series():
    return [
        101, 102.2, 103.1, 102.4, 104.5, 105.2, 106.8, 106.2, 108.7, 109.4,
        111.2, 110.1, 112.8, 114.3, 113.7, 116.2, 117.4, 116.8, 119.6, 121.2
    ]


def risk_percent_from_profile(profile):
    mapping = {
        "conservative": 0.005,
        "balanced": 0.01,
        "aggressive": 0.02,
        "prop-style": 0.005,
    }
    return mapping.get(str(profile).lower(), 0.01)




def build_context(data):
    symbol = data.get("symbol") or "BTC/USD"
    asset_class = data.get("asset_class") or data.get("market_type") or "crypto"

    strategy_frameworks = data.get("strategy_frameworks") or [
        "technical-analysis",
        "fundamentals",
        "smart-money-concepts",
        "ict-liquidity",
        "risk-model",
        "trade-journal-review",
    ]

    if isinstance(strategy_frameworks, str):
        strategy_frameworks = [strategy_frameworks]

    research_goal = data.get("research_goal") or (
        f"Build a professional multi-framework trading plan for {symbol}."
    )

    risk_profile = data.get("risk_profile", "balanced")
    capital = safe_float(data.get("capital") or data.get("account_size"), 10000)
    risk_percent = safe_float(
        data.get("risk_percent"),
        risk_percent_from_profile(risk_profile),
    )

    prices = parse_prices(data.get("prices", []))
    if len(prices) < 20:
        prices = default_price_series()

    fundamentals = data.get("fundamentals") or {}
    if not isinstance(fundamentals, dict):
        fundamentals = {}

    if data.get("pe_ratio"):
        fundamentals["pe_ratio"] = safe_float(data.get("pe_ratio"), 15)

    fundamentals.setdefault("pe_ratio", 15)

    return {
        "symbol": symbol,
        "asset_class": asset_class,
        "market_type": asset_class,
        "session": data.get("session", "New York"),
        "timeframe": data.get("timeframe", "swing"),
        "trade_style": data.get("trade_style", "liquidity-to-trend"),
        "risk_profile": risk_profile,
        "strategy_frameworks": strategy_frameworks,
        "system_objective": data.get(
            "system_objective",
            "Build a repeatable trading process with clear thesis, invalidation, execution checklist, and review loop.",
        ),
        "research_goal": research_goal,
        "prices": prices,
        "fundamentals": fundamentals,
        "news": data.get("news") or data.get("notes", ""),
        "journal_entry": data.get("journal_entry") or data.get("notes", ""),
        "capital": capital,
        "risk_percent": risk_percent,
        "stop_distance": safe_float(data.get("stop_distance"), 50),
        "atr": safe_float(data.get("atr"), 1.0),
        "adx": safe_float(data.get("adx"), 25),
        "mode": data.get("mode", "manual"),
    }

def build_agentic_prompt(context, local_output, web_answer):
    return f"""
You are AgentTrade, a professional AI trading research desk.

Your task is to produce an advanced institutional-style trading analysis that helps the trader build a repeatable, risk-controlled trading system.

Analyze using these frameworks:
- Fundamentals and macro context
- Technical trend, momentum, support/resistance
- Smart Money Concepts: liquidity pools, displacement, market structure shift, breaker/order block logic
- ICT concepts: premium/discount, fair value gaps, liquidity sweep, kill zones/session timing
- Risk model: max loss, invalidation, position sizing logic
- Execution model: entry trigger, confirmation, stop logic, target logic
- Trading psychology and journaling review

Important:
- Do not guarantee profitability.
- Do not give blind buy/sell calls.
- Focus on building a repeatable process.
- Separate thesis from execution.
- If fresh data is missing or stale, say so clearly.
- If a framework does not apply to the asset class, say that.

Return ONLY valid JSON with this schema:

{{
  "recommendation": "buy | sell | neutral | wait",
  "confidence": 0,
  "market_regime": "trend | range | breakout | distribution | accumulation | high-volatility | uncertain",
  "thesis": "professional trading thesis",
  "fundamental_analysis": {{
    "summary": "fundamental or macro read",
    "bullish_factors": ["factor"],
    "bearish_factors": ["factor"],
    "data_gaps": ["missing data"]
  }},
  "technical_analysis": {{
    "trend": "trend read",
    "momentum": "momentum read",
    "support": ["level or zone"],
    "resistance": ["level or zone"],
    "key_observations": ["observation"]
  }},
  "smart_money_analysis": {{
    "market_structure": "structure read",
    "liquidity_zones": ["zone"],
    "fair_value_gaps": ["gap or none"],
    "order_blocks": ["zone or none"],
    "premium_discount": "premium/discount context",
    "ict_notes": ["note"]
  }},
  "execution_plan": {{
    "entry_model": "what must happen before entry",
    "confirmation_triggers": ["trigger"],
    "invalidation": "clear invalidation condition",
    "targets": ["target logic"],
    "no_trade_conditions": ["condition"]
  }},
  "risk_model": {{
    "risk_profile": "profile",
    "risk_amount": 0,
    "risk_percent": 0,
    "position_sizing_note": "position sizing logic",
    "max_loss_rule": "max loss rule"
  }},
  "system_builder": {{
    "rules": ["rule"],
    "checklist": ["checklist item"],
    "journal_prompts": ["prompt"],
    "review_metrics": ["metric"]
  }},
  "risks": ["risk"],
  "action_plan": ["step"],
  "web_context_summary": "summary of current market context",
  "agent_summary": [
    {{
      "agent": "name",
      "view": "short summary"
    }}
  ]
}}

Context:
{context}

Local agent output:
{local_output}

Fresh web-search context:
{web_answer}
"""


class RunAgentsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        context = build_context(request.data)

        agent_names = request.data.get(
            "agents",
            ["technical", "fundamental", "sentiment", "strategy", "risk"],
        )

        use_web_search = bool(request.data.get("use_web_search", True))

        web_result = {
            "ok": False,
            "answer": "",
            "error": "",
        }

        if use_web_search:
            query = request.data.get("search_query") or (
            f"Today, create a current professional trading research brief for {context['symbol']} "
            f"as a {context['asset_class']} instrument. "
            f"Include current market context, fundamentals or macro drivers, technical trend, "
            f"smart money / ICT liquidity context, volatility, risks, and what traders should watch next. "
            f"Timeframe: {context['timeframe']}. "
            f"Trade style: {context['trade_style']}. "
            f"Risk profile: {context['risk_profile']}. "
            f"System objective: {context['system_objective']}."
        )

            web_result = WebSearchClient().search_fresh_market_context(
                        symbol=context["symbol"],
                        extra_query=query,
                    )

        orchestrator = Orchestrator(agent_names)
        local_output = orchestrator.run(context)
        local_results = local_output.get("results", [])

        prompt = build_agentic_prompt(
            context=context,
            local_output=local_output,
            web_answer=web_result.get("answer", ""),
        )

        openrouter = OpenRouterClient()
        ai_response = {
            "ok": False,
            "content": "",
            "error": "OpenRouter not configured.",
        }

        if openrouter.is_configured():
            ai_response = openrouter.chat(
                messages=[
                    {
                        "role": "system",
                        "content": "You are AgentTrade, an institutional trading AI. Return valid JSON only.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                model=request.data.get("model"),
            )

        parsed_report = None
        synthesis_provider = "fallback"

        if ai_response.get("ok"):
            parsed_report = extract_json_from_text(ai_response.get("content", ""))
            synthesis_provider = "openrouter"

        if not parsed_report:
            # Fallback: use the web-search AI endpoint as a synthesis engine.
            web_synthesis = WebSearchClient().search(prompt)

            if web_synthesis.get("ok"):
                parsed_report = extract_json_from_text(web_synthesis.get("answer", ""))
                synthesis_provider = "web-search-ai"

            if not parsed_report:
                parsed_report = fallback_report(
                    local_results=local_results,
                    web_answer=web_result.get("answer", ""),
                )
                synthesis_provider = "local-fallback"

        return Response({
            "context": context,
            "local": local_output,
            "web_search": web_result,
            "ai_report": parsed_report,
            "raw_ai_text": ai_response.get("content", ""),
            "provider_status": {
                "synthesis_provider": synthesis_provider,
                "openrouter_configured": openrouter.is_configured(),
                "openrouter_ok": ai_response.get("ok", False),
                "openrouter_error": ai_response.get("error", ""),
                "web_search_ok": web_result.get("ok", False),
                "web_search_error": web_result.get("error", ""),
            },
        })


class AgentChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "").strip()
        symbol = request.data.get("symbol", "").strip()
        use_web_search = bool(request.data.get("use_web_search", True))

        if not message:
            return Response({"detail": "Message is required."}, status=400)

        web_context = ""

        if use_web_search:
            web_result = WebSearchClient().search_fresh_market_context(
                symbol=symbol or "market",
                extra_query=message,
            )
            web_context = web_result.get("answer", "")

        prompt = f"""
Today is {current_utc_date()} UTC.

You are AgentTrade's professional trading copilot.

User question:
{message}

Symbol:
{symbol}

Fresh web context:
{web_context}

Rules:
- Do not use stale market data.
- Do not mention 2024 data unless the user asks for historical analysis.
- If the web context is not current, clearly say current data is unavailable.
- Mention risks and invalidation.
- Do not promise profits.

Format your answer in clean markdown with:
- short sections
- tables where useful
- bullet points for rules/checklists
- LaTeX for formulas, for example: $Risk = AccountSize \\times RiskPercent$
- no raw JSON unless requested

Do not guarantee profits.
Mention risk and invalidation where relevant.
Make the answer useful for a serious trader.

"""
        openrouter = OpenRouterClient()

        if openrouter.is_configured():
            response = openrouter.chat(
                messages=[
                    {
                        "role": "system",
                        "content": "You are AgentTrade's trading copilot. Be professional, cautious, and useful.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                model=request.data.get("model"),
                temperature=0.3,
            )

            if response.get("ok"):
                return Response({
                    "answer": response.get("content", ""),
                    "web_context": web_context,
                    "provider": "openrouter",
                })

        # Fallback to your web-search AI endpoint.
        fallback = WebSearchClient().search(prompt)

        if fallback.get("ok"):
            return Response({
                "answer": fallback.get("answer", ""),
                "web_context": web_context,
                "provider": "web-search-ai",
            })

        return Response({
            "answer": (
                "The AI provider is not configured, and the web-search fallback also failed. "
                "Add OPENROUTER_API_KEY or check WEB_SEARCH_API_KEY in backend .env."
            ),
            "web_context": web_context,
            "provider": "none",
            "error": fallback.get("error", ""),
        })


class WebSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        query = request.data.get("query", "").strip()

        if not query:
            return Response({"detail": "Query is required."}, status=400)

        result = WebSearchClient().search(query=query)
        return Response(result)