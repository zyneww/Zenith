import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const CACHE_TTL = 60;

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "DOTUSDT", "AVAXUSDT"];

async function fetchBinanceFunding() {
  const res = await fetch("https://fapi.binance.com/fapi/v1/premiumIndex", { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Binance funding ${res.status}`);
  const data = await res.json();
  return data.filter((d: any) => SYMBOLS.includes(d.symbol)).map((d: any) => ({
    symbol: d.symbol.replace("USDT", ""),
    fundingRate: parseFloat(d.lastFundingRate),
    markPrice: parseFloat(d.markPrice),
    nextFundingTime: d.nextFundingTime,
    exchange: "binance",
  }));
}

async function fetchOKXFunding() {
  const results = [];
  for (const sym of ["BTC-USD-SWAP", "ETH-USD-SWAP", "SOL-USD-SWAP"]) {
    const res = await fetch(`https://www.okx.com/api/v5/public/funding-rate?instId=${sym}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) continue;
    const json = await res.json();
    if (json.data?.[0]) {
      results.push({
        symbol: sym.split("-")[0],
        fundingRate: parseFloat(json.data[0].fundingRate),
        markPrice: parseFloat(json.data[0].markPrice || "0"),
        nextFundingTime: parseInt(json.data[0].nextFundingTime),
        exchange: "okx",
      });
    }
  }
  return results;
}

async function fetchBybitFunding() {
  const results = [];
  for (const sym of ["BTCUSDT", "ETHUSDT", "SOLUSDT"]) {
    const res = await fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${sym}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) continue;
    const json = await res.json();
    if (json.result?.list?.[0]) {
      const t = json.result.list[0];
      results.push({
        symbol: sym.replace("USDT", ""),
        fundingRate: parseFloat(t.fundingRate),
        markPrice: parseFloat(t.markPrice || t.lastPrice),
        nextFundingTime: parseInt(t.nextFundingTime),
        exchange: "bybit",
      });
    }
  }
  return results;
}

async function fetchBybitOI() {
  const results = [];
  for (const sym of ["BTCUSDT", "ETHUSDT", "SOLUSDT"]) {
    const res = await fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${sym}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) continue;
    const json = await res.json();
    if (json.result?.list?.[0]) {
      const t = json.result.list[0];
      results.push({
        symbol: sym.replace("USDT", ""),
        openInterest: parseFloat(t.openInterest),
        openInterestValue: parseFloat(t.openInterestValue),
        exchange: "bybit",
      });
    }
  }
  return results;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`derivatives:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "funding";

  if (type === "oi") {
    const cached = await redis.get("derivatives:oi");
    if (cached) return NextResponse.json(JSON.parse(cached), { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
    try {
      const bybit = await fetchBybitOI();
      const data = { bybit };
      await redis.setex("derivatives:oi", CACHE_TTL, JSON.stringify(data));
      return NextResponse.json(data, { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
    } catch {
      return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 });
    }
  }

  const cached = await redis.get("derivatives:funding");
  if (cached) return NextResponse.json(JSON.parse(cached), { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });

  const [binance, okx, bybit] = await Promise.allSettled([
    fetchBinanceFunding(),
    fetchOKXFunding(),
    fetchBybitFunding(),
  ]);

  const data = {
    binance: binance.status === "fulfilled" ? binance.value : [],
    okx: okx.status === "fulfilled" ? okx.value : [],
    bybit: bybit.status === "fulfilled" ? bybit.value : [],
  };

  if (!data.binance.length && !data.okx.length && !data.bybit.length) {
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 });
  }

  await redis.setex("derivatives:funding", CACHE_TTL, JSON.stringify(data));
  return NextResponse.json(data, { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
}
