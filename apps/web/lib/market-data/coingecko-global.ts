const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY || "";

export interface GlobalData {
  activeCryptocurrencies: number;
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  marketCapChange24h: number;
}

export async function fetchGlobalData(): Promise<GlobalData> {
  const url = `${COINGECKO_BASE}/global${API_KEY ? `?x_cg_demo_api_key=${API_KEY}` : ""}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`CoinGecko /global ${res.status}`);
  const json = await res.json();
  return {
    activeCryptocurrencies: json.data.active_cryptocurrencies,
    totalMarketCap: json.data.total_market_cap.usd,
    totalVolume: json.data.total_volume.usd,
    btcDominance: json.data.market_cap_percentage.btc,
    marketCapChange24h: json.data.market_cap_change_percentage_24h_usd,
  };
}
