// src/components/CSVImporter.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';

export default function CSVImporter({ setTrades }) {
  const [status, setStatus] = useState('');

  const parseNumber = (str) => {
    if ((!str && str !== 0) || str === '—') return NaN;
    return parseFloat(String(str).replace(/"|,/g, ''));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('Reading file...');
    const text = await file.text();
    const lines = text.split(/\r?\n/);

    // Detect CSV type and header row
    let account = 'Imported';
    let headerIdx = 0;
    let delimiter = ',';

    // TOS trade history header detection: Exec Time ... Net Price
    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.replace(/^\uFEFF/, '');
      if (line.startsWith('Exec Time') && line.includes('Net Price')) {
        account = 'TOS';
        headerIdx = i;
        delimiter = '\t';
        break;
      }
    }

    // Tradovate detection
    if (account === 'Imported') {
      const first = lines[0].replace(/^\uFEFF/, '');
      if (first.toLowerCase().startsWith('orderid,')) {
        account = 'Tradovate';
        headerIdx = 0;
        delimiter = ',';
      }
    }

    const headerLine = (lines[headerIdx] || '').replace(/^\uFEFF/, '');
    setStatus(`Detected ${account} format. Header: ${headerLine}`);
    console.log(`Account type: ${account}, headerIdx: ${headerIdx}, delimiter: '${delimiter}'`);

    const csv = lines.slice(headerIdx).join('\n');
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      delimiter: delimiter,
      complete: (result) => {
        console.log('Parsed rows:', result.data.length);
        console.log('Fields:', result.meta.fields);
        if (!result.data.length) {
          setStatus('No data rows parsed. Check header detection.');
          return;
        }
        const mapped = result.data.map((row) => {
          let symbol, pnl, ts, entryPrice, exitPrice, quantity, direction;
          if (account === 'TOS') {
            symbol = row.Symbol;
            pnl = parseNumber(row['Net Price']);
            ts = row['Exec Time'] ? new Date(row['Exec Time']).toISOString() : new Date().toISOString();
            entryPrice = parseNumber(row.Price);
            quantity = parseNumber(row.Qty);
            direction = row.Side;
            exitPrice = entryPrice + (quantity ? pnl / quantity : 0);
          } else if (account === 'Tradovate') {
            symbol = row.Contract;
            pnl = parseNumber(row.ProfitLoss) || 0;
            ts = new Date().toISOString();
            entryPrice = 0;
            exitPrice = 0;
            quantity = 0;
            direction = pnl >= 0 ? 'Long' : 'Short';
          } else {
            symbol = row.Symbol || row.Ticker || '';
            pnl = parseNumber(row['Net P&L']) || 0;
            ts = new Date().toISOString();
            entryPrice = 0;
            exitPrice = 0;
            quantity = 0;
            direction = pnl >= 0 ? 'Long' : 'Short';
          }
          if (!symbol || isNaN(pnl)) return null;
          return { symbol, pnl, profitLoss: pnl, entryPrice, exitPrice, quantity, direction, timestamp: ts, account };
        }).filter(Boolean);
        console.log('Mapped count:', mapped.length);
        setTrades((prev) => [...prev, ...mapped]);
        setStatus(`${mapped.length} imported, ${result.data.length - mapped.length} skipped`);
      },
      error: (err) => {
        console.error('Parse error:', err);
        setStatus('Error parsing CSV');
      },
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
