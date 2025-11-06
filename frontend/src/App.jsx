import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/hooks/useAuth';
import Root from './Root';

// --- Lazy-loaded Pages for Performance ---
const HomePage = lazy(() => import('./components/pages/HomePage'));
const AuthPage = lazy(() => import('./components/pages/AuthPage'));
const DashboardPage = lazy(() => import('./components/pages/DashboardPage'));
const InternshipFinderPage = lazy(() => import('./components/pages/InternshipFinderPage'));
const AppliedInternshipsPage = lazy(() => import('./components/pages/AppliedInternshipsPage'));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage'));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

// --- Upgraded Route Guards ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  // While checking for authentication, show a loading screen.
  if (loading) return <LoadingFallback />;
  // Once checked, redirect if not authenticated.
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  // This will now only protect pages like /auth
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route element={<Root />}>
          {/* --- KEY CHANGE: HomePage is now outside of PublicRoute --- */}
          <Route path="/" element={<HomePage />} />
          
          {/* AuthPage remains protected for logged-in users */}
          <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

          {/* Protected routes remain the same */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/find-internships" element={<ProtectedRoute><InternshipFinderPage /></ProtectedRoute>} />
          <Route path="/applied-internships" element={<ProtectedRoute><AppliedInternshipsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}