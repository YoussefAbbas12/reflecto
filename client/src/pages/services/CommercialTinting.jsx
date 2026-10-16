import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../../components/SEOHead';

const CommercialTinting = React.memo(() => {
  const { t, i18n } = useTranslation(['commercial_tint']);
  const isRTL = i18n.language === 'ar';

  const commercialSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Commercial & Architectural Glass Tinting - تظليل المباني والواجهات التجاري",
    "provider": {
      "@type": "AutomotiveBusiness",
      "name": "Reflecto Premium",
      "url": "https://www.reflecto.com.sa/"
    },
    "areaServed": ["Jeddah", "Riyadh", "Saudi Arabia"],
    "description": "تظليل الزجاج المعماري والواجهات التجارية والمباني لتقليل الحرارة واستهلاك التبريد حتى 30% مع حماية UV.",
    "url": "https://www.reflecto.com.sa/services/commercial-tint"
  }), []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    details: ''
  });

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    alert('تم إرسال طلب العرض! سيتواصل معك فريقنا خلال 24 ساعة.');
  }, []);

  const handleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const residentialFeatures = useMemo(() => [
    {
      icon: 'thermostat',
      title: t('commercial_tint:residential.heat_reduction.title', 'تقليل الحرارة'),
      description: t('commercial_tint:residential.heat_reduction.desc', 'تقنية سيراميك متقدمة تحجب حتى 98% من الحرارة الشمسية، مما يقلل بشكل كبير تكاليف الطاقة ويزيد الراحة.')
    },
    {
      icon: 'visibility_off',
      title: t('commercial_tint:residential.privacy.title', 'التحكم بالخصوصية'),
      description: t('commercial_tint:residential.privacy.desc', 'تحقيق أمان بصري كامل خلال النهار دون التضحية بإطلالتك على العالم الخارجي.')
    },
    {
      icon: 'shield',
      title: t('commercial_tint:residential.uv_protection.title', 'حماية من الأشعة فوق البنفسجية'),
      description: t('commercial_tint:residential.uv_protection.desc', 'حجب 99.9% من الأشعة فوق البنفسجية الضارة التي تسبب بهتان الأثاث وتلف الجلد. حماية شاملة للداخلية.')
    }
  ], [t]);

  const commercialFeatures = useMemo(() => [
    {
      icon: 'security',
      title: t('commercial_tint:commercial.security.title', 'الأمان والتخفيف من الانفجارات'),
      description: t('commercial_tint:commercial.security.desc', 'أفلام أمان سميكة مصممة لإبقاء الزجاج متحداً عند الصدمة، حماية الأصول والموظفين من التعدي أو الكوارث الطبيعية.')
    },
    {
      icon: 'eco',
      title: t('commercial_tint:commercial.energy.title', 'تحسين الطاقة'),
      description: t('commercial_tint:commercial.energy.desc', 'تقليل تكاليف التبريد بنسبة تصل إلى 30%. أفلامنا تُسدد تكاليفها من خلال وفورات التشغيل خلال 24-36 شهراً.')
    },
    {
      icon: 'light_mode',
      title: t('commercial_tint:commercial.glare.title', 'تقليل الوهج'),
      description: t('commercial_tint:commercial.glare.desc', 'القضاء على وهج الشاشة وإرهاق العين في مكان العمل، مما يعزز إنتاجية الموظفين وراحة البصر.')
    }
  ], [t]);

  // Portfolio items replaced by static sections below

  return (
    <main className={`min-h-screen bg-[#0e0e0e] text-white pt-20 font-body selection:bg-[#ff8d87]/30 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <SEOHead
        title={t('commercial_tint:hero.title', 'تظليل المباني والمنشآت التجارية')}
        description={t('commercial_tint:hero.subtitle', 'أفلام تظليل زجاجية عازلة للحرارة للمباني والواجهات التجارية توفر حتى 30% من طاقة التكييف.')}
        canonicalPath="/services/commercial-tint"
        keywords="تظليل مباني, تظليل تجاري, تظليل واجهات زجاجية, عازل حراري مباني, تظليل مكاتب جدة"
        schema={commercialSchema}
      />

      {/* Hero Section */}
      <header className="relative h-[870px] w-full flex items-center overflow-hidden bg-[#0e0e0e]" aria-label="Commercial Tinting Hero">
        <div className="absolute inset-0 z-0">
          <img
            alt="Luxury modern home with dark tinted windows"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-60"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNJsVh5v5_l6wZ0_DtKBpVYuOnX51aRBH0hAczjR9A5hfMJUYiLFi8sfiskkiU4W9DhIV5lNwW0cYbYYWiSlIhzkzL8LbAs_pZFmrGCBQzKH6cEAdZGFqh22EinXyXGnFq3xv-kRCsksiJFLUuG9ik1QgdHRW27JlROO8_3bhfzfRB6uqODbAYnhbCjlN7Dx6Eo33S5mdQdJngzjuZ4rXsK9qTAhlCTXglpgjYpTPSLpRQVMBKqatXQu8HbugGyoUPQIW80KD0EKI"
          />
          <div className={`absolute inset-0 bg-gradient-to-${isRTL ? 'l' : 'r'} from-[#0e0e0e] via-[#0e0e0e]/40 to-transparent`} aria-hidden="true"></div>
        </div>

        <div className={`relative z-10 max-w-7xl mx-auto px-8 w-full ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="max-w-2xl">
            <span className={`text-[#ff8d87] font-headline tracking-[0.3em] text-[10px] font-bold uppercase mb-4 block ${isRTL ? 'text-right' : ''}`}>
              {t('commercial_tint:hero.badge', 'هندسة دقيقة')}
            </span>
            <h1 className="text-6xl md:text-8xl font-headline font-black leading-[0.9] tracking-tighter text-white mb-6">
              {t('commercial_tint:hero.title', 'العازل الحراري')} <br />
              <span className="text-[#adaaaa] font-bold">{t('commercial_tint:hero.subtitle', 'للمباني.')}</span>
            </h1>
            <p className="text-lg text-[#adaaaa] mb-10 max-w-md leading-relaxed font-bold tracking-wide">
              {t('commercial_tint:hero.description', 'عزل حراري متفوق وخصوصية بصرية للفلل الفاخرة وبيئات العمل عالية المخاطر.')}
            </p>
            <div className="flex gap-4 flex-wrap">
              <button type="button" className="bg-gradient-to-r from-[#ff8d87] to-[#ff7670] text-black px-8 py-4 font-black tracking-widest uppercase text-[10px] flex items-center gap-3 hover:scale-95 transition-transform shadow-[0_8px_30px_rgba(255,141,135,0.3)] focus:outline-none focus:ring-2 focus:ring-white/50 rounded-xl">
                {t('commercial_tint:hero.explore', 'استكشف الحلول')} <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </button>
              <button type="button" className="bg-white/[0.05] shadow-inner text-[#ff8d87] px-8 py-4 font-black tracking-widest uppercase text-[10px] hover:bg-white/[0.1] transition-colors rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff8d87]/50 border-0">
                {t('commercial_tint:hero.case_studies', 'عرض دراسات الحالة')}
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className={`absolute bottom-12 ${isRTL ? 'left-8' : 'right-8'} hidden lg:flex gap-12 font-headline pl-8 bg-black/40 backdrop-blur-xl p-6 rounded-2xl shadow-inner border-0`} aria-label="Performance Telemetry">
          <div>
            <div className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest mb-1">{t('commercial_tint:stats.heat_rejection', 'رفض الحرارة')}</div>
            <div className="text-4xl font-black text-white tracking-tighter">98%</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest mb-1">{t('commercial_tint:stats.uv_protection', 'حماية الأشعة')}</div>
            <div className="text-4xl font-black text-white tracking-tighter">99.9%</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest mb-1">{t('commercial_tint:stats.ir_blocking', 'حجب الأشعة')}</div>
            <div className="text-4xl font-black text-white tracking-tighter">95%</div>
          </div>
        </div>
      </header>

      {/* Residential Solutions */}
      <section className="py-24 bg-[#0e0e0e]" aria-label="Residential Solutions">
        <div className="max-w-7xl mx-auto px-8">
          <header className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-16">
            <div className="lg:col-span-7">
              <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-white mb-6 uppercase">
                {t('commercial_tint:residential.title', 'حلول سكنية')}
              </h2>
              <p className="text-[#adaaaa] max-w-xl text-sm font-bold tracking-wide leading-relaxed">
                {t('commercial_tint:residential.description', 'ارتقِ بمساحات معيشتك مع أفلام تحمي داخلك مع الحفاظ على الوضوح المثالي. نتعامل مع منزلك كمعرض فني.')}
              </p>
            </div>
            <div className="lg:col-span-5 flex justify-end" aria-hidden="true">
              <div className="h-[2px] w-full bg-white/[0.05] shadow-inner rounded-full mb-4"></div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {residentialFeatures.map((feature, index) => (
              <article key={index} className="bg-white/[0.02] backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-0 hover:bg-white/[0.05] transition-all group">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#ff8d87]/10 text-[#ff8d87] shadow-inner mb-8 group-hover:bg-[#ff8d87] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">{feature.icon}</span>
                </div>
                <h3 className="font-headline font-black text-xl tracking-widest uppercase text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 text-xs font-bold tracking-wide leading-relaxed">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Expertise */}
      <section className="py-24 bg-[#000000]" aria-label="Commercial Expertise">
        <div className="max-w-7xl mx-auto px-8">
          <div className={`flex flex-col lg:flex-row-reverse gap-16 items-center`}>
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-0">
                <img
                  alt="Modern glass office building demonstrating professional window tinting applications"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7ph4S-wG6Dv_2VEixlEqBIH0GRCekSNRqPyvnH3NCNPug8wsPT4-4eVH9QmrULi2-O6nK_LTa-D4QbCqGMKnjphEXWadiv_dfaYd1CHBAlUbcP1M5d3cy_O4sQY9cXzqllL8_G5XxXRKPbAeQtbz0VCwIQZrhrwC4BhWxrHE8h0GaM8Vq8ML4uInXwTTihHGQnN2W0hnOsPwT2DSbQvdJLRXydFhrO6PGYE8mRq2zopUT-VmzkDqewhwrlL7gyzheE2ohekK6op8"
                />
                <div className={`absolute -bottom-2 ${isRTL ? 'right-6' : 'left-6'} bg-black/80 backdrop-blur-xl p-6 rounded-2xl shadow-inner border-0 transform translate-y-1/4`}>
                  <div className="text-2xl font-headline font-black text-white tracking-widest uppercase">
                    {t('commercial_tint:commercial.leed_certified', 'معتمد LEED')}
                  </div>
                  <div className="text-[10px] font-bold text-[#ff8d87] tracking-widest uppercase mt-2">
                    {t('commercial_tint:commercial.leed_standard', 'معيار كفاءة الطاقة')}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <span className="text-[#ff8d87] font-headline tracking-[0.2em] text-[10px] font-bold uppercase mb-4 block">
                {t('commercial_tint:commercial.enterprise', 'مستوى المؤسسات')}
              </span>
              <h2 className="text-4xl md:text-5xl font-headline font-black tracking-widest uppercase text-white mb-12 leading-tight">
                {t('commercial_tint:commercial.title', 'خبرة')} <br />
                <span className="text-gray-400">{t('commercial_tint:commercial.subtitle', 'تجارية')}</span>
              </h2>
              <div className="space-y-10">
                {commercialFeatures.map((feature, index) => (
                  <article key={index} className="flex gap-6 bg-white/[0.02] p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:bg-white/[0.05] transition-colors border-0">
                    <div className="w-12 h-12 rounded-xl bg-[#ff8d87]/10 flex items-center justify-center text-[#ff8d87] shrink-0 shadow-inner">
                      <span className="material-symbols-outlined" aria-hidden="true">{feature.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-headline font-black text-sm mb-2 uppercase tracking-widest">{feature.title}</h4>
                      <p className="text-gray-400 text-xs font-bold tracking-wide leading-relaxed">{feature.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-[#0e0e0e]" aria-label="Project Portfolio">
        <div className="max-w-7xl mx-auto px-8">
          <header className="mb-16">
            <h2 className="text-4xl font-headline font-black tracking-widest text-white uppercase">
              {t('commercial_tint:portfolio.title', 'ابرز أعمالنا')}
            </h2>
            <div className="w-20 h-1.5 bg-[#ff8d87] rounded-full mt-6 shadow-[0_0_10px_rgba(255,141,135,0.8)]" aria-hidden="true"></div>
          </header>
          
          <div className="space-y-32">
            {/* Project 1 */}
            <article className="border-t border-white/5 pt-16">
              <div className="mb-10">
                <span className="text-[#ff8d87] text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block">
                  {isRTL ? 'المشروع الأول • المدينة المنورة' : 'Project 01 • Al-Madinah'}
                </span>
                <h3 className="text-3xl font-headline font-black text-white mb-4 tracking-tight">فندق إيلاف طيبة</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-4xl font-bold tracking-wide">
                  يعد فندق إيلاف طيبة أحد الفنادق البارزة في المنطقة المركزية بالمدينة المنورة، ويستقبل أعداداً من الزوار على مدار العام، مما يجعل كفاءة استهلاك الطاقة وراحة النزلاء من الأولويات التشغيلية الأساسية.
                </p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {['elaf_1.jpg', 'elaf_2.jpg', 'elaf_3.jpg', 'elaf_4.jpg'].map((img, i) => (
                  <div key={i} className="aspect-[4/3] rounded-3xl overflow-hidden bg-white/[0.02] shadow-[0_15px_40px_rgba(0,0,0,0.6)] group relative border border-white/10 hover:border-[#ff8d87]/30 transition-all duration-500">
                    <img src={`/assets/projects/${img}`} alt={`فندق إيلاف طيبة - ${i+1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/35 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                ))}
              </div>
            </article>

            {/* Project 2 */}
            <article className="border-t border-white/5 pt-16">
              <div className="mb-10">
                <span className="text-[#ff8d87] text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block">
                  {isRTL ? 'المشروع الثاني • جدة' : 'Project 02 • Jeddah'}
                </span>
                <h3 className="text-3xl font-headline font-black text-white mb-4 tracking-tight">فندق ميلينيوم</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-4xl font-bold tracking-wide">
                  يعد فندق ميلينيوم جدة من المنشآت الفندقية الحديثة التي تتطلب حلولاً متقدمة للتحكم الحراري في بيئة تتميز بدرجات حرارة مرتفعة معظم أيام السنة.
                </p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {['millennium_1.jpg', 'millennium_2.jpg', 'millennium_3.jpg', 'millennium_4.jpg'].map((img, i) => (
                  <div key={i} className="aspect-[4/3] rounded-3xl overflow-hidden bg-white/[0.02] shadow-[0_15px_40px_rgba(0,0,0,0.6)] group relative border border-white/10 hover:border-[#ff8d87]/30 transition-all duration-500">
                    <img src={`/assets/projects/${img}`} alt={`فندق ميلينيوم - ${i+1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/35 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                ))}
              </div>
            </article>

            {/* Project 3 */}
            <article className="border-t border-white/5 pt-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5">
                  <span className="text-[#ff8d87] text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block">
                    {isRTL ? 'المشروع الثالث • شراكة استراتيجية' : 'Project 03 • Strategic Partnership'}
                  </span>
                  <h3 className="text-3xl font-headline font-black text-white mb-4 tracking-tight">فروع أوتوهوب التابعة لعبداللطيف جميل</h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-bold tracking-wide mb-6">
                    في إطار الشراكة الاستراتيجية مع شبكة مراكز أوتوهوب التابعة لمجموعة عبداللطيف جميل، تتولى ريفليكتو تنفيذ حلول العزل الحراري وحماية الزجاج لعدد من الفروع في مختلف مناطق المملكة.
                  </p>
                </div>
                <div className="lg:col-span-7">
                  <div className="aspect-[16/10] rounded-3xl overflow-hidden bg-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.7)] group relative border border-white/10 hover:border-[#ff8d87]/30 transition-all duration-500">
                    <img src="/assets/projects/autohub_1.jpg" alt="أوتوهوب" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/35 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                </div>
              </div>
            </article>

            {/* Project 4 */}
            <article className="border-t border-white/5 pt-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 lg:order-2">
                  <span className="text-[#ff8d87] text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block">
                    {isRTL ? 'المشروع الرابع • منشأة متخصصة' : 'Project 04 • Specialized Facility'}
                  </span>
                  <h3 className="text-3xl font-headline font-black text-white mb-4 tracking-tight">مصنع فخامة التطوير</h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-bold tracking-wide mb-6">
                    يعد مصنع فخامة التطوير أحد المنشآت المتخصصة في تعديل وتجهيز المركبات بمختلف أنواعها، بما في ذلك المركبات الفاخرة، ومركبات الخدمات الميدانية، وسيارات الإسعاف، والمركبات المخصصة للجهات الحكومية والشركات.
                  </p>
                </div>
                <div className="lg:col-span-7 lg:order-1">
                  <div className="aspect-[16/10] rounded-3xl overflow-hidden bg-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.7)] group relative border border-white/10 hover:border-[#ff8d87]/30 transition-all duration-500">
                    <img src="/assets/projects/fakhama_1.jpg" alt="مصنع فخامة التطوير" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/35 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

    </main>
  );
});

export default CommercialTinting;