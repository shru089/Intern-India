import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

/**
 * The layout for all public-facing pages (e.g., Home, Login/Register).
 * Features a persistent header and a main content area.
 */
const PublicLayout = () => (
  <div className="relative z-10">
    <Header />
    <main>
      <Outlet />
    </main>
  </div>
);

export default PublicLayout;
