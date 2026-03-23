import { Redis } from "ioredis";

let redisClient: Redis | null = null;

export const localRedisInit = () => {
  if (process.env.NODE_ENV === "development") {
    redisClient = new Redis({
      host: "redis",
      port: 6379,
    });

    redisClient.on("connect", () => {
      console.log("✅ Local Redis client connected");
    });

    redisClient.on("error", (err: unknown) => {
      console.error("Local Redis connection error:", err);
    });
  } else {
    console.warn(
      "⚠️ Local Redis client not initialized (not in development mode)",
    );
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis not initialized");
  }
  return redisClient;
};

export const isRedisReady = () => redisClient !== null;