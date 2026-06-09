"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

interface PriceUpdate {
  symbol: string;
  price: number;
  side?: "BUY" | "SELL";
  timestamp: number;
}

interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
  getLatestPrice: (symbol: string) => PriceUpdate | undefined;
}

const SocketContext = createContext<SocketContextType | null>(null);

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/ws";

// Reconnection config
const RECONNECT_DELAY_MS = 1000;
const RECONNECT_DELAY_MAX_MS = 10000;
const MAX_RECONNECT_ATTEMPTS = 10;

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const pricesRef = useRef<Map<string, PriceUpdate>>(new Map());
  const [pricesVersion, setPricesVersion] = useState(0); // For triggering re-renders
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSymbolsRef = useRef<string[]>([]);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("🟢 WebSocket connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Re-subscribe to pending symbols
        if (pendingSymbolsRef.current.length > 0) {
          ws.send(JSON.stringify({
            type: "subscribe_symbols",
            symbols: pendingSymbolsRef.current,
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "price_update") {
            const data = message.data as PriceUpdate;
            pricesRef.current.set(data.symbol, data);
            // Throttle re-renders: batch updates
            setPricesVersion((v) => v + 1);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onclose = (event) => {
        const wasClean = event.wasClean;
        const code = event.code;
        if (!wasClean) {
          console.warn(`🔴 WebSocket disconnected (code: ${code}, server may be unreachable)`);
        } else {
          console.log("🔴 WebSocket disconnected cleanly");
        }
        setIsConnected(false);
        socketRef.current = null;

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current),
            RECONNECT_DELAY_MAX_MS
          );
          console.log(`⏳ Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimerRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          console.error("❌ Max reconnection attempts reached");
        }
      };

      ws.onerror = (error) => {
        console.warn("WebSocket connection error (server may be down):", WS_URL);
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  const subscribe = useCallback((symbols: string[]) => {
    pendingSymbolsRef.current = symbols;
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "subscribe_symbols",
        symbols,
      }));
    }
  }, []);

  const unsubscribe = useCallback(() => {
    pendingSymbolsRef.current = [];
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "subscribe_symbols",
        symbols: [],
      }));
    }
  }, []);

  const getLatestPrice = useCallback((symbol: string) => {
    return pricesRef.current.get(symbol.toUpperCase());
  }, []);

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    subscribe,
    unsubscribe,
    getLatestPrice,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
