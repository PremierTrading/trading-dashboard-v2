// FILE: src/components/Calendar.jsx
import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  eachDayOfInterval,
  subWeeks,
} from 'date-fns';

export default function Calendar({ onDatesSelected }) {
  const [selectedDays, setSelectedDays] = useState([]);

  const handleSelect = (days) => {
    setSelectedDays(days || []);
    if (onDatesSelected) {
      onDatesSelected(days || []);
    }
  };

  const selectThisWeek = () => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: startOfWeek(today, { weekStartsOn: 0 }),
      end: endOfWeek(today,   { weekStartsOn: 0 }),
    });
    setSelectedDays(days);
    if (onDatesSelected) onDatesSelected(days);
  };

  const selectLastWeek = () => {
    const today = new Date();
    const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 0 });
    const lastWeekEnd   = endOfWeek(  subWeeks(today, 1), { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: lastWeekStart, end: lastWeekEnd });
    setSelectedDays(days);
    if (onDatesSelected) onDatesSelected(days);
  };

  const selectThisMonth = () => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: startOfMonth(today),
      end:   today,
    });
    setSelectedDays(days);
    if (onDatesSelected) onDatesSelected(days);
  };

  const selectLastMonth = () => {
    const today = new Date();
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const days = eachDayOfInterval({
      start: startOfMonth(lastMonthDate),
      end:   endOfMonth(lastMonthDate),
    });
    setSelectedDays(days);
    if (onDatesSelected) onDatesSelected(days);
  };

  const selectYearToDate = () => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: startOfYear(today),
      end:   today,
    });
    setSelectedDays(days);
    if (onDatesSelected) onDatesSelected(days);
  };

  const clearSelection = () => {
    setSelectedDays([]);
    if (onDatesSelected) onDatesSelected([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
      <h2 className="text-xl font-bold mb-4">Select Trading Days</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={selectThisWeek}
                className="bg-primary text-white px-3 py-1 rounded hover:bg-green-700 transition">
          This Week
        </button>
        <button onClick={selectLastWeek}
                className="bg-primary text-white px-3 py-1 rounded hover:bg-green-700 transition">
          Last Week
        </button>
        <button onClick={selectThisMonth}
                className="bg-primary text-white px-3 py-1 rounded hover:bg-green-700 transition">
          This Month
        </button>
        <button onClick={selectLastMonth}
                className="bg-primary text-white px-3 py-1 rounded hover:bg-green-700 transition">
          Last Month
        </button>
        <button onClick={selectYearToDate}
                className="bg-primary text-white px-3 py-1 rounded hover:bg-green-700 transition">
          Year-to-Date
        </button>
        <button onClick={clearSelection}
                className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-600 transition">
          Clear
        </button>
      </div>

      <DayPicker
        mode="multiple"
        selected={selectedDays}
        onSelect={handleSelect}
        defaultMonth={new Date()}
      />
    </div>
  );
}
