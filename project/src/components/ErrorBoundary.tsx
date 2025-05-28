import React, { ReactNode } from 'react';
import { withErrorBoundary } from '@sentry/react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface FallbackProps {
  error: unknown;
  resetError: () => void;
}

const ErrorFallback = ({ error, resetError }: FallbackProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-500 to-teal-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-6">
          {error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={resetError}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-full transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export const ErrorBoundary = withErrorBoundary(({ children }: ErrorBoundaryProps) => {
  return <>{children}</>;
}, {
  fallback: ErrorFallback
}); 