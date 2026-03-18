import axios from 'axios';
import { getCache, setCache } from '../utils/cache.js';

const BASE_URL = 'https://api.worldbank.org/v2';

import { supabase } from '../config/supabase.js';

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
  try {
    const { data: dbData, error } = await supabase
      .from('indicator_values')
      .select('year, value, country:country_id!inner(iso3), indicator:indicator_id!inner(code)')
      .eq('country.iso3', countryCode.toUpperCase())
      .eq('indicator.code', indicatorCode)
      .order('year', { ascending: false });

    // Ensure we actually got rows (inner joins correctly filter)
    if (!error && dbData && dbData.length > 0) {
      const formatted = [
        { page: 1, pages: 1, per_page: dbData.length, total: dbData.length },
        dbData.map((row: any) => ({ date: String(row.year), value: Number(row.value) }))
      ];
      await setCache('World_Bank', endpoint, formatted, 24);
      return formatted;
    }
  } catch (e) {
    console.error('DB fetch failed, falling back to API:', e);
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
