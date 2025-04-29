// FILE: src/components/FilterBar.jsx
import React from 'react';

export default function FilterBar({ searchFilters, setSearchFilters }) {
  const handleChange = (field, value) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6 flex flex-wrap gap-4 items-end">
      {/* SYMBOL SEARCH */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Symbol</label>
        <input
          type="text"
          value={searchFilters.symbol || ''}
          onChange={(e) => handleChange('symbol', e.target.value)}
          placeholder="Ex: AAPL, /NQ, etc."
          className="p-2 border rounded dark:bg-gray-700"
        />
      </div>

      {/* WIN/LOSS DROPDOWN */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Result</label>
        <select
          value={searchFilters.result || ''}
          onChange={(e) => handleChange('result', e.target.value)}
          className="p-2 border rounded dark:bg-gray-700"
        >
          <option value="">All</option>
          <option value="win">Win</option>
          <option value="loss">Loss</option>
        </select>
      </div>

      {/* TAG SEARCH */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Tag</label>
        <input
          type="text"
          value={searchFilters.tag || ''}
          onChange={(e) => handleChange('tag', e.target.value)}
          placeholder="Ex: Breakout, Scalp..."
          className="p-2 border rounded dark:bg-gray-700"
        />
      </div>
    </div>
  );
}
