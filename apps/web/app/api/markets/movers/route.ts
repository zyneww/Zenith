import { NextRequest, NextResponse } from "next/server";
import { getTwelveQuote, getMockMarketData } from "@/lib/market-data/twelve-data";
import { getTopCoins } from "@/lib/market-data/coingecko";
import { MarketDataPoint } from "@/lib/market-data/types";

export const revalidate = 60;

const ALL_SYMBOLS = {
  indices: ["^GSPC", "^IXIC", "^DJI", "^FCHI", "^GDAXI", "^FTSE", "^N225", "^HSI"],
  forex: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD"],
  commodities: ["CL=F", "GC=F", "SI=F", "NG=F", "HG=F"],
  futures: ["ES=F", "NQ=F", "YM=F"],
};

export async function GET(req: NextRequest) {
  try {
    const allData: MarketDataPoint[] = [];

    // Crypto from CoinGecko
    const cryptoData = await getTopCoins(15);
    allData.push(...cryptoData);

    // Other assets from Twelve Data (with mock fallback)
    for (const [assetClass, symbols] of Object.entries(ALL_SYMBOLS)) {
      const apiData = await getTwelveQuote(symbols);
      if (apiData.length > 0) {
        allData.push(...apiData);
      } else {
        allData.push(...getMockMarketData(symbols));
      }
    }

    // Sort by changePercent descending for gainers, ascending for losers
    const sorted = [...allData].sort((a, b) => b.changePercent - a.changePercent);
    const gainers = sorted.slice(0, 5);
    const losers = sorted.slice(-5).reverse();

    return NextResponse.json({ gainers, losers }, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Error fetching movers:", error);
    return NextResponse.json(
      { error: "Failed to fetch market movers" },
      { status: 500 }
    );
  }
}
