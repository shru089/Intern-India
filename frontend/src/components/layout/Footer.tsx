import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <h2 className="logo">INTERN<span className="neon-text-cyan">INDIA</span></h2>
          <p>The next-generation career catalyst for India's brightest students.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Platform</h4>
            <a href="#">Find Internships</a>
            <a href="#">AI Career Scout</a>
            <a href="#">For Organizations</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Intern-India. Built with Neon Brutalism.</p>
      </div>
      <style>{`
        .footer {
          margin-top: 5rem;
          padding: 5rem 0 2rem;
          background: #000;
          border-top: 1px solid var(--glass-border);
        }
        .footer-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }
        .footer-brand p {
          color: var(--text-dim);
          margin-top: 1rem;
          max-width: 300px;
        }
        .footer-links {
          display: flex;
          justify-content: space-around;
        }
        .footer-links h4 {
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          color: var(--primary-neon);
        }
        .footer-links a {
          display: block;
          color: var(--text-dim);
          text-decoration: none;
          margin-bottom: 0.8rem;
          font-size: 0.85rem;
          transition: color 0.3s ease;
        }
        .footer-links a:hover {
          color: #fff;
        }
        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          color: var(--text-dim);
          font-size: 0.8rem;
        }
        @media (max-width: 768px) {
          .footer-content { grid-template-columns: 1fr; text-align: center; }
          .footer-brand p { margin: 1rem auto; }
          .footer-links { justify-content: space-between; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
