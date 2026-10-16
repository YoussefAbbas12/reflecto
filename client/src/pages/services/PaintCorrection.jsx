import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import PackagesCarousel from '../../components/PackagesCarousel';
import SEOHead from '../../components/SEOHead';

const ServiceCard = React.memo(({ icon, title, subtitle }) => (
  <article className="flex-1 bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl p-6 flex flex-col items-start gap-4 hover:bg-white/[0.05] transition-all group">
    <div className="w-14 h-14 rounded-xl bg-[#FF5C35]/10 shadow-inner flex items-center justify-center text-3xl group-hover:bg-[#FF5C35] group-hover:text-white text-[#FF5C35] transition-all" aria-hidden="true">
      <Icon name={icon} />
    </div>
    <div>
      <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-1">{title}</h3>
      <p className="text-gray-500 font-bold tracking-wide text-[10px] uppercase">{subtitle}</p>
    </div>
  </article>
));

const StatBar = React.memo(({ label, value, numericValue }) => (
  <div className="flex items-center gap-6">
    <span className="text-gray-400 font-bold tracking-widest uppercase text-[10px] w-48 shrink-0">{label}</span>
    <div className="flex-1 h-1.5 bg-white/[0.05] shadow-inner rounded-full overflow-hidden" aria-hidden="true">
      <div className="h-full bg-gradient-to-r from-[#FF5C35] to-[#ff7a5c] rounded-full" style={{ width: `${numericValue}%`, transition: 'width 1s ease' }} />
    </div>
    <span className="text-[#FF5C35] font-bold tracking-widest text-[10px] w-12 text-right">{value}</span>
  </div>
));

const intensityImages = [
  '/assets/photo/level heat protection1.jpeg',
  '/assets/photo/levels heat protection.jpeg',
  '/assets/photo/levels heat protection3.jpeg',
  '/assets/photo/service/paint-after.jpg',
];

const PaintCorrection = React.memo(() => {
  const { t } = useTranslation(['paint_correction', 'common']);
  const [sliderPosition, setSliderPosition] = useState(50);

  const paintSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Paint Correction & Polish - تصحيح وتلميع الطلاء",
    "provider": {
      "@type": "AutomotiveBusiness",
      "name": "Reflecto Premium",
      "url": "https://www.reflecto.com.sa/"
    },
    "areaServed": ["Jeddah", "Riyadh", "Saudi Arabia"],
    "description": "تلميع وتصحيح طلاء احترافي لإزالة الدوائر والخدوش الدقيقة واستعادة اللمعان البراق للسيارة.",
    "url": "https://www.reflecto.com.sa/services/paint-correction"
  }), []);

  const serviceCards = useMemo(() => t('paint_correction:service_cards', { returnObjects: true }) || [], [t]);
  const statBars = useMemo(() => t('paint_correction:stat_bars', { returnObjects: true }) || [], [t]);
  const intensityLevels = useMemo(() => t('paint_correction:intensity_levels', { returnObjects: true }) || [], [t]);
  const packages = useMemo(() => t('paint_correction:packages', { returnObjects: true }) || [], [t]);

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

  const handleSliderKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') setSliderPosition(p => Math.max(0, p - 5));
    if (e.key === 'ArrowRight') setSliderPosition(p => Math.min(100, p + 5));
  }, []);

  return (
    <main className="min-h-screen bg-[#000000] text-white font-body selection:bg-[#FF5C35]/30">
      <SEOHead
        title={t('paint_correction:hero_title', 'تصحيح وتلميع الطلاء')}
        description={t('paint_correction:hero_subtitle', 'تلميع وتصحيح طلاء احترافي لإزالة الخدوش واستعادة لمعان السيارة الأصلي.')}
        canonicalPath="/services/paint-correction"
        keywords="تصحيح الطلاء, تلميع سيارات, إزالة الخدوش, تلميع ساطع, تلميع سيارات جدة, تلميع الرياض"
        schema={paintSchema}
      />
      <header className="relative w-full" aria-label="Hero Section">
        <div className="text-center pt-24 pb-12 px-6">
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-widest uppercase leading-tight">
            <span className="text-[#FF5C35]">{t('paint_correction:hero_highlight')}</span>{' '}
            <span className="text-white">{t('paint_correction:hero_rest')}</span>
          </h1>
          <p className="text-gray-400 font-bold tracking-wide text-xs mt-6 max-w-xl mx-auto uppercase">{t('paint_correction:hero_subtitle')}</p>
        </div>
        <div className="w-full h-[320px] md:h-[460px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <picture>
            <img src="/assets/photo/landing servicesss.jpeg" alt="Professional Paint Correction & Polishing" loading="lazy" decoding="async" className="w-full h-full object-cover object-center mix-blend-luminosity opacity-80" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=1400'; e.target.style.mixBlendMode='normal'; }} />
          </picture>
        </div>
      </header>

      <section className="py-24 px-6 bg-[#000000]" aria-label="Premium Services">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-widest uppercase text-center mb-12 text-white">
            {t('paint_correction:premium_services_prefix')} <span className="text-[#FF5C35]">{t('paint_correction:premium_services_highlight')}</span>{t('paint_correction:premium_services_suffix')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.isArray(serviceCards) && serviceCards.map((card, i) => (<ServiceCard key={i} icon={card.icon} title={card.title} subtitle={card.subtitle} />))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#0a0a0a]" aria-label="Technical Details">
        <div className="max-w-3xl mx-auto bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl p-10 rounded-3xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10 tracking-widest uppercase text-white">
            <span className="text-[#FF5C35]">{t('paint_correction:technical_highlight')}</span>{t('paint_correction:technical_rest')}
          </h2>
          <div className="space-y-6">
            {Array.isArray(statBars) && statBars.map((bar, i) => (<StatBar key={i} label={bar.label} value={bar.value} numericValue={bar.numericValue} />))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#000000]" aria-label="Correction Intensity Levels">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-widest uppercase mb-6 text-white">
            <span className="text-[#FF5C35]">{t('paint_correction:intensity_title_1_highlight')}</span>{t('paint_correction:intensity_title_1_rest')}
            <span className="text-white">{t('paint_correction:intensity_title_2')}</span>{t('paint_correction:intensity_title_3')}
            <span className="text-[#FF5C35]">{t('paint_correction:intensity_title_4_highlight')}</span>{t('paint_correction:intensity_title_4_rest')}
          </h2>
          <p className="text-gray-500 font-bold tracking-wide text-xs mb-16 max-w-2xl mx-auto uppercase">{t('paint_correction:intensity_subtitle')}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.isArray(intensityLevels) && intensityLevels.map((item, i) => (
              <figure key={i} className="flex flex-col items-center gap-6 group">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-white/[0.02] shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-1 group-hover:shadow-[0_10px_30px_rgba(255,92,53,0.3)] transition-all">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <picture>
                      <img src={intensityImages[i]} alt={`Paint correction intensity level: ${item.label}`} loading="lazy" decoding="async" className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" onError={(e) => { e.target.parentElement.parentElement.style.background = '#262626'; e.target.style.display = 'none'; }} />
                    </picture>
                  </div>
                </div>
                <figcaption className="text-[10px] font-bold tracking-widest text-[#FF5C35] uppercase text-center bg-[#FF5C35]/10 px-4 py-1.5 rounded-full">{item.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#000000]" aria-label="Before and After Comparison">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-widest uppercase mb-12 text-white">
            {t('paint_correction:slider_title_prefix')}<span className="text-[#FF5C35]">{t('paint_correction:slider_title_highlight_1')}</span>{t('paint_correction:slider_title_rest')}
            <span className="text-[#FF5C35]">{t('paint_correction:slider_title_highlight_2')}</span>
          </h2>
          
          <div 
            className="relative w-full h-[350px] md:h-[500px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-white/[0.02] select-none cursor-ew-resize group" 
            onMouseMove={handleMouseMove} 
            onTouchMove={handleTouchMove}
            role="slider"
            aria-valuenow={sliderPosition}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Before and after paint correction slider"
            tabIndex={0}
            onKeyDown={handleSliderKeyDown}
          >
            <div className="absolute inset-0">
              <picture>
                <img src="/assets/photo/service/paint-after.jpg" alt="After professional paint correction" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </picture>
              <div className="absolute top-6 right-6 px-5 py-2 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-widest text-white uppercase shadow-inner" aria-hidden="true">{t('paint_correction:slider_after')}</div>
            </div>
            
            <div className="absolute inset-0 shadow-[10px_0_30px_-5px_rgba(0,0,0,0.8)]" style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}>
              <picture>
                <img src="/assets/photo/service/paint-before.jpg" alt="Before paint correction with swirls and scratches" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </picture>
              <div className="absolute top-6 left-6 px-5 py-2 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-widest text-white uppercase shadow-inner" aria-hidden="true">{t('paint_correction:slider_before')}</div>
              <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-[#FF5C35] shadow-[0_0_15px_rgba(255,92,53,0.8)]" aria-hidden="true" />
            </div>
            
            <div className="absolute top-0 bottom-0 flex items-center justify-center z-10 pointer-events-none" style={{ left: `${sliderPosition}%` }}>
              <div className="w-12 h-12 bg-[#FF5C35] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(255,92,53,0.6)] text-white border-2 border-black -ml-6 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-sm font-bold">swap_horiz</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PackagesCarousel
        packages={packages}
        serviceSlug="paint-correction"
        title={
          <>
            <span className="text-[#FF5C35]">{t('paint_correction:packages_title_highlight')}</span>
            {t('paint_correction:packages_title_rest')}
          </>
        }
        bookLabel={t('paint_correction:book_service')}
      />
    </main>
  );
});

export default PaintCorrection;
