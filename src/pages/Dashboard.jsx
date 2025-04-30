// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import TradeCard from '../components/TradeCard';
import NotesModal from '../components/NotesModal';
import CSVImporter from '../components/CSVImporter';
import AccountSelector from '../components/AccountSelector';
import DarkModeToggle from '../components/DarkModeToggle';
import FilterBar from '../components/FilterBar';
import RiskAnalytics from '../components/RiskAnalytics';
import WinRateByDay from '../components/WinRateByDay';

// Tradezella-style components (relative paths)
import StatsCards from '../components/Tradezella/StatsCards';
import ZellaRadar from '../components/Tradezella/ZellaRadar';
import CumulativeAreaChart from '../components/Tradezella/CumulativeAreaChart';
import DailyBarChart from '../components/Tradezella/DailyBarChart';
import DailyPnlTable from '../components/Tradezella/DailyPnlTable';
import HeatmapCalendar from '../components/Tradezella/HeatmapCalendar';

const backendUrl = process.env.VITE_API_BASE || 'https://tradingview-webhook-v2.onrender.com';

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

  // Tradezella filters & data
  const [perfFilters, setPerfFilters] = useState({ start: '', end: '', symbol: 'ALL' });
  const [metrics, setMetrics] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [calendarData, setCalendarData] = useState([]);
  const [radarData, setRadarData] = useState([]);

  useEffect(() => {
    if (!apiKey) return;
    (async function() {
      const qs = new URLSearchParams(perfFilters).toString();
      const res = await fetch(`${backendUrl}/trades/performance?key=${apiKey}&${qs}`);
      const json = await res.json();
      setMetrics(json.metrics);
      setDailyData(json.daily);
      setCalendarData(json.calendar);
      setRadarData(json.radar);
    })();
  }, [apiKey, perfFilters]);

  useEffect(() => {
    if (!apiKey) { setLoading(false); return; }
    fetchTrades();
  }, [apiKey]);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/trades?key=${apiKey}`);
      const data = await res.json();
      setTrades(data.map(t => ({ ...t, timestamp: t.timestamp || new Date().toISOString() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async e => { /* unchanged */ };
  const handleLogout = () => { localStorage.removeItem('apiKey'); setApiKey(''); };
  const openNotes = idx => { setSelectedTradeIndex(idx); setShowNotesModal(true); };
  const saveNotes = (idx, newNote, newTag) => { setNotes(n => ({ ...n, [idx]: newNote })); setTags(t => ({ ...t, [idx]: newTag })); };
  const applyFilters = list => list; // unchanged
  const filteredTrades = applyFilters(trades);
  const onPerfFilter = e => setPerfFilters(f => ({ ...f, [e.target.name]: e.target.value }));

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-4">Please Log In</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-64 p-2 border rounded" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-64 p-2 border rounded" required />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
      </div>

      {/* Performance Filters */}
      <div className="flex space-x-2">
        <input type="date" name="start" onChange={onPerfFilter} className="p-1 border rounded" />
        <input type="date" name="end" onChange={onPerfFilter} className="p-1 border rounded" />
        <select name="symbol" onChange={onPerfFilter} className="p-1 border rounded">
          <option value="ALL">All Symbols</option>
          <option value="NQ">/NQ</option>
        </select>
      </div>

      {/* Tradezella Components */}
      {metrics && <StatsCards metrics={metrics} />}
      {radarData.length > 0 && <ZellaRadar radarData={radarData} />}
      {dailyData.length > 0 && <CumulativeAreaChart data={dailyData} />}
      {dailyData.length > 0 && <DailyBarChart data={dailyData} />}
      {dailyData.length > 0 && <DailyPnlTable dailyData={dailyData} />}
      {calendarData.length > 0 && <HeatmapCalendar calendarData={calendarData} />}

      {/* Existing UI */}
      <AccountSelector />
      <FilterBar searchFilters={searchFilters} setSearchFilters={setSearchFilters} />
      <RiskAnalytics trades={filteredTrades} />
      <WinRateByDay trades={filteredTrades} />
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrades.map((trade, i) => (
            <TradeCard key={i} trade={{ ...trade, note: notes[i], tag: tags[i] }} onNote={() => openNotes(i)} />
          ))}
        </div>
      )}

      {/* Notes & CSV */}
      <CSVImporter setTrades={setTrades} />
      {showNotesModal && <NotesModal index={selectedTradeIndex} note={notes[selectedTradeIndex]} tag={tags[selectedTradeIndex]} onSave={saveNotes} onClose={() => setShowNotesModal(false)} />}
    </div>
  );
}