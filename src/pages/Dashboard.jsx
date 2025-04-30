// FILE: src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import TradeCard from '../components/TradeCard';
import Calendar from '../components/Calendar';
import NotesModal from '../components/NotesModal';
import CSVImporter from '../components/CSVImporter';
import StatsCards from '../components/StatsCards';
import AccountSelector from '../components/AccountSelector';
import EquityCurve from '../components/EquityCurve';
import FilterBar from '../components/FilterBar';
import RiskAnalytics from '../components/RiskAnalytics';
import WinRateByDay from '../components/WinRateByDay';
import DarkModeToggle from '../components/DarkModeToggle';
import './Dashboard.css';

// pull the API base URL from env
const backendUrl = process.env.REACT_APP_API_BASE || 'https://tradingview-webhook-v2.onrender.com';

export default function Dashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState({});
  const [tags, setTags] = useState({});
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedTradeIndex, setSelectedTradeIndex] = useState(null);
  const [searchFilters, setSearchFilters] = useState({});
  const [selectedDates, setSelectedDates] = useState([]);

  // Debug: log trades state whenever it changes
  useEffect(() => {
    console.log('Dashboard trades state now:', trades);
  }, [trades]);

  // Fetch trades on login
  useEffect(() => {
    if (!apiKey) {
      setLoading(false);
      return;
    }
    fetchTrades();
  }, [apiKey]);

  const fetchTrades = async () => {
    try {
      const res = await fetch(`${backendUrl}/trades?key=${apiKey}`);
      if (!res.ok) throw new Error('Failed to fetch trades');
      const data = await res.json();
      const corrected = data.map(t => ({ ...t, timestamp: t.timestamp || new Date().toISOString() }));
      setTrades(corrected);
    } catch (err) {
      console.error('Error fetching trades:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    try {
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
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed. Try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    setApiKey('');
    setTrades([]);
    setNotes({});
    setTags({});
  };

  const openNotes = idx => {
    setSelectedTradeIndex(idx);
    setShowNotesModal(true);
  };

  const saveNotes = (idx, newNote, newTag) => {
    setNotes(prev => ({ ...prev, [idx]: newNote }));
    setTags(prev => ({ ...prev, [idx]: newTag }));
    setShowNotesModal(false);
  };

  const applyFilters = list =>
    list.filter(trade => {
      const sym = searchFilters.symbol
        ? trade.symbol?.toLowerCase().includes(searchFilters.symbol.toLowerCase())
        : true;
      const res = searchFilters.result
        ? searchFilters.result === 'win'
          ? trade.pnl >= 0
          : trade.pnl < 0
        : true;
      const tagM = searchFilters.tag
        ? trade.tag?.toLowerCase().includes(searchFilters.tag.toLowerCase())
        : true;
      const dateM =
        selectedDates.length > 0
          ? selectedDates.some(d => {
              const td = new Date(trade.timestamp).toISOString().split('T')[0];
              const sd = new Date(d).toISOString().split('T')[0];
              return td === sd;
            })
          : true;
      return sym && res && tagM && dateM;
    });

  const filteredTrades = applyFilters(trades);

  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl mb-4 font-bold text-center">Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700"
            required
          />
          <button type="submit" className="w-full bg-primary text-white p-2 rounded">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Trading Dashboard V2</h1>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <button
            onClick={() => {
              if (window.confirm('Clear all trades? This cannot be undone.')) {
                setTrades([]);
                setNotes({});
                setTags({});
              }
            }}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded"
          >
            Clear Trades
          </button>
          <CSVImporter setTrades={setTrades} />
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </div>

      {/* STATS */}
      <StatsCards trades={filteredTrades} />

      {/* ACCOUNTS */}
      <AccountSelector />

      {/* EQUITY CURVE */}
      <EquityCurve trades={filteredTrades} />

      {/* FILTER BAR */}
      <FilterBar searchFilters={searchFilters} setSearchFilters={setSearchFilters} />

      {/* CALENDAR */}
      <div className="my-6">
        <Calendar onDatesSelected={setSelectedDates} />
      </div>

      {/* RISK & WIN-RATE */}
      <RiskAnalytics trades={filteredTrades} />
      <WinRateByDay trades={filteredTrades} />

      {/* TRADES GRID */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : filteredTrades.length === 0 ? (
        <div className="text-center">No trades found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrades.map((trade, i) => (
            <TradeCard key={i} trade={{ ...trade, note: notes[i], tag: tags[i] }} onNote={() => openNotes(i)} />
          ))}
        </div>
      )}

      {/* NOTES MODAL */}
      {showNotesModal && selectedTradeIndex != null && (
        <NotesModal
          trade={filteredTrades[selectedTradeIndex]}
          note={notes[selectedTradeIndex]}
          tag={tags[selectedTradeIndex]}
          onSave={(n, t) => saveNotes(selectedTradeIndex, n, t)}
          onClose={() => setShowNotesModal(false)}
        />
      )}
    </div>
  );
}