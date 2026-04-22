import React from 'react';
import { motion } from 'framer-motion';

const MagicText = ({ text, className }) => {
  return (
    <h1 className={className}>
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.25,
            delay: i / 10,
          }}
          className="inline-block mr-[0.25em] magic-text-gradient"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
};

export default MagicText;
