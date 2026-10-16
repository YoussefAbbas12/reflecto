import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PackagesCarousel from '../../components/PackagesCarousel';
import HeroVideo from '../../components/HeroVideo';
import SEOHead from '../../components/SEOHead';

const Annotation = React.memo(({ label, className }) => (
  <div className={`absolute flex items-center gap-2 ${className}`} aria-hidden="true">
    <span className="w-2 h-2 rounded-full bg-[#FF5C35] shrink-0 shadow-[0_0_8px_rgba(255,92,53,0.8)]" />
    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-200 whitespace-nowrap leading-none bg-black/50 backdrop-blur-sm px-2 py-1 rounded shadow-inner">
      {label}
    </span>
  </div>
));

const Ppf = React.memo(() => {
  const { t } = useTranslation(['ppf', 'common']);

  const [sliderPos, setSliderPos] = useState(50);

  const ppfSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Paint Protection Film (PPF) - حماية الطلاء",
    "provider": {
      "@type": "AutomotiveBusiness",
      "name": "Reflecto Premium",
      "url": "https://www.reflecto.com.sa/"
    },
    "areaServed": ["Jeddah", "Riyadh", "Saudi Arabia"],
    "description": "أفلام حماية الطلاء البولي يوريثين ذاتية الإصلاح لحماية السيارة من الخدوش والحصى بضمان 10 سنوات.",
    "url": "https://www.reflecto.com.sa/services/ppf"
  }), []);

  const anatomyLayers = useMemo(
    () => t('ppf:anatomy_layers', { returnObjects: true }) || [],
    [t]
  );

  const packages = useMemo(
    () => t('ppf:packages', { returnObjects: true }) || [],
    [t]
  );

  const overlayLabels = useMemo(
    () => t('ppf:anatomy_overlay_labels', { returnObjects: true }) || [],
    [t]
  );

  const updateSlider = useCallback((clientX, el) => {
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseMove = useCallback((e) => {
    updateSlider(e.clientX, e.currentTarget);
  }, [updateSlider]);

  const handleTouchMove = useCallback((e) => {
    updateSlider(e.touches[0].clientX, e.currentTarget);
  }, [updateSlider]);

  const handleSliderKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      setSliderPos((v) => Math.max(v - 5, 0));
    }
    if (e.key === 'ArrowRight') {
      setSliderPos((v) => Math.min(v + 5, 100));
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#000000] text-white font-body selection:bg-[#FF5C35]/30">
      <SEOHead
        title={t('ppf:hero_title', 'افلام حماية الطلاء PPF')}
        description={t('ppf:hero_description', 'أفضل أفلام حماية الطلاء ذاتية المعالجة لحماية سيارتك من الخدوش والحصى في جدة والرياض.')}
        canonicalPath="/services/ppf"
        keywords="PPF, افلام حماية الطلاء, حماية سيارات جدة, حماية سيارات الرياض, فيلم حماية شفاف"
        schema={ppfSchema}
      />
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-black overflow-hidden mb-16" aria-labelledby="ppf-hero-heading">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <HeroVideo src="/assets/PPF.mp4" webmSrc="/assets/PPF.webm" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-black/40 to-black/30 pointer-events-none" aria-hidden="true"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6 pt-16">
          <h1 id="ppf-hero-heading" className="text-4xl tracking-[2px] md:text-7xl font-display font-black mb-4 leading-tight uppercase text-white">
            <span className="text-[#FF5C35]">{t('ppf:hero_highlight')}</span>{' '}
            <span>{t('ppf:hero_rest')}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light font-michroma leading-relaxed">
            {t('ppf:hero_tagline')}
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


      <section className="py-24 px-6 bg-[#000000]" aria-label="PPF Anatomy Details">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-display font-black tracking-widest uppercase mb-4">
              <span className="text-[#FF5C35]">{t('ppf:anatomy_title_highlight')}</span> {t('ppf:anatomy_title_rest')}
            </h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-10 max-w-sm leading-relaxed">
              {t('ppf:anatomy_subtitle')}
            </p>
            <div className="space-y-8 pl-6 border-l-2 border-[#FF5C35]/20">
              {Array.isArray(anatomyLayers) && anatomyLayers.map((item, i) => (
                <article key={i} className="relative group">
                  <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-[#FF5C35] shadow-[0_0_10px_2px_rgba(255,92,53,0.6)] transition-transform group-hover:scale-125" aria-hidden="true" />
                  <h3 className="font-bold tracking-widest uppercase text-gray-200 text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 font-bold tracking-wide leading-relaxed">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] bg-white/[0.02] backdrop-blur-xl flex items-center justify-center p-6 min-h-[300px]">
            <picture>
              <img
                src="/assets/photo/nano%20servicesss.jpg"
                alt="Detailed PPF film layers cross section"
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl object-cover max-h-[320px] shadow-inner"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800';
                }}
              />
            </picture>
            <div className="absolute top-8 right-8 text-right space-y-5" aria-hidden="true">
              {Array.isArray(overlayLabels) && overlayLabels.map((l, i) => (
                <div key={i} className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-[#FF5C35]/50 pb-1 text-right bg-black/40 px-3 py-1 rounded shadow-inner backdrop-blur-sm">{l}</div>
              ))}
            </div>
            <div className="absolute bottom-8 left-8 space-y-5" aria-hidden="true">
              <div className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-[#FF5C35]/50 pb-1 bg-black/40 px-3 py-1 rounded shadow-inner backdrop-blur-sm">
                {t('ppf:anatomy_bottom_label')}
              </div>
            </div>
          </div>
        </div>
      </section>

<section className="py-24 px-6 bg-[#000000]" aria-label="Visual Finish Comparison">
  <div className="max-w-5xl mx-auto text-center">
    <h2 className="text-3xl md:text-4xl font-display font-black tracking-widest uppercase mb-4">
      {t('ppf:visual_title_prefix')}{' '}
      <span className="text-[#FF5C35]">
        {t('ppf:visual_title_highlight')}
      </span>
    </h2>

    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-12">
      {t('ppf:visual_subtitle')}
    </p>

    <div
      className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden bg-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none cursor-ew-resize group"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseDown={(e) => updateSlider(e.clientX, e.currentTarget)}
      role="slider"
      aria-valuenow={sliderPos}
      aria-valuemin="0"
      aria-valuemax="100"
      tabIndex={0}
      onKeyDown={handleSliderKeyDown}
    >
      {/* BASE (RIGHT / MATTE) */}
      <div className="absolute inset-0">
        <img
          src="/assets/photo/service/ppf-after.jpg"
          alt="Matte finish PPF example"
          className="w-full h-full object-cover grayscale"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1400';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/50" />

        <div className="absolute top-6 right-6 px-4 py-2 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-widest text-white uppercase shadow-inner">
          {t('ppf:matte_finish')}
        </div>
      </div>

      {/* CLIPPED (LEFT / GLOSS) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
        }}
      >
        <img
          src="/assets/photo/service/ppf-before.jpg"
          alt="Gloss finish PPF example"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1400';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />

        <div className="absolute top-6 left-6 px-4 py-2 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-widest text-white uppercase shadow-inner">
          {t('ppf:gloss_finish')}
        </div>
      </div>

      {/* HANDLE */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="w-12 h-12 bg-[#FF5C35] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,92,53,0.6)] border-2 border-black">
          <span className="material-symbols-outlined text-white text-lg font-bold">
            compare_arrows
          </span>
        </div>
      </div>

      {/* INPUT fallback */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
      />
    </div>
  </div>
</section>

      <PackagesCarousel
        packages={packages}
        serviceSlug="ppf"
        title={
          <>
            {t('ppf:packages_title_prefix')}{' '}
            <span className="text-[#FF5C35]">{t('ppf:packages_title_highlight')}</span>
          </>
        }
        bookLabel={t('ppf:book_service')}
      />
    </main>
  );
});

export default Ppf;
