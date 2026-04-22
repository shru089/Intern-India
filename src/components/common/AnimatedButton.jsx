import React from 'react';
import { motion } from 'framer-motion';

const AnimatedButton = ({ children, onClick, className = '', icon: Icon, disabled = false, type = "button" }) => (
  <motion.button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn-primary ${className}`} // Uses the new, professional style
    whileHover={!disabled ? { scale: 1.03, y: -2 } : {}}
    whileTap={!disabled ? { scale: 0.98, y: 0 } : {}}
  >
    {/* Use relative z-10 to ensure content is above any gradient/background effects */}
    {Icon && <span className="relative z-10"><Icon size={20} /></span>}
    <span className="relative z-10">{children}</span>
  </motion.button>
);

export default AnimatedButton;