"use client";

import { Card, CardTitle } from "@/components/ui/Card";

interface AdvancedStatsProps {
  marketCap?: number;
  circulatingSupply?: number;
  maxSupply?: number;
  ath?: number;
  atl?: number;
  decimals?: number;
}

function fmtCompact(val: number | undefined | null): string {
  if (val == null) return "—";
  if (val >= 1e12) return `$${(val / 1e12).toFixed(3)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(3)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(3)}M`;
  return `$${val.toLocaleString("fr-FR")}`;
}

function fmtSupply(val: number | undefined | null): string {
  if (val == null) return "—";
  if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
  return val.toLocaleString("fr-FR");
}

export default function AdvancedStatsPanel({
  marketCap, circulatingSupply, maxSupply, ath, atl, decimals = 2,
}: AdvancedStatsProps) {
  const stats: { label: string; value: string }[] = [
    { label: "Capitalisation", value: fmtCompact(marketCap) },
    { label: "Offre en circulation", value: fmtSupply(circulatingSupply) },
    { label: "Offre maximale", value: maxSupply ? fmtSupply(maxSupply) : "∞" },
    { label: "ATH", value: ath ? `$${ath.toLocaleString("fr-FR", { maximumFractionDigits: decimals })}` : "—" },
    { label: "ATL", value: atl ? `$${atl.toLocaleString("fr-FR", { maximumFractionDigits: decimals })}` : "—" },
  ];

  return (
    <Card padding="sm">
      <CardTitle>Statistiques avancées</CardTitle>
      <div className="grid grid-cols-2 gap-1.5">
        {stats.map((s, i) => (
          <div key={i} className="bg-raised rounded p-1.5">
            <p className="text-[10px] text-secondary">{s.label}</p>
            <p className="text-xs text-primary font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
