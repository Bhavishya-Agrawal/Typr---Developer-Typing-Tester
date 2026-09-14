import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyStatsApi, getMyResultsApi } from '../services/api';
import { User, Award, Activity, CheckCircle, Clock, BarChart3, Lock } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      setLoading(true);
      try {
        const [statsRes, historyRes] = await Promise.all([
          getMyStatsApi(),
          getMyResultsApi()
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (historyRes.success) setHistory(historyRes.data);
      } catch (err) {
        console.error('Failed to load profile data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div className="hero-capsule-badge" style={{ marginBottom: '1.5rem' }}>
          <Lock size={14} />
          <span>Authentication Required</span>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Sign In to Access Your Profile
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
          Track your typing telemetry, monitor historical WPM improvements, and save personal best scores.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/login" className="btn-pill-primary">
            Sign In
          </Link>
          <Link to="/register" className="btn-pill-ghost">
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Profile Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div className="hero-capsule-badge" style={{ marginBottom: '0.75rem' }}>
            <User size={14} />
            <span>Developer Account</span>
          </div>
          <h1 className="page-title">{user.username}</h1>
          <p className="page-subtitle">{user.email}</p>
        </div>

        <Link to="/" className="btn-pill-primary">
          Take a Typing Test
        </Link>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="stat-card-grid">
        <div className="stat-card">
          <div className="stat-card-title">Personal Best</div>
          <div className="stat-card-value">{stats?.bestWpm || 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Highest recorded WPM</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Average Speed</div>
          <div className="stat-card-value">{stats?.avgWpm || 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Words Per Minute</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Avg Accuracy</div>
          <div className="stat-card-value">{stats?.avgAccuracy || 100}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Keystroke Precision</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Tests Completed</div>
          <div className="stat-card-value">{stats?.totalTests || 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total sessions recorded</div>
        </div>
      </div>

      {/* Test History */}
      <div className="content-card" style={{ marginTop: '2rem' }}>
        <div className="table-filter-bar">
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} />
            <span>Recent Test History</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing last {history.length} runs
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Language</th>
                <th>Mode</th>
                <th>Duration</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading your test history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No typing tests recorded yet. Go take your first run!
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h._id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                        {h.wpm}
                      </span>
                    </td>
                    <td>{h.accuracy}%</td>
                    <td style={{ textTransform: 'capitalize' }}>{h.language}</td>
                    <td style={{ textTransform: 'capitalize' }}>{h.mode}</td>
                    <td>{h.timeTaken}s</td>
                    <td>{new Date(h.createdAt).toLocaleDateString()}</td>
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

export default Profile;
