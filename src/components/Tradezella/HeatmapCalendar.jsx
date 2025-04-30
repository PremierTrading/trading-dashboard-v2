// src/components/Tradezella/HeatmapCalendar.jsx
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function HeatmapCalendar({ calendarData }) {
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const day = date.toISOString().slice(0, 10);
      const entry = calendarData.find(d => d.date === day);
      if (entry) {
        return (
          <div className="text-xs mt-1">
            ${(entry.pnl / 1000).toFixed(2)}K<br />
            {entry.count} trades
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Calendar</h3>
      <Calendar tileContent={tileContent} calendarType="US" />
    </div>
  );
}