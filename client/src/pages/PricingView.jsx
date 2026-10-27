import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { pricingService } from '../services/api';
import SEOHead from '../components/SEOHead';
const FALLBACK_TIERS = [];
import Icon from '../components/Icon';
import FadeIn from '../components/components/FadeIn';

// 1. Extract static data to prevent recreation on every render
const PAYMENT_OPTIONS = [
  'pricing:payment_options_tamara',
  'pricing:payment_options_tabby',
  'pricing:payment_options_credit_card',
  'pricing:payment_options_bank_transfer'
];

// 2. Extract and memoize list items to keep the DOM tree lean and fast
const FeatureItem = React.memo(({ feature }) => (
  <li className="flex items-center gap-3 text-sm text-gray-400">
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5C24EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
    <span>{feature}</span>
  </li>
));

const PricingView = React.memo(() => {
  const { t, i18n } = useTranslation(['pricing', 'common']);
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();

  const userCompId = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('reflecto_user') || '{}');
      return u?.company_id || u?.company?.id || 'guest';
    } catch { return 'guest'; }
  })();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['pricing', userCompId],
    queryFn: () => pricingService.getAll(),
    staleTime: 10 * 1000,
    retry: 1,
  });

  const packages = response?.data || FALLBACK_TIERS;

  const packagesToRender = useMemo(() => {
    if (!response?.data) {
      return packages;
    }

    return packages.filter((tier) => 
      (tier.service_id === undefined || tier.service_id === null || tier.service_id === '') &&
      (tier.client_id === undefined || tier.client_id === null || tier.client_id === '')
    );
  }, [packages, response?.data]);

  // 3. Memoize the handler to prevent unnecessary child re-renders
  const handleSelectPackage = useCallback((id, name, price) => {
    navigate('/checkout', { state: { packageId: id, name, price } });
  }, [navigate]);

  // 4. Heavy data transformation moved to useMemo
  const processedPackages = useMemo(() => {
    return packagesToRender.map((tier) => {
      const isPopular = tier.isPopular || tier.is_popular;
      const slug = (tier.slug || tier.name || '').toLowerCase();
      
      let nameEn = tier.name_en;
      let nameAr = tier.name_ar;
      let taglineEn = tier.tagline_en || tier.tagline;
      let taglineAr = tier.tagline_ar;

      if (!nameEn || !nameAr) {
        if (slug.includes('basic')) {
          nameEn = nameEn || t('pricing:basic_name', 'Basic');
          nameAr = nameAr || t('pricing:tiers.basic.name', 'الأساسية');
          taglineEn = taglineEn || t('pricing:basic_tagline', '');
          taglineAr = taglineAr || t('pricing:tiers.basic.tagline', '');
        } else if (slug.includes('silver')) {
          nameEn = nameEn || t('pricing:silver_name', 'Silver');
          nameAr = nameAr || t('pricing:tiers.silver.name', 'الفضية');
          taglineEn = taglineEn || t('pricing:silver_tagline', '');
          taglineAr = taglineAr || t('pricing:tiers.silver.tagline', '');
        } else if (slug.includes('diamond') || slug.includes('gold')) {
          nameEn = nameEn || t('pricing:diamond_name', 'Diamond');
          nameAr = nameAr || t('pricing:tiers.diamond.name', 'الماسية');
          taglineEn = taglineEn || t('pricing:diamond_tagline', '');
          taglineAr = taglineAr || t('pricing:tiers.diamond.tagline', '');
        } else {
          nameEn = nameEn || tier.name || 'Package';
          nameAr = nameAr || nameEn;
        }
      }

      const name = isAr ? nameAr : nameEn;
      const tagline = isAr ? taglineAr : taglineEn;

      let features = [];
      if (isAr) {
        if (tier.features_ar && Array.isArray(tier.features_ar) && tier.features_ar.length > 0) {
          features = tier.features_ar;
        } else if (tier.features_en && Array.isArray(tier.features_en) && tier.features_en.length > 0) {
          features = tier.features_en;
        } else if (slug.includes('basic')) {
          features = t('pricing:tiers.basic.features', { returnObjects: true }) || tier.features || [];
        } else if (slug.includes('silver')) {
          features = t('pricing:tiers.silver.features', { returnObjects: true }) || tier.features || [];
        } else if (slug.includes('diamond')) {
          features = t('pricing:tiers.diamond.features', { returnObjects: true }) || tier.features || [];
        } else {
          features = tier.features || [];
        }
      } else {
        if (tier.features_en && Array.isArray(tier.features_en) && tier.features_en.length > 0) {
          features = tier.features_en;
        } else if (tier.features_ar && Array.isArray(tier.features_ar) && tier.features_ar.length > 0) {
          features = tier.features_ar;
        } else if (slug.includes('basic')) {
          features = t('pricing:tiers.basic.features', { returnObjects: true }) || tier.features || [];
        } else if (slug.includes('silver')) {
          features = t('pricing:tiers.silver.features', { returnObjects: true }) || tier.features || [];
        } else if (slug.includes('diamond')) {
          features = t('pricing:tiers.diamond.features', { returnObjects: true }) || tier.features || [];
        } else {
          features = tier.features || [];
        }
      }
      if (!Array.isArray(features)) features = [features];

      const price = typeof tier.price === 'number' ? tier.price : (tier.price_amount || 0);
      const originalPrice = tier.original_price ? parseFloat(tier.original_price) : null;
      const isCompanyPrice = Boolean(tier.is_company_price || (originalPrice && originalPrice > price));
      
      const iconId = slug || (typeof tier.id === 'string' ? tier.id.toLowerCase() : 'silver');
      let iconName = 'star';
      if (iconId.includes('diamond') || iconId.includes('gold')) iconName = 'diamond';
      else if (iconId.includes('basic')) iconName = 'shield';

      return { ...tier, isPopular, name, tagline, price, originalPrice, isCompanyPrice, features, iconName };
    });
  }, [packagesToRender, t, isAr]);

  return (
    // Replaced outer div with semantic <section> and #000000 background
    <section className="py-20 px-6 bg-[#000000] min-h-screen" aria-labelledby="pricing-heading">
      <SEOHead
        title={isAr ? 'أسعار باقات حماية وتظليل السيارات' : 'Car Protection & Tinting Package Prices'}
        description={isAr ? 'اكتشف أسعار باقات حماية السيارات PPF، النانو سيراميك، والعازل الحراري في ريفليكتو جدة والرياض بضمان يصل إلى 10 سنوات وخيارات تقسيط تابي وتمارا.' : 'Explore PPF paint protection, Nano Ceramic, and window tinting package prices at Reflecto Jeddah & Riyadh with up to 10-year warranty and Tabby/Tamara installments.'}
        canonicalPath="/pricing"
        keywords="أسعار PPF جدة, سعر نانو سيراميك, أسعار تظليل السيارات الرياض, تقسيط تابي تمارا ريفليكتو"
      />
      <div className="max-w-7xl mx-auto">
        
        <FadeIn direction="up">
          <header className="text-center mb-20 flex flex-col items-center">
            <span className="px-4 py-1 rounded-full bg-[#5C24EB]/10 text-[#8B5CF6] text-[10px] font-bold uppercase tracking-widest mb-4 inline-block shadow-[0_4px_14px_0_rgba(92,36,235,0.1)]">
              {t('common:premium_packages')}
            </span>
            <h1 id="pricing-heading" className="text-3xl md:text-5xl font-display font-bold tracking-tighter mb-4 leading-tight text-white">
              {t('pricing:title_highlight')} <span className="text-[#8B5CF6]">{t('pricing:title_rest')}</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              {t('pricing:subtitle')}
            </p>
          </header>
        </FadeIn>

        {isLoading ? (
          <div className="flex justify-center items-center h-64" aria-live="polite" aria-busy="true">
            <div className="w-12 h-12 border-4 border-[#5C24EB]/20 border-t-[#5C24EB] rounded-full animate-spin" role="status">
              <span className="sr-only">{t('common:loading', 'Loading pricing plans...')}</span>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24" role="list">
            {processedPackages.map((tier, idx) => (
              <li key={tier.id} className="h-full flex">
                <FadeIn direction="up" delay={idx * 0.1} className="w-full">
                  <article
                  // Applied Glassmorphism and removed explicit borders 
                  className={`relative p-10 w-full rounded-3xl flex flex-col transition-all duration-500
                  ${tier.isPopular
                    ? 'bg-white/[0.04] backdrop-blur-3xl shadow-[0_20px_50px_rgba(92,36,235,0.15)] scale-105 z-10'
                    : 'bg-white/[0.02] backdrop-blur-xl shadow-2xl hover:bg-white/[0.04]'
                  }`}
                >
                  {tier.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#5C24EB] to-[#7B4BF5] text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                      {t('common:most_popular')}
                    </div>
                  )}

                  <div className="mb-8 flex-grow">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-xl mb-6 shadow-inner ${tier.isPopular ? 'text-[#8B5CF6]' : 'text-gray-400'}`}>
                      <Icon name={tier.iconName} aria-hidden="true" />
                    </div>
                    {/* Fixed semantic hierarchy: Swapped <h3> for <h2> */}
                    <h2 className="text-2xl font-display font-bold mb-2 text-white">{tier.name}</h2>
                    <p className="text-gray-500 text-sm mb-6">{tier.tagline}</p>
                    <div className="space-y-1">
                      <span className="text-gray-400 text-xs block">{t('common:starting_at')}</span>
                      {tier.isCompanyPrice && tier.originalPrice && tier.originalPrice > tier.price ? (
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="line-through text-gray-500 text-sm font-mono opacity-80 decoration-[#8B5CF6]">
                            {tier.originalPrice.toLocaleString()} SAR
                          </span>
                          <span className="text-3xl md:text-4xl font-display font-black text-[#8B5CF6]">
                            {tier.price.toLocaleString()} SAR
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#5C24EB]/20 text-[#8B5CF6] text-[10px] font-bold border border-[#5C24EB]/30">
                            خصم خاص بالشركة
                          </span>
                        </div>
                      ) : (
                        <span className="text-3xl md:text-4xl font-display font-bold text-white">
                          {typeof tier.price === 'number'
                            ? `${tier.price.toLocaleString()} SAR`
                            : (tier.price || 'Contact us')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPackage(tier.id, tier.name, tier.price)}
                    aria-label={`${t('common:select_tier', { tier: tier.name })}`}
                    className={`w-full py-4 rounded-xl font-bold transition-all mb-10 text-center flex items-center justify-center
                    ${tier.isPopular
                        ? 'bg-[#5C24EB] text-white shadow-[0_8px_30px_rgba(92,36,235,0.3)] hover:brightness-110'
                        : 'bg-white/5 text-white shadow-md hover:bg-white/10'
                    }`}
                  >
                    {t('common:select_tier', { tier: tier.name })}
                  </button>

                  <ul className="space-y-4" aria-label={`Features for ${tier.name}`}>
                    {tier.features.map((feature, i) => (
                      <FeatureItem key={i} feature={feature} />
                    ))}
                  </ul>
                  </article>
                </FadeIn>
              </li>
            ))}
          </ul>
        )}

        {isError && (
          <div className="text-center text-red-400 mb-8 bg-red-500/10 backdrop-blur-md shadow-lg p-4 rounded-xl" role="alert">
            Could not load latest pricing data. Showing cached options.
          </div>
        )}

        {/* Adherence to No-Line: Removed 'border-t' in favor of a gradient pseudo-element separator */}
        <section className="text-center max-w-4xl mx-auto py-20 relative before:absolute before:top-0 before:left-1/4 before:right-1/4 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
          <h2 className="text-2xl md:text-4xl font-display font-bold mb-4 text-white">
            {t('pricing:payment_title_prefix')} <span className="text-[#8B5CF6]">{t('pricing:payment_title_highlight')}</span> {t('pricing:payment_title_suffix')}
          </h2>
          <p className="text-gray-400 mb-10">{t('pricing:payment_subtitle')}</p>
          
          <ul className="flex flex-wrap justify-center gap-4" aria-label="Available payment methods">
            {PAYMENT_OPTIONS.map((key) => (
              <li key={key}>
                {/* Changed generic div to accessible <button> */}
                <button
                  type="button"
                  className="px-8 py-4 bg-white/5 backdrop-blur-md rounded-xl text-white font-bold hover:bg-white/10 hover:shadow-[0_4px_20px_rgba(92,36,235,0.15)] transition-all flex items-center justify-center"
                >
                  {t(key)}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
});

export default PricingView;
