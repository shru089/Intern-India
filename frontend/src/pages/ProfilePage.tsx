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
        <div className="glass-card identity-panel reveal reveal-d1">
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
        <div className="glass-card form-panel reveal reveal-d2">
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-row">
              <div className="input-field">
                <label htmlFor="fullName"><User size={14} /> FULL NAME</label>
                <input 
                  id="fullName"
                  type="text" 
                  value={profile.fullName} 
                  onChange={e => setProfile({...profile, fullName: e.target.value})}
                />
              </div>
              <div className="input-field">
                <label htmlFor="email"><Mail size={14} /> EMAIL</label>
                <input id="email" type="email" value={profile.email} readOnly disabled />
              </div>
            </div>

            <div className="form-row">
              <div className="input-field">
                <label htmlFor="location"><MapPin size={14} /> LOCATION</label>
                <input 
                  id="location"
                  type="text" 
                  value={profile.location} 
                  onChange={e => setProfile({...profile, location: e.target.value})}
                />
              </div>
              <div className="input-field">
                <label htmlFor="department"><BookOpen size={14} /> DEPARTMENT</label>
                <input 
                  id="department"
                  type="text" 
                  value={profile.department} 
                  onChange={e => setProfile({...profile, department: e.target.value})}
                />
              </div>
            </div>

            <div className="input-field full">
              <label htmlFor="skills"><Cpu size={14} /> SKILLS (NEURAL ARCHITECTURE)</label>
              <textarea 
                id="skills"
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

    </div>
  );
};

export default ProfilePage;
