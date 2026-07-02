import { NextRequest, NextResponse } from "next/server";
import { getMergedMarketData, getSymbolsByAssetClass } from "@/lib/market-data/twelve-data";
import { getTopCoins } from "@/lib/market-data/coingecko";
import { MarketDataPoint } from "@/lib/market-data/types";



const ASSET_CLASSES = ["crypto", "forex", "index", "indices", "commodity", "commodities", "futures", "stock", "stocks", "etf"] as const;

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
      const limit = parseInt(limitParam || "250", 10);
      const page = parseInt(searchParams.get("page") || "1", 10);
      data = await getTopCoins(limit, page);
    } else {
      // All other assets: merge real Twelve Data + auto-generated mocks
      let symbols: string[] | undefined;

      if (symbolsParam) {
        symbols = symbolsParam.split(",");
      }

      data = await getMergedMarketData(
        assetClass as (typeof ASSET_CLASSES)[number],
        symbols
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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
