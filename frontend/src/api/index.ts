import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// ═══ Country Data ═══
export const getCountries = async () => {
  const { data } = await api.get('/countries');
  return data;
};

export const getCountryByCode = async (code: string) => {
  const { data } = await api.get(`/country/${code}`);
  return data;
};

export const getCountryNeighbours = async (code: string) => {
  const { data } = await api.get(`/country/${code}/neighbours`);
  return data;
};

export const getCountryIndicators = async (code: string) => {
  const { data } = await api.get(`/country/${code}/indicators`);
  return data;
};

export const getCountryAnalytics = async (code: string) => {
  const { data } = await api.get(`/country/${code}/analytics`);
  return data;
};

export const getGeo = async () => {
  const { data } = await api.get('/geo');
  return data;
};

// ═══ Simulation ═══
export const getSimulationBaseline = async (code: string) => {
  const { data } = await api.get(`/simulation/baseline/${code}`);
  return data;
};

export const getGlobalRankings = async () => {
  const { data } = await api.get('/simulation/rankings');
  return data;
};

// ═══ Indicator History (from Supabase) ═══
export const getIndicatorHistory = async (code: string, indicatorCode: string) => {
  const { data } = await api.get(`/indicators/${code}/history?indicator=${indicatorCode}`);
  return data;
};
