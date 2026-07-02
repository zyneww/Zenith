import { MarketDataProvider, TickerSnapshot, Candle, Unsubscribe } from "./types";

export function createFallbackProvider(slug: string, type: string): MarketDataProvider {
  return {
    supportsOrderBook: false,
    supportsTrades: false,
    isLive: false,

    async getTicker(_symbol: string): Promise<TickerSnapshot> {
      const res = await fetch(`/api/market/asset/${slug}?type=${type}`);
      if (!res.ok) throw new Error("Failed to fetch ticker");
      const data = await res.json();
      return data.price as TickerSnapshot;
    },

    async getKlines(_symbol: string, interval: string, limit: number): Promise<Candle[]> {
      const res = await fetch(`/api/market/ohlcv/${slug}?range=${interval}&type=${type}&limit=${limit}`);
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

    subscribeTicker(_symbol: string, cb: (t: Partial<TickerSnapshot>) => void): Unsubscribe {
      const interval = setInterval(async () => {
        try {
          const ticker = await this.getTicker(_symbol);
          cb(ticker);
        } catch {}
      }, 10000);
      return () => clearInterval(interval);
    },
  };
}
