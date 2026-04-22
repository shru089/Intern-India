import React, { useState } from 'react';
import { Search, Filter, MapPin, Briefcase, ExternalLink, ShieldCheck } from 'lucide-react';

const InternshipFinder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const internships = [
    { id: 1, title: 'AI Ethics Intern', company: 'NITI Aayog', location: 'New Delhi', score: 98, type: 'Government', stipend: '₹25,000' },
    { id: 2, title: 'Full Stack Developer', company: 'Digital India', location: 'Remote', score: 92, type: 'Government', stipend: '₹15,000' },
    { id: 3, title: 'Cybersecurity Analyst', company: 'CERT-In', location: 'Bengaluru', score: 85, type: 'Government', stipend: '₹20,000' },
    { id: 4, title: 'UI/UX Designer', company: 'MyGov', location: 'Remote', score: 78, type: 'Government', stipend: '₹12,000' },
  ];

  return (
    <div className="finder container">
      <div className="finder-header reveal">
        <h1 className="font-orbitron">THE <span className="neon-text-pink">GRID</span></h1>
        <div className="search-bar glass-card">
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="SEARCH BY SKILL, ROLE OR ORGANIZATION..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary">SEARCH</button>
        </div>
      </div>

      <div className="finder-layout">
        <aside className="filters glass-card reveal" style={{ animationDelay: '0.2s' }}>
          <div className="filter-group">
            <h4 className="font-orbitron"><Filter size={16} /> FILTERS</h4>
          </div>
          <div className="filter-group">
            <label>SOURCE</label>
            <div className="checkbox-group">
              <label><input type="checkbox" defaultChecked /> Government</label>
              <label><input type="checkbox" /> Private Startup</label>
              <label><input type="checkbox" /> International</label>
            </div>
          </div>
          <div className="filter-group">
            <label>STIPEND RANGE</label>
            <input type="range" className="neon-range" />
          </div>
          <div className="filter-group">
            <label>QUOTA</label>
            <div className="checkbox-group">
              <label><input type="checkbox" /> Rural Opportunity</label>
              <label><input type="checkbox" /> SC/ST/OBC</label>
            </div>
          </div>
        </aside>

        <main className="results-list">
          {internships.map((job, i) => (
            <div key={job.id} className="glass-card job-card reveal" style={{ animationDelay: `${0.3 + i*0.1}s` }}>
              <div className="job-header">
                <div className="job-meta">
                  <div className="job-type-badge"><ShieldCheck size={12}/> {job.type}</div>
                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-company">{job.company}</div>
                </div>
                <div className="match-score">
                  <span className="score-val">{job.score}%</span>
                  <span className="score-label">MATCH</span>
                  <div className="score-bar-bg">
                    <div className="score-bar-fill" style={{ width: `${job.score}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="job-details">
                <div className="detail-item"><MapPin size={16} /> {job.location}</div>
                <div className="detail-item"><Briefcase size={16} /> 3-6 Months</div>
                <div className="detail-item stipend">{job.stipend} / month</div>
              </div>

              <div className="job-actions">
                <button className="btn btn-outline">DETAILS</button>
                <button className="btn btn-primary">APPLY NOW <ExternalLink size={16} /></button>
              </div>
            </div>
          ))}
        </main>
      </div>

      <style>{`
        .finder { padding-top: 8rem; }
        .finder-header { margin-bottom: 4rem; text-align: center; }
        .finder-header h1 { font-size: 3rem; margin-bottom: 2rem; }
        .search-bar {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.5rem 0.5rem 1.5rem;
          max-width: 800px;
          margin: 0 auto;
          border-radius: 50px;
        }
        .search-icon { color: var(--text-dim); }
        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          padding: 0.8rem 1rem;
          color: #fff;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
          outline: none;
        }
        .finder-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
          align-items: start;
        }
        .filters { padding: 2rem; position: sticky; top: 6rem; }
        .filter-group { margin-bottom: 2rem; }
        .filter-group h4 { font-size: 0.8rem; margin-bottom: 1.5rem; color: var(--primary-neon); display: flex; align-items: center; gap: 0.5rem; }
        .filter-group label { display: block; font-size: 0.7rem; color: var(--text-dim); margin-bottom: 1rem; font-weight: 700; }
        .checkbox-group { display: flex; flex-direction: column; gap: 0.8rem; }
        .checkbox-group label { display: flex; align-items: center; gap: 0.8rem; font-size: 0.8rem; color: #fff; margin: 0; cursor: pointer; }
        .checkbox-group input { accent-color: var(--primary-neon); }

        .results-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .job-card { padding: 2rem; transition: transform 0.3s ease; }
        .job-card:hover { transform: scale(1.01); border-color: rgba(0, 245, 255, 0.3); }
        .job-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
        .job-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.6rem;
          font-weight: 800;
          color: var(--accent-neon);
          background: rgba(57, 255, 20, 0.05);
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          margin-bottom: 0.8rem;
          font-family: 'Orbitron', sans-serif;
        }
        .job-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.2rem; }
        .job-company { color: var(--primary-neon); font-family: 'Orbitron', sans-serif; font-size: 0.8rem; font-weight: 700; }
        
        .match-score { text-align: right; width: 120px; }
        .score-val { display: block; font-size: 1.8rem; font-weight: 900; line-height: 1; color: var(--primary-neon); }
        .score-label { font-size: 0.6rem; font-weight: 800; color: var(--text-dim); }
        .score-bar-bg { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 0.5rem; overflow: hidden; }
        .score-bar-fill { height: 100%; background: var(--primary-neon); box-shadow: 0 0 10px var(--primary-neon); }

        .job-details { display: flex; gap: 2rem; margin-bottom: 2rem; }
        .detail-item { display: flex; align-items: center; gap: 0.5rem; color: var(--text-dim); font-size: 0.85rem; }
        .stipend { color: #fff; font-weight: 700; }

        .job-actions { display: flex; gap: 1rem; }

        @media (max-width: 1024px) {
          .finder-layout { grid-template-columns: 1fr; }
          .filters { position: static; }
        }
        @media (max-width: 768px) {
          .job-header { flex-direction: column; gap: 1.5rem; }
          .match-score { text-align: left; width: 100%; }
          .job-details { flex-direction: column; gap: 0.8rem; }
          .job-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default InternshipFinder;
