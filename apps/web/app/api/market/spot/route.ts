import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const CACHE_TTL = 30;

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"];

async function fetchOKXSpot() {
  const res = await fetch("https://www.okx.com/api/v5/market/tickers?instType=SPOT", { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`OKX ${res.status}`);
  const json = await res.json();
  return (json.data || [])
    .filter((t: any) => SYMBOLS.includes(t.instId))
    .map((t: any) => ({
      symbol: t.instId.replace("-USDT", ""),
      price: parseFloat(t.last),
      volume: parseFloat(t.volCcy24h),
      change24h: parseFloat(t.change24h || "0"),
      exchange: "okx",
    }));
}

async function fetchBybitSpot() {
  const res = await fetch("https://api.bybit.com/v5/market/tickers?category=spot", { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Bybit ${res.status}`);
  const json = await res.json();
  return (json.result?.list || [])
    .filter((t: any) => SYMBOLS.includes(t.symbol))
    .map((t: any) => ({
      symbol: t.symbol.replace("USDT", ""),
      price: parseFloat(t.lastPrice),
      volume: parseFloat(t.volume24h || "0"),
      change24h: parseFloat(t.price24hPcnt || "0"),
      exchange: "bybit",
    }));
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`spot:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const exchange = searchParams.get("exchange");

  if (exchange === "okx") {
    const cached = await redis.get("spot:okx");
    if (cached) return NextResponse.json(JSON.parse(cached));
    try {
      const data = await fetchOKXSpot();
      await redis.setex("spot:okx", CACHE_TTL, JSON.stringify(data));
      return NextResponse.json(data);
    } catch { return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 }); }
  }

  if (exchange === "bybit") {
    const cached = await redis.get("spot:bybit");
    if (cached) return NextResponse.json(JSON.parse(cached));
    try {
      const data = await fetchBybitSpot();
      await redis.setex("spot:bybit", CACHE_TTL, JSON.stringify(data));
      return NextResponse.json(data);
    } catch { return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 }); }
  }

  const [okx, bybit] = await Promise.allSettled([fetchOKXSpot(), fetchBybitSpot()]);
  const okxData = okx.status === "fulfilled" ? okx.value : [];
  const bybitData = bybit.status === "fulfilled" ? bybit.value : [];

  interface SpotTicker { symbol: string; price: number; volume: number; change24h: number; exchange: string; }
  const aggregate = SYMBOLS.map((sym) => {
    const s = sym.replace("USDT", "");
    const ok = (okxData as SpotTicker[]).find((t) => t.symbol === s);
    const by = (bybitData as SpotTicker[]).find((t) => t.symbol === s);
    const prices = [ok?.price, by?.price].filter(Boolean) as number[];
    return {
      symbol: s,
      price: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
      okxPrice: ok?.price || null,
      bybitPrice: by?.price || null,
      change24h: ok?.change24h || by?.change24h || 0,
    };
  });

  await redis.setex("spot:aggregate", CACHE_TTL, JSON.stringify(aggregate));
  return NextResponse.json(aggregate);
}
