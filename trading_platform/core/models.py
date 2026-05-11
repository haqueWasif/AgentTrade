from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ("trader", "Trader"),
        ("admin", "Admin"),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="trader")

class Instrument(models.Model):
    symbol = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    asset_class = models.CharField(max_length=10)  # forex, crypto, stock
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.symbol} ({self.asset_class})"

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
    trader = models.ForeignKey(User, on_delete=models.CASCADE)
    instruments = models.ManyToManyField(Instrument, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.trader.username})"