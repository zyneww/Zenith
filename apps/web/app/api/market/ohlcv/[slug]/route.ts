import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";
import { getAsset, AssetType } from "@/lib/assets/registry";
const FINNHUB_BASE = "https://finnhub.io/api/v1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = 60;

export type Range = "1s" | "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w" | "1M";
export type Preset = "24h" | "7d" | "30d" | "90d" | "180d" | "1y" | "max";

const BINANCE_INTERVAL: Record<Range, string> = {
  "1s": "1s", "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
  "1h": "1h", "4h": "4h", "1d": "1d", "1w": "1w", "1M": "1M",
};

const PRESET_TO_RANGE: Record<Preset, { interval: Range; limit: number }> = {
  "24h": { interval: "1m", limit: 500 },
  "7d": { interval: "15m", limit: 500 },
  "30d": { interval: "1h", limit: 500 },
  "90d": { interval: "4h", limit: 500 },
  "180d": { interval: "1d", limit: 180 },
  "1y": { interval: "1d", limit: 365 },
  "max": { interval: "1d", limit: 500 },
};

const NON_CRYPTO_RANGES: Range[] = ["1h", "1d", "1w", "1M"];
const FINNHUB_RESOLUTION: Partial<Record<string, string>> = {
  "1m": "1", "5m": "5", "15m": "15", "30m": "30",
  "1h": "5", "4h": "5",
  "1d": "30", "1w": "60", "1M": "D",
};

function isRange(value: string): value is Range {
  return value in BINANCE_INTERVAL;
}
function isPreset(value: string): value is Preset {
  return value in PRESET_TO_RANGE;
}

function pickIntervalForSpan(spanSeconds: number): { interval: string; limit: number } {
  if (spanSeconds <= 3600) return { interval: "1m", limit: 500 };
  if (spanSeconds <= 86400 * 2) return { interval: "5m", limit: 500 };
  if (spanSeconds <= 86400 * 7) return { interval: "15m", limit: 500 };
  if (spanSeconds <= 86400 * 30) return { interval: "1h", limit: 500 };
  if (spanSeconds <= 86400 * 90) return { interval: "4h", limit: 500 };
  if (spanSeconds <= 86400 * 365) return { interval: "1d", limit: 365 };
  return { interval: "1d", limit: 500 };
}

async function fetchCryptoKlines(symbol: string, interval: string, limit: number, startTime?: number, endTime?: number) {
  const params = new URLSearchParams({ symbol: encodeURIComponent(symbol), interval, limit: String(limit) });
  if (startTime) params.set("startTime", String(startTime * 1000));
  if (endTime) params.set("endTime", String(endTime * 1000));
  const url = `https://api.binance.com/api/v3/klines?${params}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (!res.ok) throw new Error(`binance ${res.status}`);
  const data = await res.json() as [number, string, string, string, string, string, number, string, number, number, string, string][];
  return data.map((k) => ({
    t: Math.floor(k[0] / 1000),
    o: parseFloat(k[1]), h: parseFloat(k[2]), l: parseFloat(k[3]), c: parseFloat(k[4]), v: parseFloat(k[5]),
  }));
}

async function fetchFinnhubCandles(symbol: string, resolution: string, from: number, to: number) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) throw new Error("no api key");
  const url = `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000), cache: "no-store" });
  if (res.status === 429) throw new Error("rate_limited");
  if (!res.ok) throw new Error(`finnhub ${res.status}`);
  const data = await res.json();
  if (!data || data.s !== "ok" || !Array.isArray(data.t)) throw new Error("finnhub empty");
  const sliceStart = Math.max(0, data.t.length - 100);
  const points: { t: number; o: number; h: number; l: number; c: number; v?: number }[] = [];
  for (let i = sliceStart; i < data.t.length; i++) {
    points.push({ t: data.t[i], o: data.o[i], h: data.h[i], l: data.l[i], c: data.c[i], v: data.v?.[i] });
  }
  return points;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const search = new URL(req.url).searchParams;

  const asset = getAsset(slug);
  if (!asset) return NextResponse.json({ error: "unknown_asset" }, { status: 404 });
  const typeParam = search.get("type") as AssetType | null;
  if (typeParam && typeParam !== asset.type) return NextResponse.json({ error: "type_mismatch" }, { status: 400 });
  const type = asset.type;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`market:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const fromParam = search.get("from");
  const toParam = search.get("to");
  const presetParam = search.get("preset");
  const rangeParam = search.get("range");

  // Determine interval, limit, from/to
  let interval: string;
  let limit = 500;
  let from: number | undefined;
  let to: number | undefined;
  let cacheKey: string;

  if (fromParam && toParam) {
    from = parseInt(fromParam);
    to = parseInt(toParam);
    const span = to - from;
    const picked = pickIntervalForSpan(span);
    interval = picked.interval;
    limit = picked.limit;
    cacheKey = `market:ohlcv:${slug}:custom:${from}:${to}:${type}`;
  } else if (presetParam && isPreset(presetParam as Preset)) {
    const preset = presetParam as Preset;
    const mapped = PRESET_TO_RANGE[preset];
    if (type !== "crypto" && !NON_CRYPTO_RANGES.includes(mapped.interval)) {
      return NextResponse.json({ error: "unsupported_range_for_asset" }, { status: 400 });
    }
    interval = mapped.interval;
    limit = mapped.limit;
    cacheKey = `market:ohlcv:${slug}:preset:${preset}:${type}`;
  } else {
    const rangeParam2 = rangeParam || "1d";
    if (!isRange(rangeParam2)) return NextResponse.json({ error: "invalid_range" }, { status: 400 });
    const range = rangeParam2;
    if (type !== "crypto" && !NON_CRYPTO_RANGES.includes(range)) {
      return NextResponse.json({ error: "unsupported_range_for_asset" }, { status: 400 });
    }
    interval = range;
    cacheKey = `market:ohlcv:${slug}:${range}:${type}`;
  }

  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=30` },
    });
  }

  try {
    let points: { t: number; o: number; h: number; l: number; c: number; v?: number }[];

    if (type === "crypto") {
      const binanceSymbol = asset.finnhubSymbol?.replace("BINANCE:", "") || `${asset.symbol}USDT`;
      points = await fetchCryptoKlines(binanceSymbol, interval, limit, from, to);
    } else {
      const symbol = asset.finnhubSymbol;
      if (!symbol) return NextResponse.json({ error: "unknown_asset" }, { status: 404 });
      const now = Math.floor(Date.now() / 1000);
      const finnFrom = from ?? now - 86400;
      const finnTo = to ?? now;
      const resolution = FINNHUB_RESOLUTION[interval] || "D";
      points = await fetchFinnhubCandles(symbol, resolution, finnFrom, finnTo);
    }

    const payload = { slug, type, range: interval, points };
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(payload));
    return NextResponse.json(payload, {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=30` },
    });
  } catch {
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
