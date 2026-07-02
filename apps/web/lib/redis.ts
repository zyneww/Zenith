import Redis from "ioredis";

// ponytail: single shared Redis/Dragonfly client for all API routes
export const redis = new Redis(
  process.env.DRAGONFLY_URL ||
    process.env.REDIS_URL ||
    "redis://:dragonfly_dev@localhost:6379"
);
