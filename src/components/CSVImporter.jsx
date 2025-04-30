import React from 'react';
import Papa from 'papaparse';

export default function CSVImporter({ setTrades }) {
  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    // Read raw text to detect format
    const rawText = await file.text();
    const lines = rawText.split(/\r?\n/);
    let accountType = 'Imported';
    let dataLines = lines;

    // ThinkOrSwim export: find header starting with DATE,
    const tosHeader = lines.findIndex(l => l.startsWith('DATE,'));
    if (tosHeader >= 0) {
      accountType = 'TOS';
      dataLines = lines.slice(tosHeader);
    }
    // Tradovate export: header starts with orderId,
    else if (lines[0].toLowerCase().startsWith('orderid,')) {
      accountType = 'Tradovate';
      dataLines = lines; // header is first line
    }

    const csvToParse = dataLines.join('\n');
    Papa.parse(csvToParse, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        console.log('Fields detected:', results.meta.fields);
        console.log('Parsed CSV rows:', results.data);

        const mapped = results.data
          .map(row => {
            let symbol, pnl, timestamp;

            if (accountType === 'TOS') {
              // TOS columns: DATE, TIME, TYPE, ..., DESCRIPTION, ..., AMOUNT
              symbol = row.DESCRIPTION;
              pnl = parseFloat(row.AMOUNT);
              timestamp = row.DATE && row.TIME
                ? new Date(`${row.DATE} ${row.TIME}`).toISOString()
                : null;
            } else if (accountType === 'Tradovate') {
              // Tradovate columns: Contract, Filled Qty, Avg Fill Price
              symbol = row.Contract;
              // No PnL in order export; default to 0
              pnl = 0;
              // Try date/time columns if present
              if (row.Date || row.Time) {
                timestamp = new Date(`${row.Date || ''} ${row.Time || ''}`).toISOString();
              } else {
                timestamp = new Date().toISOString();
              }
            } else {
              // Generic import
              symbol = row.Symbol || row.Ticker || '';
              pnl = parseFloat(row['Net P&L'] || row.pnl || 0);
              const dt = row.DateTime || `${row['Trade Date']} ${row['Executed Time']}`;
              timestamp = dt ? new Date(dt).toISOString() : null;
            }

            if (!symbol || isNaN(pnl) || !timestamp) {
              console.warn(`Skipping invalid row [${accountType}]:`, row);
              return null;
            }
            return { symbol, pnl, timestamp, account: accountType };
          })
          .filter(Boolean);

        console.log('Mapped Trades:', mapped);
        setTrades(prev => [...prev, ...mapped]);
      },
      error: err => console.error('Error parsing CSV:', err)
    });
  };

  return (
    <div>
      <label className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded cursor-pointer">
        Import CSV
        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
      </label>
    </div>
  );
}
