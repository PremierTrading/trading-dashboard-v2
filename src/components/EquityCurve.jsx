// FILE: src/components/EquityCurve.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function EquityCurve({ trades }) {
  if (!trades || trades.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6 text-center">
        No data available for selected dates.
      </div>
    );
  }

  // Sort trades by timestamp safely
  const sorted = [...trades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Build cumulative P&L data points
  let cumulativePnl = 0;
  const curveData = sorted.map(trade => {
    cumulativePnl += trade.pnl || 0;
    return {
      date: new Date(trade.timestamp).toLocaleDateString(),
      pnl: cumulativePnl,
    };
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Equity Curve</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={curveData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="pnl" stroke="#4ade80" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
