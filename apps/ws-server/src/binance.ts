interface PriceUpdate {
  symbol: string;
  price: number;
  side?: "BUY" | "SELL";
  timestamp: number;
}

interface BinanceTicker {
  symbol: string;
  price: string;
}

export default class BinanceConsumer {
  private wsUrl: string;
  private symbols: string[];
  private ws: WebSocket | null = null;
  private tradeHandlers: ((trade: PriceUpdate) => void)[] = [];
  private reconnectInterval = 5000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
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

    const streams = this.symbols.map((s) => `${s}@trade`).join("/");
    const url = `${this.wsUrl}/stream?streams=${streams}`;

    console.log(`📡 Connecting to Binance WS: ${this.symbols.length} streams`);

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log("✅ Binance WS connected");
        this.isConnected = true;
        this.errorCount = 0;
        this.backoffMs = 5000;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const data = payload.data || payload;
          this.handleTrade(data);
        } catch (err) {
          console.error("Error parsing Binance message:", err);
        }
      };

      this.ws.onerror = (err) => {
        console.error("Binance WS error:", err);
        this.errorCount++;
        if (this.errorCount >= 3 && !this.useFallback) {
          console.log("❌ Multiple WS errors, switching to fallback");
          this.switchToFallback();
        }
      };

      this.ws.onclose = () => {
        console.log("🔌 Binance WS disconnected");
        this.isConnected = false;
        if (!this.useFallback) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.error("Failed to create Binance WS:", err);
      this.switchToFallback();
    }
  }

  private handleTrade(data: Record<string, unknown>): void {
    if (data.e === "trade") {
      const symbol = (data.s as string).toLowerCase();
      const price = parseFloat(data.p as string);
      const side = (data.m as boolean) ? "SELL" : "BUY";

      const update: PriceUpdate = {
        symbol: symbol.replace("usdt", "").toUpperCase(),
        price,
        side,
        timestamp: Date.now(),
      };

      this.lastPrices.set(update.symbol, price);
      this.broadcast(update);
    }
  }

  private broadcast(update: PriceUpdate): void {
    for (const handler of this.tradeHandlers) {
      handler(update);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    console.log(`⏳ Reconnecting WS in ${this.backoffMs}ms...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.useFallback) {
        this.startFallback();
      } else {
        this.connect();
      }
      // Exponential backoff capped at MAX_BACKOFF_MS
      this.backoffMs = Math.min(this.backoffMs * 2, this.MAX_BACKOFF_MS);
    }, this.backoffMs);
  }

  private switchToFallback(): void {
    console.log("🔄 Switching to REST fallback polling...");
    this.useFallback = true;
    this.isConnected = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.startFallback();
  }

  private async fetchPrices(): Promise<void> {
    // Cancel previous request if still running
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      const symbolsParam = this.symbols
        .map((s) => `"${s.toUpperCase()}"`)
        .join(",");
      const url = `https://api.binance.com/api/v3/ticker/price?symbols=[${symbolsParam}]`;

      const response = await fetch(url, { signal, timeout: 5000 } as any);
      
      if (response.status === 429) {
        console.warn("Binance rate limited (429), backing off...");
        this.backoffMs = Math.min(this.backoffMs * 2, this.MAX_BACKOFF_MS);
        return;
      }
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data: BinanceTicker[] = await response.json();

      for (const ticker of data) {
        const symbol = ticker.symbol.replace("USDT", "");
        const price = parseFloat(ticker.price);
        const lastPrice = this.lastPrices.get(symbol);

        let side: "BUY" | "SELL" = "BUY";
        if (lastPrice && price < lastPrice) {
          side = "SELL";
        }

        const update: PriceUpdate = {
          symbol,
          price,
          side,
          timestamp: Date.now(),
        };

        this.lastPrices.set(symbol, price);
        this.broadcast(update);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.warn("Fallback fetch aborted (timeout or new request)");
      } else {
        console.error("Fallback polling error:", err);
      }
    }
  }

  private startFallback(): void {
    if (this.fallbackInterval) return;

    console.log(`📊 REST fallback polling started (${this.FALLBACK_INTERVAL_MS}ms interval)`);
    this.isConnected = true;

    // Fetch immediately
    this.fetchPrices();

    // Then at interval
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

  disconnect(): void {
    this.stopFallback();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}
