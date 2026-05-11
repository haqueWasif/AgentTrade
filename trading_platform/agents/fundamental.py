# agents/fundamental.py
from typing import Dict, Any
from .base import Agent, AgentRegistry

@AgentRegistry.register
class FundamentalAgent(Agent):
    name = "fundamental"

    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        fundamentals = context.get("fundamentals", {})
        pe_ratio = fundamentals.get("pe_ratio")
        if pe_ratio is None:
            return {"agent": self.name, "error": "PE ratio missing"}
        signal = "buy" if pe_ratio < 10 else "sell"
        return {"agent": self.name, "signal": signal, "pe_ratio": pe_ratio}