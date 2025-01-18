import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-xl p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Něco se pokazilo</h1>
            <p className="text-gray-600 mb-4">
              Omlouváme se, ale došlo k neočekávané chybě. Zkuste stránku obnovit nebo se vraťte na hlavní stránku.
            </p>
            {this.state.error && (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
              >
                Obnovit stránku
              </button>
              <a
                href="/"
                className="text-blue-500 hover:text-blue-600"
              >
                Zpět na hlavní stránku
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
