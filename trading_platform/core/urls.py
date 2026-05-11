from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstrumentViewSet, TradeViewSet, StrategyViewSet, WatchlistViewSet

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'instruments', InstrumentViewSet, basename='instrument')
router.register(r'trades', TradeViewSet, basename='trade')
router.register(r'strategies', StrategyViewSet, basename='strategy')
router.register(r'watchlists', WatchlistViewSet, basename='watchlist')

urlpatterns = [
    path('', include(router.urls)),
]