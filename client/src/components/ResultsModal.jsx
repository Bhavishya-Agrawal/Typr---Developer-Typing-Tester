import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ArrowRight, Trophy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ResultsModal = ({ results, onRetry, onNext }) => {
  const { user } = useAuth();
  if (!results) return null;

  const { wpm, accuracy, timeTaken, keystrokes, language, mode, saved } = results;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <span className="modal-header-pill">Session Complete</span>
        <h2 className="modal-title">Exceptional Run!</h2>

        <div className="modal-primary-metric">
          <div className="metric-hero-num">{wpm}</div>
          <div className="metric-hero-sub">Words Per Minute (WPM)</div>
        </div>

        <div className="modal-stats-grid">
          <div>
            <div className="grid-stat-val">{accuracy}%</div>
            <div className="grid-stat-label">Accuracy</div>
          </div>
          <div>
            <div className="grid-stat-val">{timeTaken}s</div>
            <div className="grid-stat-label">Duration</div>
          </div>
          <div>
            <div className="grid-stat-val">{keystrokes?.correct || 0} / {keystrokes?.total || 0}</div>
            <div className="grid-stat-label">Keystrokes</div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {user ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--code-correct)' }}>
              <CheckCircle2 size={16} /> Saved to your profile & leaderboard as <strong>{user.username}</strong>
            </span>
          ) : (
            <span>
              <Link to="/login" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>
                Sign in
              </Link>{' '}
              to permanently save your speed runs and rank on the leaderboard!
            </span>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onRetry} className="btn-pill-ghost">
            <RotateCcw size={16} /> Try Again
          </button>
          <button onClick={onNext} className="btn-pill-primary">
            Next Test <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
