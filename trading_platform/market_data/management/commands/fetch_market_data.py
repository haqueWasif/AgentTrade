from django.core.management.base import BaseCommand

from core.models import Instrument
from market_data.services.alpha_vantage import AlphaVantageService


class Command(BaseCommand):
    help = "Fetch and store market data from Alpha Vantage."

    def add_arguments(self, parser):
        parser.add_argument(
            "--symbol",
            action="append",
            dest="symbols",
            help="Symbol to fetch, for example EUR/USD. Can be used multiple times.",
        )
        parser.add_argument(
            "--all-forex",
            action="store_true",
            help="Fetch all forex instruments stored in the database.",
        )
        parser.add_argument(
            "--outputsize",
            default="compact",
            choices=["compact", "full"],
            help="Alpha Vantage outputsize for daily candles.",
        )
        parser.add_argument(
            "--interval",
            default="15min",
            choices=["1min", "5min", "15min", "30min", "60min"],
            help="Alpha Vantage FX_INTRADAY interval.",
        )

    def handle(self, *args, **options):
        service = AlphaVantageService()

        if not service.is_configured():
            self.stderr.write(self.style.ERROR("ALPHAVANTAGE_API_KEY is not configured."))
            return

        symbols = options.get("symbols") or []

        if options.get("all_forex"):
            db_symbols = list(
                Instrument.objects.filter(asset_class="forex").values_list("symbol", flat=True)
            )
            symbols.extend(db_symbols)

        if not symbols:
            symbols = ["EUR/USD", "GBP/USD", "USD/JPY"]

        unique_symbols = list(dict.fromkeys(symbols))

        for symbol in unique_symbols:
            self.stdout.write(f"\nFetching {symbol}...")

            result = service.sync_forex_symbol(
                symbol=symbol,
                outputsize=options["outputsize"],
                interval=options["interval"],
            )

            quote_ok = result.get("quote_ok", False)
            daily_ok = result.get("daily_ok", False)
            stored_candles = result.get("stored_candles", 0)

            self.stdout.write(f"quote_ok={quote_ok}")
            self.stdout.write(f"daily_ok={daily_ok}")
            self.stdout.write(f"stored_candles={stored_candles}")
            self.stdout.write(f"quote_error={result.get('quote_error', '')}")
            self.stdout.write(f"daily_error={result.get('daily_error', '')}")
            self.stdout.write(f"daily_raw_keys={result.get('daily_raw_keys', [])}")

            self.stdout.write(f"intraday_ok={result.get('intraday_ok', False)}")
            self.stdout.write(f"stored_daily_candles={result.get('stored_daily_candles', 0)}")
            self.stdout.write(f"stored_intraday_candles={result.get('stored_intraday_candles', 0)}")
            self.stdout.write(f"liquidity_source={result.get('liquidity_source', '')}")
            self.stdout.write(f"liquidity_timeframe={result.get('liquidity_timeframe', '')}")
            self.stdout.write(f"liquidity_warning={result.get('liquidity_warning', '')}")
            self.stdout.write(f"intraday_error={result.get('intraday_error', '')}")
            self.stdout.write(f"intraday_raw_keys={result.get('intraday_raw_keys', [])}")
            
            if quote_ok and daily_ok and stored_candles > 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{result['symbol']}: quote_id={result['quote_id']}, "
                        f"snapshot_id={result['snapshot_id']}, "
                        f"freshness={result['snapshot_freshness']}"
                    )
                )
            elif quote_ok and not daily_ok:
                self.stdout.write(
                    self.style.WARNING(
                        f"{result['symbol']}: quote stored, but daily candles failed."
                    )
                )
            elif quote_ok and stored_candles == 0:
                self.stdout.write(
                    self.style.WARNING(
                        f"{result['symbol']}: quote stored, but no candles were saved."
                    )
                )
            else:
                self.stderr.write(
                    self.style.ERROR(
                        f"{symbol} failed. "
                        f"quote_error={result.get('quote_error', '')} "
                        f"daily_error={result.get('daily_error', '')}"
                    )
                )