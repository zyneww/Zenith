export interface MarketDataPoint {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume?: number;
  timestamp: number;
  assetClass: AssetClass;
}

export type AssetClass = "crypto" | "forex" | "indices" | "commodities" | "stocks" | "futures";

export interface TickerData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  assetClass: AssetClass;
}

export interface EconomicEvent {
  date: string;
  time: string;
  currency: string;
  event: string;
  importance: "low" | "medium" | "high";
  actual?: string;
  forecast?: string;
  previous?: string;
  impact?: "positive" | "negative" | "neutral";
}

export interface CommunityIdea {
  id: string;
  author: string;
  avatar: string;
  title: string;
  asset: string;
  direction: "long" | "short";
  chartUrl: string;
  likes: number;
  comments: number;
  publishedAt: string;
  tags: string[];
}

export interface BrokerInfo {
  id: string;
  name: string;
  logo: string;
  rating: number;
  minDeposit: string;
  leverage: string;
  spread: string;
  features: string[];
  ctaUrl: string;
  isPromoted?: boolean;
}

export interface MarketSection {
  title: string;
  icon: string;
  assetClass: AssetClass;
  items: MarketDataPoint[];
  link: string;
  linkLabel: string;
}
