import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HHButton } from '../components/core/HHButtonComponent';
import { HHThemeToggle } from '../components/core/HHThemeToggleComponent';

export const HHHomePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold">Base Auth</span>
        <div className="flex items-center gap-3">
          <HHThemeToggle />
          <HHButton color="default" variant="outline" onClick={logout}>
            Sair
          </HHButton>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h1 className="text-2xl font-semibold mb-1">Bem-vindo, {user?.name || user?.email || 'usuário'}!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Você está autenticado. Isso confirma que o fluxo de login, tokens e sessão está funcionando ponta a ponta.
          </p>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <dt className="text-gray-400 dark:text-gray-500">ID</dt>
              <dd className="font-mono break-all">{user?.id}</dd>
            </div>
            <div>
              <dt className="text-gray-400 dark:text-gray-500">Email</dt>
              <dd>{user?.email}</dd>
            </div>
            <div>
              <dt className="text-gray-400 dark:text-gray-500">Roles</dt>
              <dd>{user?.roles?.join(', ') || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-400 dark:text-gray-500">Permissions</dt>
              <dd>{user?.permissions?.length ?? 0} concedida(s)</dd>
            </div>
          </dl>

          <Link
            to="/profile"
            className="text-brand-primary font-medium hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            Editar meu perfil →
          </Link>
        </div>
      </main>
    </div>
  );
};
