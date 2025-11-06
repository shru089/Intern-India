import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './components/hooks/useAuth';

// Layout and Global Component Imports
import VideoBackground from './components/layout/VideoBackground';
import AppLayout from './components/layout/AppLayout';
import PublicLayout from './components/layout/PublicLayout';

/**
 * The root component of the application.
 * It is responsible for:
 * 1. Rendering the persistent video background.
 * 2. Switching between the Public and Authenticated layouts based on auth state.
 */
const Root = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* The video background is rendered once here and persists across the entire app */}
      <VideoBackground />
      
      {/* AnimatePresence smoothly transitions between the two layouts when auth state changes */}
      <AnimatePresence mode="wait" initial={false}>
        {isAuthenticated ? (
          <AppLayout key="app-layout" />
        ) : (
          <PublicLayout key="public-layout" />
        )}
      </AnimatePresence>
    </>
  );
};

export default Root;
