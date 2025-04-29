// FILE: src/components/TradeCard.jsx
import React from 'react';

export default function TradeCard({ trade, onNote }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">{trade.symbol || "Unknown Symbol"}</h3>
          <span className={`text-sm px-2 py-1 rounded ${trade.pnl >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {trade.pnl >= 0 ? `+${trade.pnl}` : trade.pnl}
          </span>
        </div>

        {/* Trade Date */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
          {trade.timestamp ? new Date(trade.timestamp).toLocaleDateString() : "Unknown Date"}
        </p>

        {/* Trade Result */}
        <p className={`font-semibold mb-2 ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trade.pnl >= 0 ? "WIN" : "LOSS"}
        </p>

        {/* Trade Tag */}
        {trade.tag && (
          <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mb-2 inline-block">
            {trade.tag}
          </p>
        )}
      </div>

      {/* Notes Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={onNote}
          className="bg-primary text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
        >
          Notes
        </button>
      </div>
    </div>
  );
}
