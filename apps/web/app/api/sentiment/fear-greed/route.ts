import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";

const redis = new Redis(process.env.REDIS_URL || "redis://default:dragonfly_dev@localhost:6379");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = 3600;
const CACHE_KEY = "sentiment:fear-greed";

function labelFor(value: number): string {
  if (value <= 24) return "Extreme Fear";
  if (value <= 44) return "Fear";
  if (value <= 55) return "Neutral";
  if (value <= 75) return "Greed";
  return "Extreme Greed";
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`market:${ip}`, rateLimits.default);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
    );
  }

  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=300` },
    });
  }

  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1&format=json", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`fng ${res.status}`);
    const data = await res.json();
    const entry = data?.data?.[0];
    if (!entry) throw new Error("fng empty");
    const value = parseInt(entry.value, 10);
    const payload = {
      value,
      label: labelFor(value),
      timestamp: parseInt(entry.timestamp, 10),
    };
    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(payload));
    return NextResponse.json(payload, {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=300` },
    });
  } catch {
    return NextResponse.json(
      { error: "upstream_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
