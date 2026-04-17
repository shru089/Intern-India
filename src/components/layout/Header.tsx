import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import AnimatedButton from '../common/AnimatedButton';

const Header = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-neutral-900/50 backdrop-blur-lg shadow-2xl border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <motion.div 
          className="flex cursor-pointer items-center gap-3" 
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
        >
          <img src="/emblem.png" alt="Emblem of India" className="h-8 w-8" />
          <h1 className="text-2xl font-bold text-white">Intern India</h1>
        </motion.div>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => navigate('/auth')}
            className="rounded-lg px-4 py-2 font-semibold text-neutral-300 transition-colors hover:text-white"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
          <AnimatedButton onClick={() => navigate('/auth')} className="text-sm">
            Register
          </AnimatedButton>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;