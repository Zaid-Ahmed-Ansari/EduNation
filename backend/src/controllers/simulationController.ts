import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { getCache, setCache } from '../utils/cache.js';
import fs from 'fs';
import path from 'path';

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

    // Look up country
    const { data: country, error: countryErr } = await supabase
      .from('countries')
      .select('id, name, iso3')
      .eq('iso3', code)
      .single();

    if (countryErr || !country) {
      return res.status(404).json({ error: `Country ${code} not found` });
    }

    // Get baseline
    const { data: baseline, error: baselineErr } = await supabase
      .from('simulation_baselines')
      .select('*')
      .eq('country_id', country.id)
      .single();

    if (baselineErr || !baseline) {
      // Fallback: try to compute from indicator_values
      return res.status(404).json({ error: `No simulation baseline data for ${code}` });
    }

    const result = {
      country: country.name,
      iso3: country.iso3,
      gdp: baseline.gdp,
      gdpGrowth: baseline.gdp_growth,
      pop: 0, // Will be filled from countries table
      lifeExp: baseline.life_expectancy,
      co2: baseline.co2_emissions,
      unemployment: baseline.unemployment,
      hdi: baseline.hdi,
      innovationIndex: baseline.innovation_index,
      year: baseline.year || 2022,
      happiness: 5.0, // fallback
    };

    // Attach Happiness Data from our unified local JSON
    try {
      const hapPath = path.join(process.cwd(), 'src/data/unified_happiness.json');
      if (fs.existsSync(hapPath) && country.name) {
        const hapData = JSON.parse(fs.readFileSync(hapPath, 'utf8'));
        if (hapData[country.name]) {
          const yearStr = String(result.year);
          // If exact year doesn't exist, try 2022 or the latest available
          if (hapData[country.name][yearStr]) {
             result.happiness = hapData[country.name][yearStr];
          } else if (hapData[country.name]['2022']) {
             result.happiness = hapData[country.name]['2022'];
          } else {
             const availableYears = Object.keys(hapData[country.name]).sort();
             if (availableYears.length > 0) result.happiness = hapData[country.name][availableYears[availableYears.length - 1]];
          }
        }
      }
    } catch (e) {
      console.error('Failed reading happiness data for baseline:', e);
    }

    // Fill population from countries table
    const { data: countryFull } = await supabase
      .from('countries')
      .select('population')
      .eq('id', country.id)
      .single();
    if (countryFull) result.pop = countryFull.population;

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

    const { data, error } = await supabase
      .from('simulation_baselines')
      .select(`
        gdp, life_expectancy, co2_emissions, unemployment,
        countries (name, iso3)
      `)
      .order('gdp', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const rankings = (data || []).map((row: any, index: number) => ({
      rank: index + 1,
      country: row.countries?.name,
      iso3: row.countries?.iso3,
      gdp: row.gdp,
      lifeExp: row.life_expectancy,
      co2: row.co2_emissions,
      unemployment: row.unemployment,
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
    const cacheKey = `indicator_history_${code}_${indicator}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    // Resolve IDs
    const { data: country } = await supabase.from('countries').select('id').eq('iso3', code.toUpperCase()).single();
    const { data: ind } = await supabase.from('indicators').select('id, name, unit').eq('code', indicator).single();

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

    const result = {
      country: code.toUpperCase(),
      indicator: ind.name,
      unit: ind.unit,
      values: values || [],
    };

    await setCache('Indicators', cacheKey, result, 24);
    res.json(result);
  } catch (error) {
    console.error('Indicator history error:', error);
    res.status(500).json({ error: 'Failed to fetch indicator history' });
  }
};
