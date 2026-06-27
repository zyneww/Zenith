"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import TradingViewChart, { TimeframeSelector, Timeframe } from "@/components/charts/TradingViewChart";
import AssetHeader from "@/components/markets/AssetHeader";
import OrderBookPanel from "@/components/markets/OrderBookPanel";
import RecentTradesPanel from "@/components/markets/RecentTradesPanel";
import MetricsPanel from "@/components/markets/MetricsPanel";
import { useRealtimePrice } from "@/lib/hooks/useRealtimePrice";
import { useSocket } from "@/lib/realtime/SocketContext";
import type { AssetMeta } from "@/lib/assets/registry";

type PricePayload = {
  asset?: { id: string; symbol: string; name: string; type: string; image: string | null; finnhubSymbol: string | null };
  price?: { current: number; change24h: number; change1h: number; change7d: number; high24h: number; low24h: number; marketCap: number; volume24h: number };
  lastUpdated?: string;
} | null;

type OhlcvPoint = { t: number; o: number; h: number; l: number; c: number; v?: number };

type OhlcvPayload = {
  slug: string;
  type: string;
  range: string;
  points: OhlcvPoint[];
} | null;

interface Props {
  asset: AssetMeta;
  priceData: PricePayload;
  ohlcv: OhlcvPayload;
  locale?: string;
}

const FAV_KEY = "zenith:favorites";

function formatPrice(val: number | undefined, decimals: number): string {
  if (val === undefined || val === null || Number.isNaN(val)) return "—";
  return val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function getAssetMetrics(asset: AssetMeta, price: NonNullable<NonNullable<Props["priceData"]>["price"]>) {
  switch (asset.type) {
    case "crypto":
      return [
        { label: "Market Cap", value: price.marketCap ? `$${(price.marketCap / 1e9).toFixed(2)}B` : "—" },
        { label: "Volume 24h", value: price.volume24h ? `$${(price.volume24h / 1e9).toFixed(2)}B` : "—" },
        { label: "High 24h", value: `$${formatPrice(price.high24h, asset.displayDecimals)}` },
        { label: "Low 24h", value: `$${formatPrice(price.low24h, asset.displayDecimals)}` },
        { label: "Change 1h", value: `${price.change1h >= 0 ? "+" : ""}${price.change1h?.toFixed(2) ?? "—"}%` },
        { label: "Change 7d", value: `${price.change7d >= 0 ? "+" : ""}${price.change7d?.toFixed(2) ?? "—"}%` },
        { label: "Type", value: "Crypto" },
        { label: "Symbole", value: asset.symbol },
      ];
    case "forex":
      return [
        { label: "Volume 24h", value: price.volume24h ? `$${(price.volume24h / 1e6).toFixed(2)}M` : "—" },
        { label: "High 24h", value: `$${formatPrice(price.high24h, asset.displayDecimals)}` },
        { label: "Low 24h", value: `$${formatPrice(price.low24h, asset.displayDecimals)}` },
        { label: "Change 24h", value: `${price.change24h >= 0 ? "+" : ""}${price.change24h?.toFixed(2) ?? "—"}%` },
        { label: "Paire", value: asset.symbol },
        { label: "Type", value: "Forex" },
      ];
    case "commodity":
      return [
        { label: "High 24h", value: `$${formatPrice(price.high24h, asset.displayDecimals)}` },
        { label: "Low 24h", value: `$${formatPrice(price.low24h, asset.displayDecimals)}` },
        { label: "Change 24h", value: `${price.change24h >= 0 ? "+" : ""}${price.change24h?.toFixed(2) ?? "—"}%` },
        { label: "Volume 24h", value: price.volume24h ? `$${(price.volume24h / 1e6).toFixed(2)}M` : "—" },
        { label: "Symbole", value: asset.symbol },
        { label: "Type", value: "Matière première" },
      ];
    case "index":
      return [
        { label: "Change 24h", value: `${price.change24h >= 0 ? "+" : ""}${price.change24h?.toFixed(2) ?? "—"}%` },
        { label: "High 24h", value: `$${formatPrice(price.high24h, asset.displayDecimals)}` },
        { label: "Low 24h", value: `$${formatPrice(price.low24h, asset.displayDecimals)}` },
        { label: "Volume", value: price.volume24h ? `$${(price.volume24h / 1e9).toFixed(2)}B` : "—" },
        { label: "Symbole", value: asset.symbol },
        { label: "Type", value: "Indice" },
      ];
    default:
      return [
        { label: "Change 24h", value: `${price.change24h >= 0 ? "+" : ""}${price.change24h?.toFixed(2) ?? "—"}%` },
        { label: "High 24h", value: `$${formatPrice(price.high24h, asset.displayDecimals)}` },
        { label: "Low 24h", value: `$${formatPrice(price.low24h, asset.displayDecimals)}` },
        { label: "Volume 24h", value: price.volume24h ? `$${(price.volume24h / 1e6).toFixed(2)}M` : "—" },
        { label: "Symbole", value: asset.symbol },
      ];
  }
}

export default function AssetDetailClient({ asset, priceData, ohlcv, locale = "fr-FR" }: Props) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>("1h");
  const [chartData, setChartData] = useState<OhlcvPoint[]>(ohlcv?.points ?? []);
  const { isConnected } = useSocket();

  const wsSymbol = asset.type === "crypto" ? asset.symbol : null;
  const { getPrice } = useRealtimePrice(wsSymbol ? [wsSymbol] : []);
  const livePrice = wsSymbol ? getPrice(wsSymbol) : null;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setIsFavorite((JSON.parse(raw) as string[]).includes(asset.slug));
    } catch {}
  }, [asset.slug]);

  const toggleFavorite = () => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      const next = list.includes(asset.slug) ? list.filter((s) => s !== asset.slug) : [...list, asset.slug];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      setIsFavorite(next.includes(asset.slug));
    } catch {}
  };

  const price = priceData?.price;
  const isServiceDown = !priceData || !price;

  const displayPrice = livePrice?.price ?? price?.current ?? 0;
  const displayChange24h = price?.change24h ?? 0;
  const displayChange1h = price?.change1h ?? 0;
  const displayChange7d = price?.change7d ?? 0;

  const metricPrice = price || { current: 0, change24h: 0, change1h: 0, change7d: 0, high24h: 0, low24h: 0, marketCap: 0, volume24h: 0 };
  const metrics = price ? getAssetMetrics(asset, price) : [];

  const chartOhlcv = chartData.map((p) => ({ time: p.t, open: p.o, high: p.h, low: p.l, close: p.c }));
  const chartVolume = chartData.map((p) => ({
    time: p.t,
    value: p.v ?? 0,
    color: p.c >= p.o ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
  }));

  const handleTimeframeChange = useCallback(async (tf: Timeframe) => {
    setActiveTimeframe(tf);
    try {
      const res = await fetch(`/api/market/ohlcv/${asset.slug}?range=${tf}&type=${asset.type}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.points) setChartData(data.points);
      }
    } catch {}
  }, [asset.slug, asset.type]);

  const chartHeight = asset.type === "crypto" ? 400 : 420;
  const chartType = asset.type === "forex" ? "area" : "candlestick";

  const isCrypto = asset.type === "crypto";

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
      <div className="mb-3">
        <Link href="/markets" className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          Marchés
        </Link>
      </div>

      <AssetHeader
        asset={asset}
        price={{
          current: displayPrice,
          change1h: displayChange1h,
          change24h: displayChange24h,
          change7d: displayChange7d,
          high24h: price?.high24h ?? 0,
          low24h: price?.low24h ?? 0,
          marketCap: price?.marketCap ?? 0,
          volume24h: price?.volume24h ?? 0,
        }}
        isServiceDown={isServiceDown}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        isConnected={isConnected}
        locale={locale}
      />

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <BarChart3 className="w-4 h-4 text-accent" />
          Graphique
        </div>
        <TimeframeSelector active={activeTimeframe} onChange={handleTimeframeChange} />
      </div>

      {isCrypto ? (
        <div className="mt-2 grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-7 xl:col-span-8">
            {chartOhlcv.length > 0 ? (
              <TradingViewChart data={chartOhlcv} volumeData={chartVolume} height={chartHeight} chartType={chartType} />
            ) : (
              <div className="bg-card border border-surface rounded-lg flex items-center justify-center text-secondary text-sm" style={{ height: chartHeight }}>
                Données graphique indisponibles
              </div>
            )}
          </div>
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3">
            <OrderBookPanel symbol={wsSymbol || asset.symbol} />
            <RecentTradesPanel symbol={wsSymbol || asset.symbol} decimals={asset.displayDecimals} />
          </div>
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-8 xl:col-span-9">
            {chartOhlcv.length > 0 ? (
              <TradingViewChart data={chartOhlcv} volumeData={chartVolume} height={chartHeight} chartType={chartType} />
            ) : (
              <div className="bg-card border border-surface rounded-lg flex items-center justify-center text-secondary text-sm" style={{ height: chartHeight }}>
                Données graphique indisponibles
              </div>
            )}
          </div>
          <div className="lg:col-span-4 xl:col-span-3">
            <MetricsPanel metrics={metrics} />
          </div>
        </div>
      )}

      <div className="mt-3 bg-card border border-surface rounded-lg p-4">
        <h3 className="text-sm font-bold mb-1 text-primary">À propos de {asset.name}</h3>
        <p className="text-xs text-secondary leading-relaxed">{asset.description}</p>
      </div>
    </div>
  );
}
