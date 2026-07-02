import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimits } from "@/lib/rate-limit";



export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`calendar:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "";
  const from = new Date().toISOString().split("T")[0];
  const to = new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0];
  const params = new URLSearchParams({ from, to });

  try {
    const res = await fetch(`https://finnhub.io/api/v1/calendar/ipo?${params}`, {
      headers: { "X-Finnhub-Token": process.env.FINNHUB_API_KEY || "" },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Finnhub ipo ${res.status}`);
    const json = await res.json();
    const ipos = (json.ipoCalendar || []).filter((ipo: any) => {
      if (country && ipo.country?.toLowerCase() !== country.toLowerCase()) return false;
      return true;
    });
    return NextResponse.json({ ipos, source: "finnhub" });
  } catch {
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 503 });
  }
}
