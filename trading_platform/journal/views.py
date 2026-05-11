from django.shortcuts import render

# journal/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import JournalEntry
from .serializers import JournalEntrySerializer

class JournalEntryViewSet(viewsets.ModelViewSet):
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JournalEntry.objects.filter(trader=self.request.user)

    def perform_create(self, serializer):
        serializer.save(trader=self.request.user)
