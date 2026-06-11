import { NextRequest, NextResponse } from "next/server";
import { getTwelveQuote, getMockMarketData } from "@/lib/market-data/twelve-data";
import { getTopCoins } from "@/lib/market-data/coingecko";
import { MarketDataPoint } from "@/lib/market-data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Summary: picks key assets from each class for the ticker strip + market overview
const SUMMARY_SYMBOLS = {
  indices: ["^GSPC", "^IXIC", "^DJI", "^FCHI", "^GDAXI", "^FTSE", "^N225", "^HSI"],
  forex: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "EUR/GBP"],
  commodities: ["CL=F", "GC=F", "SI=F", "NG=F", "HG=F", "ZW=F", "ZC=F", "ZS=F"],
  futures: ["ES=F", "NQ=F", "YM=F", "GCF", "CLF"],
  crypto: ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX"],
};

export async function GET(req: NextRequest) {
  try {
    const allData: MarketDataPoint[] = [];

    // Fetch crypto via CoinGecko
    const cryptoData = await getTopCoins(8);
    allData.push(...cryptoData);

    // Fetch other assets via Twelve Data (or mock)
    for (const [assetClass, symbols] of Object.entries(SUMMARY_SYMBOLS)) {
      if (assetClass === "crypto") continue;

      const apiData = await getTwelveQuote(symbols);
      if (apiData.length > 0) {
        allData.push(...apiData);
      } else {
        allData.push(...getMockMarketData(symbols));
      }
    }

    return NextResponse.json(allData, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching market summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch market summary" },
      { status: 500 }
    );
  }
}
