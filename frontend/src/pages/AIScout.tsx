import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  TrendingUp, 
  Cpu, 
  Globe, 
  MessageSquare, 
  FileText, 
  Layout, 
  Award, 
  Upload,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AIScout: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeScore, setResumeScore] = useState<number | null>(null);
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

  const simulateResumeAnalysis = () => {
    setIsAnalyzing(true);
    toast.loading('Analyzing Neural Architecture...', { id: 'analyze' });
    
    setTimeout(() => {
      setResumeScore(88);
      setIsAnalyzing(false);
      toast.success('Resume Decoded. Score: 88/100', { id: 'analyze' });
    }, 2000);
  };

  return (
    <div className="scout-container container">
      <header className="scout-header reveal">
        <h1 className="font-orbitron"><Sparkles className="neon-text-cyan" /> AI <span className="neon-text-pink">SCOUT</span></h1>
        <p>Real-time market intelligence and career path simulation.</p>
      </header>

      <div className="scout-bento">
        {/* Row 1: Market Pulse & Global Radar */}
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
          <div className="radar-tags">
            <span className="tag">#DigitalIndia</span>
            <span className="tag">#RuralTech</span>
          </div>
        </div>

        {/* Row 2: Resume Analyzer & Chat Interface */}
        <div className="glass-card panel resume-analyzer reveal reveal-d3">
          <div className="panel-header">
            <FileText className="neon-text-cyan" size={18} />
            <h4 className="font-orbitron">RESUME ANALYZER</h4>
          </div>
          
          <div className="analyzer-content">
            {resumeScore === null ? (
              <div className="upload-zone" onClick={simulateResumeAnalysis}>
                <Upload size={32} className="neon-text-cyan" />
                <p>Drop Resume to Decode</p>
                <span className="text-dim">PDF / DOCX accepted</span>
              </div>
            ) : (
              <div className="score-display">
                <div className="circular-score">
                  <span className="score-num">{resumeScore}</span>
                  <span className="score-max">/100</span>
                </div>
                <div className="analysis-notes">
                  <div className="note-item"><Award size={14} className="neon-text-pink" /> Strong Tech Stack</div>
                  <div className="note-item"><BrainCircuit size={14} className="neon-text-cyan" /> Missing Cloud Certs</div>
                </div>
                <button className="btn btn-outline btn-sm w-full" onClick={() => setResumeScore(null)}>RE-SCAN</button>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card chat-interface reveal reveal-d4">
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

        {/* Row 3: Skill Roadmap */}
        <div className="glass-card panel roadmap-panel reveal reveal-d5 col-span-3">
          <div className="panel-header">
            <Layout className="neon-text-cyan" size={18} />
            <h4 className="font-orbitron">SKILL TRAJECTORY</h4>
          </div>
          <div className="roadmap-grid">
            <div className="roadmap-step completed">
              <div className="step-icon"><ChevronRight size={16} /></div>
              <div className="step-info">
                <h5>React Master</h5>
                <p>Core foundations secured</p>
              </div>
            </div>
            <div className="roadmap-step active">
              <div className="step-icon pulse"><ChevronRight size={16} /></div>
              <div className="step-info">
                <h5>Cloud Infrastructure</h5>
                <p>Current Mission: AWS/GCP</p>
              </div>
            </div>
            <div className="roadmap-step upcoming">
              <div className="step-icon"><ChevronRight size={16} /></div>
              <div className="step-info">
                <h5>AI Integration</h5>
                <p>Next: LLM Orchestration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AIScout;
