import axios from 'axios';
import { getCache, setCache } from '../utils/cache.js';
import { pgPool, isPostgresReady } from '../config/postgres.js';

const BASE_URL = 'https://api.worldbank.org/v2';

/**
 * Fetch raw indicator data from World Bank API 
 * Architecture: Redis -> DB -> API
 */
export const fetchIndicator = async (countryCode: string, indicatorCode: string) => {
  const endpoint = `wb_${countryCode}_${indicatorCode}`;
  
  // 1. Redis Cache (via getCache which checks memory/redis/api_cache)
  const cached = await getCache(endpoint);
  if (cached) return cached;

  // 2. Relational DB check (indicator_values)
  if (isPostgresReady() && pgPool) {
    try {
      const dbRes = await pgPool.query(
        `SELECT iv.year, iv.value
         FROM indicator_values iv
         JOIN countries c ON c.id = iv.country_id
         JOIN indicators i ON i.id = iv.indicator_id
         WHERE c.iso3 = $1 AND i.code = $2
         ORDER BY iv.year DESC`,
        [countryCode.toUpperCase(), indicatorCode]
      );

      if (dbRes.rows.length > 0) {
        const formatted = [
          { page: 1, pages: 1, per_page: dbRes.rows.length, total: dbRes.rows.length },
          dbRes.rows.map((row: any) => ({ date: String(row.year), value: Number(row.value) }))
        ];
        await setCache('World_Bank', endpoint, formatted, 24);
        return formatted;
      }
    } catch (e) {
      console.error('DB fetch failed, falling back to API:', e);
    }
  }

  // 3. API Fallback
  try {
    const url = `${BASE_URL}/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=50`;
    const response = await axios.get(url);
    const data = response.data;
    await setCache('World_Bank', endpoint, data, 24);
    return data;
  } catch (error) {
    console.error(`Failed to fetch WB indicator ${indicatorCode} for ${countryCode}:`, error);
    throw error;
  }
};

/**
 * Fetch and extract the latest non-null value for a given indicator.
 * Returns { value, year } or null.
 */
export const fetchLatestIndicator = async (
  countryCode: string,
  indicatorCode: string
): Promise<{ value: number; year: number } | null> => {
  try {
    const data = await fetchIndicator(countryCode, indicatorCode);
    const records = data?.[1] || [];
    const valid = records.find((d: any) => d.value !== null);
    if (valid) {
      return { value: valid.value, year: parseInt(valid.date) };
    }
    return null;
  } catch {
    return null;
  }
};
