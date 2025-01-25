import { useState, useCallback } from 'react';

export default function useNotification() {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const showNotification = useCallback((message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });

    setTimeout(() => {
      setNotification(prev => ({ ...prev, open: false }));
    }, 3000);
  }, []);

  return {
    notification,
    showNotification
  };
} 