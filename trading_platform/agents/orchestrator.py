# trading_platform/agents/orchestrator.py

from typing import Any, Dict, List

from .base import AgentRegistry

# Import package side effects so agents register themselves.
import agents  # noqa: F401


class Orchestrator:
    def __init__(self, agents: List[str]):
        self.agent_names = agents

    def _get_available_agents(self):
        available = []

        for name in self.agent_names:
            try:
                available.append(AgentRegistry.get_agent(name))
            except KeyError:
                available.append(None)

        return available

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        results = []
        signals = []

        agent_classes = self._get_available_agents()

        # Run all non-risk agents first.
        risk_agent_cls = None

        for agent_cls in agent_classes:
            if agent_cls is None:
                results.append({
                    "agent": "unknown",
                    "error": "Agent is not registered.",
                })
                continue

            if agent_cls.name == "risk":
                risk_agent_cls = agent_cls
                continue

            agent = agent_cls()
            result = agent.analyze(context)
            results.append(result)

            if result.get("signal"):
                signals.append(result["signal"])

        # Run risk after signals are collected.
        if risk_agent_cls:
            risk_context = dict(context)
            risk_context["signals"] = signals
            risk_agent = risk_agent_cls()
            results.append(risk_agent.analyze(risk_context))

        return {
            "results": results,
            "summary": self.summarize(results),
        }

    def summarize(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        signal_counts = {
            "buy": 0,
            "sell": 0,
            "neutral": 0,
        }

        for result in results:
            signal = result.get("signal")
            if signal in signal_counts:
                signal_counts[signal] += 1

        if signal_counts["buy"] > signal_counts["sell"]:
            recommendation = "buy"
        elif signal_counts["sell"] > signal_counts["buy"]:
            recommendation = "sell"
        else:
            recommendation = "neutral"

        return {
            "recommendation": recommendation,
            "counts": signal_counts,
        }