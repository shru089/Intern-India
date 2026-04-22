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
        <div className="glass-card stat-item reveal reveal-d2">
          <Target className="neon-text-pink" size={32} />
          <h3>98%</h3>
          <p>Match Accuracy</p>
        </div>
        <div className="glass-card stat-item reveal reveal-d4">
          <Sparkles className="neon-text-cyan" size={32} />
          <h3>AI</h3>
          <p>Career Scout</p>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
