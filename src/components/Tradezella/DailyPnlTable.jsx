import React from 'react';

export default function DailyPnlTable({ dailyData }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Recent Trades</h3>
      <table className="w-full text-left table-auto">
        <thead>
          <tr className="border-b">
            <th className="px-2 py-1">Close Date</th>
            <th className="px-2 py-1">Symbol</th>
            <th className="px-2 py-1">Net P&L</th>
          </tr>
        </thead>
        <tbody>
          {dailyData.slice(0, 5).map(r => (
            <tr key={`${r.date}-${r.symbol}`} className="border-b">
              <td className="px-2 py-1">{r.date}</td>
              <td className="px-2 py-1">{r.symbol}</td>
              <td className="px-2 py-1">${r.pnl}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">View More</button>
    </div>
  );
}