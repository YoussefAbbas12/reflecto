import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import PackagesCarousel from '../../components/PackagesCarousel';
import SEOHead from '../../components/SEOHead';

const MetricCard = React.memo(({ icon, badge, title, subtitle, desc }) => (
  <article className="bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl border-0 rounded-3xl p-8 flex flex-col gap-6 hover:bg-white/[0.05] transition-all group">
    <header className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[#FF5C35]/10 shadow-inner flex items-center justify-center shrink-0 text-[#FF5C35] group-hover:bg-[#FF5C35] group-hover:text-white transition-colors" aria-hidden="true">
        <span className="text-2xl"><Icon name={icon} /></span>
      </div>
      <div>
        <h3 className="text-white font-black tracking-widest uppercase text-sm leading-tight mb-1">{title}</h3>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{subtitle}</p>
      </div>
    </header>
    <div className="w-full py-2 text-center rounded-xl bg-[#FF5C35]/10 shadow-inner text-[#FF5C35] text-[10px] font-bold tracking-widest uppercase group-hover:bg-[#FF5C35] group-hover:text-white transition-colors" aria-label={`Metric rating: ${badge}`}>
      {badge}
    </div>
    <p className="text-gray-400 font-bold tracking-wide text-[11px] leading-relaxed">{desc}</p>
  </article>
));

const TierCard = React.memo(({ icon, name, years, desc }) => (
  <article className="flex flex-col items-center text-center gap-5 group">
    <div className="w-24 h-24 rounded-full bg-white/[0.02] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center group-hover:shadow-[0_10px_30px_rgba(255,92,53,0.3)] transition-all p-1" aria-hidden="true">
      <div className="w-full h-full rounded-full bg-black/50 shadow-inner flex items-center justify-center text-[#FF5C35] group-hover:text-white group-hover:bg-[#FF5C35] transition-colors">
        <span className="text-4xl"><Icon name={icon} /></span>
      </div>
    </div>
    <div>
      <p className="text-white font-black tracking-widest uppercase text-lg mb-1">{years}</p>
      <h3 className="text-[#FF5C35] text-[10px] tracking-widest uppercase font-black bg-[#FF5C35]/10 px-3 py-1 rounded-full">{name}</h3>
    </div>
    <p className="text-gray-500 font-bold text-[10px] tracking-widest uppercase leading-relaxed max-w-[140px]">{desc}</p>
  </article>
));

const NanoCeramic = React.memo(() => {
  const { t } = useTranslation(['service5', 'common']);
  const [sliderPos, setSliderPos] = useState(50);

  const nanoSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Nano Ceramic & Graphene Coating - النانو سيراميك والجرافين",
    "provider": {
      "@type": "AutomotiveBusiness",
      "name": "Reflecto Premium",
      "url": "https://www.reflecto.com.sa/"
    },
    "areaServed": ["Jeddah", "Riyadh", "Saudi Arabia"],
    "description": "طلاء النانو سيراميك والجرافين المتطور لحماية وتألق السيارة مع خاصية التنظيف الذاتي واللمعان العميق.",
    "url": "https://www.reflecto.com.sa/services/nano-ceramic"
  }), []);

  const packagesList = useMemo(() => t('service5:packages', { returnObjects: true }) || [], [t]);
  
  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleTouchMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleSliderKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') setSliderPos(p => Math.max(0, p - 5));
    if (e.key === 'ArrowRight') setSliderPos(p => Math.min(100, p + 5));
  }, []);

  return (
    <main className="min-h-screen bg-[#000000] text-white font-body selection:bg-[#FF5C35]/30">
      <SEOHead
        title={t('service5:hero_title', 'طلاء النانو سيراميك والجرافين')}
        description={t('service5:hero_desc', 'حماية نانو سيراميك وجرافين متعدد الطبقات يوفر لمعاناً فائقاً وتنظيفاً ذاتياً وحماية ممتدة.')}
        canonicalPath="/services/nano-ceramic"
        keywords="نانو سيراميك, جرافين, سيراميك سيارات, نانو سيراميك جدة, نانو سيراميك الرياض"
        schema={nanoSchema}
      />
      <header className="relative bg-[#000000]" aria-label="Nano Ceramic Hero">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF5C35' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 text-center pt-24 pb-12 px-6">
          <h1 className="text-3xl md:text-5xl font-display font-black tracking-widest uppercase leading-tight">
            <span className="text-[#FF5C35]">{t('service5:hero_highlight')}</span>{' '}
            <span className="text-white">{t('service5:hero_rest')}</span>
          </h1>
          <p className="text-gray-400 font-bold text-xs mt-6 max-w-lg mx-auto tracking-widest uppercase">
            {t('service5:hero_subtitle')}
          </p>
        </div>
        <div className="relative w-full h-[320px] md:h-[480px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <picture>
            <img
              src="/assets/photo/nano-services.jpg"
              alt="Nano ceramic molecular shield representation"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center mix-blend-luminosity opacity-80"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1400';
                e.target.style.mixBlendMode = 'normal';
              }}
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-[#000]/50 via-transparent to-[#000]" aria-hidden="true" />
        </div>
      </header>

      <section className="py-24 px-6 bg-[#000000]" aria-label="Performance Metrics">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-widest uppercase text-center mb-16 text-white">
            {t('service5:metrics_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MetricCard
              icon="layers"
              badge={t('service5:metrics.9h.badge')}
              title={t('service5:metrics.9h.title')}
              subtitle={t('service5:metrics.9h.subtitle')}
              desc={t('service5:metrics.9h.desc')}
            />
            <MetricCard
              icon="water_drop"
              badge={t('service5:metrics.hydro.badge')}
              title={t('service5:metrics.hydro.title')}
              subtitle={t('service5:metrics.hydro.subtitle')}
              desc={t('service5:metrics.hydro.desc')}
            />
            <MetricCard
              icon="light_mode"
              badge={t('service5:metrics.uv.badge')}
              title={t('service5:metrics.uv.title')}
              subtitle={t('service5:metrics.uv.subtitle')}
              desc={t('service5:metrics.uv.desc')}
            />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#0a0a0a]" aria-label="Nano Ceramic Protection Tiers">
        <div className="max-w-6xl mx-auto bg-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl border-0 p-12 md:p-16 rounded-[3rem] text-center">
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-widest uppercase mb-16 text-white">
            <span className="text-[#FF5C35]">{t('service5:tiers_title_highlight')}</span>{t('service5:tiers_title_rest')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <TierCard
              icon="shield"
              years={t('service5:tiers.lite.years')}
              name={t('service5:tiers.lite.name')}
              desc={t('service5:tiers.lite.desc')}
            />
            <TierCard
              icon="diamond"
              years={t('service5:tiers.pro.years')}
              name={t('service5:tiers.pro.name')}
              desc={t('service5:tiers.pro.desc')}
            />
            <TierCard
              icon="bolt"
              years={t('service5:tiers.ultra.years')}
              name={t('service5:tiers.ultra.name')}
              desc={t('service5:tiers.ultra.desc')}
            />
            <TierCard
              icon="all_inclusive"
              years={t('service5:tiers.elite.years')}
              name={t('service5:tiers.elite.name')}
              desc={t('service5:tiers.elite.desc')}
            />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#000000]" aria-label="Before and After Visual Comparison">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-widest uppercase mb-4 text-white">
            <span className="text-[#FF5C35]">{t('service5:slider.before')}</span> {t('service5:slider.vs')}{' '}
            <span className="text-[#FF5C35]">{t('service5:slider.after')}</span>
          </h2>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-16">{t('service5:slider.subtitle')}</p>
          <div
            className="relative w-full h-[350px] md:h-[500px] rounded-3xl overflow-hidden bg-white/[0.02] shadow-[0_20px_60px_rgba(0,0,0,0.8)] select-none cursor-ew-resize group border-0"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            role="slider"
            aria-valuenow={sliderPos}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Before and After Nano Ceramic application comparison"
            tabIndex={0}
            onKeyDown={handleSliderKeyDown}
          >
            <div className="absolute inset-0">
              <picture>
                <img
                  src="/assets/photo/service/nano-after.jpg"
                  alt="Car exterior after Nano Ceramic coating"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1400'; }}
                />
              </picture>
              <div className="absolute bottom-6 right-6 px-5 py-2 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-widest text-white uppercase shadow-inner border-0" aria-hidden="true">
                {t('service5:slider.btn_after')}
              </div>
            </div>
            <div
              className="absolute inset-0 shadow-[10px_0_30px_-5px_rgba(0,0,0,0.8)]"
              style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
            >
              <picture>
                <img
                  src="/assets/photo/service/nano-before.jpg"
                  alt="Car exterior before Nano Ceramic coating"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1400'; }}
                />
              </picture>
              <div className="absolute bottom-6 left-6 px-5 py-2 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-widest text-white uppercase shadow-inner border-0" aria-hidden="true">
                {t('service5:slider.btn_before')}
              </div>
              <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-[#FF5C35] shadow-[0_0_15px_rgba(255,92,53,0.8)]" aria-hidden="true" />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
              aria-hidden="true"
            >
              <div className="w-12 h-12 bg-[#FF5C35] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(255,92,53,0.6)] text-white border-2 border-black transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-sm font-bold">swap_horiz</span>
              </div>
            </div>
            <input
              type="range" min="0" max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>
        </div>
      </section>

      <PackagesCarousel
        packages={packagesList}
        serviceSlug="nano-ceramic"
        title={
          <>
            <span className="text-[#FF5C35]">{t('service5:packages_title_1')}</span> &amp;{' '}
            <span className="text-[#FF5C35]">{t('service5:packages_title_2')}</span>
            {t('service5:packages_title_rest')}
          </>
        }
        subtitle={t('service5:packages_subtitle')}
        bookLabel={t('service5:pkg_book')}
      />
    </main>
  );
});

export default NanoCeramic;
