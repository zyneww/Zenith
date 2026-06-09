import { Server } from "socket.io";
import { createServer } from "http";
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

// Simple rate limiter per IP: max 10 connections per IP
const connectionCounts = new Map<string, number>();
const MAX_CONNECTIONS_PER_IP = 10;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

async function main() {
  console.log("🚀 Zenith WS Server starting...");

  // HTTP server for Socket.IO
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`CORS blocked origin: ${origin}`);
          callback(new Error("Not allowed by CORS"), false);
        }
      },
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  // Dragonfly client
  const dragonfly = new DragonflyClient(DRAGONFLY_URL);
  await dragonfly.connect();

  // Subscribe to price updates from Dragonfly and broadcast to Socket.IO clients
  dragonfly.subscribe("prices", (message) => {
    try {
      const data = JSON.parse(message);
      const symbol = data.symbol?.toLowerCase();
      if (symbol) {
        // Broadcast only to clients subscribed to this symbol
        io.to(`sym:${symbol}`).emit("price_update", data);
      } else {
        // Fallback: broadcast to all if no symbol found
        io.emit("price_update", data);
      }
    } catch (err) {
      console.error("Error parsing price message:", err);
    }
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    const clientIp = socket.handshake.headers["x-forwarded-for"] ||
      socket.handshake.address || "unknown";
    const ipKey = String(clientIp).split(",")[0].trim();

    // Rate limiting
    const currentCount = connectionCounts.get(ipKey) || 0;
    if (currentCount >= MAX_CONNECTIONS_PER_IP) {
      console.warn(`Rate limit exceeded for IP ${ipKey}`);
      socket.emit("error", "Rate limit exceeded. Too many connections.");
      socket.disconnect(true);
      return;
    }
    connectionCounts.set(ipKey, currentCount + 1);

    console.log(`Client connected: ${socket.id} from ${ipKey}`);

    socket.on("subscribe_symbols", (symbols: string[]) => {
      console.log(`Client ${socket.id} subscribed to:`, symbols);
      // Leave previous symbol rooms
      const currentRooms = Array.from(socket.rooms).filter((r) => r.startsWith("sym:"));
      currentRooms.forEach((room) => socket.leave(room));
      // Join new symbol rooms
      symbols.forEach((s) => {
        socket.join(`sym:${s.toLowerCase()}`);
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      const count = connectionCounts.get(ipKey) || 1;
      if (count <= 1) {
        connectionCounts.delete(ipKey);
      } else {
        connectionCounts.set(ipKey, count - 1);
      }
    });
  });

  // Rate limiter cleanup window
  setInterval(() => {
    connectionCounts.clear();
  }, RATE_LIMIT_WINDOW_MS);

  // Binance WebSocket consumer
  const binance = new BinanceConsumer(BINANCE_WS_URL, TRACKED_SYMBOLS);
  binance.onTrade((trade) => {
    // Publish to Dragonfly
    dragonfly.publish("prices", JSON.stringify(trade));
  });

  binance.connect();

  // Health check endpoint
  httpServer.on("request", (req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          uptime: process.uptime(),
          connections: io.engine.clientsCount,
          symbols: TRACKED_SYMBOLS,
        })
      );
      return;
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`✅ WS Server listening on port ${PORT}`);
    console.log(`📡 Tracking ${TRACKED_SYMBOLS.length} symbols from Binance`);
    console.log(`🐉 Dragonfly Pub/Sub: ${DRAGONFLY_URL}`);
    console.log(`🔒 CORS origins: ${ALLOWED_ORIGINS.join(", ")}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully...");
    io.close();
    httpServer.close();
    await dragonfly.disconnect();
    binance.disconnect();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
