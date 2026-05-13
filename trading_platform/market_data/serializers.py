from rest_framework import serializers

from core.models import Instrument

from .models import Candle, DataProvider, MarketSnapshot, Quote


class InstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instrument
        fields = [
            "id",
            "symbol",
            "name",
            "asset_class",
            "provider_symbol",
            "exchange",
            "timezone",
            "pip_size",
            "tick_size",
            "currency",
            "description",
            "status",
            "is_tradeable",
            "is_watchlist_enabled",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class DataProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataProvider
        fields = "__all__"


class QuoteSerializer(serializers.ModelSerializer):
    instrument_symbol = serializers.CharField(source="instrument.symbol", read_only=True)
    provider_name = serializers.CharField(source="provider.name", read_only=True)

    class Meta:
        model = Quote
        fields = [
            "id",
            "instrument",
            "instrument_symbol",
            "provider",
            "provider_name",
            "bid",
            "ask",
            "mid",
            "last",
            "volume",
            "provider_timestamp",
            "received_at",
            "raw_payload",
        ]
        read_only_fields = ["received_at"]


class CandleSerializer(serializers.ModelSerializer):
    instrument_symbol = serializers.CharField(source="instrument.symbol", read_only=True)
    provider_name = serializers.CharField(source="provider.name", read_only=True)

    class Meta:
        model = Candle
        fields = [
            "id",
            "instrument",
            "instrument_symbol",
            "provider",
            "provider_name",
            "timeframe",
            "timestamp",
            "open",
            "high",
            "low",
            "close",
            "volume",
            "raw_payload",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class MarketSnapshotSerializer(serializers.ModelSerializer):
    instrument_symbol = serializers.CharField(source="instrument.symbol", read_only=True)
    provider_name = serializers.CharField(source="provider.name", read_only=True)

    class Meta:
        model = MarketSnapshot
        fields = [
            "id",
            "instrument",
            "instrument_symbol",
            "provider",
            "provider_name",
            "timestamp",
            "current_price",
            "day_open",
            "day_high",
            "day_low",
            "day_close",
            "previous_day_high",
            "previous_day_low",
            "recent_swing_high",
            "recent_swing_low",
            "liquidity_source",
            "liquidity_timeframe",
            "liquidity_warning",
            "buy_side_liquidity",
            "sell_side_liquidity",
            "trend_bias",
            "volatility_regime",
            "session_label",
            "data_freshness",
            "notes",
            "raw_payload",
            "created_at",
        ]
        read_only_fields = ["created_at"]