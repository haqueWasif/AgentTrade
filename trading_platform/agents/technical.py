# agents/technical.py
import pandas as pd
from typing import Dict, Any
from .base import Agent, AgentRegistry

@AgentRegistry.register
class TechnicalAgent(Agent):
    name = "technical"

    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Context should include a list/Series of price data."""
        prices = context.get("prices")
        if prices is None or len(prices) < 20:
            return {"agent": self.name, "error": "Not enough data"}

        df = pd.Series(prices)
        short_ma = df.rolling(window=5).mean()
        long_ma = df.rolling(window=20).mean()
        # Compare last values
        if short_ma.iloc[-1] > long_ma.iloc[-1]:
            signal = "buy"
        else:
            signal = "sell"
        confidence = float(abs(short_ma.iloc[-1] - long_ma.iloc[-1]))
        return {"agent": self.name, "signal": signal, "confidence": confidence}