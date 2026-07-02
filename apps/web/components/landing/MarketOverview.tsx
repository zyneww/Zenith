"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { ArrowRight, TrendingUp, TrendingDown, WifiOff } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useFormatPrice } from "@/lib/context/CurrencyContext";

type AssetType = "index" | "commodity" | "forex" | "crypto";

interface AssetRow {
  slug: string;
  type: AssetType;
  symbol: string;
  name: string;
  logoUrl: string | null;
  fallbackColor: string;
  price: number;
  change24h: number;
  changePercent: string;
  sparklinePath: string;
}

const NON_CRYPTO_ASSETS: {
  slug: string;
  type: "index" | "commodity" | "forex";
  symbol: string;
  name: string;
  logoUrl: string;
  fallbackColor: string;
}[] = [
  { slug: "spx", type: "index", symbol: "SPX", name: "S&P 500", logoUrl: "https://logo.clearbit.com/spglobal.com", fallbackColor: "#003B71" },
  { slug: "ndx", type: "index", symbol: "NDX", name: "Nasdaq 100", logoUrl: "https://logo.clearbit.com/nasdaq.com", fallbackColor: "#00A3DA" },
  { slug: "dax", type: "index", symbol: "DAX", name: "DAX 40", logoUrl: "https://logo.clearbit.com/dax-indices.com", fallbackColor: "#001E63" },
  { slug: "ftse", type: "index", symbol: "FTSE", name: "FTSE 100", logoUrl: "https://logo.clearbit.com/ftserussell.com", fallbackColor: "#3D195B" },
  { slug: "gold", type: "commodity", symbol: "XAU", name: "Gold", logoUrl: "https://logo.clearbit.com/gold.org", fallbackColor: "#D4AF37" },
  { slug: "crude-oil-wti", type: "commodity", symbol: "WTI", name: "Crude Oil", logoUrl: "https://logo.clearbit.com/eia.gov", fallbackColor: "#1A1A1A" },
  { slug: "dxy", type: "index", symbol: "DXY", name: "US Dollar Index", logoUrl: "https://logo.clearbit.com/federalreserve.gov", fallbackColor: "#2C2C6C" },
  { slug: "natural-gas", type: "commodity", symbol: "NG", name: "Natural Gas", logoUrl: "https://logo.clearbit.com/eia.gov", fallbackColor: "#E07B27" },
  { slug: "eurusd", type: "forex", symbol: "EUR/USD", name: "Euro / US Dollar", logoUrl: "https://logo.clearbit.com/ecb.europa.eu", fallbackColor: "#003399" },
  { slug: "gbpusd", type: "forex", symbol: "GBP/USD", name: "British Pound / US Dollar", logoUrl: "https://logo.clearbit.com/bankofengland.co.uk", fallbackColor: "#012169" },
  { slug: "usdjpy", type: "forex", symbol: "USD/JPY", name: "US Dollar / Japanese Yen", logoUrl: "https://logo.clearbit.com/boj.or.jp", fallbackColor: "#BC002D" },
  { slug: "usdcad", type: "forex", symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", logoUrl: "https://logo.clearbit.com/bankofcanada.ca", fallbackColor: "#D52B1E" },
];

const INDICES = NON_CRYPTO_ASSETS.filter((a) => a.type === "index");
const COMMODITIES = NON_CRYPTO_ASSETS.filter((a) => a.type === "commodity");
const FOREX = NON_CRYPTO_ASSETS.filter((a) => a.type === "forex");

const FLAT_SPARK = "M0,15 L100,15";

function buildSparkPath(closes: { t: number; c: number }[]): string {
  if (!closes || closes.length < 2) return FLAT_SPARK;
  const values = closes.map((p) => p.c);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = 100 / (closes.length - 1);
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * stepX).toFixed(2)},${(30 - ((v - min) / range) * 28 - 1).toFixed(2)}`)
    .join(" ");
}

function formatChange(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

interface MarketResponse {
  asset: { id: string; symbol: string; name: string; type: AssetType; image: string | null };
  price: { current: number; change24h: number };
  ohlcv1h?: { t: number; c: number }[];
}

interface CryptoTop {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: { price: number[] };
}

async function fetchNonCrypto(asset: typeof NON_CRYPTO_ASSETS[number]): Promise<AssetRow | null> {
  try {
    const res = await fetch(`/api/market/asset/${asset.slug}?type=${asset.type}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data: MarketResponse = await res.json();
    return {
      slug: asset.slug,
      type: asset.type,
      symbol: asset.symbol,
      name: data.asset?.name ?? asset.name,
      logoUrl: asset.logoUrl,
      fallbackColor: asset.fallbackColor,
      price: data.price.current,
      change24h: data.price.change24h,
      changePercent: formatChange(data.price.change24h),
      sparklinePath: buildSparkPath((data.ohlcv1h ?? []).map((p) => ({ t: p.t, c: p.c }))),
    };
  } catch {
    return null;
  }
}

async function fetchCryptoTop(limit = 4): Promise<AssetRow[]> {
  try {
    const res = await fetch(`/api/market/top-cryptos?limit=${limit}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data: CryptoTop[] = await res.json();
    return data.slice(0, limit).map((c) => ({
      slug: c.id,
      type: "crypto" as const,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      logoUrl: c.image,
      fallbackColor: "#1f2937",
      price: c.current_price,
      change24h: c.price_change_percentage_24h ?? 0,
      changePercent: formatChange(c.price_change_percentage_24h ?? 0),
      sparklinePath: buildSparkPath(((c.sparkline_in_7d?.price ?? []).slice(-24).map((p, i) => ({ t: i, c: p })))),
    }));
  } catch {
    return [];
  }
}

function Row({ asset }: { asset: AssetRow }) {
  const positive = asset.change24h >= 0;
  const formatPrice = useFormatPrice();
  return (
    <Link
      href={`/markets/${asset.slug}`}
      className="flex items-center justify-between py-2 border-b border-surface/50 last:border-0 hover:bg-raised transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-raised">
          {asset.logoUrl ? (
            <img src={asset.logoUrl} alt={asset.symbol} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-xs font-semibold"
              style={{ backgroundColor: asset.fallbackColor, color: "#fff" }}
            >
              {asset.symbol.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-secondary w-10">{asset.symbol}</div>
          <div className="text-sm text-primary truncate">{asset.name}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <svg className="w-14 h-5" viewBox="0 0 100 30" preserveAspectRatio="none">
          <path
            d={asset.sparklinePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={positive ? "text-up" : "text-down"}
          />
        </svg>
        <div className="text-right w-24">
          <div className="text-sm font-medium text-primary">{formatPrice(asset.price)}</div>
          <div className={`text-xs flex items-center gap-0.5 justify-end ${positive ? "text-up" : "text-down"}`}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {asset.changePercent}
          </div>
        </div>
      </div>
    </Link>
  );
}

function Card({
  title,
  slug,
  items,
  offline,
}: {
  title: string;
  slug: string;
  items: AssetRow[];
  offline: boolean;
}) {
  const t = useTranslations("marketOverview");
  return (
    <div className="bg-card border border-surface rounded-lg p-5 hover:border-hover transition-all group">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-primary">{title}</h3>
          {offline && (
            <span className="flex items-center gap-1 text-[10px] text-down font-mono-caps">
              <WifiOff className="w-3 h-3" />
              {t("offline")}
            </span>
          )}
        </div>
        <Link
          href={`/markets?category=${slug}`}
          className="text-xs text-secondary hover:text-accent transition-colors flex items-center gap-1"
        >
          {t("seeAll")}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-0">
        {items.length === 0 ? (
          <div className="text-xs text-secondary py-6 text-center">{t("loading")}</div>
        ) : (
          items.map((item) => <Row key={item.slug} asset={item} />)
        )}
      </div>
    </div>
  );
}

export default function MarketOverview() {
  const t = useTranslations("marketOverview");
  const [indices, setIndices] = useState<AssetRow[]>([]);
  const [commodities, setCommodities] = useState<AssetRow[]>([]);
  const [forex, setForex] = useState<AssetRow[]>([]);
  const [crypto, setCrypto] = useState<AssetRow[]>([]);
  const [offline, setOffline] = useState<Record<AssetType, boolean>>({ index: false, commodity: false, forex: false, crypto: false });

  const loadAll = useCallback(async () => {
    const [idxRes, comRes, fxRes, crRes] = await Promise.allSettled([
      Promise.all(INDICES.map(fetchNonCrypto)),
      Promise.all(COMMODITIES.map(fetchNonCrypto)),
      Promise.all(FOREX.map(fetchNonCrypto)),
      fetchCryptoTop(4),
    ]);

    const nextOffline: Record<AssetType, boolean> = { index: false, commodity: false, forex: false, crypto: false };

    if (idxRes.status === "fulfilled") {
      const rows = idxRes.value.filter(Boolean) as AssetRow[];
      if (rows.length) setIndices(rows);
      nextOffline.index = rows.length === 0;
    } else nextOffline.index = true;

    if (comRes.status === "fulfilled") {
      const rows = comRes.value.filter(Boolean) as AssetRow[];
      if (rows.length) setCommodities(rows);
      nextOffline.commodity = rows.length === 0;
    } else nextOffline.commodity = true;

    if (fxRes.status === "fulfilled") {
      const rows = fxRes.value.filter(Boolean) as AssetRow[];
      if (rows.length) setForex(rows);
      nextOffline.forex = rows.length === 0;
    } else nextOffline.forex = true;

    if (crRes.status === "fulfilled") {
      const rows = crRes.value;
      if (rows.length) setCrypto(rows);
      nextOffline.crypto = rows.length === 0;
    } else nextOffline.crypto = true;

    setOffline(nextOffline);
  }, []);

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, 60_000);
    return () => clearInterval(id);
  }, [loadAll]);

  const cards = useMemo(
    () => [
      { title: t("cardIndices"), slug: "indices", items: indices, offline: offline.index, type: "index" as AssetType },
      { title: t("cardCrypto"), slug: "crypto", items: crypto, offline: offline.crypto, type: "crypto" as AssetType },
      { title: t("cardCommodities"), slug: "commodities", items: commodities, offline: offline.commodity, type: "commodity" as AssetType },
      { title: t("cardForex"), slug: "forex", items: forex, offline: offline.forex, type: "forex" as AssetType },
    ],
    [t, indices, crypto, commodities, forex, offline]
  );

  return (
    <section id="market-overview" className="py-16 px-4 relative overflow-hidden bg-canvas">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-subtle opacity-20 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <p className="font-mono-caps text-secondary mb-2">{t("badge")}</p>
          <h2 className="heading-2 text-primary mb-2">{t("title")}</h2>
          <p className="text-secondary text-sm max-w-xl mx-auto">{t("subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <Card key={c.type} title={c.title} slug={c.slug} items={c.items} offline={c.offline} />
          ))}
        </div>
      </div>
    </section>
  );
}
