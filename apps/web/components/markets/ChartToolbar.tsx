"use client";

import { TIMEFRAMES, Timeframe } from "@/components/charts/TradingViewChart";

export type ViewMode = "standard" | "tradingview" | "depth";

interface ChartToolbarProps {
  activeTimeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  showMA: boolean;
  onToggleMA: () => void;
  showVolume: boolean;
  onToggleVolume: () => void;
}

export default function ChartToolbar({
  activeTimeframe, onTimeframeChange,
  showMA, onToggleMA, showVolume, onToggleVolume,
}: ChartToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1 flex-wrap">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              tf === activeTimeframe ? "bg-accent text-white" : "text-secondary hover:text-primary"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="hidden sm:flex items-center gap-2 ml-auto">
        <label className="flex items-center gap-1 text-[11px] text-secondary cursor-pointer">
          <input type="checkbox" checked={showVolume} onChange={onToggleVolume} className="accent-accent w-3 h-3" />
          Volume
        </label>
        <label className="flex items-center gap-1 text-[11px] text-secondary cursor-pointer">
          <input type="checkbox" checked={showMA} onChange={onToggleMA} className="accent-accent w-3 h-3" />
          MA
        </label>
      </div>
    </div>
  );
}
