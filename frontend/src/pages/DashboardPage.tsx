import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Search, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API fetch from /students/dashboard
    setTimeout(() => {
      setData({
        stats: {
          applications_count: 12,
          matches_count: 45,
          profile_completion: 85
        },
        recent_applications: [
          { id: 1, title: 'AI Research Intern', company: 'NITI Aayog', status: 'Accepted', date: '2 days ago' },
          { id: 2, title: 'ML Developer', company: 'Digital India', status: 'Pending', date: '5 days ago' },
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="flex-center spinner-container"><div className="loader"></div></div>;

  return (
    <div className="dashboard container">
      <header className="dashboard-header reveal">
        <div>
          <h1 className="font-orbitron">MISSION <span className="neon-text-cyan">CONTROL</span></h1>
          <p className="text-dim">Welcome back, Agent Shrishti. Systems are nominal.</p>
        </div>
        <div className="profile-mini glass-card">
          <div className="avatar">SS</div>
          <div className="profile-info">
            <span className="name">Shrishti Singh</span>
            <span className="role">Pro Student</span>
          </div>
        </div>
      </header>

      <div className="bento-grid">
        {/* Stats Row */}
        <div className="glass-card bento-item stat reveal reveal-d1">
          <Briefcase className="neon-text-cyan" />
          <div className="stat-content">
            <span className="label">ACTIVE APPS</span>
            <span className="value">{data.stats.applications_count}</span>
          </div>
        </div>
        
        <div className="glass-card bento-item stat reveal reveal-d2">
          <TrendingUp className="neon-text-pink" />
          <div className="stat-content">
            <span className="label">TOP MATCHES</span>
            <span className="value">{data.stats.matches_count}</span>
          </div>
        </div>

        <div className="glass-card bento-item stat reveal reveal-d3">
          <CheckCircle className="neon-text-cyan" />
          <div className="stat-content">
            <span className="label">PROFILE SCORE</span>
            <span className="value">{data.stats.profile_completion}%</span>
          </div>
        </div>

        {/* Main Actions */}
        <div className="glass-card bento-item action-card reveal reveal-d4 col-span-2">
          <div className="action-info">
            <h3 className="font-orbitron">FIND OPPORTUNITIES</h3>
            <p>Our AI has 12 new matches for your skill set.</p>
          </div>
          <button onClick={() => navigate('/find')} className="btn btn-primary">
            EXPLORE <Search size={18} />
          </button>
        </div>

        <div className="glass-card bento-item ai-card reveal reveal-d5">
          <Sparkles className="neon-text-pink pulse" size={40} />
          <h3 className="font-orbitron">AI SCOUT</h3>
          <p>Analyze market pulse and career trends.</p>
          <button onClick={() => navigate('/ai-scout')} className="btn btn-outline btn-sm">LAUNCH</button>
        </div>

        {/* Recent Activity */}
        <div className="glass-card bento-item activity-card reveal reveal-d6 col-span-3">
          <div className="activity-header">
            <h3 className="font-orbitron">RECENT DEPLOYMENTS</h3>
            <button className="text-btn">VIEW ALL <ChevronRight size={16} /></button>
          </div>
          <div className="activity-list">
            {data.recent_applications.map((app: any) => (
              <div key={app.id} className="activity-item">
                <div className="activity-icon"><Clock size={16} /></div>
                <div className="activity-details">
                  <span className="app-title">{app.title}</span>
                  <span className="app-company">{app.company}</span>
                </div>
                <div className={`status-pill ${app.status.toLowerCase()}`}>{app.status}</div>
                <span className="app-date">{app.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
