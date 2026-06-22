export type AssetType = "crypto" | "forex" | "commodity" | "index";

export interface AssetMeta {
  slug: string;
  name: string;
  symbol: string;
  type: AssetType;
  coingeckoId?: string;
  finnhubSymbol: string;
  logoUrl: string;
  fallbackColor: string;
  description: string;
  displayDecimals: number;
}

const crypto: AssetMeta[] = [
  { slug: "bitcoin", name: "Bitcoin", symbol: "BTC", type: "crypto", coingeckoId: "bitcoin", finnhubSymbol: "BINANCE:BTCUSDT", logoUrl: "https://assets.coingecko.com/coins/images/large/1.png", fallbackColor: "#F7931A", displayDecimals: 2, description: "Première crypto décentralisée, capitalisation dominante" },
  { slug: "ethereum", name: "Ethereum", symbol: "ETH", type: "crypto", coingeckoId: "ethereum", finnhubSymbol: "BINANCE:ETHUSDT", logoUrl: "https://assets.coingecko.com/coins/images/large/279.png", fallbackColor: "#627EEA", displayDecimals: 2, description: "Plateforme de smart contracts, base de la DeFi" },
  { slug: "solana", name: "Solana", symbol: "SOL", type: "crypto", coingeckoId: "solana", finnhubSymbol: "BINANCE:SOLUSDT", logoUrl: "https://assets.coingecko.com/coins/images/large/4128.png", fallbackColor: "#14F195", displayDecimals: 2, description: "Blockchain haute performance, sub-seconde finality" },
  { slug: "binancecoin", name: "BNB", symbol: "BNB", type: "crypto", coingeckoId: "binancecoin", finnhubSymbol: "BINANCE:BNBUSDT", logoUrl: "https://assets.coingecko.com/coins/images/large/825.png", fallbackColor: "#F0B90B", displayDecimals: 2, description: "Token natif de l'exchange Binance" },
  { slug: "ripple", name: "XRP", symbol: "XRP", type: "crypto", coingeckoId: "ripple", finnhubSymbol: "BINANCE:XRPUSDT", logoUrl: "https://assets.coingecko.com/coins/images/large/44.png", fallbackColor: "#23292F", displayDecimals: 4, description: "Réseau de paiements cross-border" },
  { slug: "cardano", name: "Cardano", symbol: "ADA", type: "crypto", coingeckoId: "cardano", finnhubSymbol: "BINANCE:ADAUSDT", logoUrl: "https://assets.coingecko.com/coins/images/large/975.png", fallbackColor: "#0033AD", displayDecimals: 4, description: "Blockchain proof-of-stake académique" },
  { slug: "dogecoin", name: "Dogecoin", symbol: "DOGE", type: "crypto", coingeckoId: "dogecoin", finnhubSymbol: "BINANCE:DOGEUSDT", logoUrl: "https://assets.coingecko.com/coins/images/large/5.png", fallbackColor: "#C2A633", displayDecimals: 5, description: "Meme coin original, communauté massive" },
  { slug: "matic-network", name: "Polygon", symbol: "MATIC", type: "crypto", coingeckoId: "matic-network", finnhubSymbol: "BINANCE:MATICUSDT", logoUrl: "https://assets.coingecko.com/coins/images/large/4713.png", fallbackColor: "#8247E5", displayDecimals: 4, description: "Sidechain Ethereum, scaling Layer 2" },
  { slug: "polkadot", name: "Polkadot", symbol: "DOT", type: "crypto", coingeckoId: "polkadot", finnhubSymbol: "BINANCE:DOTUSDT", logoUrl: "https://assets.coingecko.com/coins/images/large/12171.png", fallbackColor: "#E6007A", displayDecimals: 2, description: "Protocole multi-chain interop" },
  { slug: "avalanche-2", name: "Avalanche", symbol: "AVAX", type: "crypto", coingeckoId: "avalanche-2", finnhubSymbol: "BINANCE:AVAXUSDT", logoUrl: "https://assets.coingecko.com/coins/images/large/12559.png", fallbackColor: "#E84142", displayDecimals: 2, description: "Plateforme DeFi haute performance" },
];

const forex: AssetMeta[] = [
  { slug: "eurusd", name: "EUR/USD", symbol: "EUR/USD", type: "forex", finnhubSymbol: "OANDA:EUR_USD", logoUrl: "https://logo.clearbit.com/ecb.europa.eu", fallbackColor: "#003399", displayDecimals: 4, description: "Euro contre dollar US" },
  { slug: "gbpusd", name: "GBP/USD", symbol: "GBP/USD", type: "forex", finnhubSymbol: "OANDA:GBP_USD", logoUrl: "https://logo.clearbit.com/bankofengland.co.uk", fallbackColor: "#012169", displayDecimals: 4, description: "Livre sterling contre dollar US" },
  { slug: "usdjpy", name: "USD/JPY", symbol: "USD/JPY", type: "forex", finnhubSymbol: "OANDA:USD_JPY", logoUrl: "https://logo.clearbit.com/boj.or.jp", fallbackColor: "#BC002D", displayDecimals: 2, description: "Dollar US contre yen japonais" },
  { slug: "usdcad", name: "USD/CAD", symbol: "USD/CAD", type: "forex", finnhubSymbol: "OANDA:USD_CAD", logoUrl: "https://logo.clearbit.com/bankofcanada.ca", fallbackColor: "#FF0000", displayDecimals: 4, description: "Dollar US contre dollar canadien" },
  { slug: "usdchf", name: "USD/CHF", symbol: "USD/CHF", type: "forex", finnhubSymbol: "OANDA:USD_CHF", logoUrl: "https://logo.clearbit.com/snb.ch", fallbackColor: "#D52B1E", displayDecimals: 4, description: "Dollar US contre franc suisse" },
];

const commodities: AssetMeta[] = [
  { slug: "gold", name: "Gold", symbol: "XAU", type: "commodity", finnhubSymbol: "OANDA:XAU_USD", logoUrl: "https://logo.clearbit.com/gold.org", fallbackColor: "#FFD700", displayDecimals: 2, description: "Métal précieux, valeur refuge" },
  { slug: "silver", name: "Silver", symbol: "XAG", type: "commodity", finnhubSymbol: "OANDA:XAG_USD", logoUrl: "https://logo.clearbit.com/silverinstitute.org", fallbackColor: "#C0C0C0", displayDecimals: 2, description: "Métal précieux industriel" },
  { slug: "crude-oil-wti", name: "Crude Oil WTI", symbol: "WTI", type: "commodity", finnhubSymbol: "NYMEX:CL1!", logoUrl: "https://logo.clearbit.com/eia.gov", fallbackColor: "#8B4513", displayDecimals: 2, description: "Pétrole brut WTI, référence US" },
  { slug: "brent", name: "Brent Crude", symbol: "BRENT", type: "commodity", finnhubSymbol: "ICE:B1!", logoUrl: "https://logo.clearbit.com/ice.com", fallbackColor: "#000000", displayDecimals: 2, description: "Pétrole brut Brent, référence Europe" },
  { slug: "natural-gas", name: "Natural Gas", symbol: "NG", type: "commodity", finnhubSymbol: "NYMEX:NG1!", logoUrl: "https://logo.clearbit.com/eia.gov", fallbackColor: "#4682B4", displayDecimals: 3, description: "Gaz naturel, indicateur énergétique" },
];

const indices: AssetMeta[] = [
  { slug: "spx", name: "S&P 500", symbol: "SPX", type: "index", finnhubSymbol: "INDEX:SPX", logoUrl: "https://logo.clearbit.com/spglobal.com", fallbackColor: "#003B71", displayDecimals: 2, description: "500 plus grandes capitalisations US" },
  { slug: "ndx", name: "Nasdaq 100", symbol: "NDX", type: "index", finnhubSymbol: "INDEX:NDX", logoUrl: "https://logo.clearbit.com/nasdaq.com", fallbackColor: "#000000", displayDecimals: 2, description: "100 plus grandes non-financières du Nasdaq" },
  { slug: "dax", name: "DAX 40", symbol: "DAX", type: "index", finnhubSymbol: "INDEX:DAX", logoUrl: "https://logo.clearbit.com/dax-indices.com", fallbackColor: "#000000", displayDecimals: 2, description: "40 plus grandes capitalisations allemandes" },
  { slug: "ftse", name: "FTSE 100", symbol: "FTSE", type: "index", finnhubSymbol: "INDEX:FTSE", logoUrl: "https://logo.clearbit.com/ftserussell.com", fallbackColor: "#0F2041", displayDecimals: 2, description: "100 plus grandes capitalisations UK" },
  { slug: "cac40", name: "CAC 40", symbol: "CAC", type: "index", finnhubSymbol: "INDEX:CAC", logoUrl: "https://logo.clearbit.com/euronext.com", fallbackColor: "#002395", displayDecimals: 2, description: "40 plus grandes capitalisations françaises" },
  { slug: "nikkei", name: "Nikkei 225", symbol: "N225", type: "index", finnhubSymbol: "INDEX:N225", logoUrl: "https://logo.clearbit.com/jpx.co.jp", fallbackColor: "#000000", displayDecimals: 2, description: "225 plus grandes capitalisations japonaises" },
  { slug: "hang-seng", name: "Hang Seng", symbol: "HSI", type: "index", finnhubSymbol: "INDEX:HSI", logoUrl: "https://logo.clearbit.com/hkex.com.hk", fallbackColor: "#DE2910", displayDecimals: 2, description: "Plus grandes capitalisations Hong Kong" },
  { slug: "shanghai", name: "Shanghai Composite", symbol: "SSEC", type: "index", finnhubSymbol: "INDEX:SHCOMP", logoUrl: "https://logo.clearbit.com/sse.com.cn", fallbackColor: "#EE1C25", displayDecimals: 2, description: "Bourse de Shanghai" },
  { slug: "dow-jones", name: "Dow Jones", symbol: "DJI", type: "index", finnhubSymbol: "INDEX:DJI", logoUrl: "https://logo.clearbit.com/spglobal.com", fallbackColor: "#003B71", displayDecimals: 2, description: "30 plus grandes capitalisations industrielles US" },
  { slug: "russell-2000", name: "Russell 2000", symbol: "RUT", type: "index", finnhubSymbol: "INDEX:RUT", logoUrl: "https://logo.clearbit.com/ftserussell.com", fallbackColor: "#003B71", displayDecimals: 2, description: "2000 plus petites capitalisations US" },
];

export const ASSET_REGISTRY: Record<string, AssetMeta> = Object.fromEntries(
  [...crypto, ...forex, ...commodities, ...indices].map((a) => [a.slug, a])
);

export function getAsset(slug: string): AssetMeta | undefined {
  return ASSET_REGISTRY[slug.toLowerCase()];
}

export function getAllSlugs(): string[] {
  return Object.keys(ASSET_REGISTRY);
}
