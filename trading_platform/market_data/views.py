from django.shortcuts import render

from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.models import Instrument

from .models import Candle, DataProvider, MarketSnapshot, Quote
from .serializers import (
    CandleSerializer,
    DataProviderSerializer,
    InstrumentSerializer,
    MarketSnapshotSerializer,
    QuoteSerializer,
)

from .services.alpha_vantage import AlphaVantageService


class InstrumentViewSet(viewsets.ModelViewSet):
    serializer_class = InstrumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["symbol", "name", "asset_class", "provider_symbol"]
    ordering_fields = ["symbol", "asset_class", "created_at"]
    ordering = ["asset_class", "symbol"]

    def get_queryset(self):
        return Instrument.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="sync")
    def sync_market_data(self, request, pk=None):
        instrument = self.get_object()

        if instrument.asset_class != "forex":
            return Response(
                {
                    "detail": "Alpha Vantage sync currently supports forex instruments only.",
                    "asset_class": instrument.asset_class,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = AlphaVantageService()
        result = service.sync_forex_symbol(instrument.symbol)

        response_status = status.HTTP_200_OK if result.get("ok") else status.HTTP_502_BAD_GATEWAY
        return Response(result, status=response_status)

class DataProviderViewSet(viewsets.ModelViewSet):
    queryset = DataProvider.objects.all()
    serializer_class = DataProviderSerializer
    permission_classes = [IsAuthenticated]


class QuoteViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QuoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Quote.objects.select_related("instrument", "provider")

        symbol = self.request.query_params.get("symbol")
        if symbol:
            queryset = queryset.filter(instrument__symbol__iexact=symbol)

        return queryset.order_by("-provider_timestamp", "-received_at")


class CandleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CandleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Candle.objects.select_related("instrument", "provider")

        symbol = self.request.query_params.get("symbol")
        timeframe = self.request.query_params.get("timeframe")

        if symbol:
            queryset = queryset.filter(instrument__symbol__iexact=symbol)

        if timeframe:
            queryset = queryset.filter(timeframe=timeframe)

        return queryset.order_by("-timestamp")


class MarketSnapshotViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MarketSnapshotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = MarketSnapshot.objects.select_related("instrument", "provider")

        symbol = self.request.query_params.get("symbol")
        if symbol:
            queryset = queryset.filter(instrument__symbol__iexact=symbol)

        return queryset.order_by("-timestamp")

    @action(detail=False, methods=["get"], url_path="latest")
    def latest(self, request):
        symbol = request.query_params.get("symbol")

        queryset = self.get_queryset()

        if symbol:
            queryset = queryset.filter(instrument__symbol__iexact=symbol)

        snapshot = queryset.order_by("-timestamp").first()

        if not snapshot:
            return Response(
                {"detail": "No market snapshot found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(snapshot)
        return Response(serializer.data)
