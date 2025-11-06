import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

// Animation settings for page transitions within the app
const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
};

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
};

/**
 * The main layout for authenticated users.
 * Features a persistent sidebar and an animated content area for pages.
 */
const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="relative z-10 flex w-full min-h-screen">
      <Sidebar />
      <div className="flex-1 h-screen overflow-y-auto">
        {/* The motion.div ensures that page changes are animated */}
        <motion.div
          key={location.pathname} // The key is crucial for AnimatePresence to detect page changes
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default AppLayout;
