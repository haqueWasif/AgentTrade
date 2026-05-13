import datetime
from decimal import Decimal, InvalidOperation

import requests
from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from core.models import Instrument
from market_data.models import Candle, DataProvider, MarketSnapshot, Quote


ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query"


def normalize_fx_symbol(symbol):
    cleaned = str(symbol).upper().replace("-", "/").replace("_", "/").strip()

    if "/" in cleaned:
        parts = cleaned.split("/")
        if len(parts) == 2:
            return parts[0], parts[1]

    if len(cleaned) == 6:
        return cleaned[:3], cleaned[3:]

    return None, None


def to_decimal(value):
    if value in [None, ""]:
        return None

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def parse_provider_datetime(value):
    if not value:
        return None

    parsed = parse_datetime(value)

    if parsed:
        if timezone.is_naive(parsed):
            return timezone.make_aware(parsed, timezone=datetime.UTC)
        return parsed

    try:
        parsed = datetime.datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        return timezone.make_aware(parsed, timezone=datetime.UTC)
    except ValueError:
        return None


def parse_daily_date(date_string):
    parsed = datetime.datetime.strptime(date_string, "%Y-%m-%d")
    return timezone.make_aware(
        datetime.datetime.combine(parsed.date(), datetime.time.min),
        timezone=datetime.UTC
    )


def classify_freshness(provider_timestamp, quote_ok=False, candles_ok=False, provider_error=False):
    if provider_error:
        return "provider_error"

    if not provider_timestamp:
        if candles_ok:
            return "delayed"
        return "missing"

    now = timezone.now()
    age = now - provider_timestamp

    if quote_ok and age <= datetime.timedelta(hours=2):
        return "fresh"

    if age <= datetime.timedelta(days=2):
        return "delayed"

    return "stale"

def interval_to_timeframe(interval):
        mapping = {
            "1min": "1m",
            "5min": "5m",
            "15min": "15m",
            "30min": "30m",
            "60min": "1h",
        }
        return mapping.get(interval, "15m")


def get_fx_intraday_series_key(interval):
        return f"Time Series FX ({interval})"

class AlphaVantageService:
    def __init__(self):
        self.api_key = getattr(settings, "ALPHAVANTAGE_API_KEY", "")
        self.provider = self.get_provider()

    def get_provider(self):
        provider, _ = DataProvider.objects.update_or_create(
            code="alphavantage",
            defaults={
                "name": "Alpha Vantage",
                "website": "https://www.alphavantage.co/",
                "is_active": True,
                "supports_realtime": True,
                "supports_intraday": True,
                "supports_daily": True,
                "rate_limit_note": "External provider limits may apply.",
            },
        )
        return provider

    def is_configured(self):
        return bool(self.api_key)

    def request(self, params):
        if not self.api_key:
            return {
                "ok": False,
                "error": "ALPHAVANTAGE_API_KEY is not configured.",
                "data": {},
            }

        try:
            response = requests.get(
                ALPHA_VANTAGE_URL,
                params={
                    **params,
                    "apikey": self.api_key,
                },
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()

            if "Error Message" in data:
                return {
                    "ok": False,
                    "error": data.get("Error Message"),
                    "data": data,
                }

            if "Note" in data:
                return {
                    "ok": False,
                    "error": data.get("Note"),
                    "data": data,
                }

            if "Information" in data:
                return {
                    "ok": False,
                    "error": data.get("Information"),
                    "data": data,
                }

            return {
                "ok": True,
                "error": "",
                "data": data,
            }

        except requests.RequestException as exc:
            return {
                "ok": False,
                "error": str(exc),
                "data": {},
            }
        except ValueError:
            return {
                "ok": False,
                "error": "Alpha Vantage returned invalid JSON.",
                "data": {},
            }

    def fetch_fx_quote(self, symbol):
        from_currency, to_currency = normalize_fx_symbol(symbol)

        if not from_currency or not to_currency:
            return {
                "ok": False,
                "error": f"Could not parse FX symbol: {symbol}",
                "quote": None,
                "raw": {},
            }

        result = self.request({
            "function": "CURRENCY_EXCHANGE_RATE",
            "from_currency": from_currency,
            "to_currency": to_currency,
        })

        if not result["ok"]:
            return {
                "ok": False,
                "error": result["error"],
                "quote": None,
                "raw": result["data"],
            }

        payload = result["data"].get("Realtime Currency Exchange Rate", {})

        if not payload:
            return {
                "ok": False,
                "error": "No realtime exchange-rate payload returned.",
                "quote": None,
                "raw": result["data"],
            }

        rate = to_decimal(payload.get("5. Exchange Rate"))
        bid = to_decimal(payload.get("8. Bid Price"))
        ask = to_decimal(payload.get("9. Ask Price"))
        timestamp = parse_provider_datetime(payload.get("6. Last Refreshed"))

        mid = None
        if bid is not None and ask is not None:
            mid = (bid + ask) / Decimal("2")

        return {
            "ok": True,
            "error": "",
            "quote": {
                "rate": rate,
                "bid": bid,
                "ask": ask,
                "mid": mid,
                "timestamp": timestamp,
                "timezone": payload.get("7. Time Zone"),
            },
            "raw": payload,
        }

    def fetch_fx_daily(self, symbol, outputsize="compact"):
        from_symbol, to_symbol = normalize_fx_symbol(symbol)

        if not from_symbol or not to_symbol:
            return {
                "ok": False,
                "error": f"Could not parse FX symbol: {symbol}",
                "candles": [],
                "raw": {},
            }

        result = self.request({
            "function": "FX_DAILY",
            "from_symbol": from_symbol,
            "to_symbol": to_symbol,
            "outputsize": outputsize,
        })

        if not result["ok"]:
            return {
                "ok": False,
                "error": result["error"],
                "candles": [],
                "raw": result["data"],
            }

        series = result["data"].get("Time Series FX (Daily)", {})

        if not series:
            return {
                "ok": False,
                "error": "No FX daily series returned.",
                "candles": [],
                "raw": result["data"],
            }

        candles = []

        for date_string, candle in series.items():
            candles.append({
                "timestamp": parse_daily_date(date_string),
                "open": to_decimal(candle.get("1. open")),
                "high": to_decimal(candle.get("2. high")),
                "low": to_decimal(candle.get("3. low")),
                "close": to_decimal(candle.get("4. close")),
                "raw": candle,
            })

        candles.sort(key=lambda item: item["timestamp"], reverse=True)

        return {
            "ok": True,
            "error": "",
            "candles": candles,
            "raw": result["data"].get("Meta Data", {}),
        }

    def get_or_create_instrument(self, symbol):
        from_symbol, to_symbol = normalize_fx_symbol(symbol)

        if not from_symbol or not to_symbol:
            raise ValueError(f"Invalid forex symbol: {symbol}")

        normalized_symbol = f"{from_symbol}/{to_symbol}"

        instrument, _ = Instrument.objects.update_or_create(
            symbol=normalized_symbol,
            defaults={
                "name": f"{from_symbol} / {to_symbol}",
                "asset_class": "forex",
                "provider_symbol": normalized_symbol,
                "pip_size": Decimal("0.01") if to_symbol == "JPY" else Decimal("0.0001"),
                "tick_size": Decimal("0.001") if to_symbol == "JPY" else Decimal("0.00001"),
                "currency": to_symbol,
                "timezone": "UTC",
                "status": "active",
                "is_watchlist_enabled": True,
            },
        )

        return instrument

    def store_quote(self, instrument, quote_result):
        quote_data = quote_result.get("quote")

        if not quote_data:
            return None

        quote = Quote.objects.create(
            instrument=instrument,
            provider=self.provider,
            bid=quote_data.get("bid"),
            ask=quote_data.get("ask"),
            mid=quote_data.get("mid"),
            last=quote_data.get("rate"),
            provider_timestamp=quote_data.get("timestamp"),
            raw_payload=quote_result.get("raw") or {},
        )

        return quote

    def store_daily_candles(self, instrument, daily_result):
        stored = []

        for candle in daily_result.get("candles", []):
            if not all([
                candle.get("timestamp"),
                candle.get("open") is not None,
                candle.get("high") is not None,
                candle.get("low") is not None,
                candle.get("close") is not None,
            ]):
                continue

            obj, _ = Candle.objects.update_or_create(
                instrument=instrument,
                provider=self.provider,
                timeframe="1d",
                timestamp=candle["timestamp"],
                defaults={
                    "open": candle["open"],
                    "high": candle["high"],
                    "low": candle["low"],
                    "close": candle["close"],
                    "volume": None,
                    "raw_payload": candle.get("raw") or {},
                },
            )

            stored.append(obj)

        return stored

    def build_snapshot(
            self,
            instrument,
            quote_result,
            daily_candles_stored=None,
            intraday_candles_stored=None,
            liquidity_timeframe="15m",
        ):
            daily_candles_stored = daily_candles_stored or []
            intraday_candles_stored = intraday_candles_stored or []

            latest_quote = quote_result.get("quote") if quote_result.get("ok") else None
            quote_timestamp = latest_quote.get("timestamp") if latest_quote else None

            daily_candles = list(
                Candle.objects.filter(
                    instrument=instrument,
                    provider=self.provider,
                    timeframe="1d",
                ).order_by("-timestamp")[:30]
            )

            intraday_candles = list(
                Candle.objects.filter(
                    instrument=instrument,
                    provider=self.provider,
                    timeframe=liquidity_timeframe,
                ).order_by("-timestamp")[:100]
            )

            latest_daily = daily_candles[0] if daily_candles else None
            previous_daily = daily_candles[1] if len(daily_candles) > 1 else None
            latest_intraday = intraday_candles[0] if intraday_candles else None

            quote_freshness = self.get_candle_age_info(
                type("QuoteObj", (), {"timestamp": quote_timestamp})(),
                max_age_hours=2,
                label="quote",
            ) if quote_timestamp else {
                "is_fresh": False,
                "status": "missing_quote",
                "age_hours": None,
                "warning": "No realtime quote timestamp is available.",
            }

            daily_freshness = self.get_candle_age_info(
                latest_daily,
                max_age_hours=48,
                label="daily_candles",
            )

            intraday_freshness = self.get_candle_age_info(
                latest_intraday,
                max_age_hours=4,
                label="intraday_candles",
            )

            current_price = None

            if latest_quote and latest_quote.get("rate") is not None:
                current_price = latest_quote.get("rate")
            elif latest_intraday:
                current_price = latest_intraday.close
            elif latest_daily:
                current_price = latest_daily.close

            if intraday_freshness["is_fresh"]:
                liquidity = self.derive_nearest_liquidity(
                    candles=intraday_candles,
                    current_price=current_price,
                )

                buy_side_liquidity = liquidity["buy_side_liquidity"]
                sell_side_liquidity = liquidity["sell_side_liquidity"]
                recent_swing_high = liquidity["recent_swing_high"]
                recent_swing_low = liquidity["recent_swing_low"]
                liquidity_source = "intraday_candles"
                liquidity_warning = ""
            else:
                buy_side_liquidity = None
                sell_side_liquidity = None
                recent_swing_high = None
                recent_swing_low = None
                liquidity_source = "unavailable"
                liquidity_warning = (
                    "Verified intraday liquidity is unavailable. "
                    f"{intraday_freshness.get('warning')}"
                )

            if daily_freshness["is_fresh"]:
                day_open = latest_daily.open if latest_daily else None
                day_high = latest_daily.high if latest_daily else None
                day_low = latest_daily.low if latest_daily else None
                day_close = latest_daily.close if latest_daily else None
                previous_day_high = previous_daily.high if previous_daily else None
                previous_day_low = previous_daily.low if previous_daily else None
            else:
                day_open = None
                day_high = None
                day_low = None
                day_close = None
                previous_day_high = None
                previous_day_low = None

            if quote_result.get("ok") and intraday_freshness["is_fresh"]:
                data_freshness = "fresh"
            elif quote_result.get("ok") and not intraday_freshness["is_fresh"]:
                data_freshness = "fresh_quote_no_verified_liquidity"
            elif intraday_freshness["is_fresh"]:
                data_freshness = "delayed"
            elif quote_result.get("ok"):
                data_freshness = "partial_quote_only"
            else:
                data_freshness = "provider_error"

            trend_source = intraday_candles if intraday_candles else daily_candles

            snapshot = MarketSnapshot.objects.create(
                instrument=instrument,
                provider=self.provider,
                timestamp=timezone.now(),
                current_price=current_price,
                day_open=day_open,
                day_high=day_high,
                day_low=day_low,
                day_close=day_close,
                previous_day_high=previous_day_high,
                previous_day_low=previous_day_low,
                recent_swing_high=recent_swing_high,
                recent_swing_low=recent_swing_low,
                buy_side_liquidity=buy_side_liquidity,
                sell_side_liquidity=sell_side_liquidity,
                trend_bias=self.derive_trend_bias(trend_source),
                volatility_regime=self.derive_volatility_regime(trend_source),
                session_label="Intraday" if intraday_freshness["is_fresh"] else "Unavailable",
                data_freshness=data_freshness,
                liquidity_source=liquidity_source,
                liquidity_timeframe=liquidity_timeframe if liquidity_source == "intraday_candles" else "",
                liquidity_warning=liquidity_warning,
                notes=(
                    "Snapshot generated from Alpha Vantage quote, FX_DAILY, and FX_INTRADAY where available. "
                    "Current price may come from realtime quote. "
                    "Verified BSL/SSL are only exposed when fresh intraday candles are available."
                ),
                raw_payload={
                    "quote": quote_result.get("raw") or {},
                    "quote_freshness": quote_freshness,
                    "daily_freshness": daily_freshness,
                    "intraday_freshness": intraday_freshness,
                    "daily_candle_count": len(daily_candles),
                    "intraday_candle_count": len(intraday_candles),
                    "stored_daily_candles_this_sync": len(daily_candles_stored),
                    "stored_intraday_candles_this_sync": len(intraday_candles_stored),
                },
            )

            return snapshot

    def derive_trend_bias(self, candles):
        ordered = list(reversed(candles[:20]))

        closes = [c.close for c in ordered if c.close is not None]

        if len(closes) < 5:
            return "insufficient_data"

        short_avg = sum(closes[-5:]) / Decimal("5")
        long_count = min(len(closes), 20)
        long_avg = sum(closes[-long_count:]) / Decimal(str(long_count))

        if short_avg > long_avg:
            return "bullish"
        if short_avg < long_avg:
            return "bearish"
        return "neutral"

    def derive_volatility_regime(self, candles):
        recent = candles[:14]

        ranges = [
            abs(c.high - c.low)
            for c in recent
            if c.high is not None and c.low is not None
        ]

        if len(ranges) < 5:
            return "unknown"

        avg_range = sum(ranges) / Decimal(str(len(ranges)))
        latest_range = ranges[0]

        if latest_range > avg_range * Decimal("1.5"):
            return "high"
        if latest_range < avg_range * Decimal("0.7"):
            return "low"
        return "normal"

    def sync_forex_symbol(self, symbol, outputsize="compact", interval="15min"):
        instrument = self.get_or_create_instrument(symbol)

        daily_result = self.fetch_fx_daily(
            instrument.symbol,
            outputsize=outputsize,
        )

        stored_daily_candles = []
        if daily_result.get("ok"):
            stored_daily_candles = self.store_daily_candles(
                instrument,
                daily_result,
            )

        intraday_result = self.fetch_fx_intraday(
            instrument.symbol,
            interval=interval,
            outputsize=outputsize,
        )

        stored_intraday_candles = []
        if intraday_result.get("ok"):
            stored_intraday_candles = self.store_intraday_candles(
                instrument,
                intraday_result,
            )

        quote_result = self.fetch_fx_quote(instrument.symbol)

        quote = None
        if quote_result.get("ok"):
            quote = self.store_quote(instrument, quote_result)

        liquidity_timeframe = interval_to_timeframe(interval)

        snapshot = self.build_snapshot(
            instrument=instrument,
            quote_result=quote_result,
            daily_candles_stored=stored_daily_candles,
            intraday_candles_stored=stored_intraday_candles,
            liquidity_timeframe=liquidity_timeframe,
        )

        return {
            "ok": quote_result.get("ok") or daily_result.get("ok") or intraday_result.get("ok"),
            "quote_ok": quote_result.get("ok", False),
            "daily_ok": daily_result.get("ok", False),
            "intraday_ok": intraday_result.get("ok", False),
            "symbol": instrument.symbol,
            "instrument_id": instrument.id,
            "quote_id": quote.id if quote else None,
            "stored_daily_candles": len(stored_daily_candles),
            "stored_intraday_candles": len(stored_intraday_candles),
            "snapshot_id": snapshot.id if snapshot else None,
            "snapshot_freshness": snapshot.data_freshness if snapshot else "missing",
            "liquidity_source": snapshot.liquidity_source if snapshot else "unavailable",
            "liquidity_timeframe": snapshot.liquidity_timeframe if snapshot else "",
            "liquidity_warning": snapshot.liquidity_warning if snapshot else "",
            "quote_error": quote_result.get("error", ""),
            "daily_error": daily_result.get("error", ""),
            "intraday_error": intraday_result.get("error", ""),
            "daily_raw_keys": list((daily_result.get("raw") or {}).keys())
            if isinstance(daily_result.get("raw"), dict)
            else [],
            "intraday_raw_keys": list((intraday_result.get("raw") or {}).keys())
            if isinstance(intraday_result.get("raw"), dict)
            else [],
        }
    
    def derive_nearest_liquidity(self, candles, current_price):
        """
        Derives nearest usable BSL/SSL around current price.

        BSL = nearest recent candle high above current price.
        SSL = nearest recent candle low below current price.

        recent_swing_high/recent_swing_low remain the wider external extremes.
        """

        if not candles:
            return {
                "buy_side_liquidity": None,
                "sell_side_liquidity": None,
                "recent_swing_high": None,
                "recent_swing_low": None,
            }

        highs = [c.high for c in candles if c.high is not None]
        lows = [c.low for c in candles if c.low is not None]

        if not highs or not lows:
            return {
                "buy_side_liquidity": None,
                "sell_side_liquidity": None,
                "recent_swing_high": None,
                "recent_swing_low": None,
            }

        recent_swing_high = max(highs)
        recent_swing_low = min(lows)

        if current_price is None:
            return {
                "buy_side_liquidity": recent_swing_high,
                "sell_side_liquidity": recent_swing_low,
                "recent_swing_high": recent_swing_high,
                "recent_swing_low": recent_swing_low,
            }

        highs_above = [value for value in highs if value > current_price]
        lows_below = [value for value in lows if value < current_price]

        buy_side_liquidity = min(highs_above) if highs_above else recent_swing_high
        sell_side_liquidity = max(lows_below) if lows_below else recent_swing_low

        return {
            "buy_side_liquidity": buy_side_liquidity,
            "sell_side_liquidity": sell_side_liquidity,
            "recent_swing_high": recent_swing_high,
            "recent_swing_low": recent_swing_low,
        }
    
    def get_daily_candle_freshness(self, latest_candle):
        """
        Daily candles are not the same as live intraday data.

        If the latest daily candle is too old, we should not derive SSL/BSL
        from it because that would make the AI appear current when it is not.
        """

        if not latest_candle or not latest_candle.timestamp:
            return {
                "is_fresh": False,
                "status": "missing_daily_candles",
                "age_hours": None,
                "warning": "No daily candles are available.",
            }

        now = timezone.now()
        age = now - latest_candle.timestamp
        age_hours = age.total_seconds() / 3600

        # Strict rule:
        # If daily candle is older than 36 hours, do not use it for exact liquidity.
        if age_hours <= 36:
            return {
                "is_fresh": True,
                "status": "fresh",
                "age_hours": round(age_hours, 2),
                "warning": "",
            }

        return {
            "is_fresh": False,
            "status": "fresh_quote_stale_candles",
            "age_hours": round(age_hours, 2),
            "warning": (
                "Realtime quote may be fresh, but daily candle data is older "
                "than 36 hours. Exact SSL/BSL levels are disabled."
            ),
        }
    
    def fetch_fx_intraday(self, symbol, interval="15min", outputsize="compact"):
        from_symbol, to_symbol = normalize_fx_symbol(symbol)

        if not from_symbol or not to_symbol:
            return {
                "ok": False,
                "error": f"Could not parse FX symbol: {symbol}",
                "candles": [],
                "raw": {},
            }

        result = self.request({
            "function": "FX_INTRADAY",
            "from_symbol": from_symbol,
            "to_symbol": to_symbol,
            "interval": interval,
            "outputsize": outputsize,
        })

        if not result["ok"]:
            return {
                "ok": False,
                "error": result["error"],
                "candles": [],
                "raw": result["data"],
            }

        series_key = get_fx_intraday_series_key(interval)
        series = result["data"].get(series_key, {})

        if not series:
            return {
                "ok": False,
                "error": f"No FX intraday series returned for key: {series_key}",
                "candles": [],
                "raw": result["data"],
            }

        candles = []

        for timestamp_string, candle in series.items():
            candles.append({
                "timestamp": parse_provider_datetime(timestamp_string),
                "open": to_decimal(candle.get("1. open")),
                "high": to_decimal(candle.get("2. high")),
                "low": to_decimal(candle.get("3. low")),
                "close": to_decimal(candle.get("4. close")),
                "raw": candle,
            })

        candles = [
            candle for candle in candles
            if candle.get("timestamp") is not None
        ]

        candles.sort(key=lambda item: item["timestamp"], reverse=True)

        return {
            "ok": True,
            "error": "",
            "candles": candles,
            "interval": interval,
            "timeframe": interval_to_timeframe(interval),
            "raw": result["data"].get("Meta Data", {}),
        }

    def store_intraday_candles(self, instrument, intraday_result):
        stored = []
        timeframe = intraday_result.get("timeframe", "15m")

        for candle in intraday_result.get("candles", []):
            if not all([
                candle.get("timestamp"),
                candle.get("open") is not None,
                candle.get("high") is not None,
                candle.get("low") is not None,
                candle.get("close") is not None,
            ]):
                continue

            obj, _ = Candle.objects.update_or_create(
                instrument=instrument,
                provider=self.provider,
                timeframe=timeframe,
                timestamp=candle["timestamp"],
                defaults={
                    "open": candle["open"],
                    "high": candle["high"],
                    "low": candle["low"],
                    "close": candle["close"],
                    "volume": None,
                    "raw_payload": candle.get("raw") or {},
                },
            )

            stored.append(obj)

        return stored

    def get_candle_age_info(self, latest_candle, max_age_hours, label):
        if not latest_candle or not latest_candle.timestamp:
            return {
                "is_fresh": False,
                "status": f"missing_{label}",
                "age_hours": None,
                "warning": f"No {label} candles are available.",
            }

        now = timezone.now()
        age = now - latest_candle.timestamp
        age_hours = age.total_seconds() / 3600

        if age_hours <= max_age_hours:
            return {
                "is_fresh": True,
                "status": "fresh",
                "age_hours": round(age_hours, 2),
                "warning": "",
            }

        return {
            "is_fresh": False,
            "status": f"stale_{label}",
            "age_hours": round(age_hours, 2),
            "warning": (
                f"{label} candle data is older than {max_age_hours} hours. "
                "Exact liquidity levels are disabled."
            ),
        }

    def derive_nearest_liquidity(self, candles, current_price):
        """
        BSL = nearest recent candle high above current price.
        SSL = nearest recent candle low below current price.

        This should be used with fresh intraday candles only.
        """

        if not candles:
            return {
                "buy_side_liquidity": None,
                "sell_side_liquidity": None,
                "recent_swing_high": None,
                "recent_swing_low": None,
            }

        highs = [c.high for c in candles if c.high is not None]
        lows = [c.low for c in candles if c.low is not None]

        if not highs or not lows:
            return {
                "buy_side_liquidity": None,
                "sell_side_liquidity": None,
                "recent_swing_high": None,
                "recent_swing_low": None,
            }

        recent_swing_high = max(highs)
        recent_swing_low = min(lows)

        if current_price is None:
            return {
                "buy_side_liquidity": recent_swing_high,
                "sell_side_liquidity": recent_swing_low,
                "recent_swing_high": recent_swing_high,
                "recent_swing_low": recent_swing_low,
            }

        highs_above = [value for value in highs if value > current_price]
        lows_below = [value for value in lows if value < current_price]

        buy_side_liquidity = min(highs_above) if highs_above else None
        sell_side_liquidity = max(lows_below) if lows_below else None

        return {
            "buy_side_liquidity": buy_side_liquidity,
            "sell_side_liquidity": sell_side_liquidity,
            "recent_swing_high": recent_swing_high,
            "recent_swing_low": recent_swing_low,
        }