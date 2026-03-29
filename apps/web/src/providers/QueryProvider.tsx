import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const isNetworkError = (error: any): boolean => {
  return (
    !navigator.onLine ||
    error?.message?.includes('Network Error') ||
    error?.message?.includes('Failed to fetch') ||
    error?.code === 'NETWORK_ERROR'
  );
};

const isServerError = (error: any): boolean => {
  const status = error?.status || error?.response?.status;
  return status >= 500 && status < 600;
};

const isRetryableError = (error: any): boolean => {
  return isNetworkError(error) || isServerError(error);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (failureCount >= 3) return false;
        return isRetryableError(error);
      },
      retryDelay: (attemptIndex) => {
        const baseDelay = 1000;
        const maxDelay = 30000;
        return Math.min(baseDelay * Math.pow(2, attemptIndex), maxDelay);
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        if (failureCount >= 2) return false;
        return isNetworkError(error);
      },
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
      },
    },
  },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

export { queryClient, isNetworkError, isServerError, isRetryableError };
