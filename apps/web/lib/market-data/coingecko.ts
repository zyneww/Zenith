import { MarketDataPoint } from "./types";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60000;

async function coingeckoFetch<T>(endpoint: string, ttl = CACHE_TTL): Promise<T | null> {
  const cacheKey = endpoint;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) return cached.data as T;

  try {
    const url = new URL(endpoint, COINGECKO_BASE);
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        ...(process.env.COINGECKO_API_KEY ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY } : {}),
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return cached?.data as T ?? null;
    const data = await res.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data as T;
  } catch {
    return cached?.data as T ?? null;
  }
}

const SYMBOL_TO_ID: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin",
  XRP: "ripple", DOGE: "dogecoin", ADA: "cardano", AVAX: "avalanche-2",
  DOT: "polkadot", MATIC: "polygon", LINK: "chainlink", UNI: "uniswap",
  LTC: "litecoin", SHIB: "shiba-inu", TRX: "tron", WBTC: "wrapped-bitcoin",
  ATOM: "cosmos", ETC: "ethereum-classic", XLM: "stellar", ALGO: "algorand",
  FIL: "filecoin", NEAR: "near", APT: "aptos", SUI: "sui",
  OP: "optimism", ARB: "arbitrum", PEPE: "pepe", TON: "the-open-network",
  ICP: "internet-computer", RENDER: "render-token", FET: "fetch-ai",
  INJ: "injective-protocol", IMX: "immutable-x", STX: "stacks",
  GRT: "the-graph", THETA: "theta-token", FLOW: "flow", AAVE: "aave",
  MKR: "maker", RNDR: "render-token", WLD: "worldcoin-wld",
  BCH: "bitcoin-cash", EGLD: "elrond-egld", XMR: "monero",
  TIA: "celestia", SEI: "sei-network", PYTH: "pyth-network",
};

export function getCoinGeckoId(symbol: string): string {
  return SYMBOL_TO_ID[symbol.toUpperCase()] || symbol.toLowerCase();
}

// Top coins by market cap
interface CoinGeckoMarketItem {
  id: string; symbol: string; name: string; current_price: number;
  market_cap: number; market_cap_rank: number;
  price_change_24h: number; price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  high_24h: number; low_24h: number; total_volume: number;
  sparkline_in_7d?: { price: number[] };
  last_updated: string;
}

export async function getTopCoins(
  limit = 100,
  currency = "usd",
  sparkline = false
): Promise<MarketDataPoint[]> {
  const data = await coingeckoFetch<CoinGeckoMarketItem[]>(
    `/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=${sparkline}&price_change_percentage=1h,24h,7d`
  );
  if (!data) return getMockTopCoins(Math.min(limit, 100));

  return data.map((coin) => ({
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price,
    change: coin.price_change_24h ?? 0,
    changePercent: coin.price_change_percentage_24h ?? 0,
    changePercent1h: coin.price_change_percentage_1h_in_currency ?? 0,
    changePercent7d: coin.price_change_percentage_7d_in_currency ?? 0,
    high: coin.high_24h ?? coin.current_price,
    low: coin.low_24h ?? coin.current_price,
    open: coin.current_price - (coin.price_change_24h ?? 0),
    close: coin.current_price,
    volume: coin.total_volume,
    marketCap: coin.market_cap,
    marketCapRank: coin.market_cap_rank,
    sparkline7d: coin.sparkline_in_7d?.price ?? [],
    timestamp: Date.now(),
    assetClass: "crypto",
  }));
}

export async function getSparklineData(symbolOrId: string): Promise<number[]> {
  const id = getCoinGeckoId(symbolOrId);
  const data = await coingeckoFetch<{ prices: [number, number][] }>(
    `/coins/${id}/market_chart?vs_currency=usd&days=7`,
    120000
  );
  if (!data?.prices) return _mockSparkline();
  return data.prices.map(([, price]) => price);
}

function _mockSparkline(): number[] {
  let p = 100;
  const out: number[] = [];
  for (let i = 0; i < 168; i++) {
    p += (Math.random() - 0.48) * 2;
    out.push(Math.round(p * 100) / 100);
  }
  return out;
}

// Trending coins
interface CoinGeckoTrendingItem {
  item: {
    id: string; name: string; symbol: string; market_cap_rank: number;
    thumb: string; small: string; large: string;
    price_btc: number; score: number;
    data?: {
      price?: number; market_cap?: string; total_volume?: string;
      price_change_percentage_24h?: { usd: number };
    };
  };
}

export async function getTrendingCoins(): Promise<MarketDataPoint[]> {
  const data = await coingeckoFetch<{ coins: CoinGeckoTrendingItem[] }>(
    "/search/trending",
    120000
  );
  if (!data?.coins) return getMockTopCoins(7);

  return data.coins.slice(0, 15).map(({ item }) => ({
    symbol: item.symbol.toUpperCase(),
    name: item.name,
    price: item.data?.price ?? 0,
    change: 0,
    changePercent: item.data?.price_change_percentage_24h?.usd ?? 0,
    high: 0, low: 0,
    open: 0, close: item.data?.price ?? 0,
    volume: 0,
    marketCapRank: item.market_cap_rank,
    timestamp: Date.now(),
    assetClass: "crypto",
  }));
}

function getMockTopCoins(limit = 10): MarketDataPoint[] {
  const coins = [
    { symbol: "BTC", name: "Bitcoin", price: 67500, change: 1200, changePercent: 1.81, high: 68500, low: 66000, volume: 35000000000, marketCap: 1320000000000, marketCapRank: 1 },
    { symbol: "ETH", name: "Ethereum", price: 3550, change: 45, changePercent: 1.28, high: 3650, low: 3480, volume: 18000000000, marketCap: 430000000000, marketCapRank: 2 },
    { symbol: "SOL", name: "Solana", price: 145, change: 3.5, changePercent: 2.47, high: 150, low: 140, volume: 3200000000, marketCap: 65000000000, marketCapRank: 5 },
    { symbol: "BNB", name: "BNB", price: 605, change: 5, changePercent: 0.83, high: 615, low: 595, volume: 1200000000, marketCap: 90000000000, marketCapRank: 4 },
    { symbol: "XRP", name: "XRP", price: 0.52, change: 0.01, changePercent: 1.96, high: 0.54, low: 0.50, volume: 2100000000, marketCap: 28000000000, marketCapRank: 7 },
    { symbol: "DOGE", name: "Dogecoin", price: 0.16, change: 0.01, changePercent: 6.67, high: 0.17, low: 0.15, volume: 1900000000, marketCap: 23000000000, marketCapRank: 8 },
    { symbol: "ADA", name: "Cardano", price: 0.45, change: 0.01, changePercent: 2.27, high: 0.46, low: 0.44, volume: 800000000, marketCap: 16000000000, marketCapRank: 10 },
    { symbol: "AVAX", name: "Avalanche", price: 36, change: 0.8, changePercent: 2.27, high: 37, low: 35, volume: 600000000, marketCap: 13000000000, marketCapRank: 11 },
    { symbol: "DOT", name: "Polkadot", price: 7.2, change: 0.15, changePercent: 2.13, high: 7.4, low: 7.0, volume: 450000000, marketCap: 10000000000, marketCapRank: 14 },
    { symbol: "MATIC", name: "Polygon", price: 0.58, change: 0.02, changePercent: 3.57, high: 0.60, low: 0.56, volume: 700000000, marketCap: 5800000000, marketCapRank: 16 },
    { symbol: "LINK", name: "Chainlink", price: 14.3, change: 0.25, changePercent: 1.78, high: 14.8, low: 14.0, volume: 380000000, marketCap: 8300000000, marketCapRank: 13 },
    { symbol: "UNI", name: "Uniswap", price: 7.8, change: 0.12, changePercent: 1.56, high: 8.1, low: 7.6, volume: 210000000, marketCap: 4700000000, marketCapRank: 18 },
    { symbol: "SHIB", name: "Shiba Inu", price: 0.000025, change: 0.000001, changePercent: 4.17, high: 0.000026, low: 0.000024, volume: 1200000000, marketCap: 15000000000, marketCapRank: 12 },
    { symbol: "TRX", name: "Tron", price: 0.12, change: 0.002, changePercent: 1.69, high: 0.125, low: 0.118, volume: 450000000, marketCap: 10000000000, marketCapRank: 15 },
    { symbol: "ICP", name: "Internet Computer", price: 8.5, change: 0.15, changePercent: 1.80, high: 8.8, low: 8.3, volume: 180000000, marketCap: 3900000000, marketCapRank: 20 },
  ];

  return coins.slice(0, limit).map((coin) => ({
    ...coin,
    open: coin.price - coin.change,
    close: coin.price,
    timestamp: Date.now(),
    assetClass: "crypto" as const,
  }));
}
