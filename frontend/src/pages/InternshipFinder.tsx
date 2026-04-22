import React, { useState } from 'react';
import { Search, Filter, MapPin, Briefcase, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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
            aria-label="Search internships"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary">SEARCH</button>
        </div>
      </div>

      <div className="finder-layout">
        <aside className="filters glass-card reveal reveal-d2">
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
            <label htmlFor="stipend-range">STIPEND RANGE</label>
            <input type="range" id="stipend-range" className="neon-range" aria-label="Stipend range selector" />
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
            <motion.div 
              key={job.id} 
              className="glass-card job-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
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
                    <motion.div 
                      className="score-bar-fill" 
                      initial={{ width: 0 }}
                      animate={{ width: `${job.score}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    ></motion.div>
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
            </motion.div>
          ))}
        </main>
      </div>

    </div>
  );
};

export default InternshipFinder;
