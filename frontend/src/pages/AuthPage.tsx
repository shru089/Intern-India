import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({ 
          email: formData.email, 
          password: formData.password, 
          fullName: formData.fullName,
          role: 'student' 
        });
      }
      toast.success(isLogin ? 'Welcome Back!' : 'Account Created!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container flex-center">
      <div className="auth-glow"></div>
      
      <div className="glass-card auth-card reveal">
        <div className="auth-header">
          <ShieldCheck className="neon-text-cyan" size={40} />
          <h2 className="font-orbitron">{isLogin ? 'SECURE ACCESS' : 'INITIALIZE PROFILE'}</h2>
          <p>{isLogin ? 'Return to the grid' : 'Create your digital identity'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                placeholder="FULL NAME" 
                required 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          )}
          
          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS" 
              required 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              placeholder="PASSWORD" 
              required 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'PROCESSING...' : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
              {isLogin ? 'REGISTER' : 'LOGIN'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        .auth-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(0, 245, 255, 0.1) 0%, transparent 70%);
          z-index: 0;
        }
        .auth-card {
          width: 100%;
          max-width: 450px;
          padding: 3rem;
          z-index: 10;
          border-width: 2px;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .auth-header h2 {
          margin: 1rem 0 0.5rem;
          font-size: 1.5rem;
        }
        .auth-header p {
          color: var(--text-dim);
          font-size: 0.85rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .input-group {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }
        .input-group input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          padding: 1rem 1rem 1rem 3rem;
          border-radius: 8px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: all 0.3s ease;
        }
        .input-group input:focus {
          border-color: var(--primary-neon);
          background: rgba(0, 245, 255, 0.05);
          box-shadow: 0 0 10px rgba(0, 245, 255, 0.2);
        }
        .w-full { width: 100%; justify-content: center; margin-top: 1rem; }
        .auth-footer {
          margin-top: 2rem;
          text-align: center;
          color: var(--text-dim);
          font-size: 0.85rem;
        }
        .toggle-btn {
          background: none;
          border: none;
          color: var(--primary-neon);
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          margin-left: 0.5rem;
          cursor: pointer;
        }
        .toggle-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
