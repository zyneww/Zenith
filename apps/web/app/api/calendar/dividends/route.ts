import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimits } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`calendar:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const today = new Date().toISOString().split("T")[0];
  const params = new URLSearchParams({ from: today, to: today });

  try {
    const res = await fetch(`https://finnhub.io/api/v1/stock/dividend?${params}`, {
      headers: { "X-Finnhub-Token": process.env.FINNHUB_API_KEY || "" },
    });
    if (!res.ok) throw new Error(`Finnhub dividend ${res.status}`);
    const json = await res.json();
    return NextResponse.json({ dividends: json.data || json, source: "finnhub" });
  } catch {
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 });
  }
}
