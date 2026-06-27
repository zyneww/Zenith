"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { logger } from "@/lib/logger";

export interface PriceUpdate {
  symbol: string;
  price: number;
  side?: "BUY" | "SELL";
  timestamp: number;
}

export interface DepthData {
  symbol: string;
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

export interface TradeData {
  symbol: string;
  price: number;
  size: number;
  side: "BUY" | "SELL";
  time: number;
}

interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  pricesVersion: number;
  depthVersion: number;
  tradesVersion: number;
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
  getLatestPrice: (symbol: string) => PriceUpdate | undefined;
  getDepth: (symbol: string) => DepthData | undefined;
  getTrades: (symbol: string) => TradeData[];
}

const SocketContext = createContext<SocketContextType | null>(null);

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/ws";

const RECONNECT_DELAY_MS = 1000;
const RECONNECT_DELAY_MAX_MS = 10000;
const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_TRADES_PER_SYMBOL = 50;

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const pricesRef = useRef<Map<string, PriceUpdate>>(new Map());
  const depthRef = useRef<Map<string, DepthData>>(new Map());
  const tradesRef = useRef<Map<string, TradeData[]>>(new Map());
  const [pricesVersion, setPricesVersion] = useState(0);
  const [depthVersion, setDepthVersion] = useState(0);
  const [tradesVersion, setTradesVersion] = useState(0);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSymbolsRef = useRef<string[]>([]);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        logger.log("🟢 WebSocket connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        if (pendingSymbolsRef.current.length > 0) {
          ws.send(JSON.stringify({ type: "subscribe_symbols", symbols: pendingSymbolsRef.current }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "price_update") {
            const data = msg.data as PriceUpdate;
            pricesRef.current.set(data.symbol, data);
            setPricesVersion((v) => v + 1);
          }

          if (msg.type === "depth_update") {
            const data = msg.data as DepthData;
            depthRef.current.set(data.symbol, data);
            setDepthVersion((v) => v + 1);
          }

          if (msg.type === "trade_update") {
            const raw = msg.data as any;
            const data: TradeData = {
              symbol: raw.symbol,
              price: raw.price,
              size: raw.size ?? raw.quantity ?? 0,
              side: raw.side ?? "BUY",
              time: raw.time ?? raw.timestamp ?? Date.now(),
            };
            const symbol = data.symbol;
            const prev = tradesRef.current.get(symbol) || [];
            prev.unshift(data);
            if (prev.length > MAX_TRADES_PER_SYMBOL) prev.length = MAX_TRADES_PER_SYMBOL;
            tradesRef.current.set(symbol, prev);
            setTradesVersion((v) => v + 1);
          }
        } catch (err) {
          logger.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onclose = (event) => {
        if (!event.wasClean) {
          logger.warn(`🔴 WebSocket disconnected (code: ${event.code})`);
        } else {
          logger.log("🔴 WebSocket disconnected cleanly");
        }
        setIsConnected(false);
        socketRef.current = null;

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current),
            RECONNECT_DELAY_MAX_MS
          );
          logger.log(`⏳ Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current + 1})`);
          reconnectTimerRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          logger.error("❌ Max reconnection attempts reached");
        }
      };

      ws.onerror = () => {
        logger.warn("WebSocket connection error (server may be down):", WS_URL);
      };
    } catch (err) {
      logger.error("Failed to create WebSocket:", err);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  const subscribe = useCallback((symbols: string[]) => {
    pendingSymbolsRef.current = symbols;
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "subscribe_symbols", symbols }));
    }
  }, []);

  const unsubscribe = useCallback(() => {
    pendingSymbolsRef.current = [];
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "subscribe_symbols", symbols: [] }));
    }
  }, []);

  const getLatestPrice = useCallback((symbol: string) => {
    return pricesRef.current.get(symbol.toUpperCase());
  }, []);

  const getDepth = useCallback((symbol: string) => {
    return depthRef.current.get(symbol.toUpperCase());
  }, []);

  const getTrades = useCallback((symbol: string) => {
    return tradesRef.current.get(symbol.toUpperCase()) || [];
  }, []);

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    pricesVersion,
    depthVersion,
    tradesVersion,
    subscribe,
    unsubscribe,
    getLatestPrice,
    getDepth,
    getTrades,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
}
