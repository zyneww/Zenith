import { MarketDataPoint } from "./types";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60000; // 60s

async function coingeckoFetch<T>(endpoint: string, ttl = CACHE_TTL): Promise<T | null> {
  const cacheKey = endpoint;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }

  try {
    const url = new URL(endpoint, COINGECKO_BASE);

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        // Demo tier key if configured
        ...(process.env.COINGECKO_API_KEY ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY } : {}),
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return cached?.data as T ?? null;
    }

    const data = await res.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data as T;
  } catch {
    return cached?.data as T ?? null;
  }
}

// Top coins by market cap
interface CoinGeckoMarketItem {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  last_updated: string;
}

export async function getTopCoins(limit = 10, currency = "usd"): Promise<MarketDataPoint[]> {
  const data = await coingeckoFetch<CoinGeckoMarketItem[]>(
    `/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
  );

  if (!data) {
    return getMockTopCoins();
  }

  return data.map((coin) => ({
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price,
    change: coin.price_change_24h ?? 0,
    changePercent: coin.price_change_percentage_24h ?? 0,
    high: coin.high_24h ?? coin.current_price,
    low: coin.low_24h ?? coin.current_price,
    open: coin.current_price - (coin.price_change_24h ?? 0),
    close: coin.current_price,
    volume: coin.total_volume,
    timestamp: Date.now(),
    assetClass: "crypto",
  }));
}

// Mock top coins
function getMockTopCoins(): MarketDataPoint[] {
  const coins = [
    { symbol: "BTC", name: "Bitcoin", price: 67500, change: 1200, changePercent: 1.81, high: 68500, low: 66000, volume: 35000000000 },
    { symbol: "ETH", name: "Ethereum", price: 3550, change: 45, changePercent: 1.28, high: 3650, low: 3480, volume: 18000000000 },
    { symbol: "SOL", name: "Solana", price: 145, change: 3.5, changePercent: 2.47, high: 150, low: 140, volume: 3200000000 },
    { symbol: "BNB", name: "BNB", price: 605, change: 5, changePercent: 0.83, high: 615, low: 595, volume: 1200000000 },
    { symbol: "XRP", name: "XRP", price: 0.52, change: 0.01, changePercent: 1.96, high: 0.54, low: 0.50, volume: 2100000000 },
    { symbol: "DOGE", name: "Dogecoin", price: 0.16, change: 0.01, changePercent: 6.67, high: 0.17, low: 0.15, volume: 1900000000 },
    { symbol: "ADA", name: "Cardano", price: 0.45, change: 0.01, changePercent: 2.27, high: 0.46, low: 0.44, volume: 800000000 },
    { symbol: "AVAX", name: "Avalanche", price: 36, change: 0.8, changePercent: 2.27, high: 37, low: 35, volume: 600000000 },
    { symbol: "DOT", name: "Polkadot", price: 7.2, change: 0.15, changePercent: 2.13, high: 7.4, low: 7.0, volume: 450000000 },
    { symbol: "MATIC", name: "Polygon", price: 0.58, change: 0.02, changePercent: 3.57, high: 0.60, low: 0.56, volume: 700000000 },
  ];

  return coins.map((coin) => ({
    ...coin,
    open: coin.price - coin.change,
    close: coin.price,
    timestamp: Date.now(),
    assetClass: "crypto" as const,
  }));
}
