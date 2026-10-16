import React from 'react';

const ProgressBar = React.memo(({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  labelPosition = 'top',
  className = '',
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variants = {
    default: 'bg-[#FF5C35] shadow-[0_0_15px_rgba(255,92,53,0.5)]',
    success: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    warning: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    info: 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  };

  return (
    <div className={`w-full ${className}`} {...props} role="progressbar" aria-valuenow={Math.round(percentage)} aria-valuemin="0" aria-valuemax="100">
      {showLabel && labelPosition === 'top' && (
        <div className="flex justify-between text-[10px] font-black tracking-widest uppercase mb-3">
          <span className="text-gray-400">{props.label || 'Progress'}</span>
          <span className="text-white">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-white/[0.05] rounded-full overflow-hidden shadow-inner border-0 ${sizes[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${variants[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && labelPosition === 'bottom' && (
        <div className="flex justify-between text-[10px] font-black tracking-widest uppercase mt-3">
          <span className="text-gray-400">{props.label || 'Progress'}</span>
          <span className="text-white">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
});

export default ProgressBar;