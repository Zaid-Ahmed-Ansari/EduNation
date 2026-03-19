import fs from 'fs';
import path from 'path';

let owidCo2Cache: Record<string, any[]> | null = null;

const loadOwidCo2 = () => {
  if (!owidCo2Cache) {
    const jsonPath = path.join(process.cwd(), 'src/data/owid_co2.json');
    if (fs.existsSync(jsonPath)) {
      owidCo2Cache = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } else {
      owidCo2Cache = {};
      console.warn('⚠️ owid_co2.json not found! Please run `npx tsx src/scripts/ingest-owid.ts`');
    }
  }
  return owidCo2Cache;
};

export const fetchOwidData = async (type: 'co2' | 'energy', iso3: string) => {
  if (type === 'co2') {
    const data = loadOwidCo2();
    return data?.[iso3] || [];
  }
  
  // Note: energy data is not currently used by the frontend.
  // If needed in the future, a similar ingest script should be added.
  return [];
};
