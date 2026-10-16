import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';

/**
 * @typedef {'success' | 'error' | 'warning' | 'info'} ToastType
 *
 * @typedef {Object} Toast
 * @property {string} id
 * @property {ToastType} type
 * @property {string} message
 * @property {number} duration
 */

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = React.memo(({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = `toast-${++toastId}`;
      const toast = { id, type, message, duration };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        timersRef.current[id] = setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (msg, dur) => addToast(msg, 'success', dur),
      error: (msg, dur) => addToast(msg, 'error', dur ?? 6000),
      warning: (msg, dur) => addToast(msg, 'warning', dur),
      info: (msg, dur) => addToast(msg, 'info', dur),
    }),
    [addToast]
  );

  const value = useMemo(() => ({
    toasts,
    toast,
    removeToast
  }), [toasts, toast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
});

/**
 * Hook to access toast functions.
 * @returns {{ toast: { success: Function, error: Function, warning: Function, info: Function }, toasts: Toast[], removeToast: Function }}
 */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};

export default ToastContext;
