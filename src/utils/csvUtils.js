// FILE: src/utils/csvUtils.js
export function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const trade = {};
    headers.forEach((header, i) => {
      let value = values[i];
      if (!isNaN(value)) {
        value = Number(value);
      }
      trade[header.trim()] = value;
    });
    return trade;
  });
}
