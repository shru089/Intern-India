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

  if (loading) return <div className="flex-center" style={{height: '80vh'}}><div className="loader"></div></div>;

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
        <div className="glass-card bento-item stat reveal" style={{ animationDelay: '0.1s' }}>
          <Briefcase className="neon-text-cyan" />
          <div className="stat-content">
            <span className="label">ACTIVE APPS</span>
            <span className="value">{data.stats.applications_count}</span>
          </div>
        </div>
        
        <div className="glass-card bento-item stat reveal" style={{ animationDelay: '0.2s' }}>
          <TrendingUp className="neon-text-pink" />
          <div className="stat-content">
            <span className="label">TOP MATCHES</span>
            <span className="value">{data.stats.matches_count}</span>
          </div>
        </div>

        <div className="glass-card bento-item stat reveal" style={{ animationDelay: '0.3s' }}>
          <CheckCircle className="neon-text-cyan" />
          <div className="stat-content">
            <span className="label">PROFILE SCORE</span>
            <span className="value">{data.stats.profile_completion}%</span>
          </div>
        </div>

        {/* Main Actions */}
        <div className="glass-card bento-item action-card reveal" style={{ animationDelay: '0.4s', gridColumn: 'span 2' }}>
          <div className="action-info">
            <h3 className="font-orbitron">FIND OPPORTUNITIES</h3>
            <p>Our AI has 12 new matches for your skill set.</p>
          </div>
          <button onClick={() => navigate('/find')} className="btn btn-primary">
            EXPLORE <Search size={18} />
          </button>
        </div>

        <div className="glass-card bento-item ai-card reveal" style={{ animationDelay: '0.5s' }}>
          <Sparkles className="neon-text-pink pulse" size={40} />
          <h3 className="font-orbitron">AI SCOUT</h3>
          <p>Analyze market pulse and career trends.</p>
          <button onClick={() => navigate('/ai-scout')} className="btn btn-outline btn-sm">LAUNCH</button>
        </div>

        {/* Recent Activity */}
        <div className="glass-card bento-item activity-card reveal" style={{ animationDelay: '0.6s', gridColumn: 'span 3' }}>
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

      <style>{`
        .dashboard { padding-top: 8rem; padding-bottom: 5rem; }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
        }
        .profile-mini {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1.5rem;
          border-radius: 40px;
        }
        .avatar {
          width: 40px;
          height: 40px;
          background: var(--primary-neon);
          color: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-family: 'Orbitron', sans-serif;
        }
        .profile-info { display: flex; flex-direction: column; }
        .profile-info .name { font-weight: 700; font-size: 0.9rem; }
        .profile-info .role { font-size: 0.7rem; color: var(--text-dim); }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .bento-item {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .stat { flex-direction: row; align-items: center; gap: 1.5rem; }
        .stat-content { display: flex; flex-direction: column; }
        .stat-content .label { font-size: 0.65rem; color: var(--text-dim); font-family: 'Orbitron', sans-serif; }
        .stat-content .value { font-size: 2rem; font-weight: 900; line-height: 1; }

        .action-card {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, rgba(0, 245, 255, 0.05) 0%, rgba(255, 255, 255, 0.03) 100%);
          border-color: rgba(0, 245, 255, 0.2);
        }
        .action-info h3 { font-size: 1.2rem; margin-bottom: 0.5rem; }
        .action-info p { color: var(--text-dim); font-size: 0.9rem; }

        .ai-card { align-items: center; text-align: center; gap: 1rem; }
        .ai-card h3 { font-size: 1rem; }
        .ai-card p { font-size: 0.8rem; color: var(--text-dim); }
        .btn-sm { padding: 0.5rem 1.5rem; font-size: 0.7rem; }

        .activity-card { justify-content: flex-start; }
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .text-btn {
          background: none;
          border: none;
          color: var(--primary-neon);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .activity-list { display: flex; flex-direction: column; gap: 1rem; }
        .activity-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }
        .activity-item:hover {
          background: rgba(255,255,255,0.05);
          border-color: var(--glass-border);
        }
        .activity-icon { color: var(--text-dim); }
        .activity-details { flex: 1; display: flex; flex-direction: column; }
        .app-title { font-weight: 700; font-size: 0.95rem; }
        .app-company { font-size: 0.8rem; color: var(--text-dim); }
        .status-pill {
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .status-pill.accepted { background: rgba(57, 255, 20, 0.1); color: var(--accent-neon); border: 1px solid var(--accent-neon); }
        .status-pill.pending { background: rgba(255, 215, 0, 0.1); color: #ffd700; border: 1px solid #ffd700; }
        .app-date { font-size: 0.75rem; color: var(--text-dim); min-width: 80px; text-align: right; }

        @media (max-width: 1024px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr); }
          .activity-card { grid-column: span 2 !important; }
        }
        @media (max-width: 768px) {
          .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .bento-grid { grid-template-columns: 1fr; }
          .action-card, .activity-card { grid-column: span 1 !important; }
          .action-card { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
