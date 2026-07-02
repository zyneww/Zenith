import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const CACHE_TTL = 300;

export interface CoinGeckoCategory {
  id: string;
  name: string;
  market_cap: number;
  market_cap_change_24h: number;
  content: string;
  top_3_coins: string[];
  volume_24h: number;
  updated_at: string;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`categories:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const cached = await redis.get("market:categories");
  if (cached) {
    return NextResponse.json(JSON.parse(cached), { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
  }

  try {
    const url = new URL(`${COINGECKO_BASE}/coins/categories`);
    if (process.env.COINGECKO_API_KEY) {
      url.searchParams.set("x_cg_demo_api_key", process.env.COINGECKO_API_KEY);
    }

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`[CoinGecko categories] HTTP ${res.status}`);
      return NextResponse.json([], { status: 200 });
    }

    const data = (await res.json()) as CoinGeckoCategory[];
    const normalized = Array.isArray(data)
      ? data
          .filter((c) => typeof c.market_cap_change_24h === "number")
          .sort((a, b) => Math.abs(b.market_cap_change_24h) - Math.abs(a.market_cap_change_24h))
          .slice(0, 8)
          .map((c) => ({
            id: c.id,
            name: c.name,
            marketCapChange24h: c.market_cap_change_24h,
            marketCap: c.market_cap,
            volume24h: c.volume_24h,
          }))
      : [];

    await redis.setex("market:categories", CACHE_TTL, JSON.stringify(normalized));
    return NextResponse.json(normalized, { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
  } catch (err) {
    console.error("[categories] error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
