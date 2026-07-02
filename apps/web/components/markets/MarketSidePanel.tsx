"use client";

import OrderBookPanel from "./OrderBookPanel";
import RecentTradesPanel from "./RecentTradesPanel";
import MetricsPanel from "./MetricsPanel";
import { tokens } from "@/lib/theme/bybit";
import { useFormatPrice, useCurrency, CURRENCY_SYMBOLS } from "@/lib/context/CurrencyContext";
import type { AssetMeta } from "@/lib/assets/registry";
import type { DepthData, TradeData } from "@/lib/realtime/SocketContext";

interface MarketSidePanelProps {
  asset: AssetMeta;
  price: {
    change1h: number; change24h: number; change7d: number;
    marketCap: number; volume24h: number; high24h: number; low24h: number;
  };
  supportsOrderBook?: boolean;
  supportsTrades?: boolean;
  depthOverride?: DepthData | null;
  tradesOverride?: TradeData[];
  open?: boolean;
  onToggle?: () => void;
}

export default function MarketSidePanel({
  asset, price, supportsOrderBook, supportsTrades,
  depthOverride, tradesOverride, open, onToggle,
}: MarketSidePanelProps) {
  const isCrypto = asset.type === "crypto";
  const formatPrice = useFormatPrice();
  const { convertFromUsd, formatNumber, currency } = useCurrency();

  if (!isCrypto) {
    const fmtVol = (n: number) => {
      const converted = convertFromUsd(n);
      const compact = formatNumber(converted, { notation: "compact", compactDisplay: "short", maximumFractionDigits: 2 });
      return `${CURRENCY_SYMBOLS[currency]}${compact}`;
    };
    const metrics = [
      { label: "High 24h", value: formatPrice(price.high24h) },
      { label: "Low 24h", value: formatPrice(price.low24h) },
      { label: "Change 24h", value: `${price.change24h >= 0 ? "+" : ""}${price.change24h?.toFixed(2) ?? "—"}%` },
      { label: "Volume 24h", value: price.volume24h ? fmtVol(price.volume24h) : "—" },
      { label: "Change 1h", value: `${price.change1h >= 0 ? "+" : ""}${price.change1h?.toFixed(2) ?? "—"}%` },
      { label: "Change 7d", value: `${price.change7d >= 0 ? "+" : ""}${price.change7d?.toFixed(2) ?? "—"}%` },
    ];
    return <MetricsPanel metrics={metrics} />;
  }

    return (
    <div className="space-y-2">
      <div className="rounded-sm overflow-hidden" style={{ backgroundColor: tokens.color.bg.card, border: `1px solid ${tokens.color.border.default}` }}>
        <OrderBookPanel symbol={asset.symbol} decimals={asset.displayDecimals} depthOverride={depthOverride} compact />
      </div>
      <div className="rounded-sm overflow-hidden" style={{ backgroundColor: tokens.color.bg.card, border: `1px solid ${tokens.color.border.default}` }}>
        <RecentTradesPanel symbol={asset.symbol} decimals={asset.displayDecimals} tradesOverride={tradesOverride} compact />
      </div>
    </div>
  );
}
