import { Pool } from "pg";

const QUESTDB_URL = process.env.QUESTDB_URL || "postgresql://zenith:questdb_dev@localhost:8812/qdb";

const pool = new Pool({
  connectionString: QUESTDB_URL,
  max: 5,
});

export async function insertTrade(
  symbol: string,
  price: number,
  quantity: number,
  side: string
) {
  await pool.query(
    "INSERT INTO trades(symbol, price, quantity, side, timestamp) VALUES($1, $2, $3, $4, now())",
    [symbol.toUpperCase(), price, quantity, side]
  );
}

export async function aggregateCandles() {
  try {
    const result = await pool.query(`
      INSERT INTO ohlcv(symbol, interval, open, high, low, close, volume, timestamp)
      SELECT
        symbol,
        '1m',
        first(price),
        max(price),
        min(price),
        last(price),
        sum(quantity),
        timestamp
      FROM trades
      WHERE timestamp > dateadd('m', -2, now())
      SAMPLE BY 1m
    `);
    if (result.rowCount && result.rowCount > 0) {
      console.log(`[Candles] Aggregated ${result.rowCount} 1m candles`);
    }
  } catch (err) {
    console.error("[Candles] Aggregation query failed:", err);
  }
}
