"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface PriceUpdate {
  symbol: string;
  price: number;
  side?: "BUY" | "SELL";
  timestamp: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
  getLatestPrice: (symbol: string) => PriceUpdate | undefined;
}

const SocketContext = createContext<SocketContextType | null>(null);

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const pricesRef = useRef<Map<string, PriceUpdate>>(new Map());
  const [pricesVersion, setPricesVersion] = useState(0); // For triggering re-renders

  useEffect(() => {
    const s = io(WS_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = s;

    s.on("connect", () => {
      console.log("🟢 Socket.IO connected");
      setIsConnected(true);
    });

    s.on("disconnect", () => {
      console.log("🔴 Socket.IO disconnected");
      setIsConnected(false);
    });

    s.on("price_update", (data: PriceUpdate) => {
      pricesRef.current.set(data.symbol, data);
      // Throttle re-renders: batch updates every 200ms
      setPricesVersion((v) => v + 1);
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  const subscribe = useCallback((symbols: string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("subscribe_symbols", symbols);
    }
  }, []);

  const unsubscribe = useCallback((symbols: string[]) => {
    // Server handles room leaving on new subscribe, but we could explicitly leave
    if (socketRef.current?.connected) {
      socketRef.current.emit("subscribe_symbols", []);
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
