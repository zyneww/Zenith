import { NextRequest, NextResponse } from "next/server";
import { getTwelveQuote, getMockMarketData, getSymbolsByAssetClass } from "@/lib/market-data/twelve-data";
import { getTopCoins } from "@/lib/market-data/coingecko";
import { MarketDataPoint } from "@/lib/market-data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ASSET_CLASSES = ["crypto", "forex", "indices", "commodities", "futures", "stocks"] as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assetClass: string }> }
) {
  const { assetClass } = await params;

  if (!ASSET_CLASSES.includes(assetClass as (typeof ASSET_CLASSES)[number])) {
    return NextResponse.json({ error: "Invalid asset class" }, { status: 400 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const symbolsParam = searchParams.get("symbols");
    const limitParam = searchParams.get("limit");

    let data: MarketDataPoint[] = [];

    if (assetClass === "crypto") {
      // Crypto uses CoinGecko + Binance WS
      const limit = parseInt(limitParam || "10", 10);
      data = await getTopCoins(limit);
    } else {
      // All other assets use Twelve Data
      let symbols: string[];

      if (symbolsParam) {
        symbols = symbolsParam.split(",");
      } else {
        symbols = getSymbolsByAssetClass(assetClass as (typeof ASSET_CLASSES)[number]);
      }

      if (symbols.length === 0) {
        return NextResponse.json([], { status: 200 });
      }

      // Try Twelve Data API first
      const apiData = await getTwelveQuote(symbols);

      if (apiData.length > 0) {
        data = apiData;
      } else {
        // Fallback to mock data
        data = getMockMarketData(symbols);
      }
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error(`Error fetching ${assetClass} data:`, error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
