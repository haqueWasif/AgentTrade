from django.db import models

from core.models import Instrument


class DataProvider(models.Model):
    name = models.CharField(max_length=80, unique=True)
    code = models.SlugField(max_length=80, unique=True)

    website = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)

    supports_realtime = models.BooleanField(default=False)
    supports_intraday = models.BooleanField(default=False)
    supports_daily = models.BooleanField(default=True)

    rate_limit_note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Quote(models.Model):
    instrument = models.ForeignKey(
        Instrument,
        on_delete=models.CASCADE,
        related_name="quotes",
    )

    provider = models.ForeignKey(
        DataProvider,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotes",
    )

    bid = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    ask = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    mid = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    last = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)

    volume = models.DecimalField(max_digits=24, decimal_places=8, null=True, blank=True)

    provider_timestamp = models.DateTimeField(null=True, blank=True)
    received_at = models.DateTimeField(auto_now_add=True)

    raw_payload = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-provider_timestamp", "-received_at"]
        indexes = [
            models.Index(fields=["instrument", "-provider_timestamp"]),
            models.Index(fields=["instrument", "-received_at"]),
        ]

    def __str__(self):
        price = self.last or self.mid or self.bid or self.ask
        return f"{self.instrument.symbol} quote {price}"


class Candle(models.Model):
    TIMEFRAME_CHOICES = [
        ("1m", "1 Minute"),
        ("5m", "5 Minutes"),
        ("15m", "15 Minutes"),
        ("30m", "30 Minutes"),
        ("1h", "1 Hour"),
        ("4h", "4 Hours"),
        ("1d", "1 Day"),
        ("1w", "1 Week"),
        ("1M", "1 Month"),
    ]

    instrument = models.ForeignKey(
        Instrument,
        on_delete=models.CASCADE,
        related_name="candles",
    )

    provider = models.ForeignKey(
        DataProvider,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="candles",
    )

    timeframe = models.CharField(max_length=8, choices=TIMEFRAME_CHOICES)

    timestamp = models.DateTimeField()

    open = models.DecimalField(max_digits=20, decimal_places=8)
    high = models.DecimalField(max_digits=20, decimal_places=8)
    low = models.DecimalField(max_digits=20, decimal_places=8)
    close = models.DecimalField(max_digits=20, decimal_places=8)

    volume = models.DecimalField(max_digits=24, decimal_places=8, null=True, blank=True)

    raw_payload = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        constraints = [
            models.UniqueConstraint(
                fields=["instrument", "provider", "timeframe", "timestamp"],
                name="unique_candle_per_provider_timeframe_timestamp",
            )
        ]
        indexes = [
            models.Index(fields=["instrument", "timeframe", "-timestamp"]),
        ]

    def __str__(self):
        return f"{self.instrument.symbol} {self.timeframe} {self.timestamp}"


class MarketSnapshot(models.Model):
    instrument = models.ForeignKey(
        Instrument,
        on_delete=models.CASCADE,
        related_name="market_snapshots",
    )

    provider = models.ForeignKey(
        DataProvider,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="market_snapshots",
    )

    timestamp = models.DateTimeField()

    current_price = models.DecimalField(
        max_digits=20,
        decimal_places=8,
        null=True,
        blank=True,
    )

    day_open = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    day_high = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    day_low = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    day_close = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)

    previous_day_high = models.DecimalField(
        max_digits=20,
        decimal_places=8,
        null=True,
        blank=True,
    )
    previous_day_low = models.DecimalField(
        max_digits=20,
        decimal_places=8,
        null=True,
        blank=True,
    )

    recent_swing_high = models.DecimalField(
        max_digits=20,
        decimal_places=8,
        null=True,
        blank=True,
    )
    recent_swing_low = models.DecimalField(
        max_digits=20,
        decimal_places=8,
        null=True,
        blank=True,
    )

    buy_side_liquidity = models.DecimalField(
        max_digits=20,
        decimal_places=8,
        null=True,
        blank=True,
    )
    sell_side_liquidity = models.DecimalField(
        max_digits=20,
        decimal_places=8,
        null=True,
        blank=True,
    )
    
    liquidity_source = models.CharField(
        max_length=40,
        default="unavailable",
        help_text="quote_only, daily_candles, intraday_candles, unavailable",
    )

    liquidity_timeframe = models.CharField(
        max_length=12,
        blank=True,
        help_text="Timeframe used to derive liquidity, for example 15m, 1h, 1d.",
    )

    liquidity_warning = models.TextField(blank=True)


    trend_bias = models.CharField(max_length=40, blank=True)
    volatility_regime = models.CharField(max_length=40, blank=True)
    session_label = models.CharField(max_length=40, blank=True)

    data_freshness = models.CharField(
        max_length=40,
        default="unknown",
        help_text="fresh, delayed, stale, missing, provider_error",
    )

    notes = models.TextField(blank=True)
    raw_payload = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["instrument", "-timestamp"]),
            models.Index(fields=["data_freshness"]),
        ]

    def __str__(self):
        return f"{self.instrument.symbol} snapshot {self.timestamp}"