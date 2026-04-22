import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, Search, Sparkles } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <nav className={`nav-fixed ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-content">
        <Link to="/" className="logo">
          INTERN<span className="neon-text-cyan">INDIA</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links desktop-only">
          {token ? (
            <>
              <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                <LayoutDashboard size={18} /> DASHBOARD
              </Link>
              <Link to="/find" className={location.pathname === '/find' ? 'active' : ''}>
                <Search size={18} /> FIND
              </Link>
              <Link to="/ai-scout" className={location.pathname === '/ai-scout' ? 'active' : ''}>
                <Sparkles size={18} /> AI SCOUT
              </Link>
              <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                <User size={18} /> PROFILE
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary">JOIN THE FUTURE</Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        {token ? (
          <div className="mobile-nav-links">
            <Link to="/dashboard" onClick={() => setIsOpen(false)}>DASHBOARD</Link>
            <Link to="/find" onClick={() => setIsOpen(false)}>FIND</Link>
            <Link to="/ai-scout" onClick={() => setIsOpen(false)}>AI SCOUT</Link>
            <Link to="/profile" onClick={() => setIsOpen(false)}>PROFILE</Link>
            <button onClick={handleLogout}>LOGOUT</button>
          </div>
        ) : (
          <Link to="/auth" className="btn btn-primary" onClick={() => setIsOpen(false)}>LOGIN</Link>
        )}
      </div>

      <style>{`
        .nav-fixed {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 1.5rem 0;
          transition: all 0.3s ease;
        }
        .nav-scrolled {
          padding: 1rem 0;
          background: rgba(5, 5, 5, 0.8);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid var(--glass-border);
        }
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: 1.5rem;
          color: #fff;
          text-decoration: none;
          letter-spacing: -1px;
        }
        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        .nav-links a {
          text-decoration: none;
          color: var(--text-dim);
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.3s ease;
        }
        .nav-links a:hover, .nav-links a.active {
          color: var(--primary-neon);
        }
        .logout-btn {
          background: none;
          border: none;
          color: var(--secondary-neon);
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .logout-btn:hover {
          transform: scale(1.1);
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
        }
        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 80%;
          height: 100vh;
          background: #000;
          z-index: 999;
          transition: right 0.3s ease;
          display: flex;
          flex-direction: column;
          padding: 5rem 2rem;
        }
        .mobile-menu.open {
          right: 0;
        }
        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .mobile-nav-links a {
          font-size: 1.5rem;
          color: #fff;
          text-decoration: none;
          font-family: 'Orbitron', sans-serif;
        }
        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .mobile-toggle { display: block; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
