"use client";

import { useEffect, useState } from "react";
import MetricCard from "@/components/ui/MetricCard";

const METRICS = [
  "active-addresses-btc", "active-addresses-eth",
  "exchange-inflow-btc", "exchange-outflow-btc",
  "nvt-btc", "hashrate-btc",
  "total-value-locked", "stablecoin-supply",
];

export default function OnchainPage() {
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(METRICS.map(m => fetch(`/api/market/onchain/${m}`).then(r => r.json()).catch(() => null)))
      .then(results => {
        const m: Record<string, any> = {};
        results.forEach((r) => { if (r) m[r.metric] = r; });
        setMetrics(m);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-[#e3e2e0] mb-1">On-chain</h1>
      <p className="text-zinc-400 text-sm mb-6">Métriques on-chain & DeFi</p>

      {loading ? <p className="text-zinc-500">Chargement...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS.map(m => {
            const data = metrics[m];
            if (!data) return null;
            return (
              <MetricCard
                key={m}
                label={data.label}
                value={data.value}
                change={data.change24h}
                unit={data.unit}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
