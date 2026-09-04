import React from 'react';
import { HHRegisterForm } from './HHRegisterFormComponent';
import { Link } from 'react-router-dom';

export const HHRegisterCard: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col items-center relative transition-colors duration-300">

        <div className="text-center w-full flex flex-col items-center mb-2">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">Crie sua conta!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Junte-se hoje mesmo.</p>
        </div>

        <HHRegisterForm />

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta?{' '}
          <Link to="/auth/login" className="font-medium text-brand-primary hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Entre aqui
          </Link>
        </div>

        <div className="w-full mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>Base Auth Starter</span>
          <span>© 2026</span>
        </div>
      </div>
    </div>
  );
};
