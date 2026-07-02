"use client";

export type ConnectionStatus = "connecting" | "live" | "offline";

export interface BinanceTickerData {
  price: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
}

export interface BinanceDepthData {
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

export interface BinanceTradeData {
  price: number;
  size: number;
  side: "BUY" | "SELL";
  time: number;
}

export interface BinanceKlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isFinal: boolean;
}

const BINANCE_COMBINED = "wss://stream.binance.com:9443/stream";
const RECONNECT_BASE = 1000;
const RECONNECT_MAX = 10000;
const MAX_RETRIES = 10;

export class BinanceStream {
  private ws: WebSocket | null = null;
  private symbol: string;
  private streams: string[];
  private retries = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private enabled = true;

  onTicker: ((data: BinanceTickerData) => void) | null = null;
  onDepth: ((data: BinanceDepthData) => void) | null = null;
  onTrade: ((data: BinanceTradeData) => void) | null = null;
  onKline: ((data: BinanceKlineData) => void) | null = null;
  onStatus: ((status: ConnectionStatus) => void) | null = null;

  constructor(symbol: string, klineInterval?: string) {
    this.symbol = symbol.toLowerCase();
    this.streams = [
      `${this.symbol}@ticker`,
      `${this.symbol}@depth20@100ms`,
      `${this.symbol}@trade`,
    ];
    if (klineInterval) {
      this.streams.push(`${this.symbol}@kline_${klineInterval}`);
    }
  }

  connect() {
    if (!this.enabled) return;
    this.onStatus?.("connecting");
    const url = `${BINANCE_COMBINED}?streams=${this.streams.join("/")}`;
    try {
      this.ws = new WebSocket(url);
    } catch {
      this.onStatus?.("offline");
      return;
    }

    this.ws.onopen = () => {
      this.retries = 0;
      this.onStatus?.("live");
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.stream) {
          const data = msg.data;
          const type = msg.stream.split("@")[1];
          switch (type) {
            case "ticker": this.handleTicker(data); break;
            case "depth20@100ms":
            case "depth": this.handleDepth(data); break;
            case "trade": this.handleTrade(data); break;
            case "kline_1m":
            case "kline_5m":
            case "kline_15m":
            case "kline_1h":
            case "kline_4h":
            case "kline_1d":
              this.handleKline(data);
              break;
          }
        }
      } catch {}
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (this.retries < MAX_RETRIES && this.enabled) {
        const delay = Math.min(RECONNECT_BASE * Math.pow(2, this.retries), RECONNECT_MAX);
        this.timer = setTimeout(() => {
          this.retries++;
          this.connect();
        }, delay);
      } else {
        this.onStatus?.("offline");
      }
    };

    this.ws.onerror = () => {};
  }

  disconnect() {
    this.enabled = false;
    if (this.timer) clearTimeout(this.timer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.onStatus?.("offline");
  }

  private handleTicker(data: any) {
    this.onTicker?.({
      price: parseFloat(data.c),
      changePercent24h: parseFloat(data.P),
      high24h: parseFloat(data.h),
      low24h: parseFloat(data.l),
      volume24h: parseFloat(data.v),
      quoteVolume24h: parseFloat(data.q),
    });
  }

  private handleDepth(data: any) {
    this.onDepth?.({
      bids: data.b ?? data.bids ?? [],
      asks: data.a ?? data.asks ?? [],
      timestamp: data.E ?? Date.now(),
    });
  }

  private handleTrade(data: any) {
    this.onTrade?.({
      price: parseFloat(data.p),
      size: parseFloat(data.q),
      side: data.m ? "SELL" : "BUY",
      time: data.E ?? Date.now(),
    });
  }

  private handleKline(data: any) {
    const k = data.k ?? data;
    this.onKline?.({
      time: k.t ?? k.startTime ?? 0,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      volume: parseFloat(k.v),
      isFinal: k.x ?? false,
    });
  }
}

export function createBinanceStream(symbol: string, klineInterval?: string): BinanceStream {
  return new BinanceStream(symbol, klineInterval);
}
