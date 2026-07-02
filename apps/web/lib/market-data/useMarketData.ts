"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSocket } from "@/lib/realtime/SocketContext";
import { MarketDataPoint, AssetClass } from "./types";

interface MarketDataState {
  data: MarketDataPoint[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

export function useMarketData(
  assetClass: AssetClass,
  symbols: string[],
  refreshInterval = 30000
): MarketDataState {
  const { isConnected, getLatestPrice } = useSocket();
  const [state, setState] = useState<MarketDataState>({
    data: [],
    isLoading: true,
    error: null,
    lastUpdated: 0,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/markets/${assetClass}?symbols=${encodeURIComponent(symbols.join(","))}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Failed to fetch market data");

      const data: MarketDataPoint[] = await res.json();

      setState((prev) => ({
        ...prev,
        data,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, [assetClass, symbols.join(",")]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling for non-crypto assets
  useEffect(() => {
    if (assetClass === "crypto") return; // Crypto uses WebSocket

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchData, refreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [assetClass, refreshInterval, fetchData]);

  // For crypto, merge WebSocket live prices with REST data
  useEffect(() => {
    if (assetClass !== "crypto" || state.data.length === 0) return;

    const interval = setInterval(() => {
      let hasUpdate = false;
      const updatedData = state.data.map((item) => {
        const wsUpdate = getLatestPrice(item.symbol);
        if (wsUpdate && item.timestamp != null && wsUpdate.timestamp > item.timestamp) {
          hasUpdate = true;
          return {
            ...item,
            price: wsUpdate.price,
            timestamp: wsUpdate.timestamp,
          };
        }
        return item;
      });

      if (hasUpdate) {
        setState((prev) => ({
          ...prev,
          data: updatedData,
          lastUpdated: Date.now(),
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [assetClass, state.data, getLatestPrice]);

  return state;
}

// Hook for crypto data specifically (uses CoinGecko REST + WS merge)
export function useCryptoData(limit = 10): MarketDataState {
  const [state, setState] = useState<MarketDataState>({
    data: [],
    isLoading: true,
    error: null,
    lastUpdated: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchCrypto() {
      try {
        const res = await fetch(`/api/markets/crypto?limit=${limit}`, {
          cache: "no-store",
        });
        if (cancelled) return;
        if (!res.ok) throw new Error("Failed to fetch crypto data");

        const data: MarketDataPoint[] = await res.json();
        setState({
          data,
          isLoading: false,
          error: null,
          lastUpdated: Date.now(),
        });
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    }

    fetchCrypto();
    const interval = setInterval(fetchCrypto, 60000); // Poll every 60s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [limit]);

  return state;
}

// Hook for market summary (all asset classes)
export function useMarketSummary(): MarketDataState {
  const [state, setState] = useState<MarketDataState>({
    data: [],
    isLoading: true,
    error: null,
    lastUpdated: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      try {
        const res = await fetch("/api/markets/summary", { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) throw new Error("Failed to fetch market summary");

        const data: MarketDataPoint[] = await res.json();
        setState({
          data,
          isLoading: false,
          error: null,
          lastUpdated: Date.now(),
        });
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    }

    fetchSummary();
    const interval = setInterval(fetchSummary, 30000); // Poll every 30s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return state;
}

// Hook for ticker strip (mixed assets)
export function useTickerStrip() {
  const { isConnected, getLatestPrice } = useSocket();
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchTickers() {
      try {
        const res = await fetch("/api/markets/summary", { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) return;

        const data: MarketDataPoint[] = await res.json();
        const priceMap: Record<string, number> = {};
        data.forEach((d) => {
          priceMap[d.symbol] = d.price;
        });
        setPrices(priceMap);
        setLastUpdated(Date.now());
      } catch {
        // Silently fail
      }
    }

    fetchTickers();
    const interval = setInterval(fetchTickers, 15000); // 15s refresh

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Merge with WebSocket live prices for crypto
  useEffect(() => {
    const interval = setInterval(() => {
      let hasUpdate = false;
      const updatedPrices = { ...prices };

      ["BTC", "ETH", "SOL", "BNB", "XRP"].forEach((symbol) => {
        const wsUpdate = getLatestPrice(symbol);
        if (wsUpdate && wsUpdate.timestamp > lastUpdated) {
          updatedPrices[symbol] = wsUpdate.price;
          hasUpdate = true;
        }
      });

      if (hasUpdate) {
        setPrices(updatedPrices);
        setLastUpdated(Date.now());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [prices, lastUpdated, getLatestPrice]);

  return { prices, lastUpdated, isConnected };
}
