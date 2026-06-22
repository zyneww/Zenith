"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSocket } from "@/lib/realtime/SocketContext";

export interface PriceUpdate {
  symbol: string;
  price: number;
  side?: "BUY" | "SELL";
  timestamp: number;
}

export type PriceMap = Record<string, PriceUpdate>;

export function useRealtimePrice(symbols: string[]) {
  const { subscribe, isConnected, getLatestPrice, pricesVersion } = useSocket();

  const symbolsKey = symbols.join(",");

  // Subscribe to symbols on mount + when symbols change
  useEffect(() => {
    subscribe(symbols);
  }, [symbolsKey, subscribe]);

  // Read prices from the shared ref each time pricesVersion bumps.
  // This is the only way the hook can see updates from the WebSocket.
  const prices = useMemo<PriceMap>(() => {
    const out: PriceMap = {};
    for (const symbol of symbols) {
      const u = getLatestPrice(symbol);
      if (u) out[symbol.toUpperCase()] = u;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricesVersion, symbolsKey]);

  const getPrice = useCallback(
    (symbol: string) => prices[symbol.toUpperCase()],
    [prices]
  );

  return { prices, isConnected, getPrice };
}
