// FILE: src/components/WinRateByDay.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function WinRateByDay({ trades }) {
  if (!trades || trades.length === 0) return null;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const stats = {};

  // Initialize counts
  daysOfWeek.forEach(day => {
    stats[day] = { wins: 0, total: 0 };
  });

  trades.forEach(trade => {
    if (!trade.timestamp) return;
    const date = new Date(trade.timestamp);
    const day = daysOfWeek[date.getDay()];
    if (!day) return;
    if (trade.pnl >= 0) {
      stats[day].wins++;
    }
    stats[day].total++;
  });

  const data = daysOfWeek.map(day => ({
    day,
    winRate: stats[day].total > 0 ? (stats[day].wins / stats[day].total) * 100 : 0,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Win Rate by Day</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="winRate" fill="#4ade80" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
