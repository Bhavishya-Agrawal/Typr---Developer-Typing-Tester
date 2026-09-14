import React from 'react';
import { Link } from 'react-router-dom';
import TypingBox from '../components/TypingBox';
import { ArrowRight, Trophy, Code2, Zap, BarChart2 } from 'lucide-react';

const Home = () => {
  const scrollToWorkstation = () => {
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  return (
    <div className="container">
      {/* Hero Section inspired directly by reference screenshot */}
      <section className="hero-section">
        {/* Capsule Badge */}
        <div className="hero-badge-row">
          <div className="hero-capsule-badge">
            <span className="badge-dot"></span>
            <span>Developer Typing Engine</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className="hero-headline">
          The intelligent platform for developer speed & code typing.
        </h1>
        <p className="hero-subtitle">
          Build developer muscle memory, master real-world syntax across Python, JavaScript, Java, and C++, and measure typing telemetry in real-time.
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta-group">
          <button onClick={scrollToWorkstation} className="btn-pill-primary">
            Start Typing Now <ArrowRight size={16} />
          </button>
          <Link to="/leaderboard" className="btn-pill-ghost">
            <Trophy size={16} /> Global Leaderboard
          </Link>
        </div>
      </section>

      {/* The Showcase Interactive Typing Workstation */}
      <TypingBox />

      {/* Features Overview Grid */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="hero-capsule-badge" style={{ marginBottom: '1rem' }}>
            <span>Architecture & Engine</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Engineered for genuine developer workflows
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="stat-card">
            <div style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              <Code2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Real-World Codebases
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Type genuine algorithms, class hierarchies, list comprehensions, and data structures rather than disconnected English words.
            </p>
          </div>

          <div className="stat-card">
            <div style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Zero-Latency Engine
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Instant keystroke validation with smart indentation preservation for colons, braces, and multi-line code constructs.
            </p>
          </div>

          <div className="stat-card">
            <div style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              <BarChart2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Persistent Telemetry
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Backed by MongoDB and Express REST APIs to track net WPM, keystroke accuracy, and personal best records over time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
