import axios from 'axios';
import { parse } from 'csv-parse/sync';
import { getCache, setCache } from '../utils/cache.js';

const CO2_URL = 'https://nyc3.digitaloceanspaces.com/owid-public/data/co2/owid-co2-data.csv';
const ENERGY_URL = 'https://nyc3.digitaloceanspaces.com/owid-public/data/energy/owid-energy-data.csv';

// Note: OWID CSVs are massive. We should fetch, parse, and extract only the relevant country data
// and cache the extracted chunk so we don't hold the entire CSV in memory constantly.

export const fetchOwidData = async (type: 'co2' | 'energy', iso3: string) => {
  const url = type === 'co2' ? CO2_URL : ENERGY_URL;
  const endpoint = `owid_${type}_${iso3}`;
  const cached = await getCache(endpoint);
  if (cached) return cached;

  try {
    // First, see if we cached the full filtered map somewhere (advanced enhancement)
    // For now, fetch and parse specifically for the requested country
    const response = await axios.get(url, { responseType: 'text' });
    const records = parse(response.data, {
      columns: true,
      skip_empty_lines: true,
    });

    // Filter by iso3
    const countryData = records.filter((row: any) => row.iso_code === iso3);

    // Minimize payload
    const minimized = countryData.map((row: any) => {
      if (type === 'co2') {
        return {
          year: parseInt(row.year, 10),
          co2: parseFloat(row.co2) || null,
          co2_per_capita: parseFloat(row.co2_per_capita) || null,
        };
      } else {
        return {
          year: parseInt(row.year, 10),
          renewables_share_energy: parseFloat(row.renewables_share_energy) || null,
          fossil_share_energy: parseFloat(row.fossil_share_energy) || null,
          primary_energy_consumption: parseFloat(row.primary_energy_consumption) || null
        };
      }
    });

    await setCache('OWID', endpoint, minimized, 24);
    return minimized;
  } catch (error) {
    console.error(`Failed to fetch OWID ${type} for ${iso3}:`, error);
    throw error;
  }
};
