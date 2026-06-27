const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY || "";

export interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  assetPlatform: string;
}

export async function fetchNFTList(): Promise<NFTCollection[]> {
  try {
    const url = `${COINGECKO_BASE}/nfts/list${API_KEY ? `?x_cg_demo_api_key=${API_KEY}` : ""}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`CoinGecko /nfts ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, 50) : [];
  } catch {
    return [];
  }
}
