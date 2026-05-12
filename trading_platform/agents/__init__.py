"""
Agent package initialisation.

This package defines various agent classes used in the trading platform. The
base ``Agent`` and registration mechanism live in ``base.py``. Each specific
agent lives in its own module (e.g. ``technical.py``, ``fundamental.py``).
When those modules are imported they register themselves with the global
``AgentRegistry`` via the ``@AgentRegistry.register`` decorator.

Importing the modules here ensures that the agents are registered when the
package is imported. Without these imports, attempting to look up an agent
by name (e.g. ``AgentRegistry.get_agent('risk')``) may result in a
``KeyError`` because the module hasn't been imported yet.
"""

# Trigger registration of all agent types. We suppress unused-import warnings
# with ``# noqa: F401`` since the imported classes are referenced only
# through registration side-effects.
from .technical import TechnicalAgent  # noqa: F401
from .fundamental import FundamentalAgent  # noqa: F401
from .sentiment import SentimentAgent  # noqa: F401
from .risk import RiskAgent  # noqa: F401
from .strategy import StrategyAgent  # noqa: F401
from .execution import ExecutionAgent  # noqa: F401

# The journal agent depends on the textblob library. Skip import if
# unavailable. This avoids ImportError during startup when TextBlob is
# missing. Users who wish to enable the journal agent should install
# ``textblob``.
try:
    from .journal import JournalAgent  # noqa: F401
except Exception:
    JournalAgent = None  # type: ignore
