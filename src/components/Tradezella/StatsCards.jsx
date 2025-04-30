// src/components/Tradezella/StatsCards.jsx
import React from 'react';

export default function StatsCards({ metrics }) {
  // Tailwind-based Card structure
  const Card = ({ children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      {children}
    </div>
  );
  const CardHeader = ({ title }) => (
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
  );
  const CardContent = ({ children }) => (
    <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{children}</div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader title="Net P&L" />
        <CardContent>${metrics.netPnl.toLocaleString()}</CardContent>
      </Card>
      <Card>
        <CardHeader title="Trade Expectancy" />
        <CardContent>${metrics.expectancy.toFixed(2)}</CardContent>
      </Card>
      <Card>
        <CardHeader title="Profit Factor" />
        <CardContent>{metrics.profitFactor.toFixed(2)}</CardContent>
      </Card>
      <Card>
        <CardHeader title="Trade Win %" />
        <CardContent>{metrics.winRate.toFixed(2)}%</CardContent>
      </Card>
      <Card>
        <CardHeader title="Avg Win/Loss" />
        <CardContent>{metrics.avgWinLoss.toFixed(2)}</CardContent>
      </Card>
      <Card>
        <CardHeader title="Winning Trades" />
        <CardContent>{metrics.wins}</CardContent>
      </Card>
      <Card>
        <CardHeader title="Losing Trades" />
        <CardContent>{metrics.losses}</CardContent>
      </Card>
      <Card className="col-span-2 md:col-span-4">
        <CardHeader title="Your Zella Score" />
        <CardContent className="text-3xl font-bold">{metrics.zellaScore}</CardContent>
      </Card>
    </div>
  );
}