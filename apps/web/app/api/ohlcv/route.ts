import { NextResponse } from "next/server";

// Mock OHLCV data generator
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
  
  const data = generateOHLCV(symbol, timeframe, limit);
  
  return NextResponse.json({
    symbol,
    timeframe,
    data,
  });
}
