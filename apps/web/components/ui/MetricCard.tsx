"use client";

import Sparkline from "./Sparkline";

interface Props {
  label: string;
  value: string | number;
  change?: number;
  unit?: string;
  sparkline?: { value: number }[];
  icon?: string;
}

export default function MetricCard({ label, value, change, unit, sparkline, icon }: Props) {
  const changeColor = change != null ? (change >= 0 ? "#4dab9a" : "#ff7369") : undefined;
  return (
    <div className="rounded-xl bg-[#252525] p-4 border border-[#333]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-zinc-400 uppercase tracking-wider">{label}</span>
        {icon && <span>{icon}</span>}
      </div>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-2xl font-semibold text-[#e3e2e0]">
          {typeof value === "number" ? (value >= 1e12 ? `$${(value / 1e12).toFixed(2)}T` : value >= 1e9 ? `$${(value / 1e9).toFixed(1)}B` : value.toLocaleString()) : value}
        </span>
        {unit && <span className="text-[11px] text-zinc-500 mb-1">{unit}</span>}
      </div>
      {change != null && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[13px] font-medium" style={{ color: changeColor }}>
            {change > 0 ? "+" : ""}{change.toFixed(1)}%
          </span>
        </div>
      )}
      {sparkline && <div className="mt-2"><Sparkline data={sparkline} width={160} height={30} /></div>}
    </div>
  );
}
