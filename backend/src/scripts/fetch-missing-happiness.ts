import axios from 'axios';
import fs from 'fs';
import path from 'path';

const URLS = {
  '2021': 'https://raw.githubusercontent.com/dphi-official/Datasets/master/world-happiness-report-2021.csv',
  '2022': 'https://raw.githubusercontent.com/YaminiAne/Data-Analysis-on-World-Health-Reports/main/2022.csv',
  '2023': 'https://raw.githubusercontent.com/loewenj700/voila_code/main/WHR2023.CSV',
  '2022_alt': 'https://raw.githubusercontent.com/evanfrang/world_happiness/main/2022.csv'
};

async function fetchCSV(url: string) {
  try {
    const res = await axios.get(url, { timeout: 8000 });
    return res.data;
  } catch (e: any) {
    console.log(`Failed to fetch ${url}: ${e.message}`);
    return null;
  }
}

async function main() {
  const jsonPath = path.join(process.cwd(), 'src/data/unified_happiness.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('No unified_happiness.json found.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const csv21 = await fetchCSV(URLS['2021']);
  const csv22 = await fetchCSV(URLS['2022']) || await fetchCSV(URLS['2022_alt']);
  const csv23 = await fetchCSV(URLS['2023']);

  const processCsv = (csvText: string, year: string, countryColIdx: number, scoreColIdx: number) => {
    if (!csvText) return;
    const lines = csvText.split('\n');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Simple CSV split (ignores quotes, but country names in WHR usually don't have commas)
      const parts = line.split(',');
      let country = parts[countryColIdx];
      if (country?.startsWith('"')) country = country.replace(/"/g, '');
      const score = parseFloat(parts[scoreColIdx]);
      if (country && !isNaN(score)) {
        if (!data[country]) data[country] = {};
        data[country][year] = score;
      }
    }
  };

  // 2021 columns: Country name (0), Regional indicator (1), Ladder score (2)
  if (csv21) processCsv(csv21, '2021', 0, 2);
  
  // 2022 columns: RANK (0), Country (1), Happiness score(2)
  if (csv22) processCsv(csv22, '2022', 1, 2);

  // 2023 columns: Country name (0), Ladder score (1)? Let's check headers.
  if (csv23) {
     const headers = csv23.split('\n')[0].split(',');
     const cIdx = headers.findIndex((h: string) => h.toLowerCase().includes('country'));
     const sIdx = headers.findIndex((h: string) => h.toLowerCase().includes('score') || h.toLowerCase().includes('ladder'));
     if (cIdx !== -1 && sIdx !== -1) processCsv(csv23, '2023', cIdx, sIdx);
  }

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log('Successfully injected real 2021-2023 data into unified_happiness.json');
}

main();
