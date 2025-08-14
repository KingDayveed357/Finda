// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * Delays updating the debounced value until after the specified delay
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay completes
    // This prevents the debounced value from updating too frequently
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}