import { useCallback, useState } from 'react';
import { API_CONFIG } from '../config/api';

export const useRetry = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = API_CONFIG.RETRY.ATTEMPTS || 3
  ): Promise<T> => {
    let lastError: Error | undefined;
    
    setIsRetrying(true);
    
    try {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          setRetryCount(attempt);
          const result = await fn();
          // Success - reset counters
          setRetryCount(0);
          setIsRetrying(false);
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error) || 'Unknown error');
          console.warn(`Attempt ${attempt + 1}/${maxAttempts} failed:`, lastError.message);
          
          // If this isn't the last attempt, wait before retrying
          if (attempt < maxAttempts - 1) {
            const delayMs = (API_CONFIG.RETRY.DELAY || 1000) * Math.pow(2, attempt); // Exponential backoff
            console.log(`Waiting ${delayMs}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
      }
      
      // All attempts failed
      setIsRetrying(false);
      throw lastError || new Error('All retry attempts failed');
    } catch (error) {
      setIsRetrying(false);
      setRetryCount(0);
      throw error;
    }
  }, []);

  const resetRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return { 
    retry, 
    retryCount, 
    isRetrying,
    resetRetry 
  };
};