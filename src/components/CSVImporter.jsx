// src/components/CSVImporter.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';

export default function CSVImporter({ setTrades }) {
  const [status, setStatus] = useState('');

  const parseNumber = str => {
    if (!str && str !== 0) return NaN;
    return parseFloat(String(str).replace(/"|,/g, ''));
  };

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/);

    // Detect CSV type
    let account = 'Imported';
    let headerIdx = 0;

    // Look for TOS header: a line starting with DATE, and containing AMOUNT and BALANCE
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.toUpperCase().startsWith('DATE,') && /AMOUNT,/.test(line) && /BALANCE/.test(line)) {
        account = 'TOS';
        headerIdx = i;
        break;
      }
    }

    // If not TOS, check for Tradovate header at first line
    if (account === 'Imported' && lines[0].toLowerCase().startsWith('orderid,')) {
      account = 'Tradovate';
      headerIdx = 0;
    }

    console.log('CSV account type detected:', account);
    console.log('Header row:', lines[headerIdx]);

    const dataLines = lines.slice(headerIdx);
    const csv = dataLines.join('\n');

    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        console.log('Fields detected:', result.meta.fields);
        console.log('Parsed rows:', result.data.length);

        const mapped = result.data
          .map(row => {
            let symbol, pnl, ts;

            if (account === 'TOS') {
              symbol = row.DESCRIPTION;
              pnl = parseNumber(row.AMOUNT);
              ts = row.DATE && row.TIME ? new Date(`${row.DATE} ${row.TIME}`).toISOString() : new Date().toISOString();
            } else if (account === 'Tradovate') {
              symbol = row.Contract;
              pnl = parseNumber(row.ProfitLoss) || 0;
              ts = new Date().toISOString();
            } else {
              symbol = row.Symbol || row.Ticker || '';
              pnl = parseNumber(row['Net P&L']) || 0;
              ts = new Date().toISOString();
            }

            if (!symbol || isNaN(pnl)) {
              console.warn(`Skipping invalid row for ${account}:`, row);
              return null;
            }

            const profitLoss = pnl;
            const entryPrice = 0;
            const exitPrice = 0;
            const quantity = 0;
            const direction = pnl >= 0 ? 'Long' : 'Short';

            return { symbol, pnl, profitLoss, entryPrice, exitPrice, quantity, direction, timestamp: ts, account };
          })
          .filter(Boolean);

        console.log('Mapped trades count:', mapped.length);
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
      {status && <div className="mt-1 text-sm text-gray-700">{status}</div>}
    </div>
  );
}
