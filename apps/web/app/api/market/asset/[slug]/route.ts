import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";
import { getAsset, AssetMeta, AssetType } from "@/lib/assets/registry";
const FINNHUB_BASE = "https://finnhub.io/api/v1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = 60;

async function fetchCrypto(asset: AssetMeta) {
  const binanceSymbol = asset.finnhubSymbol?.replace("BINANCE:", "") || `${asset.symbol}USDT`;
  const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(binanceSymbol)}`;

  const [binanceRes, coinRes] = await Promise.allSettled([
    fetch(binanceUrl, { signal: AbortSignal.timeout(5000), cache: "no-store" }),
    asset.coingeckoId
      ? fetch(`https://api.coingecko.com/api/v3/coins/${asset.coingeckoId}`, {
          headers: {
            Accept: "application/json",
            ...(process.env.COINGECKO_API_KEY ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY } : {}),
          },
          signal: AbortSignal.timeout(8000),
          cache: "no-store",
        })
      : Promise.resolve(null as Response | null),
  ]);

  let binance: {
    lastPrice?: string;
    priceChangePercent?: string;
    highPrice?: string;
    lowPrice?: string;
    quoteVolume?: string;
  } | null = null;
  if (binanceRes.status === "fulfilled" && binanceRes.value && binanceRes.value.ok) {
    binance = (await binanceRes.value.json()) as any;
  }

  let coin: any = null;
  if (coinRes.status === "fulfilled" && coinRes.value && coinRes.value.ok) {
    coin = await coinRes.value.json();
  }

  if (!binance && !coin) {
    throw new Error("upstream_unavailable");
  }

  const md = coin?.market_data ?? {};
  const current = binance?.lastPrice ? parseFloat(binance.lastPrice) : (md.current_price?.usd ?? 0);
  const change24h = binance?.priceChangePercent ? parseFloat(binance.priceChangePercent) : (md.price_change_percentage_24h ?? 0);
  const high24h = binance?.highPrice ? parseFloat(binance.highPrice) : (md.high_24h?.usd ?? 0);
  const low24h = binance?.lowPrice ? parseFloat(binance.lowPrice) : (md.low_24h?.usd ?? 0);
  const volume24h = binance?.quoteVolume ? parseFloat(binance.quoteVolume) : (md.total_volume?.usd ?? 0);

  return {
    asset: {
      id: asset.slug,
      symbol: asset.symbol,
      name: asset.name,
      type: "crypto" as const,
      image: asset.logoUrl || coin?.image?.large || null,
      finnhubSymbol: null,
    },
    price: {
      current,
      change24h,
      change1h: md.price_change_percentage_1h_in_currency?.usd ?? 0,
      change7d: md.price_change_percentage_7d_in_currency?.usd ?? 0,
      high24h,
      low24h,
      marketCap: md.market_cap?.usd ?? 0,
      volume24h,
    },
    ohlcv1h: [],
    lastUpdated: new Date().toISOString(),
  };
}

async function fetchFinnhub(slug: string, type: string, finnhubSymbol: string, apiKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 86400;
  const [quoteRes, candleRes] = await Promise.all([
    fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(finnhubSymbol)}&token=${apiKey}`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    }),
    fetch(
      `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(finnhubSymbol)}&resolution=60&from=${from}&to=${now}&token=${apiKey}`,
      { signal: AbortSignal.timeout(5000), cache: "no-store" }
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

  const assetMeta = getAsset(slug);
  if (!assetMeta) {
    return NextResponse.json({ error: "unknown_asset" }, { status: 404 });
  }
  if (typeParam && typeParam !== assetMeta.type) {
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
    if (assetMeta.type === "crypto" && assetMeta.coingeckoId) {
      payload = await fetchCrypto(assetMeta);
    } else {
      const apiKey = process.env.FINNHUB_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "upstream_unavailable" },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        );
      }
      const result = await fetchFinnhub(slug, assetMeta.type, assetMeta.finnhubSymbol, apiKey);
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
