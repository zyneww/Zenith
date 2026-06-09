// apps/web/lib/db/questdb.ts
import { Pool } from 'pg'

const QUESTDB_URL = process.env.QUESTDB_URL || 'postgresql://zenith:questdb_dev@localhost:8812/qdb'

export const questdb = new Pool({
  connectionString: QUESTDB_URL,
  // QuestDB-specific optimizations
  max: 20, // Max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

// Helper to query OHLCV data
export async function getOHLCV(
  symbol: string,
  interval: string = '1h',
  limit: number = 100
) {
  const query = `
    SELECT timestamp, open, high, low, close, volume
    FROM ohlcv
    WHERE symbol = $1 AND interval = $2
    ORDER BY timestamp DESC
    LIMIT $3
  `
  
  const result = await questdb.query(query, [symbol.toUpperCase(), interval, limit])
  
  return result.rows.map((row: any) => ({
    time: new Date(row.timestamp).getTime() / 1000,
    open: parseFloat(row.open),
    high: parseFloat(row.high),
    low: parseFloat(row.low),
    close: parseFloat(row.close),
    volume: parseFloat(row.volume),
  })).reverse() // Reverse to chronological order
}

// Helper to get latest trades
export async function getLatestTrades(symbol: string, limit: number = 100) {
  const query = `
    SELECT symbol, price, quantity, side, timestamp
    FROM trades
    WHERE symbol = $1
    ORDER BY timestamp DESC
    LIMIT $2
  `
  
  const result = await questdb.query(query, [symbol.toUpperCase(), limit])
  
  return result.rows.map((row: any) => ({
    symbol: row.symbol,
    price: parseFloat(row.price),
    quantity: parseFloat(row.quantity),
    side: row.side,
    timestamp: new Date(row.timestamp).toISOString(),
  }))
}

// Health check
export async function questdbHealth() {
  try {
    await questdb.query('SELECT 1')
    return { status: 'ok', connected: true }
  } catch (error) {
    return { status: 'error', connected: false, error: (error as Error).message }
  }
}
