import { NextRequest, NextResponse } from "next/server";
import { getCoinGeckoId, getSparklineData } from "@/lib/market-data/coingecko";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  try {
    const id = getCoinGeckoId(symbol.toUpperCase());
    const data = await getSparklineData(id);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
