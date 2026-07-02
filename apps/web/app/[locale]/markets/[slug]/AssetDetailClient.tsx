"use client";

import { useEffect, useState, useMemo } from "react";
import AssetHeaderBar from "@/components/markets/AssetHeaderBar";
import AssetSidebar from "@/components/markets/AssetSidebar";
import ChartSection from "@/components/markets/ChartSection";
import MarketSidePanel from "@/components/markets/MarketSidePanel";
import BottomTabs from "@/components/markets/BottomTabs";
import TickerMarquee from "@/components/markets/TickerMarquee";
import { useBinanceMarketData } from "@/lib/hooks/useBinanceMarketData";
import { tokens } from "@/lib/theme/bybit";
import type { AssetMeta } from "@/lib/assets/registry";

type PricePayload = {
  asset?: { id: string; symbol: string; name: string; type: string; image: string | null; finnhubSymbol: string | null };
  price?: { current: number; change24h: number; change1h: number; change7d: number; high24h: number; low24h: number; marketCap: number; volume24h: number };
  lastUpdated?: string;
} | null;

interface Props {
  asset: AssetMeta;
  priceData: PricePayload;
  ohlcv: { slug: string; type: string; range: string; points: any[] } | null;
  locale?: string;
}

const FAV_KEY = "zenith:favorites";

function isCryptoStable(symbol: string): boolean {
  const stables = ["USDT", "USDC", "DAI", "USDE", "PYUSD", "USD1", "USDS", "USDG", "BUIDL", "USDY", "USDF", "USDD", "BFUSD", "USD0", "RLUSD", "USDTB"];
  return stables.includes(symbol.toUpperCase());
}

function toDepthData(depth: { bids: [string, string][]; asks: [string, string][]; timestamp: number } | null) {
  if (!depth || (depth.bids.length === 0 && depth.asks.length === 0)) return null;
  return { symbol: "", bids: depth.bids, asks: depth.asks, timestamp: depth.timestamp };
}

function toTradeData(trades: { price: number; size: number; side: "BUY" | "SELL"; time: number }[]) {
  return trades.map((t) => ({ symbol: "", ...t }));
}

export default function AssetDetailClient({ asset, priceData, ohlcv, locale = "fr-FR" }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const binanceSymbol = useMemo(() => {
    if (asset.type !== "crypto" || isCryptoStable(asset.symbol)) return null;
    return `${asset.symbol}USDT`.toLowerCase();
  }, [asset]);

  const liveData = useBinanceMarketData(binanceSymbol);
  const { ticker, depth, trades, status } = liveData;

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
  const displayPrice = ticker?.price ?? price?.current ?? 0;
  const displayChange24h = ticker?.changePercent24h ?? price?.change24h ?? 0;
  const displayHigh24h = ticker?.high24h ?? price?.high24h ?? 0;
  const displayLow24h = ticker?.low24h ?? price?.low24h ?? 0;
  const displayVolume24h = ticker?.volume24h ?? price?.volume24h ?? 0;
  const displayTurnover24h = ticker?.quoteVolume24h ?? 0;

  const isCrypto = asset.type === "crypto";
  const binanceReady = isCrypto && !!binanceSymbol;
  const isLive = binanceReady && status === "live";

  return (
    <div className="w-full min-w-0" style={{ backgroundColor: tokens.color.bg.dark }}>
      <AssetSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} currentSlug={asset.slug} />
      <TickerMarquee />

      <div className="px-2 py-2">
        <AssetHeaderBar
          asset={asset}
          price={{
            current: displayPrice,
            change24h: displayChange24h,
            high24h: displayHigh24h,
            low24h: displayLow24h,
            volume24h: displayVolume24h,
            turnover24h: displayTurnover24h,
            marketCap: price?.marketCap ?? 0,
          }}
          symbol={asset.symbol}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          isConnected={isLive}
          locale={locale}
        />

        <div className="mt-2 grid grid-cols-1 lg:grid-cols-12 gap-2">
          <div className={`min-w-0 space-y-2 ${rightPanelOpen ? "lg:col-span-9 xl:col-span-9" : "lg:col-span-12"}`}>
            <ChartSection
              symbol={asset.symbol}
              assetSlug={asset.slug}
              assetType={asset.type}
              depth={toDepthData(depth)}
              currentPrice={displayPrice}
              rightPanelOpen={rightPanelOpen}
              onToggleRightPanel={() => setRightPanelOpen((v) => !v)}
            />

            <BottomTabs asset={asset} currentPrice={displayPrice} />
          </div>

          {rightPanelOpen && (
            <div className="lg:col-span-3 xl:col-span-3">
              <MarketSidePanel
                asset={asset}
                price={{
                  change1h: price?.change1h ?? 0,
                  change24h: price?.change24h ?? 0,
                  change7d: price?.change7d ?? 0,
                  marketCap: price?.marketCap ?? 0,
                  volume24h: displayVolume24h,
                  high24h: displayHigh24h,
                  low24h: displayLow24h,
                }}
                supportsOrderBook={binanceReady}
                supportsTrades={binanceReady}
                depthOverride={toDepthData(depth)}
                tradesOverride={toTradeData(trades)}
                open={rightPanelOpen}
                onToggle={() => setRightPanelOpen((v) => !v)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
