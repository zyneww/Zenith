import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";

const redis = new Redis(process.env.REDIS_URL || "redis://default:dragonfly_dev@localhost:6379");
const FINNHUB_BASE = "https://finnhub.io/api/v1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = 60;

type AssetType = "crypto" | "forex" | "commodity" | "index";

interface AssetSlug {
  type: AssetType;
  coingeckoId?: string;
  finnhubSymbol?: string;
}

const ASSET_MAP: Record<string, AssetSlug> = {
  // crypto
  bitcoin: { type: "crypto", coingeckoId: "bitcoin" },
  ethereum: { type: "crypto", coingeckoId: "ethereum" },
  solana: { type: "crypto", coingeckoId: "solana" },
  binancecoin: { type: "crypto", coingeckoId: "binancecoin" },
  ripple: { type: "crypto", coingeckoId: "ripple" },
  cardano: { type: "crypto", coingeckoId: "cardano" },
  dogecoin: { type: "crypto", coingeckoId: "dogecoin" },
  "matic-network": { type: "crypto", coingeckoId: "matic-network" },
  polkadot: { type: "crypto", coingeckoId: "polkadot" },
  "avalanche-2": { type: "crypto", coingeckoId: "avalanche-2" },
  // forex
  eurusd: { type: "forex", finnhubSymbol: "OANDA:EUR_USD" },
  gbpusd: { type: "forex", finnhubSymbol: "OANDA:GBP_USD" },
  usdjpy: { type: "forex", finnhubSymbol: "OANDA:USD_JPY" },
  usdcad: { type: "forex", finnhubSymbol: "OANDA:USD_CAD" },
  usdchf: { type: "forex", finnhubSymbol: "OANDA:USD_CHF" },
  // commodities
  gold: { type: "commodity", finnhubSymbol: "OANDA:XAU_USD" },
  silver: { type: "commodity", finnhubSymbol: "OANDA:XAG_USD" },
  "crude-oil-wti": { type: "commodity", finnhubSymbol: "NYMEX:CL1!" },
  brent: { type: "commodity", finnhubSymbol: "ICE:B1!" },
  "natural-gas": { type: "commodity", finnhubSymbol: "NYMEX:NG1!" },
  // indices
  spx: { type: "index", finnhubSymbol: "INDEX:SPX" },
  ndx: { type: "index", finnhubSymbol: "INDEX:NDX" },
  dax: { type: "index", finnhubSymbol: "INDEX:DAX" },
  ftse: { type: "index", finnhubSymbol: "INDEX:FTSE" },
  cac40: { type: "index", finnhubSymbol: "INDEX:CAC" },
  nikkei: { type: "index", finnhubSymbol: "INDEX:N225" },
  "hang-seng": { type: "index", finnhubSymbol: "INDEX:HSI" },
  shanghai: { type: "index", finnhubSymbol: "INDEX:SHCOMP" },
  "dow-jones": { type: "index", finnhubSymbol: "INDEX:DJI" },
  "russell-2000": { type: "index", finnhubSymbol: "INDEX:RUT" },
};

async function fetchCrypto(slug: string, coingeckoId: string) {
  const base = "https://api.coingecko.com/api/v3";
  const headers: HeadersInit = { Accept: "application/json" };
  if (process.env.COINGECKO_API_KEY) headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;

  const [coinRes, chartRes] = await Promise.all([
    fetch(`${base}/coins/${coingeckoId}`, { headers, cache: "no-store" }),
    fetch(`${base}/coins/${coingeckoId}/market_chart?vs_currency=usd&days=1&interval=hourly`, {
      headers,
      cache: "no-store",
    }),
  ]);
  if (!coinRes.ok) throw new Error(`coingecko ${coinRes.status}`);
  const coin = await coinRes.json();
  const chart = chartRes.ok ? await chartRes.json() : null;

  const md = coin.market_data ?? {};
  const ohlcv1h = (chart?.prices ?? []).map((p: [number, number]) => ({ t: Math.floor(p[0] / 1000), p: p[1] }));

  return {
    asset: {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      type: "crypto" as const,
      image: coin.image?.large ?? coin.image?.small ?? null,
      finnhubSymbol: null,
    },
    price: {
      current: md.current_price?.usd ?? 0,
      change24h: md.price_change_percentage_24h ?? 0,
      change1h: md.price_change_percentage_1h_in_currency?.usd ?? 0,
      change7d: md.price_change_percentage_7d_in_currency?.usd ?? 0,
      high24h: md.high_24h?.usd ?? 0,
      low24h: md.low_24h?.usd ?? 0,
      marketCap: md.market_cap?.usd ?? 0,
      volume24h: md.total_volume?.usd ?? 0,
    },
    ohlcv1h,
    lastUpdated: coin.last_updated ?? new Date().toISOString(),
  };
}

async function fetchFinnhub(slug: string, type: AssetType, finnhubSymbol: string, apiKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 86400;
  const [quoteRes, candleRes] = await Promise.all([
    fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(finnhubSymbol)}&token=${apiKey}`, {
      cache: "no-store",
    }),
    fetch(
      `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(finnhubSymbol)}&resolution=60&from=${from}&to=${now}&token=${apiKey}`,
      { cache: "no-store" }
    ),
  ]);

  if (quoteRes.status === 429) {
    return { rateLimited: true } as const;
  }
  if (!quoteRes.ok) throw new Error(`finnhub ${quoteRes.status}`);

  const quote = await quoteRes.json();
  const candle = candleRes.ok ? await candleRes.json() : null;

  const current = quote.c ?? 0;
  const ohlcv1h: { t: number; o: number; h: number; l: number; c: number }[] = [];
  if (candle && candle.s === "ok" && Array.isArray(candle.t)) {
    for (let i = 0; i < candle.t.length; i++) {
      ohlcv1h.push({
        t: candle.t[i],
        o: candle.o[i],
        h: candle.h[i],
        l: candle.l[i],
        c: candle.c[i],
      });
    }
  }

  const change24h = quote.dp ?? 0;
  const high24h = quote.h ?? current;
  const low24h = quote.l ?? current;

  return {
    asset: {
      id: slug,
      symbol: finnhubSymbol,
      name: finnhubSymbol,
      type,
      image: null,
      finnhubSymbol,
    },
    price: {
      current,
      change24h,
      change1h: 0,
      change7d: 0,
      high24h,
      low24h,
      marketCap: 0,
      volume24h: 0,
    },
    ohlcv1h,
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const typeParam = (new URL(req.url).searchParams.get("type") || "") as AssetType | "";

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`market:${ip}`, rateLimits.default);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
    );
  }

  const mapping = ASSET_MAP[slug.toLowerCase()];
  if (!mapping) {
    return NextResponse.json({ error: "unknown_asset" }, { status: 404 });
  }
  if (typeParam && typeParam !== mapping.type) {
    return NextResponse.json({ error: "type_mismatch" }, { status: 400 });
  }

  const cacheKey = `market:asset:${slug}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=30` },
    });
  }

  try {
    let payload;
    if (mapping.type === "crypto") {
      payload = await fetchCrypto(slug, mapping.coingeckoId!);
    } else {
      const apiKey = process.env.FINNHUB_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "upstream_unavailable" },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        );
      }
      const result = await fetchFinnhub(slug, mapping.type, mapping.finnhubSymbol!, apiKey);
      if ("rateLimited" in result) {
        return NextResponse.json(
          { error: "upstream_unavailable" },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        );
      }
      payload = result;
    }
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
