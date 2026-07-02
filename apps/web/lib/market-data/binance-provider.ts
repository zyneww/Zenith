import { MarketDataProvider, TickerSnapshot, Candle, OrderBookSnapshot, Trade, Unsubscribe } from "./types";
import type { PriceUpdate, DepthData, TradeData } from "@/lib/realtime/SocketContext";

type Callback<T> = (data: T) => void;

function subscribeToSocket<T>(
  symbol: string,
  getData: (sym: string) => T | undefined,
  version: number,
  cb: Callback<T>
): Unsubscribe {
  const interval = setInterval(() => {
    const data = getData(symbol);
    if (data) cb(data);
  }, 200);
  return () => clearInterval(interval);
}

export function createBinanceProvider(
  slug: string,
  getPrice: (sym: string) => PriceUpdate | undefined,
  getDepth: (sym: string) => DepthData | undefined,
  getTrades: (sym: string) => TradeData[],
  pricesVersion: number,
  depthVersion: number,
  tradesVersion: number,
  subscribe: (symbols: string[]) => void,
): MarketDataProvider {
  const wsSymbol = slug.toUpperCase();

  return {
    supportsOrderBook: true,
    supportsTrades: true,
    isLive: true,

    async getTicker(_symbol: string): Promise<TickerSnapshot> {
      const res = await fetch(`/api/market/asset/${slug}?type=crypto`);
      if (!res.ok) throw new Error("Failed to fetch ticker");
      const data = await res.json();
      return data.price as TickerSnapshot;
    },

    async getKlines(_symbol: string, interval: string, limit: number): Promise<Candle[]> {
      const res = await fetch(`/api/market/ohlcv/${slug}?range=${interval}&type=crypto&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch klines");
      const data = await res.json();
      return (data.points ?? []).map((p: any) => ({
        t: p.t,
        o: p.o,
        h: p.h,
        l: p.l,
        c: p.c,
        v: p.v ?? 0,
      }));
    },

    async getOrderBook(_symbol: string, limit = 20): Promise<OrderBookSnapshot> {
      const depth = getDepth(wsSymbol);
      if (depth) return depth;
      throw new Error("No order book data");
    },

    async getRecentTrades(_symbol: string, _limit = 50): Promise<Trade[]> {
      const trades = getTrades(wsSymbol);
      return trades.map((t) => ({
        price: t.price,
        size: t.size,
        side: t.side,
        time: t.time,
      }));
    },

    subscribeTicker(_symbol: string, cb: Callback<Partial<TickerSnapshot>>): Unsubscribe {
      subscribe([wsSymbol]);
      return subscribeToSocket(wsSymbol, () => {
        const p = getPrice(wsSymbol);
        if (!p) return undefined;
        return { current: p.price, change24h: undefined };
      }, pricesVersion, cb);
    },

    subscribeTrades(_symbol: string, cb: Callback<Trade>): Unsubscribe {
      subscribe([wsSymbol]);
      const interval = setInterval(() => {
        const trades = getTrades(wsSymbol);
        const latest = trades[0];
        if (latest) cb(latest);
      }, 300);
      return () => clearInterval(interval);
    },
  };
}
