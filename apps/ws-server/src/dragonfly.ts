import Redis from "ioredis";

export default class DragonflyClient {
  private pub: Redis;
  private sub: Redis;
  private url: string;
  private handlers: Map<string, (message: string) => void> = new Map();

  constructor(url: string) {
    this.url = url;
    this.pub = new Redis(url);
    this.sub = new Redis(url);

    this.sub.on("message", (channel, message) => {
      const handler = this.handlers.get(channel);
      if (handler) {
        handler(message);
      }
    });

    this.pub.on("error", (err) => {
      console.error("Dragonfly pub error:", err);
    });
    this.sub.on("error", (err) => {
      console.error("Dragonfly sub error:", err);
    });
  }

  async connect(): Promise<void> {
    await this.pub.ping();
    await this.sub.ping();
    console.log("🐉 Connected to Dragonfly");
  }

  async disconnect(): Promise<void> {
    await this.pub.quit();
    await this.sub.quit();
    console.log("🐉 Disconnected from Dragonfly");
  }

  subscribe(channel: string, handler: (message: string) => void): void {
    this.handlers.set(channel, handler);
    this.sub.subscribe(channel);
  }

  publish(channel: string, message: string): void {
    this.pub.publish(channel, message);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.pub.setex(key, ttl, value);
    } else {
      await this.pub.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.pub.get(key);
  }
}
