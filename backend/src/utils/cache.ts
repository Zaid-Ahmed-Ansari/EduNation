import { supabase, isSupabaseEnabled } from '../config/supabase.js';
import { redisClient, isRedisReady } from '../config/redis.js';
import NodeCache from 'node-cache';

// L1 Memory Cache: 5 minutes TTL (short lived to prevent memory bloat, but long enough to absorb traffic spikes from same country load)
const memCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Multi-tier cache: 
 * L1: NodeCache in-memory (5 min) → fast, zero network
 * L2: Upstash Redis (fast) → prevents DB hits across server restarts
 * L3: Supabase api_cache table (persistent) → null (miss)
 */
export const getCache = async (endpoint: string): Promise<any | null> => {
  // Tier 1: In-Memory NodeCache
  const l1Data = memCache.get(`nh:${endpoint}`);
  if (l1Data) return l1Data;

  // Tier 2: Try Upstash Redis
  if (isRedisReady() && redisClient) {
    try {
      const redisData = await redisClient.get<any>(`nh:${endpoint}`);
      if (redisData) {
        // Backfill L1 Memory Cache
        memCache.set(`nh:${endpoint}`, redisData);
        return redisData; // Upstash auto-deserializes JSON
      }
    } catch (err) {
      console.warn('Redis GET failed:', err);
    }
  }

  // Tier 3: Try Supabase api_cache (only when enabled)
  if (!isSupabaseEnabled) return null;

  try {
    const { data, error } = await supabase
      .from('api_cache')
      .select('response, expires_at')
      .eq('endpoint', endpoint)
      .order('cached_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (now > expiresAt) return null; // Expired

    // Backfill Redis if available
    if (isRedisReady() && redisClient) {
      const ttlSeconds = Math.max(1, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      redisClient.set(`nh:${endpoint}`, data.response, { ex: ttlSeconds }).catch(() => {});
    }
    
    // Backfill L1 Memory Cache
    memCache.set(`nh:${endpoint}`, data.response);

    return data.response;
  } catch (err) {
    console.error(`Cache fetch failed for ${endpoint}:`, err);
    return null;
  }
};

/**
 * Store data in both Upstash Redis and Supabase
 */
export const setCache = async (
  source: string,
  endpoint: string,
  response: any,
  ttlHours: number = 24
): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);

  // Write to Upstash Redis
  if (isRedisReady() && redisClient) {
    try {
      const ttlSeconds = ttlHours * 3600;
      await redisClient.set(`nh:${endpoint}`, response, { ex: ttlSeconds });
    } catch (err) {
      console.warn('Redis SET failed:', err);
    }
  }
  
  // Write to L1 Cache
  memCache.set(`nh:${endpoint}`, response);

  // Write to Supabase (persistent backup) when enabled
  if (!isSupabaseEnabled) return;

  try {
    await supabase.from('api_cache').delete().eq('endpoint', endpoint);
    const { error } = await supabase.from('api_cache').insert({
      source,
      endpoint,
      response,
      expires_at: expiresAt.toISOString(),
    });
    if (error) {
      console.error('Supabase cache set error:', error.message);
    }
  } catch (err) {
    console.error(`Cache set failed for ${endpoint}:`, err);
  }
};
