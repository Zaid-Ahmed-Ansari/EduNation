/**
 * Test insert into each table to find column issues
 * Run: npx tsx src/scripts/test-insert.ts
 */
import { supabase } from '../config/supabase.js';

async function test() {
  // 1. Test regions — already has 6 rows, try read
  console.log('\n--- REGIONS ---');
  const { data: regions, error: re } = await supabase.from('regions').select('*');
  if (re) console.log('Error:', re.message);
  else console.log('Regions:', JSON.stringify(regions, null, 2));

  // 2. Test countries — try a minimal insert
  console.log('\n--- COUNTRIES (test insert) ---');
  const { data: cd, error: ce } = await supabase.from('countries').insert({
    name: 'TestCountry',
    iso2: 'TC',
    iso3: 'TCC',
  }).select();
  if (ce) {
    console.log('Insert error:', ce.message, '| code:', ce.code, '| details:', ce.details);
  } else {
    console.log('Insert OK, columns:', Object.keys(cd[0]));
    // Clean up
    await supabase.from('countries').delete().eq('iso3', 'TCC');
    console.log('Cleaned up test row');
  }

  // 3. Test indicators — try a minimal insert
  console.log('\n--- INDICATORS (test insert) ---');
  const { data: id, error: ie } = await supabase.from('indicators').insert({
    name: 'TestIndicator',
    code: 'TEST.IND.001',
  }).select();
  if (ie) {
    console.log('Insert error:', ie.message, '| code:', ie.code, '| details:', ie.details);
  } else {
    console.log('Insert OK, columns:', Object.keys(id[0]));
    await supabase.from('indicators').delete().eq('code', 'TEST.IND.001');
    console.log('Cleaned up test row');
  }

  // 4. Test indicator_values — discover columns
  console.log('\n--- INDICATOR_VALUES (column check) ---');
  const { error: ive } = await supabase.from('indicator_values').insert({
    country_id: '00000000-0000-0000-0000-000000000000', // fake UUID
    indicator_id: '00000000-0000-0000-0000-000000000000',
    year: 2000,
    value: 0,
  });
  console.log('Insert error (expected FK violation):', ive?.message, '| code:', ive?.code);

  // 5. Test simulation_baselines — check the existing row
  console.log('\n--- SIMULATION_BASELINES ---');
  const { data: sb, error: sbe } = await supabase.from('simulation_baselines').select('*').limit(1);
  if (sbe) console.log('Error:', sbe.message);
  else console.log('Existing baseline:', JSON.stringify(sb, null, 2));

  process.exit(0);
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
