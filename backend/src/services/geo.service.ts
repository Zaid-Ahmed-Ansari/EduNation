import axios from 'axios';
import { getCache, setCache } from '../utils/cache.js';

const GEO_URL = 'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';

export const fetchGeoJson = async () => {
  const endpoint = 'geo_countries_geojson';
  const cached = await getCache(endpoint);
  if (cached) return cached;

  try {
    const response = await axios.get(GEO_URL);
    // Cache for 30 days as borders rarely change
    await setCache('GeoJSON', endpoint, response.data, 24 * 30);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch GeoJSON map geometry:', error);
    throw error;
  }
};
