import { NextRequest, NextResponse } from "next/server";
import { getEconomicCalendar } from "@/lib/market-data/finnhub";
import { EconomicEvent } from "@/lib/market-data/types";



export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const from = searchParams.get("from") || new Date().toISOString().split("T")[0];
    const to = searchParams.get("to") || from;

    const data = await getEconomicCalendar(from, to);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    });
  } catch (error) {
    console.error("Error fetching economic calendar:", error);
    return NextResponse.json(
      { error: "Failed to fetch economic calendar" },
      { status: 500 }
    );
  }
}
