import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";
import { fetchStockQuote, getPopularStocks } from "@/lib/market-data/twelve-stocks";

const redis = new Redis(process.env.REDIS_URL || "redis://default:dragonfly_dev@localhost:6379");
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const CACHE_TTL = 60;

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`stocks:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const list = searchParams.get("list");

  if (list === "popular") {
    const cached = await redis.get("stocks:popular");
    if (cached) return NextResponse.json(JSON.parse(cached), { headers: { "Cache-Control": "public, s-maxage=86400" } });
    const data = getPopularStocks();
    await redis.setex("stocks:popular", 86400, JSON.stringify(data));
    return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=86400" } });
  }

  if (!symbol) return NextResponse.json({ error: "missing_symbol" }, { status: 400 });

  const cacheKey = `stocks:quote:${symbol}`;
  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json(JSON.parse(cached), { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });

  try {
    const data = await fetchStockQuote(symbol.toUpperCase());
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
    return NextResponse.json(data, { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
  } catch {
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 });
  }
}
