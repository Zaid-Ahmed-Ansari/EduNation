import fs from 'fs';
import path from 'path';

async function unifyHappinessData() {
  const rootDir = process.cwd();
  const txtPath = path.join(rootDir, 'happinesstill2020.txt');
  const jsonPath = path.join(rootDir, 'happiness.json');
  const outputPath = path.join(rootDir, 'src/data/unified_happiness.json');

  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  // 1. Read 2009-2020 Data
  const rawTxt = fs.readFileSync(txtPath, 'utf8');
  const txtLines = rawTxt.split('\n');
  const data: Record<string, Record<string, number>> = {}; // Country -> Year -> Score

  for (let i = 1; i < txtLines.length; i++) {
    const line = txtLines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    const country = parts[0];
    const year = parts[1];
    const score = parseFloat(parts[2]);
    if (country && year && !isNaN(score)) {
      if (!data[country]) data[country] = {};
      data[country][year] = score;
    }
  }

  // 2. Read 2024 Data
  const rawJson = fs.readFileSync(jsonPath, 'utf8');
  const parsedJson = JSON.parse(rawJson);
  const arr2024 = parsedJson.data;

  for (const row of arr2024) {
    const country = row.country;
    const score = parseFloat(row.life_evaluation);
    if (!isNaN(score)) {
      if (!data[country]) data[country] = {};
      data[country]['2024'] = score;
    }
  }

  // 3. Interpolate 2021, 2022, 2023
  for (const country in data) {
    const countryData = data[country];
    // Find the latest year <= 2020
    let lastYearStr = '';
    for (let y = 2020; y >= 2018; y--) {
      if (countryData[y.toString()]) {
        lastYearStr = y.toString();
        break;
      }
    }

    if (lastYearStr && countryData['2024']) {
      const startYear = parseInt(lastYearStr);
      const endYear = 2024;
      const startVal = countryData[lastYearStr];
      const endVal = countryData['2024'];
      const steps = endYear - startYear;
      
      for (let y = startYear + 1; y < endYear; y++) {
        const factor = (y - startYear) / steps;
        countryData[y.toString()] = startVal + (endVal - startVal) * factor;
      }
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Successfully unified happiness data for ${Object.keys(data).length} countries into ${outputPath}`);
}

unifyHappinessData().catch(console.error);
