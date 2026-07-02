import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";
import { getAsset } from "@/lib/assets/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = 300;

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`market:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const cached = await redis.get(`market:info:${slug}`);
  if (cached) return NextResponse.json(JSON.parse(cached));

  const asset = getAsset(slug);
  if (!asset) return NextResponse.json({ error: "unknown_asset" }, { status: 404 });

  let payload: Record<string, any> = {
    name: asset.name,
    symbol: asset.symbol,
    type: asset.type,
    slug: asset.slug,
    tags: asset.tags ?? [],
    description: asset.description,
    logoUrl: asset.logoUrl,
  };

  if (asset.type === "crypto" && asset.coingeckoId) {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${asset.coingeckoId}?localization=false&tickers=false&community_data=false&developer_data=false`,
        {
          headers: {
            Accept: "application/json",
            ...(process.env.COINGECKO_API_KEY ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY } : {}),
          },
          signal: AbortSignal.timeout(8000),
        }
      );
      if (res.ok) {
        const coin = await res.json();
        payload = {
          ...payload,
          coingeckoId: coin.id,
          description: coin.description?.en || asset.description,
          homepageUrl: coin.links?.homepage?.[0] || null,
          explorerUrl: coin.links?.blockchain_site?.[0] || null,
          subredditUrl: coin.links?.subreddit_url || null,
          twitterHandle: coin.links?.twitter_screen_name || null,
          githubUrl: coin.links?.repos_url?.github?.[0] || null,
          genesisDate: coin.genesis_date || null,
          platform: coin.asset_platform_id || null,
          categories: coin.categories || [],
          marketCapRank: coin.market_cap_rank || null,
          coingeckoScore: coin.coingecko_score || null,
          developerScore: coin.developer_score || null,
          communityScore: coin.community_score || null,
        };
      }
    } catch {}
  }

  await redis.setex(`market:info:${slug}`, CACHE_TTL, JSON.stringify(payload));
  return NextResponse.json(payload);
}
