/**
 * Quick probe to inspect actual Supabase table schemas
 * Run: npx tsx src/scripts/probe-schema.ts
 */
import { supabase } from '../config/supabase.js';

async function probe() {
  const tables = [
    'regions',
    'countries',
    'indicators',
    'indicator_values',
    'global_indicator_values',
    'simulation_baselines',
    'policy_variables',
    'api_cache',
    'data_sources',
  ];

  for (const table of tables) {
    console.log(`\n═══ TABLE: ${table} ═══`);
    
    // Try to select 1 row to see column names
    const { data, error, status } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`  ❌ Error (${status}): ${error.message} | Code: ${error.code}`);
    } else if (data && data.length > 0) {
      console.log(`  ✅ Exists — Columns: ${Object.keys(data[0]).join(', ')}`);
      console.log(`  Sample row:`, JSON.stringify(data[0], null, 2));
    } else {
      console.log(`  ✅ Exists but EMPTY — fetching column info...`);
      // Try inserting a dummy and reading the error to discover columns
      const { error: insertErr } = await supabase.from(table).insert({});
      if (insertErr) {
        console.log(`  Column hint from insert error: ${insertErr.message}`);
      }
    }
  }

  // Also check row counts for non-empty tables
  console.log('\n═══ ROW COUNTS ═══');
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      console.log(`  ${table}: ${count} rows`);
    }
  }

  process.exit(0);
}

probe().catch(err => {
  console.error('Probe error:', err);
  process.exit(1);
});
