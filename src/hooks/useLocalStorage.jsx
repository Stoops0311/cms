import React from 'react';
    import { useState, useEffect } from 'react';

    function getStorageValue(key, defaultValue) {
      const saved = localStorage.getItem(key);
      try {
        const initial = saved ? JSON.parse(saved) : defaultValue;
        return initial;
      } catch (e) {
        console.error("Error parsing localStorage key:", key, e);
        return defaultValue;
      }
    }

    const useLocalStorage = (key, defaultValue) => {
      const [value, setValue] = useState(() => {
        return getStorageValue(key, defaultValue);
      });

      useEffect(() => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
          console.error("Error setting localStorage key:", key, e);
        }
      }, [key, value]);

      return [value, setValue];
    };

    export default useLocalStorage;