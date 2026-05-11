from django.shortcuts import render

# agents/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .orchestrator import Orchestrator

class RunAgentsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Input data should include prices, fundamentals, news, journal_entry, etc.
        context = request.data
        # Define which agents to run
        agent_names = context.get("agents", [
            "technical", "fundamental", "sentiment", "risk", "strategy"])
        orchestrator = Orchestrator(agent_names)
        result = orchestrator.run(context)
        return Response(result)
