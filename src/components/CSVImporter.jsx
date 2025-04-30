// src/components/CSVImporter.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';

export default function CSVImporter({ setTrades }) {
  const [status, setStatus] = useState('');

  const parseNumber = str => {
    if (typeof str !== 'string') return NaN;
    // remove quotes, commas
    const cleaned = str.replace(/"/g, '').replace(/,/g, '');
    return parseFloat(cleaned);
  };

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/);
    let account = 'Imported';
    let dataLines = lines;

    // Detect ThinkOrSwim export (header contains AMOUNT,BALANCE)
    const tosHeaderIdx = lines.findIndex(l => l.match(/^DATE,.*AMOUNT,.*BALANCE/));
    if (tosHeaderIdx >= 0) {
      account = 'TOS';
      dataLines = lines.slice(tosHeaderIdx);
    }
    // Detect Tradovate export (header starts with "orderId,")
    else if (lines[0].toLowerCase().startsWith('orderid,')) {
      account = 'Tradovate';
    }

    const csv = dataLines.join('\n');
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        const mapped = result.data
          .map(row => {
            let symbol, pnl, ts;

            if (account === 'TOS') {
              symbol = row.DESCRIPTION;
              pnl = parseNumber(row.AMOUNT);
              const date = row.DATE;
              const time = row.TIME;
              ts = date && time ? new Date(`${date} ${time}`).toISOString() : new Date().toISOString();
            } else if (account === 'Tradovate') {
              symbol = row.Contract;
              pnl = parseNumber(row.ProfitLoss) || 0;
              ts = new Date().toISOString();
            } else {
              symbol = row.Symbol || row.Ticker || '';
              pnl = parseNumber(row['Net P&L']) || 0;
              ts = new Date().toISOString();
            }

            if (!symbol || isNaN(pnl)) return null;

            // Synthesize required fields for stats & cards
            const profitLoss = pnl;
            const entryPrice = 0;
            const exitPrice = 0;
            const quantity = 0;
            const direction = pnl >= 0 ? 'Long' : 'Short';

            return { symbol, pnl, profitLoss, entryPrice, exitPrice, quantity, direction, timestamp: ts, account };
          })
          .filter(Boolean);

        setTrades(prev => [...prev, ...mapped]);
        setStatus(`${mapped.length} imported, ${result.data.length - mapped.length} skipped`);
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
