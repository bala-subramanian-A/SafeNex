import { useState, useEffect } from 'react';
import { getStoredItem, setStoredItem } from '../lib/storage';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getStoredItem<T>(key, initialValue);
  });

  useEffect(() => {
    setStoredItem(key, storedValue);
  }, [key, storedValue]);

  const setValue = (value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value;
      setStoredItem(key, nextValue);
      return nextValue;
    });
  };

  return [storedValue, setValue];
}

