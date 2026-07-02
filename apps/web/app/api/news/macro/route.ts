import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";
import { fetchMacroNews, NewsArticle } from "@/lib/news/newsapi";


const CACHE_TTL = 900;

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`news:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const cached = await redis.get("news:macro");
  if (cached) return NextResponse.json(JSON.parse(cached), { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });

  try {
    const articles: NewsArticle[] = await fetchMacroNews();
    const data = { articles, source: "newsapi", fetchedAt: new Date().toISOString() };
    await redis.setex("news:macro", CACHE_TTL, JSON.stringify(data));
    return NextResponse.json(data, { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
  } catch {
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 });
  }
}
