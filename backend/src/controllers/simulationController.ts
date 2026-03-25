import { Request, Response } from 'express';
import { getPgPool, isPostgresReady } from '../config/postgres.js';
import { supabase, isSupabaseEnabled } from '../config/supabase.js';
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

// Here we are checking if the environment is in development mode or not 
// If it's in development mode, we will use local Postgres, otherwise we will use Supabase
// NOTE -> don't add NODE_ENV in the main .env file as it will break the local Redis connection in development mode

const devEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'development' && isPostgresReady();
};

/**
 * GET /api/simulation/baseline/:code
 * Returns simulation baseline data for a country
 */
export const getSimulationBaseline = async (req: Request, res: Response) => {
  const code = (req.params.code as string).toUpperCase();

  try {
    // Check cache first
    const cacheKey = `simulation_baseline_${code}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    let result: any;

    if (devEnvironment()) {
      const baselineQuery = await getPgPool().query(
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
      result = {
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
        happiness: 5.0,
      };
    } else {
      if (!isSupabaseEnabled || !supabase) {
        return res.status(503).json({ error: 'Supabase is not configured' });
      }

      const { data: country, error: countryErr } = await supabase
        .from('countries')
        .select('id, name, iso3, population')
        .eq('iso3', code)
        .single();

      if (countryErr || !country) {
        return res.status(404).json({ error: `Country ${code} not found` });
      }

      const { data: baseline, error: baselineErr } = await supabase
        .from('simulation_baselines')
        .select('*')
        .eq('country_id', country.id)
        .single();

      if (baselineErr || !baseline) {
        return res.status(404).json({ error: `No simulation baseline data for ${code}` });
      }

      result = {
        country: country.name,
        iso3: country.iso3,
        gdp: baseline.gdp,
        gdpGrowth: baseline.gdp_growth,
        pop: country.population || 0,
        lifeExp: baseline.life_expectancy,
        co2: baseline.co2_emissions,
        unemployment: baseline.unemployment,
        hdi: baseline.hdi,
        innovationIndex: baseline.innovation_index,
        year: baseline.year || 2022,
        happiness: 5.0,
      };
    }

    if (!devEnvironment() && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Dev mode detected but local Postgres is unavailable; using Supabase fallback');
    }

    result = {
      ...result,
      happiness: 5.0, // fallback
    };

    // Attach Happiness Data from our unified local JSON
     try {
      if (result.country) {
        const hapData = getHappinessData();
        if (hapData[result.country]) {
          const yearStr = String(result.year);
          // If exact year doesn't exist, try 2022 or the latest available
         if (hapData[result.country][yearStr]) {
           result.happiness = hapData[result.country][yearStr];
         } else if (hapData[result.country]['2022']) {
           result.happiness = hapData[result.country]['2022'];
          } else {
           const availableYears = Object.keys(hapData[result.country]).sort();
           if (availableYears.length > 0) result.happiness = hapData[result.country][availableYears[availableYears.length - 1]];
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
    const cacheKey = 'global_rankings';
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    let rankings: any[] = [];

    if (devEnvironment()) {
      const rankingsQuery = await getPgPool().query(
        `SELECT c.name, c.iso3, sb.gdp, sb.life_expectancy, sb.co2_emissions, sb.unemployment
         FROM simulation_baselines sb
         JOIN countries c ON c.id = sb.country_id
         ORDER BY sb.gdp DESC NULLS LAST`
      );

      rankings = rankingsQuery.rows.map((row: any, index: number) => ({
        rank: index + 1,
        country: row.name,
        iso3: row.iso3,
        gdp: Number(row.gdp ?? 0),
        lifeExp: Number(row.life_expectancy ?? 0),
        co2: Number(row.co2_emissions ?? 0),
        unemployment: Number(row.unemployment ?? 0),
      }));
    } else {
      if (!isSupabaseEnabled || !supabase) {
        return res.status(503).json({ error: 'Supabase is not configured' });
      }

      const { data, error } = await supabase
        .from('simulation_baselines')
        .select(
          `
          gdp, life_expectancy, co2_emissions, unemployment,
          countries (name, iso3)
        `
        )
        .order('gdp', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      rankings = (data || []).map((row: any, index: number) => ({
        rank: index + 1,
        country: row.countries?.name,
        iso3: row.countries?.iso3,
        gdp: row.gdp,
        lifeExp: row.life_expectancy,
        co2: row.co2_emissions,
        unemployment: row.unemployment,
      }));
    }

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
    const cacheKey = `indicator_history_${code}_${indicator}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    let result: any;

    if (devEnvironment()) {
      const [countryRes, indicatorRes] = await Promise.all([
        getPgPool().query(
          'SELECT id FROM countries WHERE iso3 = $1 LIMIT 1',
          [code.toUpperCase()]
        ),
        getPgPool().query(
          'SELECT id, name, unit FROM indicators WHERE code = $1 LIMIT 1',
          [indicator]
        )
      ]);

      const country = countryRes.rows[0];
      const ind = indicatorRes.rows[0];

      if (!country || !ind) {
        return res.status(404).json({ error: 'Country or indicator not found' });
      }

      const valuesRes = await getPgPool().query(
        `SELECT year, value
         FROM indicator_values
         WHERE country_id = $1 AND indicator_id = $2
         ORDER BY year ASC`,
        [country.id, ind.id]
      );

      result = {
        country: code.toUpperCase(),
        indicator: ind.name,
        unit: ind.unit,
        values: valuesRes.rows.map((row) => ({
          year: row.year,
          value: row.value === null ? null : Number(row.value),
        })),
      };
    } else {
      if (!isSupabaseEnabled || !supabase) {
        return res.status(503).json({ error: 'Supabase is not configured' });
      }

      const [{ data: country }, { data: ind }] = await Promise.all([
        supabase
          .from('countries')
          .select('id')
          .eq('iso3', code.toUpperCase())
          .single(),
        supabase
          .from('indicators')
          .select('id, name, unit')
          .eq('code', indicator)
          .single()
      ]);

      if (!country || !ind) {
        return res.status(404).json({ error: 'Country or indicator not found' });
      }

      const { data: values, error } = await supabase
        .from('indicator_values')
        .select('year, value')
        .eq('country_id', country.id)
        .eq('indicator_id', ind.id)
        .order('year', { ascending: true });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      result = {
        country: code.toUpperCase(),
        indicator: ind.name,
        unit: ind.unit,
        values: values || [],
      };
    }

    await setCache('Indicators', cacheKey, result, 24);
    res.json(result);
  } catch (error) {
    console.error('Indicator history error:', error);
    res.status(500).json({ error: 'Failed to fetch indicator history' });
  }
};
