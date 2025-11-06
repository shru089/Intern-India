import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const BackButton = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 text-sm font-semibold text-neutral-400 hover:text-white transition-colors ${className}`}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowLeft size={16} />
      Back
    </motion.button>
  );
};

export default BackButton;
