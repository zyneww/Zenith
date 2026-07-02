export function calcRSI(closes: number[], period = 14): number[] {
  if (closes.length < period + 1) return [];
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }
  const avgGain = (arr: number[], len: number) => arr.slice(0, len).reduce((a, b) => a + b, 0) / len;
  let avgG = avgGain(gains, period);
  let avgL = avgGain(losses, period);
  const rsi: number[] = [avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL)];
  for (let i = period; i < gains.length; i++) {
    avgG = (avgG * (period - 1) + gains[i]) / period;
    avgL = (avgL * (period - 1) + losses[i]) / period;
    rsi.push(avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL));
  }
  return rsi;
}

export function calcEMA(closes: number[], period: number): number[] {
  if (closes.length < period) return [];
  const multiplier = 2 / (period + 1);
  const ema: number[] = [];
  const sma = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(sma);
  for (let i = period; i < closes.length; i++) {
    ema.push((closes[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
  }
  return ema;
}

export function calcSMA(closes: number[], period: number): number[] {
  if (closes.length < period) return [];
  const sma: number[] = [];
  for (let i = period - 1; i < closes.length; i++) {
    const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

export interface MACDResult {
  macd: number[];
  signal: number[];
  histogram: number[];
}

export function calcMACD(closes: number[], fast = 12, slow = 26, signal = 9): MACDResult | null {
  if (closes.length < slow + signal) return null;
  const emaFast = calcEMA(closes, fast);
  const emaSlow = calcEMA(closes, slow);
  const offset = emaFast.length - emaSlow.length;
  const macdLine = emaFast.slice(offset).map((v, i) => v - emaSlow[i]);
  const signalLine = calcEMA(macdLine, signal);
  if (!signalLine) return null;
  const histOffset = macdLine.length - signalLine.length;
  const histogram = macdLine.slice(histOffset).map((v, i) => v - signalLine[i]);
  return { macd: macdLine, signal: signalLine, histogram };
}

export function formatIndicatorValue(v: number, decimals = 2): string {
  return v.toFixed(decimals);
}
