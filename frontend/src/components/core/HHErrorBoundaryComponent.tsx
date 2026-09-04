import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class HHErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[HHErrorBoundary]', error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-md w-full rounded-xl border border-red-200 bg-white dark:bg-gray-800 dark:border-red-800 p-8 text-center shadow-sm">
            <p className="text-4xl mb-4">⚠️</p>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Algo deu errado
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {this.state.error?.message ?? 'Erro inesperado na aplicação.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
