import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PackagesCarousel from '../../components/PackagesCarousel';
import SEOHead from '../../components/SEOHead';

const availablePhotos = [
  '/assets/photo/22536460-00db-44a2-a51c-6657fb1feec0.jpg',
  '/assets/photo/357d613a-59c8-4fed-a7d5-f0f11f5ea01e.jpg',
  '/assets/photo/4bc12624-9958-4238-bb78-cec5753fbd47.jpg',
  '/assets/photo/6c7ba9c5-ee8b-4082-8133-7cee8cf621b2.jpg',
  '/assets/photo/9394f893-7173-4229-9c39-d77c961e4e09.jpg',
  '/assets/photo/car.jpg',
  '/assets/photo/dash came.jpeg',
  '/assets/photo/dash came.jpg',
  '/assets/photo/dash came1.jpeg',
  '/assets/photo/dash came (5).jpeg',
  '/assets/photo/dash-came.jpeg',
  '/assets/photo/landing services.jpg',
  '/assets/photo/WhatsApp Image 2026-02-08 at 3.58.07 PM.jpeg',
  '/assets/photo/WhatsApp Image 2026-02-14 at 9.22.07 PM.jpeg',
  '/assets/photo/after heat protection.jpeg',
  '/assets/photo/levels heat protection.jpeg',
  '/assets/photo/nano-services.jpg',
  '/assets/photo/window-tint.jpg'
];

const getRandomPhoto = (index) => {
  return availablePhotos[index % availablePhotos.length];
};

const DashCam = React.memo(() => {
  const { t } = useTranslation(['dashcam', 'service5', 'common']);

  const dashCamSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Smart Dash Cam Installation - تركيب كاميرات الداش كام الذكية",
    "provider": {
      "@type": "AutomotiveBusiness",
      "name": "Reflecto Premium",
      "url": "https://www.reflecto.com.sa/"
    },
    "areaServed": ["Jeddah", "Riyadh", "Saudi Arabia"],
    "description": "تركيب كاميرات مراقبة السيارات الداش كام الذكية بدقة 4K مع وضع التسجيل أثناء الوقوف والتسجيل الصوتي والربط الذكي.",
    "url": "https://www.reflecto.com.sa/services/dash-cam"
  }), []);

  const dashLevels = useMemo(() => t('dashcam:dash_levels', { returnObjects: true }) || [], [t]);
  const stats = useMemo(() => t('dashcam:stats', { returnObjects: true }) || [], [t]);
  const popularCams = useMemo(() => t('dashcam:popular_cams', { returnObjects: true }) || [], [t]);
  const packagesList = useMemo(() => t('service5:packages', { returnObjects: true }) || [], [t]);

  const mainImage = useMemo(() => getRandomPhoto(6), []);
  const popImages = useMemo(() => [getRandomPhoto(8), getRandomPhoto(9), getRandomPhoto(10), getRandomPhoto(7)], []);
  const beforeImg = useMemo(() => getRandomPhoto(5), []);
  const afterImg = useMemo(() => getRandomPhoto(4), []);

  return (
    <main className="min-h-screen bg-[#000000] pb-20 font-body selection:bg-[#FF4500]/30 text-white">
      <SEOHead
        title={t('dashcam:hero_name', 'تركيب كاميرات الداش كام')}
        description={t('dashcam:hero_rest', 'تركيب كاميرات الداش كام الذكية 4K للسيارات مع تمديد أسلاك مخفي وضمان كامل.')}
        canonicalPath="/services/dash-cam"
        keywords="داش كام, تركيب كاميرا سيارة, كاميرا مراقبة السيارات 4K, داش كام جدة, داش كام الرياض"
        schema={dashCamSchema}
      />
      <div className="max-w-7xl mx-auto px-6 pt-24">
        <header className="text-center mb-16" aria-label="Dash Cam Hero">
          <h1 className="text-3xl md:text-5xl font-display text-white tracking-widest uppercase font-black">
            <span className="text-[#FF4500]">{t('dashcam:hero_highlight')}</span> <span className="text-gray-300">{t('dashcam:hero_name')}</span> {t('dashcam:hero_rest')}
          </h1>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-32 items-stretch" aria-label="Premium Dash Cam Overview">
          <div className="rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] h-full bg-white/[0.02]">
            <picture>
              <img src={mainImage} alt="Premium Dash Camera Installed" loading="lazy" decoding="async" className="w-full h-full object-cover mix-blend-luminosity opacity-90" />
            </picture>
          </div>
          <article className="bg-white/[0.02] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-0 p-10 rounded-3xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4500]/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true"></div>
            <h2 className="text-3xl font-display font-black tracking-widest uppercase text-white mb-4 relative z-10">{t('dashcam:card_title')}</h2>
            <p className="text-gray-400 text-xs font-bold tracking-wide mb-10 leading-relaxed relative z-10 uppercase">{t('dashcam:card_subtitle')}</p>
            
            <div className="flex justify-between items-center mb-8 relative z-10 border-b border-white/[0.05] pb-4">
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{t('dashcam:select_dash_level')}</span>
              <span className="text-[10px] bg-[#FF4500]/10 text-[#FF4500] shadow-inner font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">{t('dashcam:premium_warranty')}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 relative z-10" role="group" aria-label="Dash cam specifications">
              {Array.isArray(dashLevels) && dashLevels.map((level, i) => (
                <div key={i} className={`py-3 text-[10px] rounded-xl shadow-inner border-0 text-center uppercase tracking-widest transition-all ${i === 2 || i === 5 ? 'bg-[#FF4500] text-white font-bold shadow-[0_4px_15px_rgba(255,69,0,0.3)]' : 'bg-white/[0.05] text-gray-400 font-bold'}`}>
                  {level}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-white tracking-widest font-bold uppercase border-b border-white/[0.05] pb-3 mb-8 relative z-10">
              <span>{t('dashcam:cooling_factor')}</span>
              <span className="text-[#FF4500]">{t('dashcam:heat_rejection')}</span>
            </div>
            
            <div className="space-y-6 relative z-10">
              {Array.isArray(stats) && stats.map((s, i) => (
                <div key={i} className="flex grid grid-cols-[120px_1fr_40px] gap-6 items-center">
                  <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase whitespace-nowrap">{s.l}</div>
                  <div className="h-1.5 w-full bg-white/[0.05] shadow-inner rounded-full overflow-hidden"><div className="h-full bg-[#FF4500]" style={{ width: s.v }}></div></div>
                  <div className="text-[10px] font-bold text-white text-right">{s.v}</div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="text-center mb-32" aria-label="Popular Dash Cam Models">
          <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-widest text-white mb-6">
            <span className="text-[#FF4500]">{t('dashcam:popular_title_1')}</span> {t('dashcam:popular_title_2')} <span className="text-[#FF4500]">{t('dashcam:popular_title_3')}</span> {t('dashcam:popular_title_4')}
          </h2>
          <p className="text-gray-500 text-xs font-bold mb-16 max-w-2xl mx-auto tracking-widest uppercase">{t('dashcam:popular_subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-12 lg:gap-20">
            {Array.isArray(popularCams) && popularCams.map((item, i) => (
              <figure key={i} className="text-center flex flex-col items-center group cursor-pointer" tabIndex={0} role="button" aria-label={`View ${item.l}`}>
                <div className="w-40 h-40 rounded-full overflow-hidden mb-6 bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-1 group-hover:shadow-[0_8px_30px_rgba(255,69,0,0.3)] transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <picture>
                      <img src={popImages[i]} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" alt={`Popular Dash Cam model: ${item.l}`} loading="lazy" decoding="async" />
                    </picture>
                  </div>
                </div>
                <figcaption className="text-[10px] font-bold uppercase tracking-widest text-white bg-[#FF4500]/10 px-4 py-1.5 rounded-full shadow-inner group-hover:bg-[#FF4500] transition-colors">{item.l}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="relative mb-32 py-16 bg-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-3xl border-0 px-8" aria-label="Visual Evidence Comparison">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-black uppercase tracking-widest text-white mb-4">
              <span className="text-[#FF4500]">{t('dashcam:difference_1')}</span> {t('dashcam:difference_2')} <span className="text-[#FF4500]">{t('dashcam:difference_3')}</span> {t('dashcam:difference_4')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <figure className="relative group aspect-video rounded-2xl overflow-hidden shadow-inner bg-black">
              <picture>
                <img src={beforeImg} alt="Without Dash Cam Evidence" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
              </picture>
              <figcaption className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white px-6 py-2 text-[10px] font-bold tracking-widest bg-black/80 backdrop-blur-sm shadow-inner uppercase rounded-lg border-b-2 border-gray-500">
                {t('dashcam:slider_before')}
              </figcaption>
            </figure>
            <figure className="relative group aspect-video rounded-2xl overflow-hidden shadow-inner bg-black">
              <picture>
                <img src={afterImg} alt="With HD Dash Cam Evidence" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-90" />
              </picture>
              <figcaption className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#FF4500] px-6 py-2 text-[10px] font-bold tracking-widest bg-black/80 backdrop-blur-sm shadow-inner uppercase rounded-lg border-b-2 border-[#FF4500]">
                {t('dashcam:slider_after')}
              </figcaption>
            </figure>
          </div>
        </section>
      </div>

      <PackagesCarousel
        packages={packagesList}
        serviceSlug="dash-cam"
        title={
          <>
            {t('dashcam:packages_title_1')}{' '}
            <span className="text-[#FF4500]">{t('dashcam:packages_title_2')}</span>{' '}
            {t('dashcam:packages_title_rest')}
          </>
        }
        bookLabel={t('service5:pkg_book')}
      />
    </main>
  );
});

export default DashCam;
