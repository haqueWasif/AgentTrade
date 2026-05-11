from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Instrument, Trade, Strategy, Watchlist
from .serializers import InstrumentSerializer, TradeSerializer, StrategySerializer, WatchlistSerializer

class InstrumentViewSet(viewsets.ModelViewSet):
    queryset = Instrument.objects.all()
    serializer_class = InstrumentSerializer
    permission_classes = [IsAuthenticated]


class TradeViewSet(viewsets.ModelViewSet):
    serializer_class = TradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # users should see only their own trades (unless admin)
        user = self.request.user
        if user.role == 'admin':
            return Trade.objects.all()
        return Trade.objects.filter(trader=user)

    def perform_create(self, serializer):
        serializer.save(trader=self.request.user)


class StrategyViewSet(viewsets.ModelViewSet):
    serializer_class = StrategySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Strategy.objects.filter(trader=user)

    def perform_create(self, serializer):
        serializer.save(trader=self.request.user)
        
# core/views.py (add this class)
class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Watchlist.objects.filter(trader=self.request.user)

    def perform_create(self, serializer):
        serializer.save(trader=self.request.user)