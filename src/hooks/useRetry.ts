import { useCallback, useState } from 'react';
import { API_CONFIG } from '../config/api';

export const useRetry = () => {
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = API_CONFIG.RETRY_ATTEMPTS
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await fn();
        setRetryCount(0);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        setRetryCount(attempt + 1);
        
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => 
            setTimeout(resolve, API_CONFIG.RETRY_DELAY * (attempt + 1))
          );
        }
      }
    }
    
    throw lastError!;
  }, []);

  return { retry, retryCount };
};
