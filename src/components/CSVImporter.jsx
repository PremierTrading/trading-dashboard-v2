// FILE: src/components/CSVImporter.jsx
import React from 'react';
import Papa from 'papaparse';
import './CSVImporter.css';

export default function CSVImporter({ setTrades }) {
  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        console.log('Fields detected:', results.meta.fields);
        console.log('Parsed CSV:', results.data);

        // Determine CSV format (TOS vs generic)
        const isTOS = results.meta.fields.includes('Net P&L') && results.meta.fields.includes('Symbol');

        const mapped = results.data
          .map(row => {
            const symbol = row.Symbol || row.symbol || row['Underlying Symbol'] || row.Ticker || '';
            const pnlRaw = row['Net P&L'] || row.pnl || row['Profit/Loss'] || row['P&L'];
            const pnl = pnlRaw !== undefined ? parseFloat(pnlRaw) : NaN;
            const dateStr = row.DateTime || row['Trade Date'];
            const timeStr = row['Executed Time'] || row.Time;
            const dt = dateStr && timeStr ? `${dateStr} ${timeStr}` : dateStr || '';
            const timestamp = dt ? new Date(dt).toISOString() : null;

            if (!symbol || isNaN(pnl) || !timestamp) {
              console.warn('Skipping invalid row:', row);
              return null;
            }
            return { symbol, pnl, timestamp, account: row.Account || (isTOS ? 'ThinkOrSwim' : 'Imported') };
          })
          .filter(Boolean);

        console.log('Mapped Trades:', mapped);
        setTrades(prev => [...prev, ...mapped]);
      },
      error: err => console.error('Error parsing CSV:', err)
    });
  };

  return (
    <label className="bg-primary hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
      Import CSV
      <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
    </label>
  );
}
