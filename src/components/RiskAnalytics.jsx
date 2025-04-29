// FILE: src/components/RiskAnalytics.jsx
import React from 'react';

export default function RiskAnalytics({ trades }) {
  if (!trades || trades.length === 0) return null;

  let cumulative = 0;
  let peak = 0;
  let maxDrawdown = 0;
  let totalRisk = 0;
  let totalRewardRisk = 0;
  let winRiskRewardCount = 0;
  let grossWins = 0;
  let grossLosses = 0;

  trades.forEach(trade => {
    const pnl = trade.pnl || 0;
    cumulative += pnl;
    if (cumulative > peak) {
      peak = cumulative;
    }
    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }

    if (pnl > 0) {
      grossWins += pnl;
      if (trade.risk) {
        totalRewardRisk += pnl / trade.risk;
        winRiskRewardCount++;
      }
    } else if (pnl < 0) {
      grossLosses += Math.abs(pnl);
    }

    if (trade.risk) {
      totalRisk += trade.risk;
    }
  });

  const avgRisk = totalRisk / trades.length || 0;
  const avgRewardRisk = totalRewardRisk / (winRiskRewardCount || 1);
  const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Risk Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded text-center">
          <div className="text-sm text-gray-500 mb-1">Max Drawdown</div>
          <div className="text-2xl font-bold text-red-500">${maxDrawdown.toFixed(2)}</div>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded text-center">
          <div className="text-sm text-gray-500 mb-1">Profit Factor</div>
          <div className="text-2xl font-bold text-green-500">{profitFactor.toFixed(2)}</div>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded text-center">
          <div className="text-sm text-gray-500 mb-1">Avg Risk/Trade</div>
          <div className="text-2xl font-bold">${avgRisk.toFixed(2)}</div>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded text-center">
          <div className="text-sm text-gray-500 mb-1">Avg Reward/Risk</div>
          <div className="text-2xl font-bold">{avgRewardRisk.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
