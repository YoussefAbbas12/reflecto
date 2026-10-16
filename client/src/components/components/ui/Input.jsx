import React from 'react';

const Input = React.memo(({
  label,
  error,
  className = '',
  type = 'text',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const baseClasses = `
    w-full bg-white/[0.03] backdrop-blur-xl shadow-inner rounded-xl px-5 py-4 text-[11px] font-bold tracking-widest text-white uppercase
    focus:outline-none focus:bg-white/[0.06] transition-all border-0
    ${error
      ? 'shadow-[inset_0_0_0_1px_#ef4444]'
      : 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] focus:shadow-[inset_0_0_0_1px_#FF5C35]'
    }
  `;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-[10px] font-black text-gray-400 mb-2 tracking-widest uppercase">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`${baseClasses} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-red-500 text-[10px] font-bold tracking-widest uppercase mt-2">{error}</p>
      )}
    </div>
  );
});

const Select = React.memo(({
  label,
  error,
  className = '',
  children,
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const baseClasses = `
    w-full bg-white/[0.03] backdrop-blur-xl shadow-inner rounded-xl px-5 py-4 text-[11px] font-bold tracking-widest text-white uppercase
    focus:outline-none focus:bg-white/[0.06] transition-all appearance-none cursor-pointer border-0
    ${error
      ? 'shadow-[inset_0_0_0_1px_#ef4444]'
      : 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] focus:shadow-[inset_0_0_0_1px_#FF5C35]'
    }
  `;

  return (
    <div className="w-full relative">
      {label && (
        <label htmlFor={selectId} className="block text-[10px] font-black text-gray-400 mb-2 tracking-widest uppercase">
          {label}
        </label>
      )}
      <select id={selectId} className={`${baseClasses} ${className}`} aria-invalid={!!error} aria-describedby={error ? `${selectId}-error` : undefined} {...props}>
        {children}
      </select>
      <div className="absolute right-5 top-[50%] pointer-events-none mt-[8px]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      {error && (
        <p id={`${selectId}-error`} className="text-red-500 text-[10px] font-bold tracking-widest uppercase mt-2">{error}</p>
      )}
    </div>
  );
});

export { Input, Select };