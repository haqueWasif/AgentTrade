from decimal import Decimal

from core.models import Instrument
from market_data.models import Candle, MarketSnapshot
from market_data.services.alpha_vantage import AlphaVantageService


def decimal_to_float(value):
    if value is None:
        return None

    if isinstance(value, Decimal):
        return float(value)

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def serialize_snapshot(snapshot):
    if not snapshot:
        return {
            "ok": False,
            "data_freshness": "missing",
            "message": "No market snapshot available.",
        }

    return {
        "ok": True,
        "snapshot_id": snapshot.id,
        "symbol": snapshot.instrument.symbol,
        "asset_class": snapshot.instrument.asset_class,
        "provider": snapshot.provider.name if snapshot.provider else None,
        "timestamp": snapshot.timestamp.isoformat() if snapshot.timestamp else None,
        "liquidity_source": snapshot.liquidity_source,
        "liquidity_timeframe": snapshot.liquidity_timeframe,
        "liquidity_warning": snapshot.liquidity_warning,
        "current_price": decimal_to_float(snapshot.current_price),
        "day_open": decimal_to_float(snapshot.day_open),
        "day_high": decimal_to_float(snapshot.day_high),
        "day_low": decimal_to_float(snapshot.day_low),
        "day_close": decimal_to_float(snapshot.day_close),
        "previous_day_high": decimal_to_float(snapshot.previous_day_high),
        "previous_day_low": decimal_to_float(snapshot.previous_day_low),
        "recent_swing_high": decimal_to_float(snapshot.recent_swing_high),
        "recent_swing_low": decimal_to_float(snapshot.recent_swing_low),
        "buy_side_liquidity": decimal_to_float(snapshot.buy_side_liquidity),
        "sell_side_liquidity": decimal_to_float(snapshot.sell_side_liquidity),
        "trend_bias": snapshot.trend_bias,
        "volatility_regime": snapshot.volatility_regime,
        "session_label": snapshot.session_label,
        "data_freshness": snapshot.data_freshness,
        "notes": snapshot.notes,
    }


def serialize_candles(instrument, timeframe="1d", limit=30):
    candles = (
        Candle.objects.filter(instrument=instrument, timeframe=timeframe)
        .order_by("-timestamp")[:limit]
    )

    return [
        {
            "timestamp": candle.timestamp.isoformat(),
            "open": decimal_to_float(candle.open),
            "high": decimal_to_float(candle.high),
            "low": decimal_to_float(candle.low),
            "close": decimal_to_float(candle.close),
            "volume": decimal_to_float(candle.volume),
        }
        for candle in candles
    ]


def get_latest_snapshot(symbol):
    try:
        instrument = Instrument.objects.get(symbol__iexact=symbol)
    except Instrument.DoesNotExist:
        return None

    return (
        MarketSnapshot.objects.filter(instrument=instrument)
        .select_related("instrument", "provider")
        .order_by("-timestamp")
        .first()
    )


def build_market_context(symbol, asset_class="forex", auto_sync=True):
    """
    Builds the market context that will be injected into AI agent prompts.

    For forex symbols, this can auto-sync Alpha Vantage before reading the latest snapshot.
    For other asset classes, it uses the latest stored snapshot if available.
    """

    normalized_asset_class = str(asset_class or "").lower()

    sync_result = None

    if auto_sync and normalized_asset_class in ["forex", "fx"]:
        try:
            sync_result = AlphaVantageService().sync_forex_symbol(symbol)
        except Exception as exc:
            sync_result = {
                "ok": False,
                "error": str(exc),
            }

    snapshot = get_latest_snapshot(symbol)

    if not snapshot:
        return {
            "ok": False,
            "symbol": symbol,
            "asset_class": normalized_asset_class,
            "data_freshness": "missing",
            "sync_result": sync_result,
            "snapshot": None,
            "candles": [],
            "exact_level_policy": (
                "Exact price levels are unavailable because no MarketSnapshot exists."
            ),
        }

    candles = serialize_candles(snapshot.instrument, timeframe="1d", limit=30)
    snapshot_data = serialize_snapshot(snapshot)

    exact_levels_available = bool(
        snapshot.current_price
        and snapshot.buy_side_liquidity
        and snapshot.sell_side_liquidity
        and snapshot.liquidity_source == "intraday_candles"
        and snapshot.data_freshness == "fresh"
    )

    return {
        "ok": True,
        "symbol": snapshot.instrument.symbol,
        "asset_class": snapshot.instrument.asset_class,
        "sync_result": sync_result,
        "snapshot": snapshot_data,
        "candles": candles,
        "exact_levels_available": exact_levels_available,
        "exact_level_policy": (
            "Exact SSL, BSL, support, resistance, and current price may only be used "
            "if they appear in this market_context.snapshot object."
        ),
    }