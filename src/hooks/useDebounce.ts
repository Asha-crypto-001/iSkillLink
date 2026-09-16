import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay: number = 300): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), delay);
  }) as T;
  return debounced;
}
