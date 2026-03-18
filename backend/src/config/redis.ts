import { Redis } from '@upstash/redis';

// Support both naming conventions for Upstash env vars
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || '';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN || '';

let redisClient: Redis | null = null;

if (UPSTASH_URL && UPSTASH_TOKEN) {
  redisClient = new Redis({
    url: UPSTASH_URL,
    token: UPSTASH_TOKEN,
  });
  console.log('✅ Upstash Redis client initialized');
} else {
  console.warn('⚠️  Upstash Redis credentials not set — Redis caching disabled');
}

export { redisClient };

/**
 * Check if Redis is configured and available
 */
export const isRedisReady = (): boolean => {
  return redisClient !== null;
};
