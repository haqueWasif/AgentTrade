# agents/urls.py
from django.urls import path
from .views import RunAgentsView

urlpatterns = [
    path('run/', RunAgentsView.as_view(), name='run_agents'),
]