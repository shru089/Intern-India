import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, Zap } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero flex-center">
        <div className="hero-grid"></div>
        <div className="container hero-content reveal">
          <div className="badge pulse">AI-POWERED MATCHING</div>
          <h1 className="hero-title">
            EVOLVE YOUR <span className="neon-text-cyan">CAREER</span> <br />
            BEYOND THE <span className="neon-text-pink">ORDINARY</span>
          </h1>
          <p className="hero-subtitle">
            The premium internship platform where AI intelligence meets human potential. 
            Direct government connections, rural empowerment, and elite opportunities.
          </p>
          <div className="hero-actions">
            <Link to="/auth" className="btn btn-primary btn-lg">GET STARTED <ArrowRight size={20} /></Link>
            <Link to="/find" className="btn btn-outline btn-lg">EXPLORE JOBS</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section container">
        <div className="glass-card stat-item reveal">
          <Zap className="neon-text-cyan" size={32} />
          <h3>10K+</h3>
          <p>Verified Internships</p>
        </div>
        <div className="glass-card stat-item reveal" style={{ animationDelay: '0.2s' }}>
          <Target className="neon-text-pink" size={32} />
          <h3>98%</h3>
          <p>Match Accuracy</p>
        </div>
        <div className="glass-card stat-item reveal" style={{ animationDelay: '0.4s' }}>
          <Sparkles className="neon-text-cyan" size={32} />
          <h3>AI</h3>
          <p>Career Scout</p>
        </div>
      </section>

      <style>{`
        .landing {
          min-height: 100vh;
        }
        .hero {
          position: relative;
          height: 100vh;
          overflow: hidden;
          text-align: center;
          background: radial-gradient(circle at 50% 50%, #111 0%, #050505 100%);
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(0, 245, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 245, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at 50% 50%, black, transparent 80%);
          transform: perspective(500px) rotateX(60deg) translateY(-100px);
          animation: grid-move 20s linear infinite;
        }
        @keyframes grid-move {
          from { background-position: 0 0; }
          to { background-position: 0 1000px; }
        }
        .hero-content {
          position: relative;
          z-index: 10;
        }
        .badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(0, 245, 255, 0.1);
          border: 1px solid var(--primary-neon);
          border-radius: 20px;
          color: var(--primary-neon);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          margin-bottom: 2rem;
        }
        .hero-title {
          font-size: 4.5rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }
        .hero-subtitle {
          font-size: 1.2rem;
          color: var(--text-dim);
          max-width: 700px;
          margin: 0 auto 3rem;
        }
        .hero-actions {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
        }
        .btn-lg {
          padding: 1rem 2.5rem;
          font-size: 1rem;
        }
        .stats-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: -5rem;
          position: relative;
          z-index: 20;
        }
        .stat-item {
          padding: 3rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .stat-item h3 {
          font-size: 2.5rem;
          margin: 0;
        }
        .stat-item p {
          color: var(--text-dim);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
        }
        @media (max-width: 1024px) {
          .hero-title { font-size: 3.5rem; }
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; }
          .stats-section { grid-template-columns: 1fr; margin-top: 2rem; }
          .hero-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
