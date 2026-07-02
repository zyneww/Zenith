import { NextRequest, NextResponse } from "next/server";
import { questdb } from "@/lib/db/questdb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function calcRSI(closes: number[], period = 14): number[] {
  if (closes.length < period + 1) return [];
  const gains: number[] = []; const losses: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0); losses.push(diff < 0 ? -diff : 0);
  }
  const avgGain = (arr: number[], len: number) => arr.slice(0, len).reduce((a, b) => a + b, 0) / len;
  let avgG = avgGain(gains, period); let avgL = avgGain(losses, period);
  if (avgL === 0) return [100];
  const rsi: number[] = [100 - 100 / (1 + avgG / avgL)];
  for (let i = period; i < gains.length; i++) {
    avgG = (avgG * (period - 1) + gains[i]) / period;
    avgL = (avgL * (period - 1) + losses[i]) / period;
    rsi.push(avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL));
  }
  return rsi;
}

function calcEMA(closes: number[], period: number): number[] {
  if (closes.length < period) return [];
  const multiplier = 2 / (period + 1);
  const ema: number[] = [];
  const sma = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(sma);
  for (let i = period; i < closes.length; i++)
    ema.push((closes[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
  return ema;
}

function calcSMA(closes: number[], period: number): number[] {
  if (closes.length < period) return [];
  const sma: number[] = [];
  for (let i = period - 1; i < closes.length; i++)
    sma.push(closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period);
  return sma;
}

function calcMACD(closes: number[], fast = 12, slow = 26, signal = 9) {
  if (closes.length < slow + signal) return null;
  const ef = calcEMA(closes, fast); const es = calcEMA(closes, slow);
  const offset = ef.length - es.length;
  const macdLine = ef.slice(offset).map((v, i) => v - es[i]);
  const signalLine = calcEMA(macdLine, signal);
  if (!signalLine || signalLine.length === 0) return null;
  const histOffset = macdLine.length - signalLine.length;
  const histogram = macdLine.slice(histOffset).map((v, i) => v - signalLine[i]);
  return { macdLine, signalLine, histogram };
}

function calcBollinger(closes: number[], period = 20, stdDev = 2) {
  const middle = calcSMA(closes, period);
  if (middle.length === 0) return null;
  const upper: number[] = []; const lower: number[] = [];
  for (let i = 0; i < middle.length; i++) {
    const idx = closes.length - middle.length + i;
    const slice = closes.slice(idx, idx + period);
    const mean = middle[i];
    const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    upper.push(mean + stdDev * std);
    lower.push(mean - stdDev * std);
  }
  return { middle, upper, lower };
}

function calcStoch(highs: number[], lows: number[], closes: number[], period = 14, smoothK = 3, smoothD = 3) {
  if (closes.length < period) return null;
  const rawK: number[] = [];
  for (let i = period - 1; i < closes.length; i++) {
    const hh = Math.max(...highs.slice(i - period + 1, i + 1));
    const ll = Math.min(...lows.slice(i - period + 1, i + 1));
    rawK.push(hh - ll === 0 ? 50 : ((closes[i] - ll) / (hh - ll)) * 100);
  }
  const k = calcSMA(rawK, smoothK);
  const d = k ? calcSMA(k, smoothD) : null;
  return { k, d };
}

function calcVWAP(highs: number[], lows: number[], closes: number[], volumes: number[]) {
  if (highs.length === 0) return [];
  let cumTPV = 0; let cumVol = 0; const vwap: number[] = [];
  for (let i = 0; i < highs.length; i++) {
    const tp = (highs[i] + lows[i] + closes[i]) / 3;
    cumTPV += tp * volumes[i];
    cumVol += volumes[i];
    vwap.push(cumTPV / cumVol);
  }
  return vwap;
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") || "BTC";
  const interval = req.nextUrl.searchParams.get("interval") || "1h";
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "200"), 500);

  try {
    const query = `
      SELECT timestamp, open, high, low, close, volume
      FROM ohlcv
      WHERE symbol = $1 AND interval = $2
      ORDER BY timestamp DESC
      LIMIT $3
    `;
    const result = await questdb.query(query, [symbol.toUpperCase(), interval, limit]);
    const rows = result.rows.map((row: any) => ({
      t: new Date(row.timestamp).getTime() / 1000,
      o: parseFloat(row.open), h: parseFloat(row.high),
      l: parseFloat(row.low), c: parseFloat(row.close),
      v: parseFloat(row.volume),
    })).reverse();

    if (rows.length < 30) {
      return NextResponse.json({
        ok: false, error: "not_enough_data",
        count: rows.length, needed: 30,
      });
    }

    const closes = rows.map(r => r.c);
    const highs = rows.map(r => r.h);
    const lows = rows.map(r => r.l);
    const volumes = rows.map(r => r.v);
    const latestC = closes[closes.length - 1];

    const rsi = calcRSI(closes, 14);
    const ema5 = calcEMA(closes, 5);
    const ema10 = calcEMA(closes, 10);
    const ema20 = calcEMA(closes, 20);
    const ema30 = calcEMA(closes, 30);
    const ema50 = calcEMA(closes, 50);
    const macd = calcMACD(closes, 12, 26, 9);
    const bb = calcBollinger(closes, 20, 2);
    const stoch = calcStoch(highs, lows, closes, 14, 3, 3);
    const vwap = calcVWAP(highs, lows, closes, volumes);

    const latestRSI = rsi.length > 0 ? rsi[rsi.length - 1] : null;
    const latestBB = bb ? { upper: bb.upper[bb.upper.length - 1], middle: bb.middle[bb.middle.length - 1], lower: bb.lower[bb.lower.length - 1] } : null;
    const latestStoch = stoch && stoch.k.length > 0 ? { k: stoch.k[stoch.k.length - 1], d: stoch.d ? stoch.d[stoch.d.length - 1] : null } : null;
    const latestVWAP = vwap.length > 0 ? vwap[vwap.length - 1] : null;
    const latestMACD = macd ? { macd: macd.macdLine[macd.macdLine.length - 1], signal: macd.signalLine[macd.signalLine.length - 1], histogram: macd.histogram[macd.histogram.length - 1] } : null;

    const signalRSI = latestRSI !== null ? (latestRSI >= 70 ? "SURACHAT" : latestRSI <= 30 ? "SURVENTE" : "NEUTRE") : null;
    const signalMACD = macd && latestMACD ? (latestMACD.histogram >= 0 ? "BULLISH" : "BEARISH") : null;
    const signalBB = latestBB ? (latestC >= latestBB.upper ? "SURACHAT" : latestC <= latestBB.lower ? "SURVENTE" : "NEUTRE") : null;

    return NextResponse.json({
      ok: true,
      symbol: symbol.toUpperCase(),
      interval,
      count: rows.length,
      latest: { close: latestC, timestamp: rows[rows.length - 1].t },
      indicators: {
        rsi: { value: latestRSI, period: 14, signal: signalRSI },
        ema: [
          { period: 5, value: ema5.length > 0 ? ema5[ema5.length - 1] : null },
          { period: 10, value: ema10.length > 0 ? ema10[ema10.length - 1] : null },
          { period: 20, value: ema20.length > 0 ? ema20[ema20.length - 1] : null },
          { period: 30, value: ema30.length > 0 ? ema30[ema30.length - 1] : null },
          { period: 50, value: ema50.length > 0 ? ema50[ema50.length - 1] : null },
        ],
        macd: latestMACD ? {
          macd: latestMACD.macd,
          signalLine: latestMACD.signal,
          histogram: latestMACD.histogram,
          trend: signalMACD,
        } : null,
        bollinger: latestBB,
        stoch: latestStoch,
        vwap: latestVWAP,
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
