// FILE: src/components/CSVImporter.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';

export default function CSVImporter({ setTrades }) {
  const [importCount, setImportCount] = useState(null);
  const [errorCount, setErrorCount] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    setStatusMessage('Parsing CSV...');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const mapped = results.data
          .map(row => {
            const symbol = row.Symbol || row.symbol || row.Ticker || '';
            const pnlRaw = row['Net P&L'] || row.pnl || row['Profit/Loss'];
            const pnl = pnlRaw !== undefined ? parseFloat(pnlRaw) : NaN;
            const dt = row.DateTime || (row['Trade Date'] && row['Executed Time'] ? `${row['Trade Date']} ${row['Executed Time']}` : '');
            const timestamp = dt ? new Date(dt).toISOString() : null;
            if (!symbol || isNaN(pnl) || !timestamp) return null;
            return { symbol, pnl, timestamp, account: row.Account || 'Imported' };
          })
          .filter(Boolean);

        setTrades(prev => [...prev, ...mapped]);
        setImportCount(mapped.length);
        setErrorCount(results.data.length - mapped.length);
        setStatusMessage(
          `${mapped.length} trades imported${mapped.length < results.data.length ? `, ${results.data.length - mapped.length} skipped` : ''}`
        );
      },
      error: err => {
        console.error('Error parsing CSV:', err);
        setStatusMessage('Error parsing CSV');
      }
    });
  };

  return (
    <div className="csv-importer inline-block">
      <label className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded cursor-pointer">
        Import CSV
        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
      </label>
      {statusMessage && (
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
