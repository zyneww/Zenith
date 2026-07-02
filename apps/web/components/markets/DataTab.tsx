"use client";

import { useEffect, useState } from "react";
import type { AssetMeta } from "@/lib/assets/registry";

interface Fundamentals {
  marketCapRank: number | null; marketCap: number | null; fullyDilutedValuation: number | null;
  totalVolume: number | null; circulatingSupply: number | null; maxSupply: number | null;
  totalSupply: number | null; ath: number | null; athDate: string | null; atl: number | null;
  atlDate: string | null; priceChange7d: number | null; priceChange30d: number | null;
  priceChange1y: number | null; btcDominance: number | null; totalMarketCap: number | null;
  totalVolumeGlobal: number | null;
}

interface DataTabProps { asset: AssetMeta; currentPrice: number; high24h: number; low24h: number; }

function fmtCompact(val: number | null | undefined): string {
  if (val == null) return "—";
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
  return `$${val.toLocaleString("fr-FR")}`;
}
function fmtSupply(val: number | null | undefined): string {
  if (val == null) return "—";
  if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
  return val.toLocaleString("fr-FR");
}
function fmtPrice(val: number | null | undefined, decimals = 2): string {
  if (val == null) return "—";
  return `$${val.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-canvas rounded px-2.5 py-1.5">
      <div className="text-[9px] text-tertiary">{label}</div>
      <div className={`text-[11px] font-semibold tabular-nums ${color || "text-primary"}`}>{value}</div>
    </div>
  );
}

export default function DataTab({ asset, currentPrice, high24h, low24h }: DataTabProps) {
  const [data, setData] = useState<Fundamentals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/market/fundamentals?slug=${asset.slug}&type=${asset.type}`)
      .then((r) => r.json())
      .then((json) => { if (json.ok && !cancelled) setData(json.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [asset.slug, asset.type]);

  if (loading) return <div className="text-[11px] text-tertiary text-center py-6">Chargement...</div>;
  if (!data) return <div className="text-[11px] text-tertiary text-center py-6">Indisponible</div>;

  const items: { label: string; value: string; color?: string }[] = [];

  if (asset.type === "crypto") {
    if (data.marketCapRank != null) items.push({ label: "Rang", value: `#${data.marketCapRank}` });
    if (data.marketCap != null) items.push({ label: "Capitalisation", value: fmtCompact(data.marketCap) });
    if (data.totalVolume != null) items.push({ label: "Volume 24h", value: fmtCompact(data.totalVolume) });
    if (data.circulatingSupply != null) items.push({ label: "Offre circ.", value: fmtSupply(data.circulatingSupply) });
    if (data.totalSupply != null) items.push({ label: "Offre totale", value: fmtSupply(data.totalSupply) });
    if (data.maxSupply != null) items.push({ label: "Offre max", value: fmtSupply(data.maxSupply) });
    if (data.priceChange7d != null) {
      const c = data.priceChange7d >= 0 ? "var(--text-up)" : "var(--text-down)";
      items.push({ label: "7 jours", value: `${data.priceChange7d >= 0 ? "+" : ""}${data.priceChange7d.toFixed(2)}%`, color: c });
    }
    if (data.priceChange30d != null) {
      const c = data.priceChange30d >= 0 ? "var(--text-up)" : "var(--text-down)";
      items.push({ label: "30 jours", value: `${data.priceChange30d >= 0 ? "+" : ""}${data.priceChange30d.toFixed(2)}%`, color: c });
    }
    if (data.ath != null) items.push({ label: "ATH", value: `${fmtPrice(data.ath, asset.displayDecimals)}` });
    if (data.atl != null) items.push({ label: "ATL", value: `${fmtPrice(data.atl, asset.displayDecimals)}` });
  } else {
    items.push({ label: "High 24h", value: fmtPrice(high24h, asset.displayDecimals) });
    items.push({ label: "Low 24h", value: fmtPrice(low24h, asset.displayDecimals) });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
      {items.map((item) => (
        <StatCell key={item.label} {...item} />
      ))}
    </div>
  );
}
