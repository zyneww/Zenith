"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "@/lib/realtime/SocketContext";

interface PriceUpdate {
  symbol: string;
  price: number;
  side?: "BUY" | "SELL";
  timestamp: number;
}

interface PriceMap {
  [symbol: string]: PriceUpdate;
}

export function useRealtimePrice(symbols: string[]) {
  const { subscribe, isConnected, getLatestPrice } = useSocket();
  const [prices, setPrices] = useState<PriceMap>({});
  const pendingUpdatesRef = useRef<PriceMap>({});

  // Subscribe to symbols
  useEffect(() => {
    subscribe(symbols);
  }, [symbols.join(","), subscribe]);

  // Throttled price updates: batch every 200ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(pendingUpdatesRef.current).length > 0) {
        setPrices((prev) => ({
          ...prev,
          ...pendingUpdatesRef.current,
        }));
        pendingUpdatesRef.current = {};
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Poll for price changes from shared SocketContext
  useEffect(() => {
    const interval = setInterval(() => {
      let hasUpdate = false;
      const updates: PriceMap = {};

      for (const symbol of symbols) {
        const update = getLatestPrice(symbol);
        if (update) {
          const current = prices[symbol.toUpperCase()];
          if (!current || current.timestamp !== update.timestamp) {
            updates[symbol.toUpperCase()] = update;
            hasUpdate = true;
          }
        }
      }

      if (hasUpdate) {
        pendingUpdatesRef.current = {
          ...pendingUpdatesRef.current,
          ...updates,
        };
      }
    }, 200);

    return () => clearInterval(interval);
  }, [symbols.join(","), getLatestPrice, prices]);

  const getPrice = useCallback(
    (symbol: string) => {
      return prices[symbol.toUpperCase()];
    },
    [prices]
  );

  return { prices, isConnected, getPrice };
}
