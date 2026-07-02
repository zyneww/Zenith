import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimits } from "@/lib/rate-limit";



export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`calendar:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "US";
  const industry = searchParams.get("industry") || "";
  const limit = parseInt(searchParams.get("limit") || "20");

  const params = new URLSearchParams({ from: new Date().toISOString().split("T")[0], to: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0] });
  if (country) params.set("country", country);

  try {
    const res = await fetch(`https://finnhub.io/api/v1/calendar/earnings?${params}`, {
      headers: { "X-Finnhub-Token": process.env.FINNHUB_API_KEY || "" },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Finnhub ${res.status}`);
    const json = await res.json();
    const earnings = (json.earningsCalendar || []).filter((e: any) => {
      if (industry && e.industry?.toLowerCase() !== industry.toLowerCase()) return false;
      return true;
    }).slice(0, limit);
    return NextResponse.json({ earnings, source: "finnhub", country, industry });
  } catch {
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 });
  }
}
