import React, { useState } from 'react';
import { User, Mail, MapPin, BookOpen, Cpu, Award, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'Shrishti Singh',
    email: 'shrishti@example.com',
    location: 'Remote / India',
    department: 'Computer Science',
    skills: 'React, Python, AI/ML, Cyber Security',
    gpa: '8.9'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Neural Profile Updated');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="profile-container container">
      <header className="profile-header reveal">
        <h1 className="font-orbitron">NEURAL <span className="neon-text-cyan">PROFILE</span></h1>
        <p>Calibrate your professional identity for the AI matching core.</p>
      </header>

      <div className="profile-grid">
        {/* Left: Identity Card */}
        <div className="glass-card identity-panel reveal" style={{ animationDelay: '0.1s' }}>
          <div className="profile-avatar-large">SS</div>
          <h2 className="profile-name">{profile.fullName}</h2>
          <p className="profile-tagline">Elite Student Developer</p>
          
          <div className="identity-stats">
            <div className="id-stat">
              <span className="label">REPUTATION</span>
              <span className="val neon-text-cyan">Lvl 4</span>
            </div>
            <div className="id-stat">
              <span className="label">BADGES</span>
              <span className="val neon-text-pink">12</span>
            </div>
          </div>
          
          <div className="profile-badges">
            <div className="badge-icon" title="Early Adopter"><Award size={20} /></div>
            <div className="badge-icon" title="AI Expert"><Cpu size={20} /></div>
          </div>
        </div>

        {/* Right: Data Form */}
        <div className="glass-card form-panel reveal" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-row">
              <div className="input-field">
                <label><User size={14} /> FULL NAME</label>
                <input 
                  type="text" 
                  value={profile.fullName} 
                  onChange={e => setProfile({...profile, fullName: e.target.value})}
                />
              </div>
              <div className="input-field">
                <label><Mail size={14} /> EMAIL</label>
                <input type="email" value={profile.email} readOnly disabled />
              </div>
            </div>

            <div className="form-row">
              <div className="input-field">
                <label><MapPin size={14} /> LOCATION</label>
                <input 
                  type="text" 
                  value={profile.location} 
                  onChange={e => setProfile({...profile, location: e.target.value})}
                />
              </div>
              <div className="input-field">
                <label><BookOpen size={14} /> DEPARTMENT</label>
                <input 
                  type="text" 
                  value={profile.department} 
                  onChange={e => setProfile({...profile, department: e.target.value})}
                />
              </div>
            </div>

            <div className="input-field full">
              <label><Cpu size={14} /> SKILLS (NEURAL ARCHITECTURE)</label>
              <textarea 
                rows={3} 
                value={profile.skills}
                onChange={e => setProfile({...profile, skills: e.target.value})}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'UPLOADING...' : 'SAVE CONFIGURATION'} <Save size={18} />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .profile-container { padding-top: 8rem; padding-bottom: 5rem; }
        .profile-header { margin-bottom: 3rem; text-align: center; }
        
        .profile-grid { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; }
        
        .identity-panel { padding: 3rem 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .profile-avatar-large { 
          width: 120px; height: 120px; 
          background: linear-gradient(135deg, var(--primary-neon), var(--secondary-neon)); 
          border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          font-size: 2.5rem; font-weight: 900; color: #000; 
          margin-bottom: 1.5rem;
          box-shadow: 0 0 30px rgba(0, 245, 255, 0.3);
          border: 4px solid #000;
        }
        .profile-name { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .profile-tagline { font-size: 0.8rem; color: var(--text-dim); font-family: 'Orbitron', sans-serif; margin-bottom: 2rem; }
        
        .identity-stats { display: flex; gap: 2rem; margin-bottom: 2rem; width: 100%; justify-content: center; }
        .id-stat { display: flex; flex-direction: column; gap: 0.3rem; }
        .id-stat .label { font-size: 0.6rem; font-family: 'Orbitron', sans-serif; color: var(--text-dim); }
        .id-stat .val { font-size: 1.2rem; font-weight: 900; }

        .profile-badges { display: flex; gap: 1rem; }
        .badge-icon { 
          width: 40px; height: 40px; 
          background: rgba(255,255,255,0.05); 
          border: 1px solid var(--glass-border); 
          border-radius: 8px; 
          display: flex; align-items: center; justify-content: center;
          color: var(--primary-neon);
          transition: all 0.3s ease;
        }
        .badge-icon:hover { border-color: var(--primary-neon); transform: translateY(-3px); }

        .form-panel { padding: 3rem; }
        .profile-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .input-field { display: flex; flex-direction: column; gap: 0.8rem; }
        .input-field label { font-size: 0.7rem; font-family: 'Orbitron', sans-serif; color: var(--text-dim); display: flex; align-items: center; gap: 0.5rem; }
        .input-field input, .input-field textarea {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          padding: 1rem;
          border-radius: 8px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: all 0.3s ease;
        }
        .input-field input:focus, .input-field textarea:focus {
          border-color: var(--primary-neon);
          background: rgba(0, 245, 255, 0.05);
        }
        .input-field.full { grid-column: span 2; }
        
        @media (max-width: 1024px) {
          .profile-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .form-row { grid-template-columns: 1fr; }
          .input-field.full { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
