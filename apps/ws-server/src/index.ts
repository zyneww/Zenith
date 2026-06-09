// apps/ws-server/src/index.ts
import BinanceConsumer from "./binance.js";
import DragonflyClient from "./dragonfly.js";

const PORT = parseInt(process.env.PORT || "3001");
const DRAGONFLY_URL = process.env.DRAGONFLY_URL || "redis://:dragonfly_dev@localhost:6379";
const BINANCE_WS_URL =
  process.env.BINANCE_WS_URL || "wss://stream.binance.com:9443/ws";

// Parse CORS origins from env
const rawCors = process.env.CORS_ORIGINS || "http://localhost:3000";
const ALLOWED_ORIGINS = rawCors.split(",").map((s) => s.trim());

// Top symbols to track
const TRACKED_SYMBOLS = [
  "btcusdt",
  "ethusdt",
  "solusdt",
  "bnbusdt",
  "xrpusdt",
  "adausdt",
  "dogeusdt",
  "maticusdt",
  "dotusdt",
  "avaxusdt",
];

// Client tracking
interface ClientInfo {
  ip: string;
  symbols: Set<string>;
  connectedAt: number;
}

const clients = new Map<any, ClientInfo>();

// Simple rate limiter per IP: max 10 connections per IP
const connectionCounts = new Map<string, number>();
const MAX_CONNECTIONS_PER_IP = 10;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

// Get client IP from request
function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

// Check if origin is allowed
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

async function main() {
  console.log("🚀 Zenith WS Server starting (Bun native WebSocket)...");

  // Dragonfly client
  const dragonfly = new DragonflyClient(DRAGONFLY_URL);
  await dragonfly.connect();

  // Subscribe to price updates from Dragonfly and broadcast to WebSocket clients
  dragonfly.subscribe("prices", (message) => {
    try {
      const data = JSON.parse(message);
      const symbol = data.symbol?.toLowerCase();
      if (!symbol) return;

      // Broadcast to all clients subscribed to this symbol
      const broadcastMessage = JSON.stringify({ type: "price_update", data });
      let sentCount = 0;

      for (const [ws, info] of clients.entries()) {
        if (info.symbols.has(symbol)) {
          try {
            ws.send(broadcastMessage);
            sentCount++;
          } catch (err) {
            // Client disconnected, will be cleaned up on close
          }
        }
      }

      // Also broadcast to clients with no specific subscription (fallback)
      if (sentCount === 0) {
        for (const [ws, info] of clients.entries()) {
          if (info.symbols.size === 0) {
            try {
              ws.send(broadcastMessage);
            } catch (err) {
              // Client disconnected
            }
          }
        }
      }
    } catch (err) {
      console.error("Error parsing price message:", err);
    }
  });

  // Binance WebSocket consumer
  const binance = new BinanceConsumer(BINANCE_WS_URL, TRACKED_SYMBOLS);
  binance.onTrade((trade) => {
    // Publish to Dragonfly
    dragonfly.publish("prices", JSON.stringify(trade));
  });
  binance.connect();

  // Bun server with WebSocket support
  const server = Bun.serve({
    port: PORT,
    fetch(req, server) {
      const url = new URL(req.url);
      const origin = req.headers.get("origin");

      // CORS check
      if (!isAllowedOrigin(origin)) {
        console.warn(`CORS blocked origin: ${origin}`);
        return new Response("Not allowed by CORS", { status: 403 });
      }

      // Health check endpoint
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
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": origin || "*",
            },
          }
        );
      }

      // WebSocket upgrade endpoint
      if (url.pathname === "/ws") {
        const ip = getClientIP(req);

        // Rate limiting
        const currentCount = connectionCounts.get(ip) || 0;
        if (currentCount >= MAX_CONNECTIONS_PER_IP) {
          console.warn(`Rate limit exceeded for IP ${ip}`);
          return new Response("Rate limit exceeded", { status: 429 });
        }

        const success = server.upgrade(req, {
          data: { ip } as any,
        });

        if (success) {
          connectionCounts.set(ip, currentCount + 1);
          return undefined as any; // Bun expects this for successful upgrade
        }

        return new Response("WebSocket upgrade failed", { status: 400 });
      }

      return new Response("Not found", { status: 404 });
    },
    websocket: {
      open(ws) {
        const ip = (ws.data as any)?.ip || "unknown";
        clients.set(ws, {
          ip,
          symbols: new Set(),
          connectedAt: Date.now(),
        });
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
            cmd.symbols.forEach((s: string) => {
              info.symbols.add(s.toLowerCase());
            });
            console.log(`📡 Client ${info.ip} subscribed to:`, [...info.symbols]);
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
          if (count <= 1) {
            connectionCounts.delete(ip);
          } else {
            connectionCounts.set(ip, count - 1);
          }
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
  console.log(`🚀 Bun native WebSocket enabled`);

  // Rate limiter cleanup window
  setInterval(() => {
    connectionCounts.clear();
    console.log("🧹 Rate limiter window reset");
  }, RATE_LIMIT_WINDOW_MS);

  // Graceful shutdown
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
