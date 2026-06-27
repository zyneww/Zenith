import { aggregateCandles } from "./questdb.js";

export function startCandleAggregation(intervalMs = 60_000) {
  console.log(`[Candles] Starting aggregation every ${intervalMs / 1000}s`);
  setInterval(async () => {
    try {
      await aggregateCandles();
    } catch (err) {
      console.error("[Candles] Aggregation failed:", err);
    }
  }, intervalMs);
}
