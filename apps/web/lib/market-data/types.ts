export type AssetClass = "crypto" | "forex" | "commodity" | "commodities" | "index" | "indices" | "stock" | "stocks" | "etf" | "futures";
export type { EconomicEvent } from "@/lib/calendar/types";

export interface MarketDataPoint {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
  circulating_supply: number;
  max_supply: number | null;
  ath: number;
  atl: number;
  sparkline_in_7d?: { price: number[] };
  assetClass: AssetClass;
  open?: number;
  close?: number;
  change?: number;
  timestamp?: number;
  changePercent: number;
  changePercent1h?: number;
  changePercent7d?: number;
  change24h?: number;
  change1h?: number;
  change7d?: number;
  price: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  marketCapRank?: number;
  sparkline7d?: number[];
  tags?: string[];
}

export interface TickerSnapshot {
  current: number;
  change24h: number;
  change1h: number;
  change7d: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
}

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface OrderBookSnapshot {
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

export interface Trade {
  price: number;
  size: number;
  side: "BUY" | "SELL";
  time: number;
}

export type Unsubscribe = () => void;

export interface MarketDataProvider {
  getTicker(symbol: string): Promise<TickerSnapshot>;
  getKlines(symbol: string, interval: string, limit: number): Promise<Candle[]>;
  getOrderBook?(symbol: string, limit?: number): Promise<OrderBookSnapshot>;
  getRecentTrades?(symbol: string, limit?: number): Promise<Trade[]>;
  subscribeTicker(symbol: string, cb: (t: Partial<TickerSnapshot>) => void): Unsubscribe;
  subscribeTrades?(symbol: string, cb: (t: Trade) => void): Unsubscribe;
  supportsOrderBook: boolean;
  supportsTrades: boolean;
  isLive: boolean;
}
