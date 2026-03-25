import { Request, Response } from 'express';
import { fetchAllCountries, fetchCountryByCode, fetchCountryNeighbours } from '../services/restCountries.service.js';
import { fetchIndicator } from '../services/worldBank.service.js';
import { fetchOwidData } from '../services/owid.service.js';
import { fetchGeoJson } from '../services/geo.service.js';
import fs from 'fs';
import path from 'path';

// Memory Caching local JSON to prevent recurrent disk I/O on every request
let hapDataCache: any = null;
const getHappinessData = () => {
  if (!hapDataCache) {
    const hapPath = path.join(process.cwd(), 'src/data/unified_happiness.json');
    if (fs.existsSync(hapPath)) {
      hapDataCache = JSON.parse(fs.readFileSync(hapPath, 'utf8'));
    } else {
      hapDataCache = {};
    }
  }
  return hapDataCache;
};

export const getCountries = async (req: Request, res: Response) => {
  try {
    const data = await fetchAllCountries();
    // Simplify data payload for performance, extracting what's needed for the globe
    const simplified = data.map((c: any) => ({
      name: c.name.common,
      cca2: c.cca2,
      cca3: c.cca3,
      region: c.region,
      population: c.population,
      flag: c.flags?.svg,
      latlng: c.latlng
    }));
    res.json(simplified);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
};

export const getCountryByCode = async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    const data = await fetchCountryByCode(code);
    res.json(data[0] || data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch country details' });
  }
};

export const getCountryNeighbours = async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    const countryData = await fetchCountryByCode(code);
    const borders = countryData[0]?.borders || countryData?.borders;
    
    if (!borders || borders.length === 0) {
      return res.json([]);
    }
    
    const neighbours = await fetchCountryNeighbours(borders);
    
    // Simplify for globe/ui usage
    const simplified = neighbours.map((c: any) => ({
      name: c.name.common,
      cca2: c.cca2,
      cca3: c.cca3,
      region: c.region,
      population: c.population,
      flag: c.flags?.svg,
      latlng: c.latlng
    }));
    
    res.json(simplified);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch country neighbours' });
  }
};

export const getCountryIndicators = async (req: Request, res: Response) => {
  const code = req.params.code as string;
  try {
    const indicatorsList = [
      { key: 'gdp', id: 'NY.GDP.MKTP.CD' },
      { key: 'pop', id: 'SP.POP.TOTL' },
      { key: 'lifeExp', id: 'SP.DYN.LE00.IN' },
      { key: 'inflation', id: 'FP.CPI.TOTL.ZG' },
      { key: 'unemployment', id: 'SL.UEM.TOTL.ZS' },
      { key: 'gini', id: 'SI.POV.GINI' },
      { key: 'fdi', id: 'BX.KLT.DINV.CD.WD' },
      { key: 'military', id: 'MS.MIL.XPND.GD.ZS' },
      { key: 'healthSpend', id: 'SH.XPD.CHEX.GD.ZS' },
      { key: 'eduSpend', id: 'SE.XPD.TOTL.GD.ZS' },
      { key: 'techExports', id: 'TX.VAL.TECH.CD' },
      { key: 'internet', id: 'IT.NET.USER.ZS' },
      { key: 'mobile', id: 'IT.CEL.SETS.P2' },
      { key: 'poverty', id: 'SI.POV.DDAY' },
      { key: 'electricity', id: 'EG.ELC.ACCS.ZS' },
      { key: 'renewables', id: 'EG.FEC.RNEW.ZS' },
      { key: 'forest', id: 'AG.LND.FRST.ZS' },
      { key: 'agriLand', id: 'AG.LND.AGRI.ZS' },
      { key: 'urbanPop', id: 'SP.URB.TOTL.IN.ZS' },
      { key: 'literacy', id: 'SE.ADT.LITR.ZS' },
      { key: 'laborForce', id: 'SL.TLF.TOTL.IN' },
      { key: 'exports', id: 'NE.EXP.GNFS.CD' },
      { key: 'imports', id: 'NE.IMP.GNFS.CD' },
      { key: 'debt', id: 'GC.DOD.TOTL.GD.ZS' },
      { key: 'tourism', id: 'ST.INT.ARVL' }
    ];

    // Fire all indicator fetches concurrently.
    const indicatorPromise = Promise.all(
      indicatorsList.map(async (ind) => {
        try {
          const data = await fetchIndicator(code, ind.id);
          return { [ind.key]: data };
        } catch {
          return { [ind.key]: null }; // Graceful failure per metric
        }
      })
    );
    
    // Concurrently fetch country details for happiness data mapping
    const countryPromise = fetchCountryByCode(code).catch(() => null);

    const [results, countryDetails] = await Promise.all([indicatorPromise, countryPromise]);

    // Merge array of objects into a single payload object
    const payload = Object.assign({}, ...results);
    
    // Attach Happiness Data
    try {
      const countryName = countryDetails[0]?.name?.common || countryDetails?.name?.common;
      if (countryName) {
        const hapData = getHappinessData();
        if (hapData[countryName]) {
          const hapScores = Object.entries(hapData[countryName]).map(([year, val]) => ({ date: year, value: val as number }));
          hapScores.sort((a, b) => parseInt(b.date) - parseInt(a.date));
          payload.happiness = [ { page: 1, pages: 1, per_page: 50, total: hapScores.length }, hapScores ];
        } else {
          payload.happiness = null;
        }
      }
    } catch (e) {
      console.error('Failed processing happiness data:', e);
      payload.happiness = null;
    }

    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch indicators' });
  }
};

export const getCountryAnalytics = async (req: Request, res: Response) => {
  const code = req.params.code as string;
  try {
    // Fetch climate data representing history
    const co2Data = await fetchOwidData('co2', code);
    res.json({ co2: co2Data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

export const getGeoGeometry = async (req: Request, res: Response) => {
  try {
    const data = await fetchGeoJson();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch map geometry' });
  }
};
