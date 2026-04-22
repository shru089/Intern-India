import React, { useState } from 'react';
import { Send, Sparkles, TrendingUp, Cpu, Globe, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

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
          <div className="glass-card panel reveal reveal-d1">
            <div className="panel-header">
              <TrendingUp className="neon-text-cyan" size={18} />
              <h4 className="font-orbitron">MARKET PULSE</h4>
            </div>
            <div className="pulse-item">
              <span className="label">Web3 Devs</span>
              <div className="pulse-bar">
                <motion.div 
                  className="fill" 
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                ></motion.div>
              </div>
              <span className="trend up">+12%</span>
            </div>
            <div className="pulse-item">
              <span className="label">Cybersec</span>
              <div className="pulse-bar">
                <motion.div 
                  className="fill" 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1.5, delay: 0.4 }}
                ></motion.div>
              </div>
              <span className="trend up">+8%</span>
            </div>
          </div>

          <div className="glass-card panel reveal reveal-d2">
            <div className="panel-header">
              <Globe className="neon-text-pink" size={18} />
              <h4 className="font-orbitron">GLOBAL RADAR</h4>
            </div>
            <p className="panel-text">Government of India has announced 5,000+ new technical internships for rural students.</p>
          </div>
        </div>

        {/* Right: AI Chat Interface */}
        <div className="glass-card chat-interface reveal reveal-d3">
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
            <button type="submit" className="btn btn-primary btn-icon" aria-label="Send query">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default AIScout;
