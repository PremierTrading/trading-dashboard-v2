// src/components/CSVImporter.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';

export default function CSVImporter({ setTrades }) {
  const [status, setStatus] = useState('');

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    // Read entire file to detect format
    const text = await file.text();
    const lines = text.split(/\r?\n/);
    let account = 'Imported';
    let dataLines = lines;

    // Detect ThinkOrSwim export (header starts "DATE,")
    const tosIdx = lines.findIndex(l => l.startsWith('DATE,'));
    if (tosIdx >= 0) {
      account = 'TOS';
      dataLines = lines.slice(tosIdx);
    }
    // Detect Tradovate export (header starts "orderId,")
    else if (lines[0].toLowerCase().startsWith('orderid,')) {
      account = 'Tradovate';
    }

    const csv = dataLines.join('\n');
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: r => {
        const mapped = r.data
          .map(row => {
            let symbol, pnl, ts;

            if (account === 'TOS') {
              symbol = row.DESCRIPTION;
              pnl = parseFloat(row.AMOUNT);
              ts =
                row.DATE && row.TIME
                  ? new Date(row.DATE + ' ' + row.TIME).toISOString()
                  : new Date().toISOString();
            } else if (account === 'Tradovate') {
              symbol = row.Contract;
              pnl = 0;
              ts = new Date().toISOString();
            } else {
              symbol = row.Symbol || row.Ticker || '';
              pnl = parseFloat(row['Net P&L'] || 0);
              ts = new Date().toISOString();
            }

            if (!symbol || isNaN(pnl)) return null;
            return { symbol, pnl, timestamp: ts, account };
          })
          .filter(Boolean);

        setTrades(prev => [...prev, ...mapped]);
        setStatus(`${mapped.length} imported, ${r.data.length - mapped.length} skipped`);
      },
      error: err => {
        console.error('Error parsing CSV:', err);
        setStatus('Error parsing CSV');
      }
    });
  };

  return (
    <div className="inline-block">
      <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
        Import CSV
        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
      </label>
      {status && <div className="mt-1 text-sm">{status}</div>}
    </div>
  );
}
