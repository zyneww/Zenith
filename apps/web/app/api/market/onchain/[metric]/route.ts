import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { rateLimit, rateLimits } from "@/lib/rate-limit";


const CACHE_TTL = 3600;

const HARDCODED_METRICS: Record<string, any> = {
  "active-addresses-btc": { value: 850000, change24h: 3.2, unit: "addresses", label: "Bitcoin Active Addresses" },
  "active-addresses-eth": { value: 520000, change24h: -1.5, unit: "addresses", label: "Ethereum Active Addresses" },
  "exchange-inflow-btc": { value: 28500, change24h: 12.4, unit: "BTC", label: "Exchange Inflow (BTC)" },
  "exchange-outflow-btc": { value: 31200, change24h: -5.8, unit: "BTC", label: "Exchange Outflow (BTC)" },
  "nvt-btc": { value: 42.5, change24h: -0.8, unit: "ratio", label: "NVT Ratio (BTC)" },
  "hashrate-btc": { value: 725, change24h: 1.2, unit: "EH/s", label: "Bitcoin Hashrate" },
  "total-value-locked": { value: 98500000000, change24h: 2.1, unit: "USD", label: "Total Value Locked (DeFi)" },
  "stablecoin-supply": { value: 165000000000, change24h: 0.5, unit: "USD", label: "Stablecoin Market Cap" },
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ metric: string }> }) {
  const { metric } = await params;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`onchain:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  if (!HARDCODED_METRICS[metric]) {
    return NextResponse.json({ error: "unknown_metric" }, { status: 404 });
  }

  const cached = await redis.get(`onchain:${metric}`);
  if (cached) return NextResponse.json(JSON.parse(cached), { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });

  const data = { metric, ...HARDCODED_METRICS[metric], fetchedAt: new Date().toISOString(), source: "hardcoded" };
  await redis.setex(`onchain:${metric}`, CACHE_TTL, JSON.stringify(data));
  return NextResponse.json(data, { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}` } });
}
