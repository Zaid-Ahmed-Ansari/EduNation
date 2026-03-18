import axios from 'axios';
import { getCache, setCache } from '../utils/cache.js';

const BASE_URL = 'https://restcountries.com/v3.1';

export const fetchAllCountries = async () => {
  const endpoint = `${BASE_URL}/all?fields=name,cca2,cca3,region,population,flags,latlng`;
  const cached = await getCache('rest_countries_all');
  if (cached) return cached;

  try {
    const response = await axios.get(endpoint);
    await setCache('REST_Countries', 'rest_countries_all', response.data, 24);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch from REST Countries API:', error);
    throw error;
  }
};

export const fetchCountryByCode = async (code: string) => {
  const endpoint = `${BASE_URL}/alpha/${code}`;
  const cached = await getCache(endpoint);
  if (cached) return cached;

  try {
    const response = await axios.get(endpoint);
    await setCache('REST_Countries', endpoint, response.data, 24);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch country ${code}:`, error);
    throw error;
  }
};

export const fetchCountryNeighbours = async (codes: string[]) => {
  if (!codes || codes.length === 0) return [];
  const endpoint = `${BASE_URL}/alpha?codes=${codes.join(',')}&fields=name,cca2,cca3,region,population,flags,latlng,borders`;
  const cached = await getCache(endpoint);
  if (cached) return cached;

  try {
    const response = await axios.get(endpoint);
    await setCache('REST_Countries', endpoint, response.data, 24);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch neighbours ${codes}:`, error);
    throw error;
  }
};

