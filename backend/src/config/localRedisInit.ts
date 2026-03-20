import { Redis } from "ioredis";

export const localRedisInit = () => {
  let localRedisClient: Redis | null = null;

  if (process.env.NODE_ENV === "development") {
    localRedisClient = new Redis({
      host: "redis",
      port: 6379,
    });
    localRedisClient.on("connect", () => {
      console.log("✅ Local Redis client connected");
    });
    localRedisClient.on("error", (err: unknown) => {
      console.error("Local Redis connection error:", err);
    });
  } else {
    console.warn(
      "⚠️ Local Redis client not initialized (not in development mode)",
    );
  }
};
