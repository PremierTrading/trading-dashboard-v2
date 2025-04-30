// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import TradeCard from '../components/TradeCard';
import Calendar from '../components/Calendar';
import CSVImporter from '../components/CSVImporter';
import StatsCards from '../components/StatsCards';
import EquityCurve from '../components/EquityCurve';
import FilterBar from '../components/FilterBar';
import RiskAnalytics from '../components/RiskAnalytics';
import WinRateByDay from '../components/WinRateByDay';
import DarkModeToggle from '../components/DarkModeToggle';

const backendUrl = process.env.REACT_APP_API_BASE || 'https://tradingview-webhook-v2.onrender.com';

export default function Dashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clear Trades button
  const clearTrades = () => {
    if (window.confirm('Clear all trades? This cannot be undone.')) {
      setTrades([]);
    }
  };

  // Debug log of trades state
  useEffect(() => console.log('Trades:', trades), [trades]);

  // Fetch stored trades when logged in
  useEffect(() => {
    if (apiKey) fetchTrades();
    else setLoading(false);
  }, [apiKey]);

  const fetchTrades = async () => {
    try {
      const res = await fetch(`${backendUrl}/trades?key=${apiKey}`);
      const data = await res.json();
      setTrades(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    const res = await fetch(`${backendUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('apiKey', data.api_key);
      setApiKey(data.api_key);
    } else {
      alert(data.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    setApiKey('');
    setTrades([]);
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={handleLogin} className="p-6 border rounded shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Please Log In</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="block mb-2 p-2 border rounded w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="block mb-4 p-2 border rounded w-full"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Trading Dashboard</h1>
        <div className="flex space-x-2">
          <DarkModeToggle />
          <CSVImporter setTrades={setTrades} />
          <button onClick={clearTrades} className="bg-yellow-400 text-black px-3 py-1 rounded">
            Clear Trades
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
            Logout
          </button>
        </div>
      </div>

      <StatsCards trades={trades} />
      <EquityCurve trades={trades} />
      <FilterBar searchFilters={{}} setSearchFilters={() => {}} />
      <Calendar onDatesSelected={() => {}} />
      <RiskAnalytics trades={trades} />
      <WinRateByDay trades={trades} />

      {loading ? (
        <div>Loading trades...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {trades.length > 0 ? (
            trades.map((t, i) => <TradeCard key={i} trade={t} />)
          ) : (
            <div className="col-span-full text-center text-gray-500">No trades to display</div>
          )}
        </div>
      )}
    </div>
  );
}
