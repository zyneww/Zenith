-- infra/questdb/init.sql
-- Schema time-series pour Zenith

-- Trades temps réel (inserts via Binance WS)
CREATE TABLE IF NOT EXISTS trades (
  symbol       SYMBOL CAPACITY 256 CACHE,
  price        DOUBLE,
  quantity     DOUBLE,
  side         SYMBOL CAPACITY 2,      -- 'BUY' | 'SELL'
  timestamp    TIMESTAMP
) TIMESTAMP(timestamp) PARTITION BY DAY WAL;

-- OHLCV historique (candles)
CREATE TABLE IF NOT EXISTS ohlcv (
  symbol       SYMBOL CAPACITY 256 CACHE,
  interval     SYMBOL CAPACITY 16,     -- '1m','5m','15m','1h','4h','1d','1w'
  open         DOUBLE,
  high         DOUBLE,
  low          DOUBLE,
  close        DOUBLE,
  volume       DOUBLE,
  timestamp    TIMESTAMP
) TIMESTAMP(timestamp) PARTITION BY MONTH WAL;

-- Index optimisés pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_ohlcv_symbol_interval ON ohlcv(symbol, interval);
