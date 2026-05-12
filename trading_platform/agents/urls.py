from django.urls import path

from .views import RunAgentsView, AgentChatView, WebSearchView

urlpatterns = [
    path("run/", RunAgentsView.as_view(), name="run_agents"),
    path("chat/", AgentChatView.as_view(), name="agent_chat"),
    path("web-search/", WebSearchView.as_view(), name="agent_web_search"),
]