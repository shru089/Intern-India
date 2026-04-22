import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../layout/PageWrapper';
import HeroTextAnimation from '../common/HeroTextAnimation';

// Animation variants for the new intro sequence
const introContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.4, delayChildren: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  }
};

const emblemVariant = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } },
};

const textVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const HomePage = () => {
  const navigate = useNavigate();
  const phrases = ["Excellence.", "Opportunity.", "The Future.", "Your Career."];

  // This effect handles the 7-second timer and redirect
  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to the auth page and pass state to default to the register tab
      navigate('/auth', { state: { defaultToRegister: true } });
    }, 7000); // 7 seconds

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleMouseMove = (e) => {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--x", `${x}px`);
    target.style.setProperty("--y", `${y}px`);
  };

  return (
    <PageWrapper>
      <AnimatePresence>
        <div className="hero-section flex min-h-screen items-center justify-center p-4 text-center" onMouseMove={handleMouseMove}>
          <motion.div
            className="relative z-10"
            variants={introContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.img
              src="/emblem.png"
              alt="Emblem of India"
              variants={emblemVariant}
              className="mx-auto h-24 w-24 mb-6"
            />
            
            <motion.h2
              variants={textVariant}
              className="text-4xl font-bold text-neutral-200 sm:text-5xl md:text-6xl"
            >
              Connecting India's Talent with
            </motion.h2>

            <motion.div variants={textVariant}>
              <HeroTextAnimation
                phrases={phrases}
                as="h2"
                className="mt-2 text-4xl font-bold sm:text-5xl md:text-6xl"
              />
            </motion.div>
            
            <motion.p
              variants={textVariant}
              className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400 md:text-xl"
            >
              The Prime Minister's Internship Scheme: Your gateway to a career in public service.
            </motion.p>
          </motion.div>
        </div>
      </AnimatePresence>
    </PageWrapper>
  );
};

export default HomePage;