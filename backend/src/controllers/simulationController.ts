import { Request, Response } from 'express';
import { pgPool, isPostgresReady } from '../config/postgres.js';
import { getCache, setCache } from '../utils/cache.js';
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

/**
 * GET /api/simulation/baseline/:code
 * Returns simulation baseline data for a country
 */
export const getSimulationBaseline = async (req: Request, res: Response) => {
  const code = (req.params.code as string).toUpperCase();

  try {
    if (!isPostgresReady() || !pgPool) {
      return res.status(503).json({ error: 'Postgres is not configured' });
    }

    // Check cache first
    const cacheKey = `simulation_baseline_${code}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const baselineQuery = await pgPool.query(
      `SELECT c.name, c.iso3, c.population, sb.gdp, sb.gdp_growth, sb.life_expectancy,
              sb.co2_emissions, sb.unemployment, sb.hdi, sb.innovation_index, sb.year
       FROM countries c
       JOIN simulation_baselines sb ON sb.country_id = c.id
       WHERE c.iso3 = $1
       LIMIT 1`,
      [code]
    );

    if (baselineQuery.rows.length === 0) {
      return res.status(404).json({ error: `Country ${code} not found` });
    }

    const baseline = baselineQuery.rows[0] as any;

    const result = {
      country: baseline.name,
      iso3: baseline.iso3,
      gdp: Number(baseline.gdp ?? 0),
      gdpGrowth: Number(baseline.gdp_growth ?? 0),
      pop: Number(baseline.population ?? 0),
      lifeExp: Number(baseline.life_expectancy ?? 0),
      co2: Number(baseline.co2_emissions ?? 0),
      unemployment: Number(baseline.unemployment ?? 0),
      hdi: Number(baseline.hdi ?? 0),
      innovationIndex: Number(baseline.innovation_index ?? 0),
      year: baseline.year || 2022,
      happiness: 5.0, // fallback
    };

    // Attach Happiness Data from our unified local JSON
    try {
      if (baseline.name) {
        const hapData = getHappinessData();
        if (hapData[baseline.name]) {
          const yearStr = String(result.year);
          // If exact year doesn't exist, try 2022 or the latest available
          if (hapData[baseline.name][yearStr]) {
             result.happiness = hapData[baseline.name][yearStr];
          } else if (hapData[baseline.name]['2022']) {
             result.happiness = hapData[baseline.name]['2022'];
          } else {
             const availableYears = Object.keys(hapData[baseline.name]).sort();
             if (availableYears.length > 0) result.happiness = hapData[baseline.name][availableYears[availableYears.length - 1]];
          }
        }
      }
    } catch (e) {
      console.error('Failed reading happiness data for baseline:', e);
    }

    // Cache for 6 hours
    await setCache('Simulation', cacheKey, result, 6);

    res.json(result);
  } catch (error) {
    console.error('Simulation baseline error:', error);
    res.status(500).json({ error: 'Failed to fetch simulation baseline' });
  }
};

/**
 * GET /api/simulation/rankings
 * Returns global rankings for all baseline countries
 */
export const getGlobalRankings = async (req: Request, res: Response) => {
  try {
    if (!isPostgresReady() || !pgPool) {
      return res.status(503).json({ error: 'Postgres is not configured' });
    }

    const cacheKey = 'global_rankings';
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const rankingsQuery = await pgPool.query(
      `SELECT c.name, c.iso3, sb.gdp, sb.life_expectancy, sb.co2_emissions, sb.unemployment
       FROM simulation_baselines sb
       JOIN countries c ON c.id = sb.country_id
       ORDER BY sb.gdp DESC NULLS LAST`
    );

    const rankings = rankingsQuery.rows.map((row: any, index: number) => ({
      rank: index + 1,
      country: row.name,
      iso3: row.iso3,
      gdp: Number(row.gdp ?? 0),
      lifeExp: Number(row.life_expectancy ?? 0),
      co2: Number(row.co2_emissions ?? 0),
      unemployment: Number(row.unemployment ?? 0),
    }));

    await setCache('Simulation', cacheKey, rankings, 6);
    res.json(rankings);
  } catch (error) {
    console.error('Rankings error:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
};

/**
 * GET /api/indicators/:code/history
 * Returns time-series data for a specific indicator and country from Supabase
 */
export const getIndicatorHistory = async (req: Request, res: Response) => {
  const code = req.params.code as string;
  const indicator = req.query.indicator as string;

  if (!indicator) {
    return res.status(400).json({ error: 'Missing indicator query parameter' });
  }

  try {
    if (!isPostgresReady() || !pgPool) {
      return res.status(503).json({ error: 'Postgres is not configured' });
    }

    const cacheKey = `indicator_history_${code}_${indicator}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const countryRes = await pgPool.query(
      'SELECT id FROM countries WHERE iso3 = $1 LIMIT 1',
      [code.toUpperCase()]
    );
    const indicatorRes = await pgPool.query(
      'SELECT id, name, unit FROM indicators WHERE code = $1 LIMIT 1',
      [indicator]
    );

    const country = countryRes.rows[0];
    const ind = indicatorRes.rows[0];

    if (!country || !ind) {
      return res.status(404).json({ error: 'Country or indicator not found' });
    }

    const valuesRes = await pgPool.query(
      `SELECT year, value
       FROM indicator_values
       WHERE country_id = $1 AND indicator_id = $2
       ORDER BY year ASC`,
      [country.id, ind.id]
    );

    const result = {
      country: code.toUpperCase(),
      indicator: ind.name,
      unit: ind.unit,
      values: valuesRes.rows.map((row) => ({
        year: row.year,
        value: row.value === null ? null : Number(row.value),
      })),
    };

    await setCache('Indicators', cacheKey, result, 24);
    res.json(result);
  } catch (error) {
    console.error('Indicator history error:', error);
    res.status(500).json({ error: 'Failed to fetch indicator history' });
  }
};
