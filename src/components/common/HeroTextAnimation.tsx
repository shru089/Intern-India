import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroTextAnimation = ({ phrases = [], as: Component = "h2", className }) => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!phrases.length) return;

    const type = () => {
      setText(phrases[index].substring(0, text.length + 1));
    };

    const backspace = () => {
      setText(phrases[index].substring(0, text.length - 1));
    };

    if (!isDeleting && text === phrases[index]) {
      // Pause at the end of the word
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    } 
    
    if (isDeleting && text === '') {
      setIsDeleting(false);
      setIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }

    const timeout = setTimeout(isDeleting ? backspace : type, isDeleting ? 50 : 125);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, phrases]);

  return (
    <Component className={`${className} relative`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="magic-text-gradient"
        >
          {text}&nbsp; {/* Use non-breaking space to prevent layout shift */}
        </motion.span>
      </AnimatePresence>
      <span 
        className="inline-block w-1 bg-secondary animate-pulse ml-1" 
        style={{ height: '1em', verticalAlign: 'bottom' }}
      ></span>
    </Component>
  );
};

export default HeroTextAnimation;