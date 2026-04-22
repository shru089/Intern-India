import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const InternshipFinder = lazy(() => import('./pages/InternshipFinder'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AIScout = lazy(() => import('./pages/AIScout'));

// Auth Guard (Simplified for now)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 15, 15, 0.9)',
              color: '#fff',
              border: '1px solid rgba(0, 245, 255, 0.5)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
        
        <Navbar />
        
        <main className="main-content">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Protected Student Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/find" element={<ProtectedRoute><InternshipFinder /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/ai-scout" element={<ProtectedRoute><AIScout /></ProtectedRoute>} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
      </div>
     </AuthProvider>
    </Router>
  );
};

const LoadingSpinner = () => (
  <div className="flex-center" style={{ height: '80vh' }}>
    <div className="loader"></div>
    <style>{`
      .loader {
        width: 50px;
        height: 50px;
        border: 3px solid var(--glass-border);
        border-top-color: var(--primary-neon);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        box-shadow: 0 0 15px var(--primary-neon);
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

export default App;