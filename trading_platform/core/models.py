from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ("trader", "Trader"),
        ("admin", "Admin"),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="trader")

class Instrument(models.Model):
    ASSET_CLASS_CHOICES = [
        ("forex", "Forex"),
        ("crypto", "Crypto"),
        ("stock", "Stock"),
        ("index", "Index"),
        ("futures", "Futures"),
        ("commodity", "Commodity"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("watch_only", "Watch Only"),
    ]

    symbol = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=120)
    asset_class = models.CharField(
        max_length=20,
        choices=ASSET_CLASS_CHOICES,
        default="crypto",
    )

    provider_symbol = models.CharField(
        max_length=64,
        blank=True,
        help_text="Symbol format used by external data provider.",
    )

    exchange = models.CharField(max_length=80, blank=True)
    timezone = models.CharField(max_length=64, default="UTC")

    pip_size = models.DecimalField(
        max_digits=12,
        decimal_places=8,
        null=True,
        blank=True,
        help_text="Useful for forex instruments.",
    )

    tick_size = models.DecimalField(
        max_digits=12,
        decimal_places=8,
        null=True,
        blank=True,
        help_text="Useful for futures, stocks, crypto, commodities.",
    )

    currency = models.CharField(max_length=16, blank=True)
    description = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )

    is_tradeable = models.BooleanField(default=False)
    is_watchlist_enabled = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_instruments",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["asset_class", "symbol"]

    def __str__(self):
        return f"{self.symbol} · {self.asset_class}"

class Strategy(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField()
    trader = models.ForeignKey(User, on_delete=models.CASCADE)

class Trade(models.Model):
    instrument = models.ForeignKey(Instrument, on_delete=models.CASCADE)
    trader = models.ForeignKey(User, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=20, decimal_places=8)
    price = models.DecimalField(max_digits=20, decimal_places=8)
    side = models.CharField(max_length=4)  # buy/sell
    order_type = models.CharField(max_length=20)  # market, limit, stop
    executed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20)  # pending/executed/cancelled

# core/models.py (add this class)
class Watchlist(models.Model):
    name = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    instruments = models.ManyToManyField(Instrument, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"