import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { HHErrorBoundary } from './components/core/HHErrorBoundaryComponent';
import { HHRouteGuard } from './components/core/HHRouteGuardComponent';
import { HHLandingPage } from './pages/LandingPage';
import { HHAuthPage } from './pages/AuthPage';
import { HHHomePage } from './pages/HomePage';
import { HHProfilePage } from './pages/ProfilePage';

const App: React.FC = () => {
  return (
    <HHErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HHLandingPage />} />
                <Route path="/auth/login" element={<HHAuthPage mode="login" />} />
                <Route path="/auth/register" element={<HHAuthPage mode="register" />} />
                <Route path="/auth/forgot-password" element={<HHAuthPage mode="forgot-password" />} />
                <Route path="/auth/reset-password" element={<HHAuthPage mode="reset-password" />} />
                <Route path="/home" element={<HHRouteGuard><HHHomePage /></HHRouteGuard>} />
                <Route path="/profile" element={<HHRouteGuard><HHProfilePage /></HHRouteGuard>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </HHErrorBoundary>
  );
};

export default App;
