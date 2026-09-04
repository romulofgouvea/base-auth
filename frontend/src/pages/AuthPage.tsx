import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HHAuthLayout } from '../components/core/HHAuthLayoutComponent';
import { HHLoginCard } from '../components/auth/HHLoginCardComponent';
import { HHRegisterCard } from '../components/auth/HHRegisterCardComponent';
import { HHForgotPasswordCard } from '../components/auth/HHForgotPasswordCardComponent';
import { HHResetPasswordCard } from '../components/auth/HHResetPasswordCardComponent';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

interface HHAuthPageProps {
  mode: AuthMode;
}

export const HHAuthPage: React.FC<HHAuthPageProps> = ({ mode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const renderCard = () => {
    switch (mode) {
      case 'login':
        return <HHLoginCard />;
      case 'register':
        return <HHRegisterCard />;
      case 'forgot-password':
        return <HHForgotPasswordCard />;
      case 'reset-password':
        return <HHResetPasswordCard />;
      default:
        return <HHLoginCard />;
    }
  };

  return (
    <HHAuthLayout>
      {renderCard()}
    </HHAuthLayout>
  );
};
