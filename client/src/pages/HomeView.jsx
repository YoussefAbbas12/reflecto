import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SERVICES } from '../constants.jsx';
import Icon from '../components/Icon';
import HeroVideo from '../components/HeroVideo';
import FadeIn from '../components/components/FadeIn';
import SEOHead from '../components/SEOHead';

const STANDARDS_KEYS = [
  { titleKey: 'home:standards.iso', icon: 'shield' },
  { titleKey: 'home:standards.warranty', icon: 'timer' },
  { titleKey: 'home:standards.materials', icon: 'public' },
  { titleKey: 'home:standards.installers', icon: 'check_circle' }
];

const ServiceItem = React.memo(({ service, t }) => (
  <article className="group relative bg-[#262626]/60 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(255,92,53,0.15)] transition-all flex flex-col h-full">
    <div className="h-64 overflow-hidden relative">
      <picture>
        <img
          src={service.imageUrl}
          alt={t(`services_alt_${service.id}`, `Premium ${service.title} service`)}
          loading="lazy"
          decoding="async"
          width="400"
          height="260"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </picture>
      <div className="absolute top-4 right-4 bg-[#FF5C35] p-2 rounded-xl shadow-lg flex items-center justify-center">
        <Icon name={service.icon} className="text-xl text-white" aria-hidden="true" />
      </div>
    </div>
    <div className="p-8 flex flex-col flex-grow">
      <h3 className="text-2xl font-display font-bold mb-2 text-white">{t(service.titleKey)}</h3>
      <p className="text-gray-400 text-sm mb-6 flex-grow">{t(service.descriptionKey)}</p>
      <ul className="space-y-2 mb-8" aria-label={`Features of ${t(service.titleKey)}`}>
        {service.featuresKeys.map(fk => (
          <li key={fk} className="text-xs text-gray-300 flex items-center gap-2">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5C35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            <span>{t(fk)}</span>
          </li>
        ))}
      </ul>
      <Link
        to={`${service.path}`}
        aria-label={`${t('common:learn_more')} about ${t(service.titleKey)}`}
        className="text-[#FF5C35] font-bold text-sm flex items-center gap-2 hover:gap-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 rounded px-2 py-1 -ml-2 w-fit"
      >
        {t('common:learn_more')}
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      </Link>
    </div>
  </article>
));

const FAQ_KEYS = Array.from({ length: 13 }, (_, i) => `q${i + 1}`);

const FAQItem = React.memo(({ faqKey, t }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-white/5 last:border-0 py-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex justify-between items-center text-start gap-6 focus:outline-none text-white hover:text-[#FF5C35] transition-colors group"
      >
        <span className="text-base md:text-lg font-bold tracking-tight leading-snug">
          {t(`faq.${faqKey}.q`)}
        </span>
        <span className={`text-xl font-bold text-[#FF5C35] shrink-0 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          {isOpen ? '−' : '+'}
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-gray-400 text-sm md:text-base leading-relaxed whitespace-pre-line font-light">
            {t(`faq.${faqKey}.a`)}
          </p>
        </div>
      </div>
    </div>
  );
});

const HomeView = React.memo(() => {
  const { t, i18n } = useTranslation(['home', 'common', 'services']);
  const isRTL = i18n.language === 'ar';

  return (
    <main className="w-full bg-[#000000]">
      <SEOHead
        canonicalPath="/"
        keywords="حماية سيارات, PPF, نانو سيراميك, عازل حراري, تصحيح طلاء, جدة, الرياض, Reflecto"
      />
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-black overflow-hidden" aria-labelledby="hero-heading">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <HeroVideo src="/assets/hero-video.mp4" webmSrc="/assets/hero-video.webm" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-black/30 to-black/20 pointer-events-none" aria-hidden="true"></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl px-6">
          <FadeIn direction="up" delay={0.2}>
            <h1 id="hero-heading" className="text-3xl tracking-[2px] md:text-5xl font-display font-bold mb-4 leading-tight text-white">
              {t('home:hero_line1')} <br />
              <span className="text-[#FF5C35]">{t('home:hero_line2')}</span>
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.4}>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light font-michroma">
              {t('home:hero_subtitle')}
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={0.6}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="w-full sm:w-auto px-10 py-4 bg-[#FF5C35] text-white font-bold rounded flex items-center justify-center gap-2 group shadow-[0_8px_30px_rgb(255,92,53,0.3)] hover:brightness-110 transition-all rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50"
              >
                {t('common:book_service')}
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6" /></svg>
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto px-10 py-4 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold rounded flex items-center justify-center gap-2 shadow-inner transition-all rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {t('common:view_pricing')}
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 12l-4-4-4 4M12 16V8" /></svg>
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none" aria-hidden="true">
          <div className="w-6 h-10 rounded-full bg-white/5 shadow-inner flex justify-center p-1">
            <div className="w-1 h-2 bg-[#FF5C35] rounded-full shadow-[0_0_10px_#FF5C35]"></div>
          </div>
        </div>
      </section>

      {/* Standards Section */}
      <section className="py-24 bg-[#0a0a0a] relative overflow-hidden" aria-labelledby="standards-heading">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <span id="standards-heading" className="text-[#FF5C35] font-bold tracking-widest text-sm uppercase mb-4 block">{t('home:standards.badge')}</span>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-6 leading-tight">{t('home:standards.title')}</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">{t('home:standards.desc')}</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STANDARDS_KEYS.map((s, idx) => (
              <FadeIn key={s.titleKey} direction="up" delay={0.1 * idx}>
                <div className="p-8 bg-black border border-white/5 rounded-2xl hover:border-[#FF5C35]/30 transition-colors text-center group">
                  <div className="w-16 h-16 bg-[#FF5C35]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Icon name={s.icon} className="text-3xl text-[#FF5C35]" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{t(s.titleKey)}</h3>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 bg-[#000000] relative" id="services" aria-labelledby="services-heading">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="max-w-2xl">
                <span className="text-[#FF5C35] font-bold tracking-widest text-sm uppercase mb-4 flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-[#FF5C35]"></span>
                  {t('home:services_subtitle')}
                </span>
                <h2 id="services-heading" className="text-2xl md:text-4xl font-display font-bold text-white leading-tight">
                  {t('home:services_title')}
                </h2>
              </div>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, idx) => (
              <FadeIn key={service.id} direction="up" delay={0.08 * idx}>
                <ServiceItem service={service} t={t} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 bg-[#1a1a1a] border-t border-white/5" aria-labelledby="faq-heading">
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up">
            <header className="text-center mb-20 flex flex-col items-center">
              <h2 id="faq-heading" className="text-3xl md:text-5xl font-display font-bold mb-4 text-white tracking-tight">
                {t('faq.title')}{' '}
                <span className="text-[#FF5C35] block md:inline md:ml-2">{t('faq.subtitle')}</span>
              </h2>
            </header>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <div className="bg-[#262626]/40 backdrop-blur-2xl rounded-3xl p-6 md:p-10 shadow-2xl border border-white/5 mb-12 divide-y divide-white/5">
              {['q1', 'q2', 'q3', 'q4', 'q6','q7','q8','q9','q10','q11','q12','q13'].map((key) => (
                <FAQItem key={key} faqKey={key} t={t} />
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.4}>
            <div className="bg-gradient-to-r from-white/[0.02] to-white/[0.04] border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-gray-300 text-sm md:text-base font-medium">
                {t('faq.not_found')}
              </p>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#FF5C35] text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(255,92,53,0.2)] hover:brightness-110 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50"
              >
                {t('faq.contact_here')}
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${isRTL ? "rotate-180" : ""}`}><path d="m9 18 6-6-6-6" /></svg>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
});

export default HomeView;
