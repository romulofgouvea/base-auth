import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const HHLandingPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Base Auth</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          A ready-to-run auth starter: JWT access/refresh tokens, roles &amp; permissions,
          password reset and email verification.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/auth/login"
            className="px-5 py-2.5 rounded-lg bg-brand-primary text-white font-medium hover:bg-brand-secondary transition-colors"
          >
            Entrar
          </Link>
          <Link
            to="/auth/register"
            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
};
