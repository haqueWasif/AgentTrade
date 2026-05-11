# agents/base.py
from typing import Any, Dict, List, Type

class Agent:
    """Base class for all agents."""
    name: str = "base"

    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform analysis on the provided context and return a dict with results.
        Each subclass should override this method.
        """
        raise NotImplementedError

# A simple registry to access all agents by name
class AgentRegistry:
    _registry: Dict[str, Type[Agent]] = {}

    @classmethod
    def register(cls, agent_cls: Type[Agent]):
        cls._registry[agent_cls.name] = agent_cls
        return agent_cls

    @classmethod
    def get_agent(cls, name: str) -> Type[Agent]:
        return cls._registry[name]

    @classmethod
    def all_agents(cls) -> List[Type[Agent]]:
        return list(cls._registry.values())