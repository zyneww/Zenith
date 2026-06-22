"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, TrendingUp, TrendingDown, Activity, BarChart3, AlertCircle } from "lucide-react";
import TradingViewChart from "@/components/charts/TradingViewChart";
import type { AssetMeta, AssetType } from "@/lib/assets/registry";

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
}

const FAV_KEY = "zenith:favorites";

function formatNumber(value: number | undefined, decimals: number, prefix = "$") {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  if (value >= 1e12) return `${prefix}${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${prefix}${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${prefix}${(value / 1e6).toFixed(2)}M`;
  return `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function formatPrice(value: number | undefined, decimals: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatChange(value: number | undefined): { text: string; isUp: boolean; display: string } {
  if (value === undefined || value === null || Number.isNaN(value)) return { text: "—", isUp: true, display: "—" };
  const isUp = value >= 0;
  return { text: `${isUp ? "+" : ""}${value.toFixed(2)}%`, isUp, display: `${isUp ? "+" : ""}${value.toFixed(2)}%` };
}

const TYPE_LABELS: Record<AssetType, string> = {
  crypto: "Crypto",
  forex: "Forex",
  commodity: "Matière première",
  index: "Indice",
};

function buildMockOrderBook(price: number, decimals: number) {
  const step = Math.max(price * 0.0005, 1 / Math.pow(10, decimals));
  const bids = Array.from({ length: 6 }).map((_, i) => ({
    price: price - step * (i + 1),
    size: +(Math.random() * 2 + 0.05).toFixed(4),
  }));
  const asks = Array.from({ length: 6 }).map((_, i) => ({
    price: price + step * (i + 1),
    size: +(Math.random() * 2 + 0.05).toFixed(4),
  }));
  return { bids, asks };
}

function buildMockTrades(price: number, decimals: number) {
  return Array.from({ length: 8 }).map((_, i) => {
    const side = Math.random() > 0.5 ? "buy" : "sell";
    const drift = (Math.random() - 0.5) * price * 0.0005;
    return {
      side,
      price: +(price + drift).toFixed(decimals),
      size: +(Math.random() * 1.5 + 0.001).toFixed(4),
      time: new Date(Date.now() - i * 12_000),
    };
  });
}

export default function AssetDetailClient({ asset, priceData, ohlcv }: Props) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) {
        const list = JSON.parse(raw) as string[];
        setIsFavorite(list.includes(asset.slug));
      }
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

  const chartData =
    ohlcv?.points?.map((p) => ({
      time: p.t,
      open: p.o,
      high: p.h,
      low: p.l,
      close: p.c,
    })) ?? [];

  const volumeData =
    ohlcv?.points?.map((p) => ({
      time: p.t,
      value: p.v ?? 0,
      color: p.c >= p.o ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)",
    })) ?? [];

  const change1h = formatChange(price?.change1h);
  const change24h = formatChange(price?.change24h);
  const change7d = formatChange(price?.change7d);

  const orderBook = !isServiceDown ? buildMockOrderBook(price!.current, asset.displayDecimals) : null;
  const trades = !isServiceDown ? buildMockTrades(price!.current, asset.displayDecimals) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
      <div className="mb-4">
        <Link href="/markets" className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition">
          <ArrowLeft className="w-4 h-4" />
          Marchés
        </Link>
      </div>

      <div className="bg-card border border-surface rounded-lg p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden"
              style={{ backgroundColor: asset.fallbackColor }}
            >
              {asset.logoUrl ? (
                <Image
                  src={asset.logoUrl}
                  alt={asset.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-white">{asset.symbol.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-primary truncate">{asset.name}</h1>
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-raised text-secondary font-medium">
                  {TYPE_LABELS[asset.type]}
                </span>
              </div>
              <p className="text-sm text-secondary mt-0.5">{asset.symbol}</p>
            </div>
          </div>
          <button
            onClick={toggleFavorite}
            className="self-start md:self-center text-secondary hover:text-warning transition"
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Star className={`w-5 h-5 ${isFavorite ? "fill-warning text-warning" : ""}`} />
          </button>
        </div>

        {isServiceDown ? (
          <div className="mt-5 flex items-start gap-3 bg-raised border border-surface rounded-md p-4">
            <AlertCircle className="w-5 h-5 text-down shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">Service indisponible</p>
              <p className="text-xs text-secondary mt-1">
                Impossible de récupérer les données de marché pour {asset.name}. Réessayez dans quelques instants.
              </p>
              <button
                onClick={() => router.refresh()}
                className="mt-2 text-xs px-3 py-1.5 rounded-md bg-accent text-on-inverse hover:opacity-90 transition"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                ${formatPrice(price!.current, asset.displayDecimals)}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <ChangePill label="1h" change={change1h} />
                <ChangePill label="24h" change={change24h} />
                <ChangePill label="7j" change={change7d} />
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Metric label="Plus haut 24h" value={`$${formatPrice(price!.high24h, asset.displayDecimals)}`} />
              <Metric label="Plus bas 24h" value={`$${formatPrice(price!.low24h, asset.displayDecimals)}`} />
              <Metric label="Cap. boursière" value={formatNumber(price!.marketCap, 2)} />
              <Metric label="Volume 24h" value={formatNumber(price!.volume24h, 2)} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card border border-surface rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold flex items-center gap-2 text-primary">
                <BarChart3 className="w-4 h-4 text-accent" />
                Graphique
              </h2>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {["1m", "5m", "15m", "1h", "4h", "1d", "1w"].map((tf) => (
                  <span
                    key={tf}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      tf === "1h" ? "bg-accent-subtle text-accent border border-accent" : "border border-surface text-secondary"
                    }`}
                  >
                    {tf}
                  </span>
                ))}
              </div>
            </div>
            {chartData.length > 0 ? (
              <TradingViewChart data={chartData} volumeData={volumeData} height={460} />
            ) : (
              <div className="h-[460px] flex items-center justify-center text-secondary text-sm">
                Données graphique indisponibles
              </div>
            )}
          </div>

          {orderBook && (
            <div className="bg-card border border-surface rounded-lg p-4">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-primary">
                <Activity className="w-4 h-4 text-accent" />
                Carnet d'ordres
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <OrderBookColumn title="BIDS" side="bid" rows={orderBook.bids} decimals={asset.displayDecimals} />
                <OrderBookColumn title="ASKS" side="ask" rows={orderBook.asks} decimals={asset.displayDecimals} />
              </div>
            </div>
          )}

          <div className="bg-card border border-surface rounded-lg p-4">
            <h3 className="text-sm font-bold mb-2 text-primary">À propos de {asset.name}</h3>
            <p className="text-sm text-secondary leading-relaxed">{asset.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          {trades && (
            <div className="bg-card border border-surface rounded-lg p-4">
              <h3 className="text-sm font-bold mb-3 text-primary">Transactions récentes</h3>
              <div className="space-y-1.5 text-xs font-mono">
                {trades.map((t, i) => (
                  <div key={i} className="flex justify-between">
                    <span className={t.side === "buy" ? "text-up" : "text-down"}>
                      ${t.price.toFixed(asset.displayDecimals)}
                    </span>
                    <span className="text-secondary">{t.size.toFixed(4)}</span>
                    <span className="text-secondary">{t.time.toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-surface rounded-lg p-4">
            <h3 className="text-sm font-bold mb-3 text-primary">Détails</h3>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-secondary">Symbole</dt>
                <dd className="text-primary font-medium">{asset.symbol}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-secondary">Type</dt>
                <dd className="text-primary font-medium">{TYPE_LABELS[asset.type]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-secondary">Finnhub</dt>
                <dd className="text-primary font-mono">{asset.finnhubSymbol}</dd>
              </div>
              {asset.coingeckoId && (
                <div className="flex justify-between">
                  <dt className="text-secondary">CoinGecko</dt>
                  <dd className="text-primary font-mono">{asset.coingeckoId}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangePill({ label, change }: { label: string; change: { text: string; isUp: boolean; display: string } }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-secondary uppercase tracking-wide">{label}</span>
      <span className={`flex items-center gap-0.5 font-medium ${change.isUp ? "text-up" : "text-down"}`}>
        {change.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change.display}
      </span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-secondary">{label}</div>
      <div className="font-medium text-primary mt-0.5">{value}</div>
    </div>
  );
}

function OrderBookColumn({
  title,
  side,
  rows,
  decimals,
}: {
  title: string;
  side: "bid" | "ask";
  rows: { price: number; size: number }[];
  decimals: number;
}) {
  const colorClass = side === "bid" ? "text-up" : "text-down";
  return (
    <div>
      <h4 className={`text-xs font-bold mb-2 ${colorClass}`}>{title}</h4>
      <div className="space-y-1 text-xs font-mono">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between">
            <span className={colorClass}>${r.price.toFixed(decimals)}</span>
            <span className="text-secondary">{r.size.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
