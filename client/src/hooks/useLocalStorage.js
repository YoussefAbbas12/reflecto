import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    syncAcrossTabs = true,
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    onError = console.error,
  } = options;

  const readValue = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      onError(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, deserializer, onError]);

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, serializer(valueToStore));

        if (syncAcrossTabs) {
          window.dispatchEvent(new Event('local-storage'));
        }
      } catch (error) {
        onError(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serializer, storedValue, syncAcrossTabs, onError]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);

      if (syncAcrossTabs) {
        window.dispatchEvent(new Event('local-storage'));
      }
    } catch (error) {
      onError(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, syncAcrossTabs, onError]);

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    if (syncAcrossTabs) {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('local-storage', handleStorageChange);
    }

    return () => {
      if (syncAcrossTabs) {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('local-storage', handleStorageChange);
      }
    };
  }, [readValue, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
