"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  BinanceStream,
  BinanceTickerData,
  BinanceDepthData,
  BinanceTradeData,
  ConnectionStatus,
} from "@/lib/market-data/binance-ws";

const MAX_TRADES = 50;

export interface BinanceMarketData {
  ticker: BinanceTickerData | null;
  depth: BinanceDepthData | null;
  trades: BinanceTradeData[];
  status: ConnectionStatus;
}

const EMPTY: BinanceMarketData = { ticker: null, depth: null, trades: [], status: "offline" };

export function useBinanceMarketData(symbol: string | null) {
  const streamRef = useRef<BinanceStream | null>(null);
  const [data, setData] = useState<BinanceMarketData>(EMPTY);

  const update = useCallback((patch: Partial<BinanceMarketData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (!symbol) {
      setData(EMPTY);
      return;
    }

    const stream = new BinanceStream(symbol);
    streamRef.current = stream;

    stream.onTicker = (ticker) => {
      update({ ticker, status: "live" });
    };

    stream.onDepth = (depth) => {
      update({ depth });
    };

    stream.onTrade = (trade) => {
      setData((prev) => {
        const trades = [trade, ...prev.trades].slice(0, MAX_TRADES);
        return { ...prev, trades };
      });
    };

    stream.onStatus = (status) => {
      update({ status });
    };

    stream.connect();

    return () => {
      stream.disconnect();
      streamRef.current = null;
    };
  }, [symbol, update]);

  return data;
}

export type { ConnectionStatus };
