import { MarketDataPoint, AssetClass } from "./types";

const TWELVE_DATA_BASE = "https://api.twelvedata.com";

const API_KEY = process.env.TWELVE_DATA_API_KEY || "";

// Free tier: 800 API calls/day, 8 per minute
// We cache aggressively to stay within limits

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30000; // 30s for live prices
const CACHE_TTL_LONG = 300000; // 5min for less critical data

async function twelveDataFetch<T>(endpoint: string, ttl = CACHE_TTL): Promise<T | null> {
  if (!API_KEY || API_KEY === "your_free_twelve_data_key_here") {
    // Return mock data if no key configured
    return null;
  }

  const cacheKey = endpoint;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }

  try {
    const url = new URL(endpoint, TWELVE_DATA_BASE);
    url.searchParams.set("apikey", API_KEY);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      // Rate limited or error
      return cached?.data as T ?? null;
    }

    const data = await res.json();

    if (data.status === "error" || data.code !== undefined) {
      return cached?.data as T ?? null;
    }

    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data as T;
  } catch {
    return cached?.data as T ?? null;
  }
}

// Price quote endpoint
interface TwelveQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  open: string;
  high: string;
  low: string;
  close: string;
  previous_close: string;
  change: string;
  percent_change: string;
  volume: string;
  timestamp: number;
}

export async function getTwelveQuote(symbols: string[]): Promise<MarketDataPoint[]> {
  const symbolStr = symbols.join(",");
  const data = await twelveDataFetch<{ [symbol: string]: TwelveQuote | { status: string } }>(
    `/quote?symbol=${symbolStr}`
  );

  if (!data) {
    return [];
  }

  const results: MarketDataPoint[] = [];

  for (const symbol of symbols) {
    const item = data[symbol];
    if (!item || "status" in item) continue;

    const assetClass = classifySymbol(symbol);

    results.push({
      symbol,
      name: item.name || symbol,
      price: parseFloat(item.close),
      change: parseFloat(item.change),
      changePercent: parseFloat(item.percent_change),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      open: parseFloat(item.open),
      close: parseFloat(item.close),
      volume: parseFloat(item.volume),
      timestamp: typeof item.timestamp === "number" ? item.timestamp * 1000 : Date.now(),
      assetClass,
    });
  }

  return results;
}

// EOD prices for historical context
export async function getTwelveEOD(symbol: string): Promise<MarketDataPoint | null> {
  const data = await twelveDataFetch<{ [symbol: string]: TwelveQuote }>(`/eod?symbol=${symbol}`, CACHE_TTL_LONG);

  if (!data || !data[symbol]) return null;

  const item = data[symbol];
  const assetClass = classifySymbol(symbol);

  return {
    symbol,
    name: item.name || symbol,
    price: parseFloat(item.close),
    change: parseFloat(item.change),
    changePercent: parseFloat(item.percent_change),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    open: parseFloat(item.open),
    close: parseFloat(item.close),
    timestamp: Date.now(),
    assetClass,
  };
}

function classifySymbol(symbol: string): AssetClass {
  const s = symbol.toUpperCase();
  if (s.includes("/")) return "forex";
  if (s.startsWith("BTC") || s.startsWith("ETH") || s.endsWith("USD") || s.endsWith("USDT")) return "crypto";
  if (s.startsWith("ES") || s.startsWith("NQ") || s.startsWith("YM") || s.endsWith("1!")) return "futures";
  if (s.startsWith("^")) return "indices";
  if (s === "SPX" || s === "DJI" || s === "IXIC" || s === "RUT" || s === "VIX" || s.startsWith("STOXX") || s.startsWith("FTSE") || s.startsWith("DAX") || s.startsWith("N225") || s.startsWith("HSI")) return "indices";
  if (s.startsWith("GC") || s.startsWith("SI") || s.startsWith("CL") || s.startsWith("NG") || s.startsWith("HG") || s.startsWith("ZW") || s.startsWith("ZC") || s.startsWith("ZS")) return "commodities";
  return "stocks";
}

// Mock data fallback for when no API key is configured
const MOCK_DATA: Record<string, MarketDataPoint> = {
  "EUR/USD": { symbol: "EUR/USD", name: "Euro / Dollar", price: 1.0845, change: 0.0023, changePercent: 0.21, high: 1.0860, low: 1.0810, open: 1.0822, close: 1.0845, timestamp: Date.now(), assetClass: "forex" },
  "GBP/USD": { symbol: "GBP/USD", name: "Livre / Dollar", price: 1.2730, change: -0.0041, changePercent: -0.32, high: 1.2780, low: 1.2700, open: 1.2771, close: 1.2730, timestamp: Date.now(), assetClass: "forex" },
  "USD/JPY": { symbol: "USD/JPY", name: "Dollar / Yen", price: 149.85, change: 0.45, changePercent: 0.30, high: 150.20, low: 149.30, open: 149.40, close: 149.85, timestamp: Date.now(), assetClass: "forex" },
  "USD/CHF": { symbol: "USD/CHF", name: "Dollar / Franc", price: 0.8820, change: -0.0012, changePercent: -0.14, high: 0.8840, low: 0.8800, open: 0.8832, close: 0.8820, timestamp: Date.now(), assetClass: "forex" },
  "AUD/USD": { symbol: "AUD/USD", name: "Dollar australien / Dollar", price: 0.6560, change: 0.0015, changePercent: 0.23, high: 0.6580, low: 0.6530, open: 0.6545, close: 0.6560, timestamp: Date.now(), assetClass: "forex" },
  "USD/CAD": { symbol: "USD/CAD", name: "Dollar / Dollar canadien", price: 1.3520, change: -0.0030, changePercent: -0.22, high: 1.3560, low: 1.3490, open: 1.3550, close: 1.3520, timestamp: Date.now(), assetClass: "forex" },
  "EUR/GBP": { symbol: "EUR/GBP", name: "Euro / Livre", price: 0.8520, change: 0.0010, changePercent: 0.12, high: 0.8550, low: 0.8490, open: 0.8510, close: 0.8520, timestamp: Date.now(), assetClass: "forex" },

  "^GSPC": { symbol: "^GSPC", name: "S&P 500", price: 5200.15, change: 12.45, changePercent: 0.24, high: 5210.00, low: 5180.00, open: 5187.70, close: 5200.15, timestamp: Date.now(), assetClass: "indices" },
  "^IXIC": { symbol: "^IXIC", name: "Nasdaq", price: 16500.30, change: 45.20, changePercent: 0.27, high: 16600.00, low: 16400.00, open: 16455.10, close: 16500.30, timestamp: Date.now(), assetClass: "indices" },
  "^DJI": { symbol: "^DJI", name: "Dow Jones", price: 39500.00, change: 80.50, changePercent: 0.20, high: 39600.00, low: 39300.00, open: 39419.50, close: 39500.00, timestamp: Date.now(), assetClass: "indices" },
  "^FCHI": { symbol: "^FCHI", name: "CAC 40", price: 8000.00, change: 15.00, changePercent: 0.19, high: 8050.00, low: 7950.00, open: 7985.00, close: 8000.00, timestamp: Date.now(), assetClass: "indices" },
  "^GDAXI": { symbol: "^GDAXI", name: "DAX", price: 18000.00, change: 30.00, changePercent: 0.17, high: 18100.00, low: 17900.00, open: 17970.00, close: 18000.00, timestamp: Date.now(), assetClass: "indices" },
  "^FTSE": { symbol: "^FTSE", name: "FTSE 100", price: 7800.00, change: -10.00, changePercent: -0.13, high: 7850.00, low: 7750.00, open: 7810.00, close: 7800.00, timestamp: Date.now(), assetClass: "indices" },
  "^N225": { symbol: "^N225", name: "Nikkei 225", price: 39000.00, change: 200.00, changePercent: 0.51, high: 39200.00, low: 38700.00, open: 38800.00, close: 39000.00, timestamp: Date.now(), assetClass: "indices" },
  "^HSI": { symbol: "^HSI", name: "Hang Seng", price: 17000.00, change: -50.00, changePercent: -0.29, high: 17200.00, low: 16900.00, open: 17050.00, close: 17000.00, timestamp: Date.now(), assetClass: "indices" },

  "CL=F": { symbol: "CL=F", name: "Pétrole brut (WTI)", price: 78.50, change: 1.20, changePercent: 1.55, high: 79.00, low: 77.00, open: 77.30, close: 78.50, volume: 250000, timestamp: Date.now(), assetClass: "commodities" },
  "GC=F": { symbol: "GC=F", name: "Or", price: 2350.00, change: 15.00, changePercent: 0.64, high: 2360.00, low: 2330.00, open: 2335.00, close: 2350.00, volume: 180000, timestamp: Date.now(), assetClass: "commodities" },
  "SI=F": { symbol: "SI=F", name: "Argent", price: 28.50, change: 0.30, changePercent: 1.06, high: 28.80, low: 28.00, open: 28.20, close: 28.50, volume: 120000, timestamp: Date.now(), assetClass: "commodities" },
  "NG=F": { symbol: "NG=F", name: "Gaz naturel", price: 2.50, change: -0.05, changePercent: -1.96, high: 2.60, low: 2.40, open: 2.55, close: 2.50, volume: 90000, timestamp: Date.now(), assetClass: "commodities" },
  "HG=F": { symbol: "HG=F", name: "Cuivre", price: 4.20, change: 0.08, changePercent: 1.94, high: 4.25, low: 4.10, open: 4.12, close: 4.20, volume: 75000, timestamp: Date.now(), assetClass: "commodities" },
  "ZW=F": { symbol: "ZW=F", name: "Blé", price: 5.80, change: 0.10, changePercent: 1.75, high: 5.90, low: 5.70, open: 5.70, close: 5.80, volume: 50000, timestamp: Date.now(), assetClass: "commodities" },
  "ZC=F": { symbol: "ZC=F", name: "Maïs", price: 4.50, change: 0.05, changePercent: 1.12, high: 4.55, low: 4.40, open: 4.45, close: 4.50, volume: 45000, timestamp: Date.now(), assetClass: "commodities" },
  "ZS=F": { symbol: "ZS=F", name: "Soja", price: 12.00, change: 0.20, changePercent: 1.69, high: 12.10, low: 11.80, open: 11.80, close: 12.00, volume: 40000, timestamp: Date.now(), assetClass: "commodities" },

  "ES=F": { symbol: "ES=F", name: "S&P 500 Futures", price: 5200.00, change: 10.00, changePercent: 0.19, high: 5210.00, low: 5180.00, open: 5190.00, close: 5200.00, volume: 50000, timestamp: Date.now(), assetClass: "futures" },
  "NQ=F": { symbol: "NQ=F", name: "Nasdaq Futures", price: 16500.00, change: 35.00, changePercent: 0.21, high: 16600.00, low: 16400.00, open: 16465.00, close: 16500.00, volume: 40000, timestamp: Date.now(), assetClass: "futures" },
  "YM=F": { symbol: "YM=F", name: "Dow Jones Futures", price: 39500.00, change: 70.00, changePercent: 0.18, high: 39600.00, low: 39300.00, open: 39430.00, close: 39500.00, volume: 30000, timestamp: Date.now(), assetClass: "futures" },
  "GCF": { symbol: "GCF", name: "Or Futures", price: 2350.00, change: 15.00, changePercent: 0.64, high: 2360.00, low: 2330.00, open: 2335.00, close: 2350.00, volume: 20000, timestamp: Date.now(), assetClass: "futures" },
  "CLF": { symbol: "CLF", name: "Pétrole Futures", price: 78.50, change: 1.20, changePercent: 1.55, high: 79.00, low: 77.00, open: 77.30, close: 78.50, volume: 25000, timestamp: Date.now(), assetClass: "futures" },
};

export function getMockMarketData(symbols: string[]): MarketDataPoint[] {
  return symbols
    .map((s) => MOCK_DATA[s])
    .filter(Boolean)
    .map((item) => ({
      ...item,
      price: item.price + (Math.random() - 0.5) * item.price * 0.002,
      changePercent: item.changePercent + (Math.random() - 0.5) * 0.1,
      change: item.change + (Math.random() - 0.5) * item.price * 0.002,
      timestamp: Date.now(),
    }));
}

// Helper to get all symbols by asset class
export function getSymbolsByAssetClass(assetClass: AssetClass): string[] {
  return Object.values(MOCK_DATA)
    .filter((d) => d.assetClass === assetClass)
    .map((d) => d.symbol);
}
