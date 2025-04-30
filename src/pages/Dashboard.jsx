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

// You can remove these if you have no CSS or replace with your styling
// import './Dashboard.css';

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

  useEffect(() => {
    console.log('Dashboard trades state now:', trades);
  }, [trades]);

  useEffect(() => {
    if (apiKey) fetchTrades();
    else setLoading(false);
  }, [apiKey]);

  const fetchTrades = async () => {
    try {
      const res = await fetch(`${backendUrl}/trades?key=${apiKey}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setTrades(data.map(t => ({ ...t, timestamp: t.timestamp || new Date().toISOString() })));
    } catch (e) {
      console.error(e);
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
    } catch {
      alert('Login error');
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

  const applyFilters = list => list.filter(trade => {
    const sym = searchFilters.symbol ? trade.symbol.toLowerCase().includes(searchFilters.symbol.toLowerCase()) : true;
    const res = searchFilters.result ? (searchFilters.result === 'win' ? trade.pnl >= 0 : trade.pnl < 0) : true;
    const tagM = searchFilters.tag ? trade.tag?.toLowerCase().includes(searchFilters.tag.toLowerCase()) : true;
    const dateM = selectedDates.length ? selectedDates.some(d => new Date(trade.timestamp).toISOString().startsWith(new Date(d).toISOString().split('T')[0])) : true;
    return sym && res && tagM && dateM;
  });

  const filteredTrades = applyFilters(trades);

  if (!apiKey) return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="p-6 border rounded">
        <h2 className="mb-4 text-xl">Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="block mb-2" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="block mb-4" />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
      </form>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trading Dashboard V2</h1>
        <div className="flex space-x-2">
          <DarkModeToggle />
          <CSVImporter setTrades={setTrades} />
          <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
        </div>
      </div>

      <StatsCards trades={filteredTrades} />
      <EquityCurve trades={filteredTrades} />
      <FilterBar searchFilters={searchFilters} setSearchFilters={setSearchFilters} />
      <Calendar onDatesSelected={setSelectedDates} />
      <RiskAnalytics trades={filteredTrades} />
      <WinRateByDay trades={filteredTrades} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filteredTrades.length ? (
          filteredTrades.map((trade, i) => (
            <TradeCard key={i} trade={{ ...trade, note: notes[i], tag: tags[i] }} onNote={() => openNotes(i)} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">No trades found.</div>
        )}
      </div>

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