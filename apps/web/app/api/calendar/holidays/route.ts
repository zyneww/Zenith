import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimits } from "@/lib/rate-limit";



const HOLIDAYS: Record<string, { date: string; name: string; market: string }[]> = {
  US: [
    { date: "2026-01-01", name: "New Year's Day", market: "NYSE, NASDAQ" },
    { date: "2026-01-19", name: "Martin Luther King Jr. Day", market: "NYSE, NASDAQ" },
    { date: "2026-02-16", name: "Presidents' Day", market: "NYSE, NASDAQ" },
    { date: "2026-04-18", name: "Good Friday", market: "NYSE, NASDAQ" },
    { date: "2026-05-25", name: "Memorial Day", market: "NYSE, NASDAQ" },
    { date: "2026-06-19", name: "Juneteenth", market: "NYSE, NASDAQ" },
    { date: "2026-07-03", name: "Independence Day (observed)", market: "NYSE, NASDAQ" },
    { date: "2026-09-07", name: "Labor Day", market: "NYSE, NASDAQ" },
    { date: "2026-11-26", name: "Thanksgiving Day", market: "NYSE, NASDAQ" },
    { date: "2026-12-25", name: "Christmas Day", market: "NYSE, NASDAQ" },
  ],
  FR: [
    { date: "2026-01-01", name: "Jour de l'An", market: "Euronext Paris" },
    { date: "2026-04-06", name: "Lundi de Pâques", market: "Euronext Paris" },
    { date: "2026-05-01", name: "Fête du Travail", market: "Euronext Paris" },
    { date: "2026-05-08", name: "Victoire 1945", market: "Euronext Paris" },
    { date: "2026-05-14", name: "Ascension", market: "Euronext Paris" },
    { date: "2026-05-25", name: "Lundi de Pentecôte", market: "Euronext Paris" },
    { date: "2026-07-14", name: "Fête Nationale", market: "Euronext Paris" },
    { date: "2026-08-15", name: "Assomption", market: "Euronext Paris" },
    { date: "2026-11-01", name: "Toussaint", market: "Euronext Paris" },
    { date: "2026-12-25", name: "Noël", market: "Euronext Paris" },
  ],
  UK: [
    { date: "2026-01-01", name: "New Year's Day", market: "LSE" },
    { date: "2026-04-06", name: "Easter Monday", market: "LSE" },
    { date: "2026-05-04", name: "Early May Bank Holiday", market: "LSE" },
    { date: "2026-05-25", name: "Spring Bank Holiday", market: "LSE" },
    { date: "2026-08-31", name: "Summer Bank Holiday", market: "LSE" },
    { date: "2026-12-25", name: "Christmas Day", market: "LSE" },
    { date: "2026-12-28", name: "Boxing Day", market: "LSE" },
  ],
  JP: [
    { date: "2026-01-01", name: "New Year's Day", market: "TSE" },
    { date: "2026-01-12", name: "Coming of Age Day", market: "TSE" },
    { date: "2026-02-11", name: "National Foundation Day", market: "TSE" },
    { date: "2026-04-29", name: "Showa Day", market: "TSE" },
    { date: "2026-05-03", name: "Constitution Day", market: "TSE" },
    { date: "2026-07-20", name: "Marine Day", market: "TSE" },
    { date: "2026-09-21", name: "Respect for the Aged Day", market: "TSE" },
    { date: "2026-11-03", name: "Culture Day", market: "TSE" },
    { date: "2026-11-23", name: "Labor Thanksgiving Day", market: "TSE" },
  ],
  CN: [
    { date: "2026-01-01", name: "New Year's Day", market: "SSE, HKEX" },
    { date: "2026-02-17", name: "Chinese New Year", market: "SSE, HKEX" },
    { date: "2026-04-06", name: "Qingming Festival", market: "SSE, HKEX" },
    { date: "2026-05-01", name: "Labor Day", market: "SSE, HKEX" },
    { date: "2026-06-30", name: "Tuen Ng Festival", market: "HKEX" },
    { date: "2026-10-01", name: "National Day", market: "SSE, HKEX" },
  ],
};

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`calendar:${ip}`, rateLimits.default);
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "all";

  if (country !== "all") {
    return NextResponse.json({ country, holidays: HOLIDAYS[country] || [], source: "hardcoded" });
  }

  const all: { date: string; name: string; market: string; country: string }[] = [];
  for (const [cc, holidays] of Object.entries(HOLIDAYS)) {
    for (const h of holidays) {
      all.push({ ...h, country: cc });
    }
  }
  return NextResponse.json({ holidays: all, source: "hardcoded" });
}
