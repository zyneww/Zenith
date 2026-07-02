import { NextResponse } from "next/server";
import { getTrendingCoins } from "@/lib/market-data/coingecko";

export const revalidate = 120;

export async function GET() {
  try {
    const data = await getTrendingCoins();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
