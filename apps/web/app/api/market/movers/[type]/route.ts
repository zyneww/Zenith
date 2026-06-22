import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";

const redis = new Redis(process.env.REDIS_URL || "redis://default:dragonfly_dev@localhost:6379");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = 60;
const CACHE_KEY = "market:movers";

async function getClientIp(req: NextRequest): Promise<string> {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

interface CoinGeckoItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!["trending", "gainers", "losers"].includes(type)) {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  const ip = await getClientIp(req);
  const rl = await rateLimit(`market:${ip}`, rateLimits.default);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
    );
  }

  const cacheKey = `${CACHE_KEY}:${type}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=30` },
    });
  }

  try {
    const url = new URL(
      "/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h",
      "https://api.coingecko.com/api/v3"
    );
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        ...(process.env.COINGECKO_API_KEY ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY } : {}),
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    const data = (await res.json()) as CoinGeckoItem[];

    const sorted = [...data].sort((a, b) => {
      if (type === "trending") return b.total_volume - a.total_volume;
      if (type === "gainers") return b.price_change_percentage_24h - a.price_change_percentage_24h;
      return a.price_change_percentage_24h - b.price_change_percentage_24h;
    });

    const top = sorted.slice(0, 5).map((c) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      image: c.image,
      price: c.current_price,
      change24h: c.price_change_percentage_24h,
      volume24h: c.total_volume,
      marketCap: c.market_cap,
    }));

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(top));
    return NextResponse.json(top, {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=30` },
    });
  } catch {
    return NextResponse.json(
      { error: "upstream_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
