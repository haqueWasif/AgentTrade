# agents/strategy.py
from typing import Dict, Any
from .base import Agent, AgentRegistry

@AgentRegistry.register
class StrategyAgent(Agent):
    name = "strategy"

    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        # context should include volatility (ATR) and trend strength (ADX)
        atr = context.get("atr")
        adx = context.get("adx")
        if atr is None or adx is None:
            return {"agent": self.name, "error": "ATR/ADX missing"}
        if adx > 25:
            strategy = "trend_following"
        elif atr < 0.5:  # low volatility implies mean‑reversion markets
            strategy = "mean_reversion"
        else:
            strategy = "momentum"
        return {"agent": self.name, "strategy": strategy}