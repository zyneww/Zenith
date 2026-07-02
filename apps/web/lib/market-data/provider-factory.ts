import type { AssetType } from "@/lib/assets/registry";
import type { MarketDataProvider } from "./types";

export type ProviderDeps = {
  slug: string;
  assetType: AssetType;
  getPrice: (sym: string) => any;
  getDepth: (sym: string) => any;
  getTrades: (sym: string) => any[];
  pricesVersion: number;
  depthVersion: number;
  tradesVersion: number;
  subscribe: (symbols: string[]) => void;
};

export function createProvider(deps: ProviderDeps): MarketDataProvider {
  if (deps.assetType === "crypto") {
    const { createBinanceProvider } = require("./binance-provider");
    return createBinanceProvider(
      deps.slug,
      deps.getPrice,
      deps.getDepth,
      deps.getTrades,
      deps.pricesVersion,
      deps.depthVersion,
      deps.tradesVersion,
      deps.subscribe,
    );
  }
  const { createFallbackProvider } = require("./fallback-provider");
  return createFallbackProvider(deps.slug, deps.assetType);
}
