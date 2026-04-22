import React, { useState } from 'react';
import { Send, Sparkles, TrendingUp, Cpu, Globe, MessageSquare } from 'lucide-react';

const AIScout: React.FC = () => {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState([
    { role: 'ai', content: "SYSTEM INITIALIZED. I am the Saarthi AI Career Scout. Analyze your trajectory or query the market pulse." }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setChat([...chat, { role: 'user', content: query }]);
    setQuery('');
    
    // Simulate AI response
    setTimeout(() => {
      setChat(prev => [...prev, { 
        role: 'ai', 
        content: "ANALYSIS COMPLETE: Demand for 'Generative AI' and 'Rust' is spiking in the public sector. Your current stack has a 94% compatibility with upcoming Ministry of Electronics projects." 
      }]);
    }, 1000);
  };

  return (
    <div className="scout-container container">
      <header className="scout-header reveal">
        <h1 className="font-orbitron"><Sparkles className="neon-text-cyan" /> AI <span className="neon-text-pink">SCOUT</span></h1>
        <p>Real-time market intelligence and career path simulation.</p>
      </header>

      <div className="scout-grid">
        {/* Left: Intelligence Panels */}
        <div className="scout-panels">
          <div className="glass-card panel reveal" style={{ animationDelay: '0.1s' }}>
            <div className="panel-header">
              <TrendingUp className="neon-text-cyan" size={18} />
              <h4 className="font-orbitron">MARKET PULSE</h4>
            </div>
            <div className="pulse-item">
              <span className="label">Web3 Devs</span>
              <div className="pulse-bar"><div className="fill" style={{width: '80%'}}></div></div>
              <span className="trend up">+12%</span>
            </div>
            <div className="pulse-item">
              <span className="label">Cybersec</span>
              <div className="pulse-bar"><div className="fill" style={{width: '65%'}}></div></div>
              <span className="trend up">+8%</span>
            </div>
          </div>

          <div className="glass-card panel reveal" style={{ animationDelay: '0.2s' }}>
            <div className="panel-header">
              <Globe className="neon-text-pink" size={18} />
              <h4 className="font-orbitron">GLOBAL RADAR</h4>
            </div>
            <p className="panel-text">Government of India has announced 5,000+ new technical internships for rural students.</p>
          </div>
        </div>

        {/* Right: AI Chat Interface */}
        <div className="glass-card chat-interface reveal" style={{ animationDelay: '0.3s' }}>
          <div className="chat-messages">
            {chat.map((msg, i) => (
              <div key={i} className={`message-wrapper ${msg.role}`}>
                <div className="message-bubble">
                  {msg.role === 'ai' && <Cpu size={14} className="ai-icon" />}
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSend} className="chat-input-area">
            <input 
              type="text" 
              placeholder="QUERY THE AI CORE..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-icon">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .scout-container { padding-top: 8rem; }
        .scout-header { margin-bottom: 3rem; text-align: center; }
        .scout-header h1 { font-size: 2.5rem; display: flex; align-items: center; justify-content: center; gap: 1rem; }
        .scout-header p { color: var(--text-dim); }

        .scout-grid { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; height: 600px; }
        .scout-panels { display: flex; flex-direction: column; gap: 1.5rem; }
        .panel { padding: 1.5rem; }
        .panel-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.8rem; }
        .panel-header h4 { font-size: 0.75rem; margin: 0; }
        
        .pulse-item { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .pulse-item .label { font-size: 0.75rem; width: 80px; }
        .pulse-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .pulse-bar .fill { height: 100%; background: var(--primary-neon); box-shadow: 0 0 10px var(--primary-neon); }
        .trend { font-size: 0.7rem; font-weight: 800; }
        .trend.up { color: var(--accent-neon); }
        .panel-text { font-size: 0.85rem; color: var(--text-dim); line-height: 1.5; }

        .chat-interface { 
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
          border-color: rgba(0, 245, 255, 0.1); 
        }
        .chat-messages { flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem; }
        .message-wrapper { display: flex; width: 100%; }
        .message-wrapper.user { justify-content: flex-end; }
        .message-bubble { 
          max-width: 80%; 
          padding: 1rem 1.5rem; 
          border-radius: 12px; 
          font-size: 0.9rem; 
          line-height: 1.6;
          position: relative;
        }
        .ai .message-bubble { 
          background: rgba(255,255,255,0.03); 
          border: 1px solid var(--glass-border);
          color: #fff;
          border-left: 3px solid var(--primary-neon);
        }
        .user .message-bubble { 
          background: var(--primary-neon); 
          color: #000; 
          font-weight: 600;
          box-shadow: 4px 4px 0 #000;
        }
        .ai-icon { position: absolute; left: -25px; top: 15px; color: var(--primary-neon); }

        .chat-input-area { 
          padding: 1.5rem; 
          background: rgba(0,0,0,0.3); 
          border-top: 1px solid var(--glass-border); 
          display: flex; 
          gap: 1rem; 
        }
        .chat-input-area input { 
          flex: 1; 
          background: rgba(255,255,255,0.05); 
          border: 1px solid var(--glass-border); 
          padding: 1rem 1.5rem; 
          border-radius: 8px; 
          color: #fff; 
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
          outline: none;
        }
        .chat-input-area input:focus { border-color: var(--primary-neon); }
        .btn-icon { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; padding: 0; }

        @media (max-width: 1024px) {
          .scout-grid { grid-template-columns: 1fr; height: auto; }
          .chat-interface { height: 500px; }
        }
      `}</style>
    </div>
  );
};

export default AIScout;
