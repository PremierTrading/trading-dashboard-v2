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

    setStatus('Reading file...');
    const text = await file.text();
    const lines = text.split(/\r?\n/);

    console.log('First 10 lines of CSV:', lines.slice(0, 10));

    // Detect CSV type and header row, handle BOM
    let account = 'Imported';
    let headerIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      // remove BOM if present
      if (i === 0) line = line.replace(/^\uFEFF/, '');
      const up = line.toUpperCase();
      if (up.startsWith('DATE,') && /AMOUNT,/.test(up) && /BALANCE/.test(up)) {
        account = 'TOS';
        headerIdx = i;
        break;
      }
    }
    if (account === 'Imported') {
      const first = lines[0].replace(/^\uFEFF/, '').toLowerCase();
      if (first.startsWith('orderid,')) {
        account = 'Tradovate';
        headerIdx = 0;
      }
    }

    const headerLine = (lines[headerIdx] || '').replace(/^\uFEFF/, '');
    setStatus(`Detected ${account} format. Header: ${headerLine}`);
    console.log(`Detected account type: ${account} at header index ${headerIdx}`);

    const dataLines = lines.slice(headerIdx);
    const csv = dataLines.join('\n');

    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        console.log('Parsed rows count:', result.data.length);
        console.log('Fields detected:', result.meta.fields);

        if (!result.data.length) {
          setStatus('No data rows parsed. Check header detection.');
          return;
        }

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
