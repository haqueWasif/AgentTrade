# agents/sentiment.py
from typing import Dict, Any
from .base import Agent, AgentRegistry

POSITIVE_WORDS = {"good", "great", "bull", "buy", "profit", "up"}
NEGATIVE_WORDS = {"bad", "bear", "sell", "loss", "down"}

@AgentRegistry.register
class SentimentAgent(Agent):
    name = "sentiment"

    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        text = context.get("news", "")
        words = text.lower().split()
        positive = sum(word in POSITIVE_WORDS for word in words)
        negative = sum(word in NEGATIVE_WORDS for word in words)
        score = positive - negative
        if score > 0:
            signal = "buy"
        elif score < 0:
            signal = "sell"
        else:
            signal = "neutral"
        return {"agent": self.name, "signal": signal, "score": score}