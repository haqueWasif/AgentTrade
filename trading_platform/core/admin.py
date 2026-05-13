from django.contrib import admin

from .models import Instrument, Watchlist


@admin.register(Instrument)
class InstrumentAdmin(admin.ModelAdmin):
    list_display = [
        "symbol",
        "name",
        "asset_class",
        "provider_symbol",
        "exchange",
        "status",
        "is_tradeable",
        "is_watchlist_enabled",
    ]
    list_filter = ["asset_class", "status", "is_tradeable", "is_watchlist_enabled"]
    search_fields = ["symbol", "name", "provider_symbol"]


@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "created_at"]
    search_fields = ["name", "user__username"]