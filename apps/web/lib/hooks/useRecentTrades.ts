"use client";

import { useEffect, useMemo } from "react";
import { useSocket } from "@/lib/realtime/SocketContext";

const MAX_TRADES = 50;

export function useRecentTrades(symbol: string | null) {
  const { subscribe, getTrades, tradesVersion } = useSocket();

  useEffect(() => {
    if (symbol) subscribe([symbol]);
  }, [symbol, subscribe]);

  const trades = useMemo(() => {
    if (!symbol) return [];
    return getTrades(symbol.toUpperCase()).slice(0, MAX_TRADES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradesVersion, symbol]);

  return trades;
}
