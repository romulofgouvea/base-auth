import React from 'react';
import { Link } from 'react-router-dom';
import { HHResetPasswordForm } from './HHResetPasswordFormComponent';

export const HHResetPasswordCard: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col items-center relative transition-colors duration-300">

        <div className="text-center w-full flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">Redefinir Senha</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Crie uma nova senha para sua conta.</p>
        </div>

        <HHResetPasswordForm />

        <div className="mt-6 text-center text-sm w-full border-t border-gray-100 dark:border-gray-800 pt-6">
          <Link to="/auth/login" className="text-brand-primary hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">
            Voltar para o Login
          </Link>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 flex w-full max-w-md justify-between px-2 text-xs text-teal-100/60 font-medium tracking-wide">
        <span>Base Auth Starter</span>
        <span>&copy; 2026</span>
      </div>
    </div>
  );
};
