from django.core.management.base import BaseCommand

from core.models import Instrument
from market_data.models import DataProvider


class Command(BaseCommand):
    help = "Seed baseline market data providers and common instruments."

    def handle(self, *args, **options):
        providers = [
            {
                "name": "Alpha Vantage",
                "code": "alphavantage",
                "website": "https://www.alphavantage.co/",
                "supports_realtime": True,
                "supports_intraday": True,
                "supports_daily": True,
            },
            {
                "name": "Manual",
                "code": "manual",
                "supports_realtime": False,
                "supports_intraday": False,
                "supports_daily": False,
            },
        ]

        for provider in providers:
            DataProvider.objects.update_or_create(
                code=provider["code"],
                defaults=provider,
            )

        instruments = [
            {
                "symbol": "EUR/USD",
                "name": "Euro / US Dollar",
                "asset_class": "forex",
                "provider_symbol": "EUR/USD",
                "pip_size": "0.0001",
                "tick_size": "0.00001",
                "currency": "USD",
                "timezone": "UTC",
            },
            {
                "symbol": "GBP/USD",
                "name": "British Pound / US Dollar",
                "asset_class": "forex",
                "provider_symbol": "GBP/USD",
                "pip_size": "0.0001",
                "tick_size": "0.00001",
                "currency": "USD",
                "timezone": "UTC",
            },
            {
                "symbol": "USD/JPY",
                "name": "US Dollar / Japanese Yen",
                "asset_class": "forex",
                "provider_symbol": "USD/JPY",
                "pip_size": "0.01",
                "tick_size": "0.001",
                "currency": "JPY",
                "timezone": "UTC",
            },
            {
                "symbol": "XAU/USD",
                "name": "Gold / US Dollar",
                "asset_class": "commodity",
                "provider_symbol": "XAU/USD",
                "tick_size": "0.01",
                "currency": "USD",
                "timezone": "UTC",
            },
            {
                "symbol": "BTC/USD",
                "name": "Bitcoin / US Dollar",
                "asset_class": "crypto",
                "provider_symbol": "BTC/USD",
                "tick_size": "0.01",
                "currency": "USD",
                "timezone": "UTC",
            },
            {
                "symbol": "ETH/USD",
                "name": "Ethereum / US Dollar",
                "asset_class": "crypto",
                "provider_symbol": "ETH/USD",
                "tick_size": "0.01",
                "currency": "USD",
                "timezone": "UTC",
            },
            {
                "symbol": "ES",
                "name": "S&P 500 E-mini Futures",
                "asset_class": "futures",
                "provider_symbol": "ES",
                "tick_size": "0.25",
                "currency": "USD",
                "exchange": "CME",
                "timezone": "America/New_York",
            },
            {
                "symbol": "NQ",
                "name": "Nasdaq 100 E-mini Futures",
                "asset_class": "futures",
                "provider_symbol": "NQ",
                "tick_size": "0.25",
                "currency": "USD",
                "exchange": "CME",
                "timezone": "America/New_York",
            },
            {
                "symbol": "AAPL",
                "name": "Apple Inc.",
                "asset_class": "stock",
                "provider_symbol": "AAPL",
                "tick_size": "0.01",
                "currency": "USD",
                "exchange": "NASDAQ",
                "timezone": "America/New_York",
            },
            {
                "symbol": "NVDA",
                "name": "NVIDIA Corporation",
                "asset_class": "stock",
                "provider_symbol": "NVDA",
                "tick_size": "0.01",
                "currency": "USD",
                "exchange": "NASDAQ",
                "timezone": "America/New_York",
            },
        ]

        for instrument in instruments:
            Instrument.objects.update_or_create(
                symbol=instrument["symbol"],
                defaults=instrument,
            )

        self.stdout.write(self.style.SUCCESS("Seeded market providers and instruments."))