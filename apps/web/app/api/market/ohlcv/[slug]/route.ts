import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";

const redis = new Redis(process.env.REDIS_URL || "redis://default:dragonfly_dev@localhost:6379");
const FINNHUB_BASE = "https://finnhub.io/api/v1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = 60;

type AssetType = "crypto" | "forex" | "commodity" | "index";
type Range = "1h" | "1d" | "1w";

const COINGECKO_IDS: Record<string, string> = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  solana: "solana",
  binancecoin: "binancecoin",
  ripple: "ripple",
  cardano: "cardano",
  dogecoin: "dogecoin",
  "matic-network": "matic-network",
  polkadot: "polkadot",
  "avalanche-2": "avalanche-2",
};

const FINNHUB_SYMBOLS: Record<string, string> = {
  eurusd: "OANDA:EUR_USD",
  gbpusd: "OANDA:GBP_USD",
  usdjpy: "OANDA:USD_JPY",
  usdcad: "OANDA:USD_CAD",
  usdchf: "OANDA:USD_CHF",
  gold: "OANDA:XAU_USD",
  silver: "OANDA:XAG_USD",
  "crude-oil-wti": "NYMEX:CL1!",
  brent: "ICE:B1!",
  "natural-gas": "NYMEX:NG1!",
  spx: "INDEX:SPX",
  ndx: "INDEX:NDX",
  dax: "INDEX:DAX",
  ftse: "INDEX:FTSE",
  cac40: "INDEX:CAC",
  nikkei: "INDEX:N225",
  "hang-seng": "INDEX:HSI",
  shanghai: "INDEX:SHCOMP",
  "dow-jones": "INDEX:DJI",
  "russell-2000": "INDEX:RUT",
};

const RANGE_DAYS: Record<Range, number> = { "1h": 1, "1d": 1, "1w": 7 };
const FINNHUB_RESOLUTION: Record<Range, string> = { "1h": "5", "1d": "30", "1w": "60" };
const FINNHUB_WINDOW_SEC: Record<Range, number> = { "1h": 3600, "1d": 86400, "1w": 604800 };

function resolveType(slug: string, typeParam: string | null): AssetType | null {
  if (typeParam && ["crypto", "forex", "commodity", "index"].includes(typeParam)) {
    return typeParam as AssetType;
  }
  if (COINGECKO_IDS[slug]) return "crypto";
  if (FINNHUB_SYMBOLS[slug]) {
    if (["gold", "silver", "crude-oil-wti", "brent", "natural-gas"].includes(slug)) return "commodity";
    if (["spx", "ndx", "dax", "ftse", "cac40", "nikkei", "hang-seng", "shanghai", "dow-jones", "russell-2000"].includes(slug))
      return "index";
    return "forex";
  }
  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const search = new URL(req.url).searchParams;
  const range = (search.get("range") || "1d") as Range;
  if (!["1h", "1d", "1w"].includes(range)) {
    return NextResponse.json({ error: "invalid_range" }, { status: 400 });
  }
  const typeParam = search.get("type");
  const type = resolveType(slug, typeParam);
  if (!type) {
    return NextResponse.json({ error: "unknown_asset" }, { status: 404 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`market:${ip}`, rateLimits.default);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
    );
  }

  const cacheKey = `market:ohlcv:${slug}:${range}:${type}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=30` },
    });
  }

  try {
    let points: { t: number; o: number; h: number; l: number; c: number; v?: number }[];

    if (type === "crypto") {
      const cgId = COINGECKO_IDS[slug];
      const days = RANGE_DAYS[range];
      const url = `https://api.coingecko.com/api/v3/coins/${cgId}/market_chart?vs_currency=usd&days=${days}`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          ...(process.env.COINGECKO_API_KEY ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY } : {}),
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`coingecko ${res.status}`);
      const data = await res.json();
      const prices: [number, number][] = data.prices ?? [];
      const sliced = prices.slice(-100);
      points = sliced.map((p) => ({ t: Math.floor(p[0] / 1000), o: p[1], h: p[1], l: p[1], c: p[1] }));
    } else {
      const symbol = FINNHUB_SYMBOLS[slug];
      if (!symbol) {
        return NextResponse.json({ error: "unknown_asset" }, { status: 404 });
      }
      const apiKey = process.env.FINNHUB_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "upstream_unavailable" },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        );
      }
      const now = Math.floor(Date.now() / 1000);
      const from = now - FINNHUB_WINDOW_SEC[range];
      const resolution = FINNHUB_RESOLUTION[range];
      const res = await fetch(
        `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${now}&token=${apiKey}`,
        { cache: "no-store" }
      );
      if (res.status === 429) {
        return NextResponse.json(
          { error: "upstream_unavailable" },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        );
      }
      if (!res.ok) throw new Error(`finnhub ${res.status}`);
      const data = await res.json();
      if (!data || data.s !== "ok" || !Array.isArray(data.t)) {
        throw new Error("finnhub empty");
      }
      const sliceStart = Math.max(0, data.t.length - 100);
      points = [];
      for (let i = sliceStart; i < data.t.length; i++) {
        points.push({
          t: data.t[i],
          o: data.o[i],
          h: data.h[i],
          l: data.l[i],
          c: data.c[i],
          v: data.v?.[i],
        });
      }
    }

    const payload = { slug, type, range, points };
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(payload));
    return NextResponse.json(payload, {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=30` },
    });
  } catch {
    return NextResponse.json(
      { error: "upstream_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
