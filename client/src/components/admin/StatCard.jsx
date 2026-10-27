import React from 'react';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

const StatCard = React.memo(({ title, value, icon, trendText, isSpecial, description }) => {
  const { isLight } = useAdminTheme();

  if (isSpecial) {
    return (
      <article className={`md:col-span-1 lg:col-span-2 p-8 rounded-2xl relative overflow-hidden flex flex-col justify-center border transition-colors ${
        isLight
          ? 'bg-gradient-to-br from-[#5C24EB]/10 via-white to-purple-50/40 border-gray-200 shadow-sm'
          : 'bg-white/[0.05] border-white/5 backdrop-blur-2xl shadow-inner'
      }`}>
        <div className="relative z-10">
          <h4 className="text-[#8B5CF6] font-black font-display text-[14px] uppercase tracking-widest">{title}</h4>
          <p className={`text-[11px] font-bold uppercase tracking-widest mt-2 max-w-[240px] leading-relaxed ${
            isLight ? 'text-gray-600' : 'text-gray-400'
          }`}>{description}</p>
        </div>
        <span
          className={`absolute -right-8 -bottom-8 material-symbols-outlined text-[160px] pointer-events-none ${
            isLight ? 'opacity-10 text-[#5C24EB]' : 'opacity-5 text-white'
          }`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </article>
    );
  }

  return (
    <article className={`p-6 rounded-2xl border flex flex-col gap-3 transition-colors ${
      isLight
        ? 'bg-white border-gray-200 shadow-sm text-gray-900'
        : 'bg-[#000000]/60 border-white/5 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)]'
    }`}>
      <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{title}</span>
      <span className={`text-3xl font-black font-display tracking-widest uppercase ${isLight ? 'text-gray-900' : 'text-white'}`}>{value}</span>
      <div className="flex items-center gap-2 text-[#8B5CF6] font-black tracking-widest uppercase text-[10px] mt-1 bg-[#5C24EB]/15 border border-[#5C24EB]/25 w-fit px-3 py-1.5 rounded-lg shadow-inner">
        <span className="material-symbols-outlined text-sm" aria-hidden="true">
          {icon}
        </span>
        {trendText}
      </div>
    </article>
  );
});

export default StatCard;
