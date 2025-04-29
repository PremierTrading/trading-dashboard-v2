// FILE: src/components/StatsCards.jsx
import React from 'react';

export default function StatsCards({ trades }) {
  let netPL = 0;
  let wins = 0;
  let losses = 0;
  let totalWinAmount = 0;
  let totalLossAmount = 0;

  trades.forEach(trade => {
    if (typeof trade.pnl === 'number') {
      netPL += trade.pnl;
      if (trade.pnl > 0) {
        wins += 1;
        totalWinAmount += trade.pnl;
      } else if (trade.pnl < 0) {
        losses += 1;
        totalLossAmount += Math.abs(trade.pnl);
      }
    }
  });

  const totalTrades = wins + losses;
  const winRate = totalTrades > 0 ? (wins / totalTrades * 100).toFixed(2) : 0;
  const avgWin = wins > 0 ? (totalWinAmount / wins).toFixed(2) : 0;
  const avgLoss = losses > 0 ? (totalLossAmount / losses).toFixed(2) : 0;
  const rrRatio = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
        <h2 className="text-lg font-bold">Net P&L</h2>
        <p className={netPL >= 0 ? "text-green-500 text-xl" : "text-red-500 text-xl"}>
          {netPL.toFixed(2)}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
        <h2 className="text-lg font-bold">Win %</h2>
        <p className="text-xl">{winRate}%</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
        <h2 className="text-lg font-bold">Avg Win</h2>
        <p className="text-green-500 text-xl">${avgWin}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
        <h2 className="text-lg font-bold">Avg Loss</h2>
        <p className="text-red-500 text-xl">${avgLoss}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
        <h2 className="text-lg font-bold">R:R Ratio</h2>
        <p className="text-primary text-xl">{rrRatio}</p>
      </div>
    </div>
  );
}
