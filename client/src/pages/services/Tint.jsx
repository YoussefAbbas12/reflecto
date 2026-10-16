import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PackagesCarousel from '../../components/PackagesCarousel';
import HeroVideo from '../../components/HeroVideo';
import SEOHead from '../../components/SEOHead';

const TINT_SPECS = {
  '00': { ir: '96%', uv: '99.9%', privacy: '30%', tser: '68.05%' },
  '01': { ir: '95%', uv: '99.9%', privacy: '50%', tser: '72.92%' },
  '02': { ir: '96%', uv: '99.9%', privacy: '65%', tser: '82.45%' },
  '03': { ir: '96%', uv: '99.9%', privacy: '80%', tser: '89.05%' },
  '04': { ir: '96%', uv: '99.9%', privacy: '95%', tser: '95.65%' }
};

const Tint = React.memo(() => {
  const { t } = useTranslation(['tint', 'service5', 'common']);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeLevel, setActiveLevel] = useState('02');

  const tintSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Thermal Insulation Window Tinting - تظليل عازل حراري",
    "provider": {
      "@type": "AutomotiveBusiness",
      "name": "Reflecto Premium",
      "url": "https://www.reflecto.com.sa/"
    },
    "areaServed": ["Jeddah", "Riyadh", "Saudi Arabia"],
    "description": "تظليل نوافذ نانو سيراميك عازل للحرارة يقلل 99% من الأشعة فوق البنفسجية و95% من الأشعة تحت الحمراء.",
    "url": "https://www.reflecto.com.sa/services/window-tint"
  }), []);

  const currentSpec = useMemo(() => TINT_SPECS[activeLevel] || TINT_SPECS['02'], [activeLevel]);
  const vltLevels = useMemo(() => t('tint:vlt_levels', { returnObjects: true }) || [], [t]);
  const thermalFeatures = useMemo(() => t('tint:thermal_features', { returnObjects: true }) || [], [t]);
  const regularFeatures = useMemo(() => t('tint:regular_features', { returnObjects: true }) || [], [t]);
  const packages = useMemo(() => t('tint:packages', { returnObjects: true }) || [], [t]);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  }, []);

  const handleTouchMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  }, []);

  return (
    <main className="min-h-screen bg-[#000000] pb-20 font-body text-white selection:bg-[#FF5C35]/30">
      <SEOHead
        title={t('tint:hero_title', 'تظليل النوافذ العازل للحرارة')}
        description={t('tint:hero_subtitle', 'تظليل نانو سيراميك احترافي يعزل حتى 99% من الحرارة والأشعة الضارة.')}
        canonicalPath="/services/window-tint"
        keywords="تظليل سيارات, عازل حراري, تظليل نانو سيراميك, تظليل سيارات جدة, تظليل الرياض"
        schema={tintSchema}
      />
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-black overflow-hidden mb-16" aria-labelledby="tint-hero-heading">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <HeroVideo src="/assets/solar_film_demonstration.mp4" webmSrc="/assets/solar_film_demonstration.webm" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-black/40 to-black/30 pointer-events-none" aria-hidden="true"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6 pt-16">
          <h1 id="tint-hero-heading" className="text-4xl tracking-[2px] md:text-7xl font-display font-black mb-4 leading-tight uppercase text-white">
            {t('tint:tint_title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light font-michroma leading-relaxed">
            {t('tint:tint_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto px-10 py-4 bg-[#FF5C35] text-white font-bold rounded-2xl flex items-center justify-center gap-2 group shadow-[0_8px_30px_rgb(255,92,53,0.3)] hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50"
            >
              {t('common:book_service')}
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6" /></svg>
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto px-10 py-4 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
            >
              {t('common:explore_services')}
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none z-10" aria-hidden="true">
          <div className="w-6 h-10 rounded-full bg-white/5 shadow-inner flex justify-center p-1 border border-white/10 backdrop-blur-sm">
            <div className="w-1 h-2 bg-[#FF5C35] rounded-full shadow-[0_0_10px_#FF5C35]"></div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <section className="w-full max-w-4xl mx-auto mb-32" aria-label="Tint Overview">
          <article className="bg-white/[0.02] backdrop-blur-2xl p-6 sm:p-10 rounded-3xl shadow-inner border border-white/5">
            <h2 className="text-4xl font-display font-bold mb-4 tracking-widest uppercase leading-tight">{t('tint:tint_title')}</h2>
            <p className="text-gray-400 text-sm mb-10 leading-relaxed font-bold tracking-wide">{t('tint:tint_subtitle')}</p>
            <div className="space-y-8">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('tint:select_tint_level')}</span>
                <span className="text-[10px] bg-[#FF5C35]/10 text-[#FF5C35] shadow-inner px-3 py-1 rounded-full font-bold uppercase tracking-widest">{t('tint:premium_film')}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-[10px] font-bold tracking-widest uppercase text-gray-500" role="group" aria-label="Tint levels">
                {['00', '01', '02', '03', '04'].map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveLevel(key)}
                    className={`py-3 px-1 rounded-xl shadow-inner border-0 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 ${activeLevel === key ? 'bg-[#FF5C35] text-white shadow-[0_4px_15px_rgba(255,92,53,0.3)] font-black scale-105' : 'bg-white/[0.05] hover:bg-white/[0.1] hover:text-white'}`}
                    aria-pressed={activeLevel === key}
                  >
                    {t(`tint:tint_levels.${key}`)}
                  </button>
                ))}
              </div>
              <div className="space-y-5" aria-label="Performance Statistics">
                {[
                  { label: t('tint:stats.heat_reduction'), val: currentSpec.ir },
                  { label: t('tint:stats.uv_protection'), val: currentSpec.uv },
                  { label: t('tint:stats.privacy_level'), val: currentSpec.privacy },
                  { label: t('tint:stats.tser'), val: currentSpec.tser }
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2"><span className="text-gray-400">{s.label}</span><span className="text-[#FF5C35] font-black">{s.val}</span></div>
                    <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden shadow-inner"><div className="h-full bg-[#FF5C35] transition-all duration-300" style={{ width: parseFloat(s.val) + '%' }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="text-center mb-32" aria-label="Transparency Guide">
          <span className="text-[#FF5C35] text-[10px] font-bold uppercase tracking-widest mb-4 block">{t('tint:visual_guide')}</span>
          <h2 className="text-4xl md:text-5xl font-display font-light mb-14 tracking-tight"><span className="text-[#FF5C35] font-bold">{t('tint:transparency_scale_highlight')}</span> {t('tint:transparency_scale_rest')}</h2>
          <p className="text-gray-400 text-sm mb-12 leading-relaxed max-w-xl mx-auto font-bold tracking-wide">{t('tint:transparency_desc')}</p>
          <div className="flex flex-wrap justify-center gap-12">
            {Array.isArray(vltLevels) && vltLevels.map((item, i) => (
              <div key={i} className="text-center group cursor-pointer" tabIndex={0} role="button" aria-label={`VLT ${item.p}`}>
                <div className="w-[140px] h-[140px] rounded-full bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] mb-4 p-1 group-hover:shadow-[0_8px_30px_rgba(255,92,53,0.2)] transition-all relative overflow-hidden">
                  <img src={`/assets/photo/service/vlt-${item.p.replace('%', '')}.jpg`} alt={`VLT ${item.p} tint level`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </div>
                <div className="text-xl font-display font-bold mb-1 tracking-widest">{item.p}</div>
                <div className="text-[10px] font-bold uppercase text-[#FF5C35] tracking-widest">{item.l}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center mb-32" aria-label="Visual Impact Comparison">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 tracking-widest uppercase text-white">
            {t('tint:visual_impact_prefix')} <span className="text-[#FF5C35]">{t('tint:visual_impact_highlight')}</span>
          </h2>
          <p className="text-gray-500 text-sm mb-10 max-w-xl mx-auto font-bold tracking-wide">
            {t('tint:visual_impact_subtitle')}
          </p>

          <div
            className="relative max-w-5xl mx-auto h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-white/[0.02] border-0 select-none cursor-ew-resize group"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            role="slider"
            aria-valuenow={sliderPosition}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Before and after tint comparison slider"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') setSliderPosition(p => Math.max(0, p - 5));
              if (e.key === 'ArrowRight') setSliderPosition(p => Math.min(100, p + 5));
            }}
          >
            <div className="absolute inset-0">
              <picture>
                <div className="w-full h-full relative">
                  <img src="/assets/photo/service/tint-after.jpg" alt="Window Tint After Application" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white text-xl md:text-2xl font-black tracking-widest uppercase [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000]">Window Tint After Application</span>
                </div>
              </picture>
              <div className="absolute top-6 right-6 px-5 py-2 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-widest text-white uppercase shadow-inner" aria-hidden="true">{t('tint:slider_after')}</div>
            </div>
            <div
              className="absolute inset-0 shadow-[10px_0_30px_-5px_rgba(0,0,0,0.8)]"
              style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
              <picture>
                <img src="/assets/photo/service/tint-before.jpg" alt="Window Tint Before Application" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </picture>
              <div className="absolute top-6 left-6 px-5 py-2 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-widest text-white uppercase shadow-inner" aria-hidden="true">{t('tint:slider_before')}</div>
              <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-[#FF5C35] shadow-[0_0_15px_rgba(255,92,53,0.8)]" aria-hidden="true" />
            </div>
            <div
              className="absolute top-0 bottom-0 pointer-events-none flex items-center justify-center z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-12 h-12 bg-[#FF5C35] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(255,92,53,0.6)] text-white border-2 border-black -ml-6 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-sm font-bold">swap_horiz</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-32" aria-label="Tint Packages Comparison">
          <article className="bg-gradient-to-b from-[#1a0f0d] to-black p-10 rounded-3xl shadow-[0_8px_30px_rgba(255,92,53,0.1)] border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5C35] to-transparent opacity-50" aria-hidden="true"></div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-display font-black tracking-widest uppercase mb-2">{t('tint:thermal_tint_title')}</h3>
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#FF5C35]">{t('tint:thermal_tint_subtitle')}</p>
              </div>
              <span className="bg-[#FF5C35]/10 text-[#FF5C35] text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full uppercase shadow-inner whitespace-nowrap">{t('tint:recommended')}</span>
            </div>
            <ul className="space-y-4 mb-12 text-xs font-bold tracking-wide text-gray-300">
              {Array.isArray(thermalFeatures) && thermalFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-[#FF5C35] text-sm shrink-0">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="space-y-5">
              {[
                { l: t('tint:thermal_stats.heat_block'), v: '95%' },
                { l: t('tint:thermal_stats.uv_protection'), v: '99%' },
                { l: t('tint:thermal_stats.privacy'), v: '70%' }
              ].map(s => (
                <div key={s.l}>
                  <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2 text-gray-500"><span>{s.l}</span><span className="text-white">{s.v}</span></div>
                  <div className="h-1 w-full bg-white/[0.05] rounded-full shadow-inner overflow-hidden"><div className="h-full bg-[#FF5C35]" style={{ width: s.v }}></div></div>
                </div>
              ))}
            </div>
              <Link to="/contact" className="w-full py-4 mt-12 bg-[#FF5C35] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-[0_8px_30px_rgba(255,92,53,0.3)] hover:brightness-110 transition-all text-center block focus:outline-none focus:ring-2 focus:ring-white/50">
              {t('tint:book_service')}
            </Link>
          </article>

          <article className="bg-white/[0.02] backdrop-blur-2xl p-10 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-0">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-display font-black tracking-widest uppercase mb-2 text-gray-400">{t('tint:regular_tint_title')}</h3>
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-600">{t('tint:regular_tint_subtitle')}</p>
              </div>
            </div>
            <ul className="space-y-4 mb-12 text-xs font-bold tracking-wide text-gray-500">
              {Array.isArray(regularFeatures) && regularFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-gray-600 text-sm shrink-0">check</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="space-y-5">
              {[
                { l: t('tint:thermal_stats.heat_block'), v: '55%' },
                { l: t('tint:thermal_stats.uv_protection'), v: '70%' },
                { l: t('tint:thermal_stats.privacy'), v: '80%' }
              ].map(s => (
                <div key={s.l}>
                  <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2 text-gray-600"><span>{s.l}</span><span className="text-gray-400">{s.v}</span></div>
                  <div className="h-1 w-full bg-white/[0.02] rounded-full shadow-inner overflow-hidden"><div className="h-full bg-gray-600" style={{ width: s.v }}></div></div>
                </div>
              ))}
              <Link to="/contact" className="w-full py-4 mt-12 bg-white/[0.05] shadow-inner text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/[0.1] transition-all text-center block focus:outline-none focus:ring-2 focus:ring-white/50">
                {t('tint:book_service')}
              </Link>
            </div>
          </article>
        </section>
      </div>

      <PackagesCarousel
        packages={packages}
        serviceSlug="window-tint"
        title={
          <>
            {t('tint:packages_title_highlight_1')}{' '}
            <span className="text-[#FF5C35]">{t('tint:packages_title_highlight_2')}</span>{' '}
            {t('tint:packages_title_rest')}
          </>
        }
        bookLabel={t('tint:book_service')}
      />
    </main>
  );
});

export default Tint;
