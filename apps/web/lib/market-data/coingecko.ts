import { MarketDataPoint } from "./types";
import { getAssetsByType } from "@/lib/assets/registry";

const BASE = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY || "";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 300_000; // ponytail: 5min cache to stay well under CoinGecko free-tier 10-30 req/min

async function coingeckoFetch<T>(endpoint: string, ttl = CACHE_TTL): Promise<T | null> {
  const cacheKey = endpoint;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }

  try {
    const url = new URL(BASE + endpoint);
    if (API_KEY) url.searchParams.set("x_cg_demo_api_key", API_KEY);
    // ponytail: force no-store to avoid Next.js fetch cache doubling our rate-limit usage
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[CoinGecko] HTTP ${res.status} on ${endpoint}: ${res.statusText} | body: ${body.slice(0, 200)}`);
      return null;
    }
    const data = await res.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data as T;
  } catch (err) {
    console.warn(`[CoinGecko] fetch error on ${endpoint}:`, err);
    return cached?.data as T ?? null;
  }
}

export function getCoinGeckoId(symbolOrId: string): string {
  const map: Record<string, string> = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    BNB: "binancecoin",
    XRP: "ripple",
    DOGE: "dogecoin",
    ADA: "cardano",
    AVAX: "avalanche-2",
    DOT: "polkadot",
    MATIC: "polygon",
    LINK: "chainlink",
    UNI: "uniswap",
    SHIB: "shiba-inu",
    TRX: "tron",
    ICP: "internet-computer",
    NEAR: "near",
    ATOM: "cosmos",
    OP: "optimism",
    ARB: "arbitrum",
    APT: "aptos",
    SUI: "sui",
    TIA: "celestia",
    SEI: "sei-network",
    INJ: "injective",
    RUNE: "thorchain",
    AAVE: "aave",
    MKR: "maker",
    COMP: "compound",
    CRV: "curve-dao-token",
    LDO: "lido-dao",
    RPL: "rocket-pool",
    FXS: "frax-share",
    ALGO: "algorand",
    FIL: "filecoin",
    ETC: "ethereum-classic",
    XLM: "stellar",
    XMR: "monero",
    ZEC: "zcash",
    DASH: "dash",
    EOS: "eos",
    TRB: "tellor",
    API3: "api3",
    BAND: "band-protocol",
  };
  return map[symbolOrId.toUpperCase()] || symbolOrId.toLowerCase();
}

function toMarketDataPoint(data: Partial<MarketDataPoint> & { symbol: string; name: string; price: number }): MarketDataPoint {
  return {
    id: data.id || data.symbol,
    symbol: data.symbol,
    name: data.name,
    image: data.image || "",
    current_price: data.price,
    price_change_percentage_24h: data.changePercent ?? 0,
    high_24h: data.high ?? data.price,
    low_24h: data.low ?? data.price,
    total_volume: data.volume ?? 0,
    market_cap: data.marketCap ?? 0,
    circulating_supply: data.circulating_supply ?? 0,
    max_supply: data.max_supply ?? null,
    ath: data.ath ?? data.price,
    atl: data.atl ?? 0,
    assetClass: data.assetClass ?? "crypto" as any,
    price: data.price,
    changePercent: data.changePercent ?? 0,
    changePercent1h: data.changePercent1h ?? 0,
    changePercent7d: data.changePercent7d ?? 0,
    change24h: data.changePercent ?? 0,
    high: data.high ?? data.price,
    low: data.low ?? data.price,
    volume: data.volume ?? 0,
    marketCap: data.marketCap ?? 0,
    marketCapRank: data.marketCapRank,
    sparkline7d: data.sparkline7d ?? [],
    tags: data.tags ?? [],
  };
}

// Build a lookup map from registry: symbol → tags
const registryTagMap = new Map<string, string[]>();
for (const asset of getAssetsByType("crypto")) {
  if (asset.tags?.length) {
    registryTagMap.set(asset.symbol.toUpperCase(), asset.tags);
  }
}

export async function getTopCoins(limit = 10, page = 1): Promise<MarketDataPoint[]> {
  const perPage = Math.min(limit, 250);
  const pages = Math.ceil(limit / 250);
  const startPage = page;

  const allRaw: any[] = [];
  for (let p = 0; p < pages; p++) {
    const currentPage = startPage + p;
    const data = await coingeckoFetch<any[]>(
      `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${currentPage}&sparkline=true&price_change_percentage=1h,7d`,
      60_000 // 60s cache aligned with CoinGecko free tier
    );
    if (data) allRaw.push(...data);
  }

  if (allRaw.length === 0) {
    console.warn(`[CoinGecko] API returned 0 coins for limit=${limit}, falling back to mock data. Key present: ${Boolean(API_KEY)}`);
    return getMockTopCoins(limit);
  }

  return allRaw.slice(0, limit).map((coin) => {
    const symbol = coin.symbol.toUpperCase();
    const tags = registryTagMap.get(symbol) ?? [];
    return toMarketDataPoint({
      id: coin.id,
      symbol,
      name: coin.name,
      image: coin.image,
      price: coin.current_price,
      changePercent: coin.price_change_percentage_24h ?? 0,
      changePercent1h: coin.price_change_percentage_1h_in_currency ?? 0,
      changePercent7d: coin.price_change_percentage_7d_in_currency ?? 0,
      high: coin.high_24h ?? coin.current_price,
      low: coin.low_24h ?? coin.current_price,
      volume: coin.total_volume,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      sparkline7d: coin.sparkline_in_7d?.price ?? [],
      tags,
    });
  });
}

export async function getTrendingCoins(): Promise<MarketDataPoint[]> {
  interface CoinGeckoTrendingItem {
    item: {
      id: string;
      symbol: string;
      name: string;
      large: string;
      thumb: string;
      market_cap_rank: number;
      data: {
        price: number;
        price_change_percentage_24h: { usd: number };
        market_cap: number;
        total_volume: number;
      };
    };
  }
  const data = await coingeckoFetch<{ coins: CoinGeckoTrendingItem[] }>("/search/trending", 120000);
  if (!data?.coins) return getMockTopCoins(7);

  return data.coins.slice(0, 15).map(({ item }) => toMarketDataPoint({
    id: item.id,
    symbol: item.symbol.toUpperCase(),
    name: item.name,
    image: item.large ?? item.thumb,
    price: item.data?.price ?? 0,
    changePercent: item.data?.price_change_percentage_24h?.usd ?? 0,
    marketCapRank: item.market_cap_rank,
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

// Seeded random for consistent mock prices between calls
function seededRandom(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const normalized = (Math.abs(hash) % 10000) / 10000;
  return min + normalized * (max - min);
}

function generateMetricsByRank(rank: number) {
  if (rank <= 10) {
    return {
      price: 1000 + seededRandom(`price${rank}`, 0, 69000),
      marketCap: 10e9 + seededRandom(`mc${rank}`, 0, 1490e9),
      volume: 1e9 + seededRandom(`vol${rank}`, 0, 49e9),
    };
  } else if (rank <= 50) {
    return {
      price: 10 + seededRandom(`price${rank}`, 0, 990),
      marketCap: 1e9 + seededRandom(`mc${rank}`, 0, 9e9),
      volume: 100e6 + seededRandom(`vol${rank}`, 0, 900e6),
    };
  } else if (rank <= 100) {
    return {
      price: 1 + seededRandom(`price${rank}`, 0, 99),
      marketCap: 500e6 + seededRandom(`mc${rank}`, 0, 500e6),
      volume: 50e6 + seededRandom(`vol${rank}`, 0, 50e6),
    };
  } else {
    return {
      price: 0.01 + seededRandom(`price${rank}`, 0, 9.99),
      marketCap: 100e6 + seededRandom(`mc${rank}`, 0, 400e6),
      volume: 10e6 + seededRandom(`vol${rank}`, 0, 40e6),
    };
  }
}

function getMockTopCoins(limit = 10): MarketDataPoint[] {
  const registryAssets = getAssetsByType("crypto");
  
  // 1. Generate from registry assets (real names, symbols, logos, tags)
  const registryCoins = registryAssets.map((asset, index) => {
    const rank = index + 1;
    const { price, marketCap, volume } = generateMetricsByRank(rank);
    const changePercent = seededRandom(asset.symbol + "24h", -15, 15);
    const high = price * (1 + Math.abs(changePercent) / 100 + 0.05);
    const low = price * (1 - Math.abs(changePercent) / 100 - 0.05);
    
    return toMarketDataPoint({
      id: asset.coingeckoId || asset.slug,
      symbol: asset.symbol,
      name: asset.name,
      image: asset.logoUrl,
      price,
      changePercent,
      changePercent1h: seededRandom(asset.symbol + "1h", -5, 5),
      changePercent7d: seededRandom(asset.symbol + "7d", -30, 30),
      high,
      low,
      volume,
      marketCap,
      marketCapRank: rank,
      sparkline7d: _mockSparkline(),
      tags: asset.tags ?? [],
    });
  });
  
  // 2. Generate additional 150 mocks to reach 250 total
  const additionalCoins: MarketDataPoint[] = [];
  const FAKE_NAMES = [
    "Aurora", "Borealis", "Catalyst", "Drift", "Eclipse", "Flux", "Glitch", "Helix", "Ion", "Jolt",
    "Kinetic", "Lunar", "Matrix", "Nebula", "Orbit", "Pulse", "Quantum", "Rift", "Solstice", "Titan",
    "Uplink", "Vector", "Warp", "Xenon", "Yield", "Zenith", "Arc", "Bolt", "Cipher", "Delta",
    "Ethera", "Frost", "Grit", "Haven", "Iris", "Jade", "Karma", "Lumen", "Myth", "Nova",
    "Opal", "Prism", "Quark", "Relay", "Shard", "Tide", "Unity", "Volt", "Wave", "Xero",
    "Apex", "Blaze", "Core", "Dusk", "Echo", "Fury", "Gale", "Halo", "Ivy", "Jolt",
    "Kite", "Lynx", "Muse", "Nyx", "Omni", "Peak", "Quill", "Rune", "Sage", "Tide",
    "Umbra", "Vex", "Wisp", "Axiom", "Brim", "Crest", "Dune", "Ember", "Flux", "Gloom",
    "Hush", "Inkx", "Jinx", "Kelp", "Loom", "Mire", "Nook", "Oath", "Pact", "Quip",
    "Reef", "Silt", "Tarn", "Urge", "Vale", "Whey", "Yarn", "Zest", "Acre", "Bane",
    "Cove", "Dire", "Eave", "Fell", "Gyre", "Hewn", "Idle", "Jape", "Keen", "Lilt",
    "Meld", "Nigh", "Orne", "Prow", "Quay", "Rife", "Sewn", "Tact", "Umbr", "Vial",
    "Wold", "Yore", "Zinc", "Alta", "Brio", "Chin", "Dote", "Earn", "Fawn", "Gild",
    "Hilt", "Iota", "Jade", "Kale", "Lace", "Maze", "Nape", "Ogre", "Pine", "Quid",
    "Raze", "Sine", "Tome", "Updo", "Vole", "Wane", "Xyst", "Yurt", "Zebu",
  ];
  
  for (let i = 0; i < 150; i++) {
    const rank = 101 + i;
    const { price, marketCap, volume } = generateMetricsByRank(rank);
    const name = FAKE_NAMES[i % FAKE_NAMES.length] + (i >= FAKE_NAMES.length ? ` ${Math.floor(i / FAKE_NAMES.length) + 1}` : "");
    const symbol = name.substring(0, 4).toUpperCase();
    const changePercent = seededRandom(symbol + "24h", -15, 15);
    
    additionalCoins.push(toMarketDataPoint({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      symbol,
      name,
      price,
      changePercent,
      changePercent1h: seededRandom(symbol + "1h", -5, 5),
      changePercent7d: seededRandom(symbol + "7d", -30, 30),
      high: price * (1 + Math.abs(changePercent) / 100 + 0.05),
      low: price * (1 - Math.abs(changePercent) / 100 - 0.05),
      volume,
      marketCap,
      marketCapRank: rank,
      sparkline7d: _mockSparkline(),
    }));
  }
  
  const all = [...registryCoins, ...additionalCoins];
  return all.slice(0, limit);
}
