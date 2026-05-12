# agents/risk.py

"""
Implementation of the RiskAgent used to determine position sizing and
generate a final trading action based on aggregated signals from other
agents.

This file replaces the previously misnamed ``risk,py`` and ensures the
module can be imported using standard Python syntax. The agent will be
automatically registered with ``AgentRegistry`` when the module is
imported.
"""

from typing import Dict, Any
from .base import Agent, AgentRegistry


@AgentRegistry.register
class RiskAgent(Agent):
    """Agent responsible for risk management and position sizing."""

    # Unique name used to look up this agent
    name = "risk"

    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze risk parameters and compute position size.

        Parameters expected in ``context``:
        - capital: total available capital
        - risk_percent: allowable percentage risk per trade (default 0.02)
        - stop_distance: distance between entry and stop in price units
        - signals: optional list of signals from other agents (buy/sell/neutral)

        Returns a dict including the calculated position size, total risk
        amount and a recommended action derived from consensus signals.
        """
        capital = context.get("capital", 0)
        risk_percent = context.get("risk_percent", 0.02)
        stop_distance = context.get("stop_distance")
        if capital <= 0 or stop_distance is None or stop_distance <= 0:
            return {
                "agent": self.name,
                "error": "Invalid capital or stop distance",
            }

        # Calculate the absolute amount of capital at risk
        risk_amount = capital * risk_percent
        quantity = risk_amount / stop_distance

        # Determine consensus action based on other agents' signals
        signals = context.get("signals", [])
        if signals.count("buy") > 0 and signals.count("sell") > 0:
            action = "abstain"
        else:
            action = signals[0] if signals else "neutral"

        return {
            "agent": self.name,
            "position_size": quantity,
            "action": action,
            "risk_amount": risk_amount,
        }