# agents/journal.py
from textblob import TextBlob
from typing import Dict, Any
from .base import Agent, AgentRegistry

@AgentRegistry.register
class JournalAgent(Agent):
    name = "journal"

    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        entry_text = context.get("journal_entry", "")
        if not entry_text:
            return {"agent": self.name, "error": "No entry"}
        blob = TextBlob(entry_text)
        polarity = blob.sentiment.polarity  # -1 to 1
        # classify negativity or positivity
        if polarity > 0.2:
            mood = "positive"
        elif polarity < -0.2:
            mood = "negative"
        else:
            mood = "neutral"
        return {"agent": self.name, "mood": mood, "polarity": polarity}