import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Search, ListChecks, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/find-internships', icon: Search, label: 'Find' },
  { path: '/applied-internships', icon: ListChecks, label: 'Applications' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarVariants = {
    hidden: { x: -250 },
    visible: { x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-64 min-h-screen bg-neutral-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col p-4"
    >
      <div className="flex items-center gap-3 px-3 py-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <img src="/emblem.png" alt="Emblem of India" className="w-8 h-8" />
        <h1 className="text-xl font-bold text-white">Intern India</h1>
      </div>

      <nav className="mt-10 flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 my-1 rounded-lg transition-colors text-neutral-300 hover:bg-primary/20 hover:text-white ${
                    isActive ? 'bg-primary/20 text-white font-semibold' : ''
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-neutral-400 hover:bg-red-500/20 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
