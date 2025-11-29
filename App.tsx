import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import WorkerDashboard from './pages/WorkerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import ChatBot from './components/ChatBot';

// Guards
const ProtectedRoute = ({ children, role }: React.PropsWithChildren<{ role?: UserRole }>) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Redirect to correct dashboard if role mismatch
    return <Navigate to={user.role === UserRole.EMPLOYER ? '/employer/dashboard' : '/worker/dashboard'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        
        {/* Worker Routes */}
        <Route 
          path="/worker/dashboard" 
          element={
            <ProtectedRoute role={UserRole.WORKER}>
              <WorkerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Employer Routes */}
        <Route 
          path="/employer/dashboard" 
          element={
            <ProtectedRoute role={UserRole.EMPLOYER}>
              <EmployerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ChatBot />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;