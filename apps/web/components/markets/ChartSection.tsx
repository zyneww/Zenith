"use client";

import { useState } from "react";
import { LineChart, BarChart3, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import CoinGeckoChart from "@/components/charts/CoinGeckoChart";
import TradingViewWidget from "./TradingViewWidget";
import DepthChart from "./DepthChart";
import type { DepthData } from "@/lib/realtime/SocketContext";
import { tokens } from "@/lib/theme/bybit";

type ViewMode = "standard" | "tradingview" | "depth";

const TV_PREFIX: Record<string, string> = {
  crypto: "BINANCE:", forex: "FX:", index: "TVC:", commodity: "TVC:", futures: "TVC:",
};

import { getAsset } from "@/lib/assets/registry";

function toTradingViewSymbol(symbol: string, assetType: string, assetSlug?: string): string {
  // Use explicit tradingviewSymbol from registry if available
  if (assetSlug) {
    const asset = getAsset(assetSlug);
    if (asset && (asset as any).tradingviewSymbol) return (asset as any).tradingviewSymbol;
  }
  const prefix = TV_PREFIX[assetType] || "NASDAQ:";
  if (assetType === "crypto") return `${prefix}${symbol}USDT`;
  if (assetType === "forex") return `${prefix}${symbol}`;
  if (assetType === "commodity") return `TVC:${symbol}`;
  if (assetType === "index") return `TVC:${symbol}`;
  if (assetType === "futures") return `TVC:${symbol}`;
  if (assetType === "etf" || assetType === "stock") return `NASDAQ:${symbol}`;
  return `${prefix}${symbol}`;
}

interface ChartSectionProps {
  symbol: string;
  assetSlug: string;
  assetType: string;
  depth: DepthData | null | undefined;
  currentPrice?: number;
  rightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
}

export default function ChartSection({
  symbol, assetSlug, assetType, depth, currentPrice, rightPanelOpen, onToggleRightPanel,
}: ChartSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("standard");
  const tvSymbol = toTradingViewSymbol(symbol, assetType, assetSlug);

  const primaryBtnClass = (active: boolean) =>
    `px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 ${
      active ? "text-black" : "text-secondary hover:text-primary"
    }`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="rounded-sm overflow-hidden" style={{ backgroundColor: tokens.color.bg.dark, border: `1px solid ${tokens.color.border.default}` }}>
        <div className="px-3 py-2 flex items-center justify-between shrink-0" style={{ backgroundColor: tokens.color.bg.panel, borderBottom: `1px solid ${tokens.color.border.default}` }}>
          <div className="flex items-center gap-2">
            <LineChart className="w-3.5 h-3.5" style={{ color: tokens.color.accent.primary }} />
            <span className="font-semibold text-xs uppercase tracking-wider" style={{ color: tokens.color.text.secondary }}>Graphique</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center rounded p-0.5" style={{ backgroundColor: tokens.color.bg.dark, border: `1px solid ${tokens.color.border.default}` }}>
              <button
                onClick={() => setViewMode("standard")}
                className={primaryBtnClass(viewMode === "standard")}
                style={{ backgroundColor: viewMode === "standard" ? tokens.color.accent.primary : "transparent" }}
              >
                <LineChart className="w-3 h-3" />
                Standard
              </button>
              <button
                onClick={() => setViewMode("tradingview")}
                className={primaryBtnClass(viewMode === "tradingview")}
                style={{ backgroundColor: viewMode === "tradingview" ? tokens.color.accent.primary : "transparent" }}
              >
                <BarChart3 className="w-3 h-3" />
                TradingView
              </button>
              <button
                onClick={() => setViewMode("depth")}
                className={primaryBtnClass(viewMode === "depth")}
                style={{ backgroundColor: viewMode === "depth" ? tokens.color.accent.primary : "transparent" }}
              >
                <Activity className="w-3 h-3" />
                Profondeur
              </button>
            </div>
            {onToggleRightPanel && (
              <button
                onClick={onToggleRightPanel}
                className="p-1.5 rounded transition ml-1"
                style={{ color: tokens.color.text.muted }}
                title={rightPanelOpen ? "Réduire le panneau" : "Afficher le panneau"}
              >
                {rightPanelOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {viewMode === "standard" && (
          <CoinGeckoChart assetSlug={assetSlug} assetType={assetType} currentPrice={currentPrice} />
        )}
        {viewMode === "tradingview" && (
          <div style={{ height: 640 }}>
            <TradingViewWidget symbol={tvSymbol} interval="60" height={640} />
          </div>
        )}
        {viewMode === "depth" && (
          <div className="p-4" style={{ height: 640 }}>
            <h4 className="text-xs font-semibold mb-2" style={{ color: tokens.color.text.primary }}>Profondeur de marché</h4>
            <DepthChart depth={depth ?? null} currentPrice={currentPrice} />
          </div>
        )}
      </div>
    </div>
  );
}
