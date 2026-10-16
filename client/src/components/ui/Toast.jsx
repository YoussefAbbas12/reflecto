import React from 'react';
import { useToast } from '../../contexts/ToastContext';

const ICON_MAP = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const STYLE_MAP = {
  success: {
    bg: 'bg-emerald-500/10 backdrop-blur-2xl shadow-[0_8px_30px_rgba(16,185,129,0.3)]',
    border: 'border-0 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)]',
    icon: 'text-emerald-400',
    text: 'text-emerald-100',
  },
  error: {
    bg: 'bg-red-500/10 backdrop-blur-2xl shadow-[0_8px_30px_rgba(239,68,68,0.3)]',
    border: 'border-0 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.3)]',
    icon: 'text-red-400',
    text: 'text-red-100',
  },
  warning: {
    bg: 'bg-amber-500/10 backdrop-blur-2xl shadow-[0_8px_30px_rgba(245,158,11,0.3)]',
    border: 'border-0 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.3)]',
    icon: 'text-amber-400',
    text: 'text-amber-100',
  },
  info: {
    bg: 'bg-blue-500/10 backdrop-blur-2xl shadow-[0_8px_30px_rgba(59,130,246,0.3)]',
    border: 'border-0 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]',
    icon: 'text-blue-400',
    text: 'text-blue-100',
  },
};

/**
 * Global toast container — render once at app root.
 */
const ToastContainer = React.memo(() => {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => {
        const style = STYLE_MAP[t.type] || STYLE_MAP.info;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-4 px-5 py-4 rounded-2xl animate-fadeIn ${style.bg} ${style.border} transition-all duration-300`}
            role="alert"
          >
            <span className={`mt-0.5 shrink-0 bg-white/[0.05] p-1.5 rounded-full shadow-inner ${style.icon}`}>
              {ICON_MAP[t.type] || ICON_MAP.info}
            </span>
            <p className={`text-[11px] font-bold tracking-widest uppercase leading-relaxed flex-1 mt-1.5 ${style.text}`}>
              {t.message}
            </p>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-white/40 hover:text-white transition-colors mt-0.5 p-1 bg-white/[0.05] rounded-full shadow-inner hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={`Dismiss ${t.type} message`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
});

export default ToastContainer;
