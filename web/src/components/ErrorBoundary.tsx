import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error reporting service in production
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
                Something went wrong
              </h2>

              <p className="mt-2 text-center text-sm text-gray-600">
                We're sorry for the inconvenience. An unexpected error has occurred.
              </p>

              {/* Only show error details in development */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-gray-900">
                      Error Details (Development Only)
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="font-semibold">Error:</span>{' '}
                        <span className="text-red-600">{this.state.error.message}</span>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <span className="font-semibold">Component Stack:</span>
                          <pre className="mt-1 text-xs overflow-auto max-h-40 bg-white p-2 rounded border">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 btn btn-secondary"
                >
                  Try Again
                </button>
                <button
                  onClick={() => (window.location.href = '/#/dashboard')}
                  className="flex-1 btn btn-primary"
                >
                  Go to Dashboard
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-gray-500">
                If this problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
