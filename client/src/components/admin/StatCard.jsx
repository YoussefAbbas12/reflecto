import React from 'react';

const StatCard = React.memo(({ title, value, icon, trendText, isSpecial, description }) => {
  if (isSpecial) {
    return (
      <article className="md:col-span-1 lg:col-span-2 bg-white/[0.05] backdrop-blur-2xl p-8 rounded-2xl relative overflow-hidden flex flex-col justify-center shadow-inner border-0">
        <div className="relative z-10">
          <h4 className="text-[#FF5C35] font-black font-display text-[14px] uppercase tracking-widest">{title}</h4>
          <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-2 max-w-[240px] leading-relaxed">{description}</p>
        </div>
        <span
          className="absolute -right-8 -bottom-8 material-symbols-outlined text-[160px] opacity-5 text-white pointer-events-none"
          aria-hidden="true"
        >
          {icon}
        </span>
      </article>
    );
  }

  return (
    <article className="bg-[#000000]/60 backdrop-blur-2xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border-0 flex flex-col gap-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</span>
      <span className="text-3xl font-black font-display tracking-widest uppercase text-white">{value}</span>
      <div className="flex items-center gap-2 text-[#FF5C35] font-black tracking-widest uppercase text-[10px] mt-1 bg-[#FF5C35]/10 w-fit px-3 py-1.5 rounded-lg shadow-inner">
        <span className="material-symbols-outlined text-sm" aria-hidden="true">
          {icon}
        </span>
        {trendText}
      </div>
    </article>
  );
});

export default StatCard;
