import axios from 'axios';

async function run() {
  const url = 'https://raw.githubusercontent.com/sharmadhiraj/free-json-datasets/master/docs/society-social/happiness_index_by_country.json';
  console.log(`Fetching from: ${url}`);
  try {
    const res = await axios.get(url);
    const records = res.data;
    console.log(`Found ${records.length} records`);
    if (records.length > 0) {
      console.log('Sample record (first):', Object.keys(records[0]));
      console.log('Sample record data:', records[0]);
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

run();
