// hooks/useAppInitialization.ts
import { useEffect, useState } from 'react';
import { initializeHttpClient } from '@/utils/axios-client';

interface UseAppInitializationReturn {
  isInitialized: boolean;
  initializationError: string | null;
}

/**
 * Hook to handle app initialization including CSRF token setup
 */
export const useAppInitialization = (): UseAppInitializationReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        
        // Initialize HTTP client with CSRF support
        await initializeHttpClient();
        
        setIsInitialized(true);
        console.log('App initialization completed successfully');
      } catch (error) {
        console.error('App initialization failed:', error);
        setInitializationError(error instanceof Error ? error.message : 'Unknown initialization error');
        // Still set as initialized to let the app continue
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  return {
    isInitialized,
    initializationError,
  };
};