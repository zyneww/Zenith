import { NextRequest, NextResponse } from "next/server";
import { getAsset } from "@/lib/assets/registry";



export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "bitcoin";
  const type = req.nextUrl.searchParams.get("type") || "crypto";

  try {
    const asset = getAsset(slug);
    if (!asset) throw new Error("unknown_asset");

    let payload: Record<string, any> = {};

    if (type === "crypto" && asset.coingeckoId) {
      const [coinRes, globalRes] = await Promise.allSettled([
        fetch(`https://api.coingecko.com/api/v3/coins/${asset.coingeckoId}?localization=false&tickers=false&community_data=false&developer_data=false`, {
          headers: {
            Accept: "application/json",
            ...(process.env.COINGECKO_API_KEY ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY } : {}),
          },
          signal: AbortSignal.timeout(8000),
          next: { revalidate: 60 },
        }),
        fetch("https://api.coingecko.com/api/v3/global", {
          headers: {
            ...(process.env.COINGECKO_API_KEY ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY } : {}),
          },
          signal: AbortSignal.timeout(5000),
          next: { revalidate: 60 },
        }),
      ]);

      let md: any = {};
      let global: any = null;

      if (coinRes.status === "fulfilled" && coinRes.value.ok) {
        const coin = await coinRes.value.json();
        md = coin.market_data || {};
        payload = {
          marketCapRank: coin.market_cap_rank ?? md.market_cap_rank ?? null,
          marketCap: md.market_cap?.usd ?? null,
          fullyDilutedValuation: md.fully_diluted_valuation?.usd ?? null,
          totalVolume: md.total_volume?.usd ?? null,
          circulatingSupply: md.circulating_supply ?? null,
          maxSupply: md.max_supply ?? null,
          totalSupply: md.total_supply ?? null,
          ath: md.ath?.usd ?? null,
          athDate: md.ath_date?.usd ?? null,
          atl: md.atl?.usd ?? null,
          atlDate: md.atl_date?.usd ?? null,
          priceChange7d: md.price_change_percentage_7d ?? null,
          priceChange30d: md.price_change_percentage_30d ?? null,
          priceChange1y: md.price_change_percentage_1y ?? null,
        };
      }

      if (globalRes.status === "fulfilled" && globalRes.value.ok) {
        const g = await globalRes.value.json();
        global = g.data;
        const btcDominance = global?.market_cap_percentage?.btc ?? null;
        payload.btcDominance = btcDominance;
        payload.totalMarketCap = global?.total_market_cap?.usd ?? null;
        payload.totalVolumeGlobal = global?.total_volume?.usd ?? null;
      }
    }

    return NextResponse.json({ ok: true, data: payload });
  } catch {
    return NextResponse.json({ ok: false, data: null, error: "upstream_unavailable" }, { status: 503 });
  }
}
