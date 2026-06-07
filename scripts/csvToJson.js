const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]);
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    results.push(row);
  }
  return results;
}

const inputDir = path.join(__dirname, '../src/data');
const outputDir = path.join(__dirname, '../src/data');

const files = [
  { csv: 'worldcup2026.games.csv', json: 'worldcup2026.games.json' },
  { csv: 'worldcup2026.groups.csv', json: 'worldcup2026.groups.json' },
  { csv: 'worldcup2026.stadium.csv', json: 'worldcup2026.stadium.json' },
  { csv: 'worldcup2026.teams.csv', json: 'worldcup2026.teams.json' }
];

console.log('Converting CSV files to JSON...');

files.forEach(file => {
  const csvPath = path.join(inputDir, file.csv);
  const jsonPath = path.join(outputDir, file.json);
  
  if (fs.existsSync(csvPath)) {
    const data = parseCSV(csvPath);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Converted ${file.csv} -> ${file.json} (${data.length} rows)`);
  } else {
    console.warn(`CSV file not found: ${csvPath}`);
  }
});

console.log('CSV to JSON conversion complete!');
