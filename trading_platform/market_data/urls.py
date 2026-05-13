from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CandleViewSet,
    DataProviderViewSet,
    InstrumentViewSet,
    MarketSnapshotViewSet,
    QuoteViewSet,
)

router = DefaultRouter()
router.register("instruments", InstrumentViewSet, basename="market-instruments")
router.register("providers", DataProviderViewSet, basename="market-providers")
router.register("quotes", QuoteViewSet, basename="market-quotes")
router.register("candles", CandleViewSet, basename="market-candles")
router.register("snapshots", MarketSnapshotViewSet, basename="market-snapshots")

urlpatterns = [
    path("", include(router.urls)),
]