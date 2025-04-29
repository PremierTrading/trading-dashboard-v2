// FILE: src/components/CSVImporter.jsx
import React from 'react';
import Papa from 'papaparse';

export default function CSVImporter({ setTrades }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Parsed CSV:', results.data);

        // Detect if this is a ThinkOrSwim CSV
        const isTOS = results.meta.fields.includes('Net P&L') && results.meta.fields.includes('Symbol');

        const mappedTrades = results.data.map((row) => {
          try {
            const symbol = row.Symbol || row.symbol || row['Underlying Symbol'] || row['Ticker'] || '';
            const pnl = parseFloat(row["Net P&L"] || row.pnl || row['Profit/Loss'] || row['P&L'] || 0);
            const date = row['Trade Date'] || row.Date || row['Execution Date'] || '';
            const time = row['Executed Time'] || row.Time || '';

            let timestamp = '';
            if (date && time) {
              timestamp = new Date(`${date} ${time}`).toISOString();
            } else if (date) {
              timestamp = new Date(date).toISOString();
            }

            if (!symbol || isNaN(pnl) || !timestamp) {
              console.warn('Invalid row skipped:', row);
              return null;
            }

            return {
              symbol,
              pnl,
              timestamp,
              account: isTOS ? "ThinkOrSwim" : "Other", // <-- Auto-detect broker
            };
          } catch (error) {
            console.error('Error parsing row:', row);
            return null;
          }
        }).filter(row => row !== null);

        console.log('Mapped Trades:', mappedTrades);

        // Inject parsed trades into your dashboard
        setTrades(prev => [...prev, ...mappedTrades]);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <label className="bg-primary hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
        Import CSV
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
    </div>
  );
}
