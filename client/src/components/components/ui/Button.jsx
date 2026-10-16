import React from 'react';

const variants = {
  primary: 'bg-[#FF5C35]/10 text-[#FF5C35] hover:bg-[#FF5C35] hover:text-white shadow-inner border-0',
  secondary: 'bg-white/[0.05] text-white border-0 shadow-inner hover:bg-white/[0.1]',
  outline: 'bg-transparent text-[#FF5C35] shadow-[inset_0_0_0_1px_#FF5C35] hover:bg-[#FF5C35] hover:text-white border-0',
  ghost: 'text-gray-400 hover:text-white hover:bg-white/[0.05] border-0',
};

const sizes = {
  sm: 'px-4 py-2 text-[10px]',
  md: 'px-6 py-3 text-[11px]',
  lg: 'px-10 py-4 text-[12px]',
};

const Button = React.memo(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  ...props
}) => {
  return (
    <button
      className={`
        font-black tracking-widest uppercase rounded-xl flex items-center justify-center gap-3
        transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      ) : icon ? (
        <span className="shrink-0 flex items-center justify-center" aria-hidden="true">{icon}</span>
      ) : null}
      {children}
    </button>
  );
});

export default Button;