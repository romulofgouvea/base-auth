import React from 'react';
import { HHLoginForm } from './HHLoginFormComponent';
import { Link } from 'react-router-dom';

export const HHLoginCard: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col items-center relative transition-colors duration-300">

        <HHLoginForm />

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?{' '}
          <Link to="/auth/register" className="font-medium text-brand-primary hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Cadastre-se
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
