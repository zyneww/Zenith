import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";
import { fetchStockSparkline } from "@/lib/market-data/twelve-stocks";

const redis = new Redis(process.env.REDIS_URL || "redis://default:dragonfly_dev@localhost:6379");
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const CACHE_TTL = 300;

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`stocks:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "missing_symbol" }, { status: 400 });

  const cacheKey = `stocks:sparkline:${symbol}`;
  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json(JSON.parse(cached), { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });

  try {
    const data = await fetchStockSparkline(symbol.toUpperCase());
    const result = { symbol: symbol.toUpperCase(), data };
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return NextResponse.json(result, { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
  } catch {
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 });
  }
}
