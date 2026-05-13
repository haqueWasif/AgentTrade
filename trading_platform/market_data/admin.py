from django.contrib import admin

from .models import Candle, DataProvider, MarketSnapshot, Quote


@admin.register(DataProvider)
class DataProviderAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "code",
        "is_active",
        "supports_realtime",
        "supports_intraday",
        "supports_daily",
    ]
    search_fields = ["name", "code"]


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = [
        "instrument",
        "provider",
        "bid",
        "ask",
        "mid",
        "last",
        "provider_timestamp",
        "received_at",
    ]
    list_filter = ["provider", "instrument__asset_class"]
    search_fields = ["instrument__symbol", "instrument__name"]


@admin.register(Candle)
class CandleAdmin(admin.ModelAdmin):
    list_display = [
        "instrument",
        "provider",
        "timeframe",
        "timestamp",
        "open",
        "high",
        "low",
        "close",
        "volume",
    ]
    list_filter = ["provider", "timeframe", "instrument__asset_class"]
    search_fields = ["instrument__symbol", "instrument__name"]
    date_hierarchy = "timestamp"


@admin.register(MarketSnapshot)
class MarketSnapshotAdmin(admin.ModelAdmin):
    list_display = [
        "instrument",
        "provider",
        "timestamp",
        "current_price",
        "buy_side_liquidity",
        "sell_side_liquidity",
        "trend_bias",
        "data_freshness",
    ]
    list_filter = ["provider", "data_freshness", "instrument__asset_class"]
    search_fields = ["instrument__symbol", "instrument__name"]
    date_hierarchy = "timestamp"