"use client";

import { useEffect, useMemo } from "react";
import { useSocket } from "@/lib/realtime/SocketContext";

export function useOrderBook(symbol: string | null) {
  const { subscribe, getDepth, depthVersion } = useSocket();

  useEffect(() => {
    if (symbol) subscribe([symbol]);
  }, [symbol, subscribe]);

  const depth = useMemo(() => {
    if (!symbol) return null;
    return getDepth(symbol.toUpperCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depthVersion, symbol]);

  return depth;
}
