// apps/ws-server/src/index.ts
import BinanceConsumer from "./binance.js";
import DragonflyClient from "./dragonfly.js";
import { insertTrade } from "./questdb.js";
import { startCandleAggregation } from "./candles.js";

const PORT = parseInt(process.env.PORT || "3001");
const DRAGONFLY_URL = process.env.DRAGONFLY_URL || "redis://:dragonfly_dev@localhost:6379";
const BINANCE_WS_URL =
  process.env.BINANCE_WS_URL || "wss://stream.binance.com:9443/ws";

const rawCors = process.env.CORS_ORIGINS || "http://localhost:3000";
const ALLOWED_ORIGINS = rawCors.split(",").map((s) => s.trim());

const TRACKED_SYMBOLS = [
  "btcusdt", "ethusdt", "solusdt", "bnbusdt", "xrpusdt",
  "adausdt", "dogeusdt", "maticusdt", "dotusdt", "avaxusdt",
  "ltcusdt", "linkusdt", "uniusdt", "shibusdt", "trxusdt",
  "bchusdt", "xlmusdt", "atomusdt", "etcusdt", "filusdt",
  "hbarusdt", "nearusdt", "icpusdt", "algousdt", "vetusdt",
  "aaveusdt", "eosusdt", "xtzusdt", "thetausdt", "sushiusdt",
  "crvusdt", "grtrusdt", "sandusdt", "manausdt", "enjusdt",
  "chzusdt", "woousdt", "1inchusdt", "storjusdt", "sklusdt",
  "iotausdt", "antusdt", "bnausdt", "ankrusdt", "celrusdt",
  "kavausdt", "polusdt", "pepeusdt", "suiusdt", "aptusdt",
  "arbusdt", "opusdt", "injusdt", "fetusdt", "agixusdt",
  "galausdt", "xmrusdt", "zecusdt", "dashusdt", "wavesusdt",
  "omgusdt", "zilusdt", "flowusdt", "axsusdt", "slpusdt",
  "1mingusdt", "stmusdt", "ldousdt", "rndrusdt", "grtusdt",
  "mkrusdt", "compusdt", "snxusdt", "dydxusdt", "blurusdt",
  "omnisusdt",
];

interface ClientInfo {
  ip: string;
  symbols: Set<string>;
  connectedAt: number;
}

const clients = new Map<any, ClientInfo>();

const connectionCounts = new Map<string, number>();
const MAX_CONNECTIONS_PER_IP = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

function broadcastToSubscribed(clients: Map<any, ClientInfo>, symbol: string, message: string) {
  let sentCount = 0;
  for (const [ws, info] of clients.entries()) {
    if (info.symbols.size === 0 || info.symbols.has(symbol)) {
      try {
        ws.send(message);
        sentCount++;
      } catch (_) {}
    }
  }
  return sentCount;
}

async function main() {
  console.log("🚀 Zenith WS Server starting (Bun native WebSocket)...");

  const dragonfly = new DragonflyClient(DRAGONFLY_URL);
  await dragonfly.connect();

  dragonfly.subscribe("prices", (message) => {
    try {
      const data = JSON.parse(message);
      const symbol = data.symbol?.toLowerCase();
      if (!symbol) return;
      broadcastToSubscribed(clients, symbol, JSON.stringify({ type: "price_update", data }));
    } catch (err) {
      console.error("Error parsing price message:", err);
    }
  });

  dragonfly.subscribe("depth", (message) => {
    try {
      const data = JSON.parse(message);
      const symbol = data.symbol?.toLowerCase();
      if (!symbol) return;
      broadcastToSubscribed(clients, symbol, JSON.stringify({ type: "depth_update", data }));
    } catch (err) {
      console.error("Error parsing depth message:", err);
    }
  });

  const binance = new BinanceConsumer(BINANCE_WS_URL, TRACKED_SYMBOLS);

  binance.onTrade((trade) => {
    const symbol = trade.symbol.toLowerCase();
    dragonfly.publish("prices", JSON.stringify(trade));
    broadcastToSubscribed(clients, symbol, JSON.stringify({ type: "trade_update", data: trade }));
    if (trade.quantity != null && trade.quantity > 0) {
      insertTrade(trade.symbol, trade.price, trade.quantity, trade.side || "BUY")
        .catch((err) => console.error("[QuestDB] insert error:", err));
    }
  });

  binance.onDepth((depth) => {
    const symbol = depth.symbol.toLowerCase();
    dragonfly.publish("depth", JSON.stringify(depth));
  });

  binance.connect();

  const server = Bun.serve({
    port: PORT,
    fetch(req, server) {
      const url = new URL(req.url);
      const origin = req.headers.get("origin");

      if (!isAllowedOrigin(origin)) {
        console.warn(`CORS blocked origin: ${origin}`);
        return new Response("Not allowed by CORS", { status: 403 });
      }

      if (url.pathname === "/health") {
        return new Response(
          JSON.stringify({
            status: "ok",
            uptime: process.uptime(),
            connections: clients.size,
            symbols: TRACKED_SYMBOLS,
            server: "bun-native-ws",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin || "*" },
          }
        );
      }

      if (url.pathname === "/ws") {
        const ip = getClientIP(req);
        const currentCount = connectionCounts.get(ip) || 0;
        if (currentCount >= MAX_CONNECTIONS_PER_IP) {
          console.warn(`Rate limit exceeded for IP ${ip}`);
          return new Response("Rate limit exceeded", { status: 429 });
        }

        const success = server.upgrade(req, { data: { ip } as any });
        if (success) {
          connectionCounts.set(ip, currentCount + 1);
          return undefined as any;
        }
        return new Response("WebSocket upgrade failed", { status: 400 });
      }

      return new Response("Not found", { status: 404 });
    },
    websocket: {
      open(ws) {
        const ip = (ws.data as any)?.ip || "unknown";
        clients.set(ws, { ip, symbols: new Set(), connectedAt: Date.now() });
        console.log(`🟢 Client connected: ${ip} (total: ${clients.size})`);
      },

      message(ws, message) {
        const info = clients.get(ws);
        if (!info) return;

        try {
          const text = typeof message === "string" ? message : message.toString();
          const cmd = JSON.parse(text);

          if (cmd.type === "subscribe_symbols" && Array.isArray(cmd.symbols)) {
            info.symbols.clear();
            cmd.symbols.forEach((s: string) => info.symbols.add(s.toLowerCase()));
            console.log(`📡 Client ${info.ip} subscribed:`, [...info.symbols]);
          }

          if (cmd.type === "subscribe_symbol" && cmd.symbol) {
            info.symbols.clear();
            info.symbols.add(cmd.symbol.toLowerCase());
            console.log(`📡 Client ${info.ip} subscribed to ${cmd.symbol} channels:`, cmd.channels || "all");
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      },

      close(ws) {
        const info = clients.get(ws);
        if (info) {
          const ip = info.ip;
          const count = connectionCounts.get(ip) || 1;
          if (count <= 1) connectionCounts.delete(ip);
          else connectionCounts.set(ip, count - 1);
          clients.delete(ws);
          console.log(`🔴 Client disconnected: ${ip} (total: ${clients.size})`);
        }
      },
    },
  });

  console.log(`✅ WS Server listening on port ${PORT}`);
  console.log(`📡 Tracking ${TRACKED_SYMBOLS.length} symbols from Binance`);
  console.log(`🐉 Dragonfly Pub/Sub: ${DRAGONFLY_URL}`);
  console.log(`🔒 CORS origins: ${ALLOWED_ORIGINS.join(", ")}`);

  startCandleAggregation();

  setInterval(() => {
    connectionCounts.clear();
  }, RATE_LIMIT_WINDOW_MS);

  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully...");
    server.stop();
    await dragonfly.disconnect();
    binance.disconnect();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
