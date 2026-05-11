# agents/orchestrator.py
from typing import Dict, Any, List
from .base import AgentRegistry

class Orchestrator:
    def __init__(self, agents: List[str]):
        # Accept agent names; look them up in registry
        self.agent_classes = [AgentRegistry.get_agent(name) for name in agents]

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        results = []
        signals = []
        # Execute each agent
        for agent_cls in self.agent_classes:
            agent = agent_cls()
            result = agent.analyze(context)
            results.append(result)
            # Collect signals for risk agent
            if result.get("signal"):
                signals.append(result["signal"])
        # Provide aggregated signals to risk agent if risk agent is included
        if "risk" in [cls.name for cls in self.agent_classes]:
            context = dict(context)  # copy
            context["signals"] = signals
        return {
            "results": results,
            "summary": self.summarize(results),
        }

    def summarize(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Combine signals into a consensus recommendation."""
        signal_counts = {"buy": 0, "sell": 0, "neutral": 0}
        for r in results:
            s = r.get("signal")
            if s and s in signal_counts:
                signal_counts[s] += 1
        # majority vote
        if signal_counts["buy"] > signal_counts["sell"]:
            return {"recommendation": "buy", "counts": signal_counts}
        elif signal_counts["sell"] > signal_counts["buy"]:
            return {"recommendation": "sell", "counts": signal_counts}
        else:
            return {"recommendation": "neutral", "counts": signal_counts}