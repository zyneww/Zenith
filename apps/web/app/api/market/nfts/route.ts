import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";
import { fetchNFTList } from "@/lib/market-data/coingecko-nft";


const CACHE_TTL = 300;

const OPENSEA_KEY = process.env.OPENSEA_API_KEY || "";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`nfts:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source") || "coingecko";

  if (source === "opensea" && OPENSEA_KEY) {
    const cached = await redis.get("nfts:opensea");
    if (cached) return NextResponse.json(JSON.parse(cached), { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
    try {
      const res = await fetch("https://api.opensea.io/api/v2/collections?limit=50", {
        headers: { "X-API-KEY": OPENSEA_KEY },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 300 },
      });
      if (!res.ok) throw new Error(`OpenSea ${res.status}`);
      const json = await res.json();
      const data = { source: "opensea", collections: json.collections || [] };
      await redis.setex("nfts:opensea", CACHE_TTL, JSON.stringify(data));
      return NextResponse.json(data, { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
    } catch {
      return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 });
    }
  }

  try {
    const collections = await fetchNFTList();
    const data = { source: "coingecko", collections };
    await redis.setex("nfts:coingecko", CACHE_TTL, JSON.stringify(data));
    return NextResponse.json(data, { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
  } catch {
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 });
  }
}
