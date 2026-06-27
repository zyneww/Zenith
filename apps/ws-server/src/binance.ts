interface PriceUpdate {
  symbol: string;
  price: number;
  quantity?: number;
  side?: "BUY" | "SELL";
  timestamp: number;
}

interface DepthUpdate {
  symbol: string;
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

interface BinanceTicker24hr {
  symbol: string;
  lastPrice: string;
  quoteVolume: string;
}

export default class BinanceConsumer {
  private wsUrl: string;
  private symbols: string[];
  private wsConnections: Map<string, WebSocket> = new Map();
  private tradeHandlers: ((trade: PriceUpdate) => void)[] = [];
  private depthHandlers: ((depth: DepthUpdate) => void)[] = [];
  private isConnected = false;
  private useFallback = false;
  private fallbackInterval: ReturnType<typeof setInterval> | null = null;
  private lastPrices: Map<string, number> = new Map();
  private errorCount = 0;
  private backoffMs = 5000;
  private abortController: AbortController | null = null;
  private readonly MAX_BACKOFF_MS = 60_000;
  private readonly FALLBACK_INTERVAL_MS = 2000;

  constructor(wsUrl: string, symbols: string[]) {
    this.wsUrl = wsUrl;
    this.symbols = symbols.map((s) => s.toLowerCase());
  }

  connect(): void {
    if (this.useFallback) {
      this.startFallback();
      return;
    }

    console.log(`📡 Connecting ${this.symbols.length} Binance combined WS streams (trade+depth)...`);

    let connectedCount = 0;

    for (const symbol of this.symbols) {
      const url = `${this.wsUrl}/${symbol}@trade/${symbol}@depth20@100ms`;
      try {
        const ws = new WebSocket(url);

        ws.onopen = () => {
          connectedCount++;
          this.isConnected = true;
          this.errorCount = 0;
          this.backoffMs = 5000;
          if (connectedCount === this.symbols.length) {
            console.log(`✅ All ${this.symbols.length} Binance WS streams connected`);
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.e === "trade") {
              this.handleTrade(data);
            } else if (data.bids || data.lastUpdateId) {
              this.handleDepth(data, symbol);
            }
          } catch (err) {
            console.error("Error parsing Binance message:", err);
          }
        };

        ws.onerror = () => {
          this.errorCount++;
          if (this.errorCount >= 3 && !this.useFallback) {
            console.log("❌ Multiple WS stream errors, switching to fallback");
            this.switchToFallback();
          }
        };

        ws.onclose = () => {
          if (!this.useFallback) {
            this.scheduleReconnect();
          }
        };

        this.wsConnections.set(symbol, ws);
      } catch (err) {
        console.error(`Failed to create WS for ${symbol}:`, err);
        this.switchToFallback();
        return;
      }
    }
  }

  private handleTrade(data: Record<string, unknown>): void {
    const symbol = (data.s as string).toLowerCase();
    const price = parseFloat(data.p as string);
    const quantity = parseFloat(data.q as string);
    const side = (data.m as boolean) ? "SELL" : "BUY";

    const update: PriceUpdate = {
      symbol: symbol.replace("usdt", "").toUpperCase(),
      price,
      quantity: isNaN(quantity) ? undefined : quantity,
      side,
      timestamp: Date.now(),
    };

    this.lastPrices.set(update.symbol, price);
    this.broadcastTrade(update);
  }

  private handleDepth(data: Record<string, unknown>, symbol: string): void {
    const rawBids = data.bids as [string, string][] | undefined;
    const rawAsks = data.asks as [string, string][] | undefined;
    if (!rawBids || !rawAsks) return;

    const update: DepthUpdate = {
      symbol: symbol.replace("usdt", "").toUpperCase(),
      bids: rawBids,
      asks: rawAsks,
      timestamp: Date.now(),
    };

    this.broadcastDepth(update);
  }

  private broadcastTrade(update: PriceUpdate): void {
    for (const handler of this.tradeHandlers) {
      handler(update);
    }
  }

  private broadcastDepth(update: DepthUpdate): void {
    for (const handler of this.depthHandlers) {
      handler(update);
    }
  }

  private scheduleReconnect(): void {
    console.log(`⏳ Reconnecting WS in ${this.backoffMs}ms...`);
    setTimeout(() => {
      if (this.useFallback) {
        this.startFallback();
      } else {
        this.connect();
      }
      this.backoffMs = Math.min(this.backoffMs * 2, this.MAX_BACKOFF_MS);
    }, this.backoffMs);
  }

  private switchToFallback(): void {
    console.log("🔄 Switching to REST fallback polling...");
    this.useFallback = true;
    this.isConnected = false;
    for (const [, ws] of this.wsConnections) {
      ws.close();
    }
    this.wsConnections.clear();
    this.startFallback();
  }

  private async fetchPrices(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      const symbolsParam = this.symbols
        .map((s) => `"${s.toUpperCase()}"`)
        .join(",");
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbolsParam}]`;

      const response = await fetch(url, { signal, timeout: 5000 } as any);

      if (response.status === 429) {
        console.warn("Binance rate limited (429), backing off...");
        this.backoffMs = Math.min(this.backoffMs * 2, this.MAX_BACKOFF_MS);
        return;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data: BinanceTicker24hr[] = await response.json();

      for (const ticker of data) {
        const symbol = ticker.symbol.replace("USDT", "");
        const price = parseFloat(ticker.lastPrice);
        const volume = parseFloat(ticker.quoteVolume);
        const lastPrice = this.lastPrices.get(symbol);

        let side: "BUY" | "SELL" = "BUY";
        if (lastPrice && price < lastPrice) {
          side = "SELL";
        }

        const update: PriceUpdate = {
          symbol,
          price,
          quantity: isNaN(volume) ? 0 : volume,
          side,
          timestamp: Date.now(),
        };

        this.lastPrices.set(symbol, price);
        this.broadcastTrade(update);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.warn("Fallback fetch aborted");
      } else {
        console.error("Fallback polling error:", err);
      }
    }
  }

  private startFallback(): void {
    if (this.fallbackInterval) return;

    console.log(`📊 REST fallback polling started (${this.FALLBACK_INTERVAL_MS}ms interval)`);
    this.isConnected = true;

    this.fetchPrices();

    this.fallbackInterval = setInterval(() => {
      this.fetchPrices();
    }, this.FALLBACK_INTERVAL_MS);
  }

  private stopFallback(): void {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  onTrade(handler: (trade: PriceUpdate) => void): void {
    this.tradeHandlers.push(handler);
  }

  onDepth(handler: (depth: DepthUpdate) => void): void {
    this.depthHandlers.push(handler);
  }

  disconnect(): void {
    this.stopFallback();
    for (const [, ws] of this.wsConnections) {
      ws.close();
    }
    this.wsConnections.clear();
    this.isConnected = false;
  }
}
