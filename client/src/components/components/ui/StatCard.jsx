import React from 'react';

const StatCard = React.memo(({
  label,
  value,
  trend,
  icon,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-[#000000]/60 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-0',
    highlighted: 'bg-[#FF5C35]/5 backdrop-blur-2xl shadow-inner border-0',
    success: 'bg-emerald-500/10 backdrop-blur-2xl shadow-inner border-0',
    warning: 'bg-amber-500/10 backdrop-blur-2xl shadow-inner border-0',
  };

  const trendColors = {
    up: 'text-emerald-500 bg-emerald-500/10',
    down: 'text-red-500 bg-red-500/10',
    neutral: 'text-gray-400 bg-white/[0.05]',
  };

  const getTrendDirection = (trendText) => {
    if (!trendText) return 'neutral';
    if (trendText.startsWith('+') || trendText.includes('increase') || trendText.includes('up')) {
      return 'up';
    }
    if (trendText.startsWith('-') || trendText.includes('decrease') || trendText.includes('down')) {
      return 'down';
    }
    return 'neutral';
  };

  return (
    <article
      className={`p-6 lg:p-8 rounded-2xl h-full flex flex-col ${variants[variant]} ${className}`}
      {...props}
    >
      <header className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4 flex items-center justify-between">
        {label}
        {icon && <span className="bg-white/[0.05] p-2 rounded-xl shadow-inner" aria-hidden="true">{icon}</span>}
      </header>
      <div className="text-3xl font-display font-black tracking-widest uppercase mb-4 text-white">{value}</div>
      {trend && (
        <div className={`text-[9px] font-bold tracking-widest uppercase flex items-center gap-2 w-fit px-3 py-1.5 rounded-lg shadow-inner ${trendColors[getTrendDirection(trend)]}`}>
          {getTrendDirection(trend) === 'up' && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          )}
          {getTrendDirection(trend) === 'down' && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          )}
          {trend}
        </div>
      )}
    </article>
  );
});

export default StatCard;