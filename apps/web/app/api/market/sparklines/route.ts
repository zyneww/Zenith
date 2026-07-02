import { NextRequest, NextResponse } from "next/server";
import { questdb } from "@/lib/db/questdb";
import { fetchStockSparkline } from "@/lib/market-data/twelve-stocks";
import { getAssetsByType, getAllSlugs } from "@/lib/assets/registry";



export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const assets = searchParams.get("assets")?.split(",").filter(Boolean) || [];
  const category = searchParams.get("category") || "crypto";

  if (!assets.length) {
    const slugs = getAllSlugs().filter((s) => {
      const asset = getAssetsByType(category as any).find((a) => a.slug === s);
      return !!asset;
    });
    return NextResponse.json({ slugs: slugs.slice(0, 50) });
  }

  const result: Record<string, number[]> = {};

  const cryptoAssets = assets.filter((s) => {
    const asset = getAssetsByType("crypto").find((a) => a.slug === s);
    return !!asset;
  });

  if (cryptoAssets.length > 0) {
    try {
      const symbols = cryptoAssets.map((s) => {
        const asset = getAssetsByType("crypto").find((a) => a.slug === s);
        return asset?.symbol.toUpperCase() || s.toUpperCase();
      });
      const placeholders = symbols.map((_, i) => `$${i + 1}`).join(", ");
      const query = `
        WITH ranked AS (
          SELECT symbol, close, timestamp,
            ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY timestamp DESC) AS rn
          FROM ohlcv
          WHERE symbol IN (${placeholders})
            AND interval = '1h'
            AND timestamp >= NOW() - INTERVAL '24 hours'
        )
        SELECT symbol, close, EXTRACT(epoch FROM timestamp)::bigint * 1000 as t
        FROM ranked
        WHERE rn <= 24
        ORDER BY symbol, timestamp ASC
      `;
      const pgResult = await questdb.query(query, symbols);
      if (pgResult.rows.length > 0) {
        for (const row of pgResult.rows) {
          const slug = cryptoAssets[symbols.indexOf(row.symbol.toUpperCase())];
          if (slug) {
            if (!result[slug]) result[slug] = [];
            result[slug].push(parseFloat(row.close));
          }
        }
      }
    } catch {
      // QuestDB unavailable, skip crypto sparklines
    }
  }

  const stockAssets = assets.filter((s) => {
    const asset = getAssetsByType("stock").find((a) => a.slug === s) || getAssetsByType("etf").find((a) => a.slug === s);
    return !!asset;
  });

  for (const slug of stockAssets) {
    const asset = getAssetsByType("stock").find((a) => a.slug === slug) || getAssetsByType("etf").find((a) => a.slug === slug);
    if (!asset) continue;
    try {
      const sparkline = await fetchStockSparkline(asset.finnhubSymbol);
      result[slug] = sparkline.map((p) => p.value).slice(-24);
    } catch {
      result[slug] = [];
    }
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
