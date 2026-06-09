import { NextResponse } from "next/server";
import { getOHLCV } from "@/lib/db/questdb";

// Mock OHLCV data generator (fallback if QuestDB unavailable)
function generateOHLCV(symbol: string, timeframe: string, limit: number = 100) {
  const data = [];
  const now = Date.now();
  const interval = timeframe === "1m" ? 60000 : timeframe === "5m" ? 300000 : timeframe === "1h" ? 3600000 : 86400000;
  
  let basePrice = symbol === "BTC" ? 65000 : symbol === "ETH" ? 3500 : 150;
  
  for (let i = limit; i > 0; i--) {
    const time = (now - i * interval) / 1000;
    const volatility = basePrice * 0.02;
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const high = open + Math.random() * volatility * 0.5;
    const low = open - Math.random() * volatility * 0.5;
    const close = low + Math.random() * (high - low);
    const volume = Math.random() * 1000000;
    
    data.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });
    
    basePrice = close;
  }
  
  return data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTC";
  const timeframe = searchParams.get("timeframe") || "1h";
  const limit = parseInt(searchParams.get("limit") || "100");
  
  try {
    // Try to get real data from QuestDB
    const data = await getOHLCV(symbol, timeframe, limit);
    
    if (data.length === 0) {
      // Fallback to mock if no data in QuestDB yet
      const mockData = generateOHLCV(symbol, timeframe, limit);
      return NextResponse.json({
        symbol,
        timeframe,
        data: mockData,
        source: "mock",
        note: "QuestDB has no data for this symbol yet. Ingestion pipeline not running.",
      });
    }
    
    return NextResponse.json({
      symbol,
      timeframe,
      data,
      source: "questdb",
    });
  } catch (error) {
    console.error("QuestDB error:", error);
    // Fallback to mock data on error
    const mockData = generateOHLCV(symbol, timeframe, limit);
    return NextResponse.json({
      symbol,
      timeframe,
      data: mockData,
      source: "mock",
      error: (error as Error).message,
    });
  }
}
