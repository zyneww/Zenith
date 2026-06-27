import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";
import { fetchFXRates, fetchFXHistory } from "@/lib/market-data/frankfurter";

const redis = new Redis(process.env.REDIS_URL || "redis://default:dragonfly_dev@localhost:6379");
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const CACHE_TTL = 3600;

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`fx:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const base = searchParams.get("base") || "USD";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const days = parseInt(searchParams.get("days") || "30");

  if (from && to) {
    const cacheKey = `fx:history:${from}:${to}:${days}`;
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached), { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
    try {
      const rates = await fetchFXHistory(from, to, days);
      const result = { from, to, days, rates };
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
      return NextResponse.json(result, { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
    } catch {
      return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 });
    }
  }

  const cacheKey = `fx:rates:${base}`;
  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json(JSON.parse(cached), { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });

  try {
    const data = await fetchFXRates(base);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
    return NextResponse.json(data, { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
  } catch {
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 });
  }
}
