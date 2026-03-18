import axios from 'axios';
import { parse } from 'csv-parse/sync';

async function run() {
  const url = 'https://raw.githubusercontent.com/owid/owid-datasets/master/datasets/World%20Happiness%20Report%20(2022)/World%20Happiness%20Report%20(2022).csv';
  console.log(`Fetching from: ${url}`);
  try {
    const res = await axios.get(url);
    const records = parse(res.data, { columns: true, skip_empty_lines: true });
    console.log(`Found ${records.length} records`);
    if (records.length > 0) {
      console.log('Sample record (first):', records[0]);
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

run();
