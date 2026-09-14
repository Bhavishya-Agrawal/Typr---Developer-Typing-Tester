import React, { useState, useEffect } from 'react';
import { getLeaderboardApi } from '../services/api';
import { Trophy, RefreshCw, Filter } from 'lucide-react';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('all');
  const [mode, setMode] = useState('all');

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await getLeaderboardApi({
        language: language === 'all' ? undefined : language,
        mode: mode === 'all' ? undefined : mode,
        limit: 50
      });
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [language, mode]);

  const languages = [
    { id: 'all', label: 'All Languages' },
    { id: 'python', label: 'Python' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'java', label: 'Java' },
    { id: 'cpp', label: 'C++' }
  ];

  return (
    <div className="container">
      <div className="page-header">
        <div className="hero-capsule-badge" style={{ marginBottom: '1rem' }}>
          <Trophy size={14} />
          <span>Global Rankings</span>
        </div>
        <h1 className="page-title">Developer Leaderboard</h1>
        <p className="page-subtitle">
          Benchmark your developer typing speed against top programmers worldwide.
        </p>
      </div>

      <div className="content-card">
        {/* Filter Bar */}
        <div className="table-filter-bar">
          <div className="chip-cluster">
            {languages.map((l) => (
              <button
                key={l.id}
                className={`chip ${language === l.id ? 'active' : ''}`}
                onClick={() => setLanguage(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button onClick={fetchLeaderboard} className="btn-pill-ghost" title="Refresh Leaderboard">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Leaderboard Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>Typist</th>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Language</th>
                <th>Mode</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading leaderboard rankings...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No test runs found for this filter. Be the first to set a score!
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <span className={`rank-badge ${row.rank === 1 ? 'rank-1' : row.rank === 2 ? 'rank-2' : row.rank === 3 ? 'rank-3' : ''}`}>
                        {row.rank}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{row.username}</strong>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                        {row.wpm}
                      </span>
                    </td>
                    <td>{row.accuracy}%</td>
                    <td style={{ textTransform: 'capitalize' }}>{row.language}</td>
                    <td style={{ textTransform: 'capitalize' }}>{row.mode}</td>
                    <td>{new Date(row.date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
