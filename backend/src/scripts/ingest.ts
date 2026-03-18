/**
 * NationHub Data Ingestion Script
 * 
 * Populates Supabase tables from external APIs:
 * 1. regions (from REST Countries)
 * 2. countries (from REST Countries)  
 * 3. indicators (definitions)
 * 4. indicator_values (from World Bank API)
 * 5. simulation_baselines (from latest indicator values)
 * 
 * Run: npx tsx src/scripts/ingest.ts
 */

import axios from 'axios';
import { supabase } from '../config/supabase.js';

const WB_BASE = 'https://api.worldbank.org/v2';

// ═══════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url: string, retries = 3, backoff = 1000): Promise<any> {
  try {
    const res = await axios.get(url, { timeout: 10000 });
    return res;
  } catch (err: any) {
    if (retries > 0) {
      console.warn(`    ⚠️  Retry ${url.split('/').pop()} in ${backoff}ms... (${err.message})`);
      await sleep(backoff);
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    throw err;
  }
}

// ═══════════════════════════════════════════
//  INDICATOR DEFINITIONS (25 metrics per architecture doc)
// ═══════════════════════════════════════════
const INDICATOR_DEFS = [
  { code: 'NY.GDP.MKTP.CD', name: 'GDP', category: 'Economy', unit: 'USD', source: 'World Bank' },
  { code: 'NY.GDP.PCAP.CD', name: 'GDP per Capita', category: 'Economy', unit: 'USD', source: 'World Bank' },
  { code: 'NY.GDP.MKTP.KD.ZG', name: 'GDP Growth Rate', category: 'Economy', unit: '%', source: 'World Bank' },
  { code: 'SP.POP.TOTL', name: 'Population', category: 'Demographics', unit: 'people', source: 'World Bank' },
  { code: 'SP.POP.GROW', name: 'Population Growth', category: 'Demographics', unit: '%', source: 'World Bank' },
  { code: 'SP.URB.TOTL.IN.ZS', name: 'Urban Population', category: 'Demographics', unit: '%', source: 'World Bank' },
  { code: 'SP.DYN.LE00.IN', name: 'Life Expectancy', category: 'Health', unit: 'years', source: 'World Bank' },
  { code: 'SP.DYN.IMRT.IN', name: 'Infant Mortality Rate', category: 'Health', unit: 'per 1000', source: 'World Bank' },
  { code: 'SL.UEM.TOTL.ZS', name: 'Unemployment Rate', category: 'Economy', unit: '%', source: 'World Bank' },
  { code: 'FP.CPI.TOTL.ZG', name: 'Inflation Rate', category: 'Economy', unit: '%', source: 'World Bank' },
  { code: 'NE.EXP.GNFS.ZS', name: 'Exports (% GDP)', category: 'Trade', unit: '%', source: 'World Bank' },
  { code: 'NE.IMP.GNFS.ZS', name: 'Imports (% GDP)', category: 'Trade', unit: '%', source: 'World Bank' },
  { code: 'NE.TRD.GNFS.ZS', name: 'Trade (% GDP)', category: 'Trade', unit: '%', source: 'World Bank' },
  { code: 'EN.ATM.CO2E.PC', name: 'CO2 Emissions per Capita', category: 'Environment', unit: 'tonnes', source: 'World Bank' },
  { code: 'EN.ATM.CO2E.KT', name: 'Total CO2 Emissions', category: 'Environment', unit: 'kt', source: 'World Bank' },
  { code: 'EG.FEC.RNEW.ZS', name: 'Renewable Energy Share', category: 'Energy', unit: '%', source: 'World Bank' },
  { code: 'EG.ELC.ACCS.ZS', name: 'Electricity Access', category: 'Energy', unit: '%', source: 'World Bank' },
  { code: 'SE.XPD.TOTL.GD.ZS', name: 'Education Expenditure', category: 'Education', unit: '% GDP', source: 'World Bank' },
  { code: 'SE.PRM.ENRR', name: 'School Enrollment', category: 'Education', unit: '%', source: 'World Bank' },
  { code: 'SI.POV.DDAY', name: 'Poverty Rate', category: 'Economy', unit: '%', source: 'World Bank' },
  { code: 'EG.USE.PCAP.KG.OE', name: 'Energy Consumption', category: 'Energy', unit: 'kg oil eq', source: 'World Bank' },
  { code: 'SH.XPD.CHEX.GD.ZS', name: 'Healthcare Expenditure', category: 'Health', unit: '% GDP', source: 'World Bank' },
  { code: 'MS.MIL.XPND.GD.ZS', name: 'Military Expenditure', category: 'Economy', unit: '% GDP', source: 'World Bank' },
  { code: 'AG.LND.TOTL.K2', name: 'Land Area', category: 'Geography', unit: 'sq km', source: 'World Bank' },
  { code: 'SI.POV.GINI', name: 'GINI Index', category: 'Economy', unit: 'index', source: 'World Bank' },
];

// Top 30 countries by GDP
const KEY_COUNTRIES = [
  'USA','CHN','JPN','DEU','IND','GBR','FRA','BRA','ITA','CAN',
  'RUS','KOR','AUS','ESP','MEX','IDN','NLD','SAU','TUR','CHE',
  'POL','SWE','BEL','ARG','NOR','AUT','ARE','THA','ISR','IRL',
];

// ═══════════════════════════════════════════
//  Step 1: Ingest Regions
// ═══════════════════════════════════════════
async function ingestRegions() {
  console.log('\n📌 Step 1: Ingesting regions...');
  
  // Check if already populated
  const { count } = await supabase.from('regions').select('*', { count: 'exact', head: true });
  if (count && count > 0) {
    console.log(`  ⏭️  Already has ${count} regions — skipping`);
    return;
  }

  const regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'];
  for (const name of regions) {
    const { error } = await supabase.from('regions').insert({ name });
    if (error && !error.message.includes('duplicate')) {
      console.error(`  Region "${name}" error:`, error.message);
    }
  }
  console.log(`  ✅ Regions inserted`);
}

// ═══════════════════════════════════════════
//  Step 2: Ingest Countries
// ═══════════════════════════════════════════
async function ingestCountries() {
  console.log('\n📌 Step 2: Ingesting countries from REST Countries API...');
  
  const { count } = await supabase.from('countries').select('*', { count: 'exact', head: true });
  if (count && count > 5) {
    console.log(`  ⏭️  Already has ${count} countries — skipping`);
    return;
  }

  // Split into two requests to stay under the 10-field limit
  const { data: countriesPart1 } = await axios.get(
    'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,capital,region,subregion,population,area,latlng'
  );
  
  const { data: countriesPart2 } = await axios.get(
    'https://restcountries.com/v3.1/all?fields=cca3,flags,currencies'
  );

  // Merge the two datasets
  const allCountries = countriesPart1.map((c1: any) => {
    const c2 = countriesPart2.find((c: any) => c.cca3 === c1.cca3);
    return { ...c1, ...c2 };
  });

  // Get region map
  const { data: regionRows } = await supabase.from('regions').select('id, name');
  const regionMap: Record<string, string> = {};
  (regionRows || []).forEach((r: any) => { regionMap[r.name] = r.id; });

  let count2 = 0;
  let errors = 0;
  const batchSize = 10;
  let currentBatch = [];

  for (const c of allCountries) {
    if (!c.cca3) continue; // Skip entries without iso3
    
    const currency = c.currencies ? Object.values(c.currencies)[0] : null;
    currentBatch.push({
      name: c.name?.common || 'Unknown',
      iso2: c.cca2 || null,
      iso3: c.cca3,
      capital: c.capital?.[0] || null,
      region_id: regionMap[c.region] || null,
      subregion: c.subregion || null,
      population: c.population || 0,
      area: c.area || 0,
      latitude: c.latlng?.[0] || 0,
      longitude: c.latlng?.[1] || 0,
      flag_url: c.flags?.svg || null,
      currency: currency ? `${(currency as any).name}` : null,
    });

    if (currentBatch.length === batchSize) {
      const { error } = await supabase.from('countries').insert(currentBatch);
      if (error) {
        if (!error.message.includes('duplicate')) {
          console.error(`  ❌ Batch error: ${error.message}`);
          errors += currentBatch.length;
        }
      } else {
        count2 += currentBatch.length;
      }
      currentBatch = [];
    }
  }

  // Insert any remaining items
  if (currentBatch.length > 0) {
    const { error } = await supabase.from('countries').insert(currentBatch);
    if (error) {
      if (!error.message.includes('duplicate')) {
        console.error(`  ❌ Final batch error: ${error.message}`);
        errors += currentBatch.length;
      }
    } else {
      count2 += currentBatch.length;
    }
  }

  console.log(`  ✅ ${count2} countries inserted (${errors} errors)`);
}

// ═══════════════════════════════════════════
//  Step 3: Ingest Indicator Definitions
// ═══════════════════════════════════════════
async function ingestIndicators() {
  console.log('\n📌 Step 3: Ingesting indicator definitions...');
  
  const { count } = await supabase.from('indicators').select('*', { count: 'exact', head: true });
  if (count && count > 5) {
    console.log(`  ⏭️  Already has ${count} indicators — skipping`);
    return;
  }
  
  let inserted = 0;
  for (const ind of INDICATOR_DEFS) {
    const { error } = await supabase.from('indicators').insert(ind);
    if (error) {
      if (!error.message.includes('duplicate')) {
        console.error(`  ❌ ${ind.code}: ${error.message}`);
      }
    } else {
      inserted++;
    }
  }
  console.log(`  ✅ ${inserted} indicators inserted`);
}

// ═══════════════════════════════════════════
//  Step 4: Ingest Indicator Values (Time Series)
// ═══════════════════════════════════════════
async function ingestIndicatorValues() {
  console.log('\n📌 Step 4: Ingesting indicator values for key countries...');
  console.log(`  Processing ${KEY_COUNTRIES.length} countries × ${INDICATOR_DEFS.length} indicators`);

  // Load lookup tables
  const { data: countryRows } = await supabase.from('countries').select('id, iso3');
  const countryMap: Record<string, string> = {};
  (countryRows || []).forEach((c: any) => { if (c.iso3) countryMap[c.iso3] = c.id; });

  const { data: indicatorRows } = await supabase.from('indicators').select('id, code');
  const indicatorMap: Record<string, string> = {};
  (indicatorRows || []).forEach((i: any) => { indicatorMap[i.code] = i.id; });

  let totalInserted = 0;
  let totalErrors = 0;

  for (const iso3 of KEY_COUNTRIES) {
    const countryId = countryMap[iso3];
    if (!countryId) {
      console.warn(`  ⚠️  Country ${iso3} not found in DB — skipping`);
      continue;
    }

    for (const ind of INDICATOR_DEFS) {
      const indicatorId = indicatorMap[ind.code];
      if (!indicatorId) continue;

      try {
        const url = `${WB_BASE}/country/${iso3}/indicator/${ind.code}?format=json&per_page=25&date=2000:2023`;
        const { data: wbResponse } = await fetchWithRetry(url);
        
        const records = wbResponse?.[1] || [];
        const values = records
          .filter((r: any) => r.value !== null)
          .map((r: any) => ({
            country_id: countryId,
            indicator_id: indicatorId,
            year: parseInt(r.date),
            value: r.value,
          }));

        if (values.length > 0) {
          // Delete existing data for this combo first
          await supabase.from('indicator_values')
            .delete()
            .eq('country_id', countryId)
            .eq('indicator_id', indicatorId);

          // Insert in small batches to avoid payload limits
          for (let i = 0; i < values.length; i += 10) {
            const batch = values.slice(i, i + 10);
            const { error } = await supabase.from('indicator_values').insert(batch);
            if (error) {
              console.error(`  ❌ ${iso3}/${ind.code} batch: ${error.message}`);
              totalErrors++;
            } else {
              totalInserted += batch.length;
            }
          }
        }

        // Rate limit: World Bank ~30 req/sec
        await sleep(120);
      } catch (err: any) {
        console.error(`  ❌ ${iso3}/${ind.code}: ${err.message}`);
        totalErrors++;
      }
    }
    console.log(`  📊 ${iso3} complete`);
  }
  
  console.log(`  ✅ ${totalInserted} indicator values inserted (${totalErrors} errors)`);
}

// ═══════════════════════════════════════════
//  Step 5: Create Simulation Baselines
// ═══════════════════════════════════════════
async function ingestSimulationBaselines() {
  console.log('\n📌 Step 5: Computing simulation baselines...');

  // Clean out any empty baselines
  await supabase.from('simulation_baselines').delete().is('country_id', null);

  const { data: countryRows } = await supabase.from('countries').select('id, iso3');
  const { data: indicatorRows } = await supabase.from('indicators').select('id, code');

  const indicatorMap: Record<string, string> = {};
  (indicatorRows || []).forEach((i: any) => { indicatorMap[i.code] = i.id; });

  const getLatest = async (countryId: string, indCode: string): Promise<number | null> => {
    const indId = indicatorMap[indCode];
    if (!indId) return null;
    const { data } = await supabase
      .from('indicator_values')
      .select('value')
      .eq('country_id', countryId)
      .eq('indicator_id', indId)
      .order('year', { ascending: false })
      .limit(1)
      .single();
    return data?.value ?? null;
  };

  let count = 0;
  // Only process countries that are in KEY_COUNTRIES and have indicator data
  const keySet = new Set(KEY_COUNTRIES);
  const relevantCountries = (countryRows || []).filter((c: any) => keySet.has(c.iso3));

  for (const c of relevantCountries) {
    const gdp = await getLatest(c.id, 'NY.GDP.MKTP.CD');
    if (gdp === null) continue; // Skip countries without GDP data

    const gdpGrowth = await getLatest(c.id, 'NY.GDP.MKTP.KD.ZG');
    const lifeExp = await getLatest(c.id, 'SP.DYN.LE00.IN');
    const co2 = await getLatest(c.id, 'EN.ATM.CO2E.PC');
    const unemployment = await getLatest(c.id, 'SL.UEM.TOTL.ZS');

    // Delete existing baseline for this country
    await supabase.from('simulation_baselines').delete().eq('country_id', c.id);

    const { error } = await supabase.from('simulation_baselines').insert({
      country_id: c.id,
      gdp,
      gdp_growth: gdpGrowth ?? 2.0,
      hdi: null,
      life_expectancy: lifeExp,
      co2_emissions: co2,
      unemployment,
      innovation_index: null,
      year: 2022,
    });

    if (error) console.error(`  ❌ Baseline ${c.iso3}: ${error.message}`);
    else count++;
  }
  console.log(`  ✅ ${count} simulation baselines created`);
}

// ═══════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  NationHub Data Ingestion Starting...');
  console.log('═══════════════════════════════════════════');

  try {
    await ingestRegions();
    await ingestCountries();
    await ingestIndicators();
    await ingestIndicatorValues();
    await ingestSimulationBaselines();
  } catch (err) {
    console.error('\n❌ Fatal error:', err);
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ Data Ingestion Complete!');
  console.log('═══════════════════════════════════════════\n');
  process.exit(0);
}

main();
