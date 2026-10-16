import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SaudiMap from '../components/SaudiMap';
import SEOHead from '../components/SEOHead';

const Branches = React.memo(() => {
  const { t } = useTranslation(['branches', 'common']);

const branches = useMemo(() => [
  {
    id: 1,
    name: t('jeddah.name'),
    location: t('jeddah.location'),
    tag: null,
    tagColor: '',
    span: 'col-span-12 md:col-span-12',
    height: 'h-[450px]',
    image: '/assets/photo/jeddah.png',
    alt: 'Luxurious car detailing studio in Jeddah showcasing ceramic coating',
    mapUrl: 'https://maps.app.goo.gl/atYXQa5VcwzifDNT8?g_st=iw',
    supervisor: '+966 55 872 2444',
    supervisorLabel: t('supervisor')
  },
  {
    id: 2,
    name: t('riyadh_faisaliah_1.name'),
    location: t('riyadh_faisaliah_1.location'),
    tag: null,
    tagColor: '',
    span: 'col-span-12 md:col-span-8',
    height: 'h-[450px]',
    image: '/assets/photo/riyadh_faisaliah_1.png',
    alt: 'Modern high-end car detailing center in Riyadh - Al Faisaliah 1',
    mapUrl: 'https://maps.app.goo.gl/P9uPiPyRajjcR1RXA?g_st=iw',
    supervisor: null
  },
  {
    id: 3,
    name: t('riyadh_faisaliah_2.name'),
    location: t('riyadh_faisaliah_2.location'),
    tag: t('riyadh_faisaliah_2.tag'),
    tagColor: 'bg-[#FF5C35] text-white',
    span: 'col-span-12 md:col-span-4',
    height: 'h-[450px]',
    image: '/assets/photo/riyadh_faisaliah_2.png',
    alt: 'Premium car window tinting and wrapping workshop in Riyadh - Al Faisaliah 2',
    mapUrl: 'https://maps.app.goo.gl/u6HcJzFD1sNqhGyF7?g_st=iw',
    supervisor: null
  },
  {
    id: 4,
    name: t('makkah.name'),
    location: t('makkah.location'),
    tag: null,
    tagColor: '',
    span: 'col-span-12 md:col-span-6',
    height: 'h-[350px]',
    image: '/assets/photo/makkah.png',
    alt: 'State-of-the-art car detailing studio in Mecca',
    mapUrl: 'https://maps.app.goo.gl/rfxd3su14tg2yUko6?g_st=iw',
    supervisor: '+966 53 533 2279',
    supervisorLabel: t('supervisor_both')
  },
  {
    id: 5,
    name: t('taif.name'),
    location: t('taif.location'),
    tag: null,
    tagColor: '',
    span: 'col-span-12 md:col-span-6',
    height: 'h-[350px]',
    image: '/assets/photo/taif.png',
    alt: 'Professional car detailing and polishing service center in Taif',
    mapUrl: 'https://maps.app.goo.gl/v59fwspEgpkpR1KY6?g_st=iw',
    supervisor: '+966 53 533 2279',
    supervisorLabel: t('supervisor_both')
  },
  {
    id: 6,
    name: t('dammam.name'),
    location: t('dammam.location'),
    tag: null,
    tagColor: '',
    span: 'col-span-12 md:col-span-4',
    height: 'h-[450px]',
    image: '/assets/photo/dammam.png',
    alt: 'Premium automotive detailing workshop in Dammam',
    mapUrl: 'https://maps.app.goo.gl/bcWgyncTdk4BsQZq6?g_st=iw',
    supervisor: null
  },
  {
    id: 7,
    name: t('almadina.name'),
    location: t('almadina.location'),
    tag: null,
    tagColor: '',
    span: 'col-span-12 md:col-span-8',
    height: 'h-[450px]',
    image: '/assets/photo/riyadh_faisaliah_1.png',
    alt: 'Modern high-end car detailing center in Riyadh - Al Faisaliah 1',
    mapUrl: 'https://maps.app.goo.gl/P9uPiPyRajjcR1RXA?g_st=iw',
    supervisor: '+966 55 872 2444',
    supervisorLabel: t('supervisor')
  }
  ], [t]);

  const statistics = useMemo(() => [
    { number: '09', label: t('stat_branches') },
  ], [t]);

  return (
    <main className="min-h-screen bg-[#000000] text-white pt-16 font-body" aria-labelledby="branches-heading">
      <SEOHead
        title={t('title', 'فروعنا في المملكة العربية السعودية')}
        description={t('subtitle', 'فروع ريفليكتو بريميوم لحماية السيارات في جدة، الرياض، مكة، الطائف، الدمام والمدينة المنورة.')}
        canonicalPath="/branches"
        keywords="فروع ريفليكتو, مراكز حماية السيارات جدة, مراكز حماية السيارات الرياض, ريفليكتو مكة, ريفليكتو الدمام"
      />
      {/* Hero Section */}
      <header className="relative min-h-[600px] flex flex-col items-center justify-center overflow-hidden px-6 lg:px-12 bg-[#000000]">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FF5C35]/20 via-[#000000] to-[#000000]"></div>
        </div>
        <div className="relative z-10 text-center max-w-5xl">
          <h1 id="branches-heading" className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-6 leading-none italic drop-shadow-2xl font-headline">
            {t('title').split(' ')[0]} <span className="text-[#FF5C35] italic">{t('title').split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 uppercase tracking-[0.3em] font-bold mb-12 max-w-3xl mx-auto drop-shadow-md">
            {t('subtitle')}
          </p>
        </div>
      </header>

      {/* Statistics Section */}
      <section className="py-24 bg-white/[0.02] backdrop-blur-2xl border-0 shadow-2xl relative z-10" aria-label="Branch Statistics">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-12 text-center">
            {statistics.map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-7xl font-black text-white mb-2 italic drop-shadow-lg" aria-hidden="true">{stat.number}</span>
                <span className="text-[#FF5C35] text-sm tracking-[0.4em] font-bold uppercase">{stat.label}</span>
                <div className="w-12 h-1 bg-[#FF5C35]/50 mt-6 rounded-full shadow-[0_0_10px_rgba(255,92,53,0.5)]"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Interactive Saudi Arabia Map */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto py-12 relative z-10">
        <SaudiMap />
      </section>

      {/* Featured Locations Grid */}
      <section className="py-24 px-6 lg:px-12 max-w-[1600px] mx-auto" aria-labelledby="network-heading">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-[#FF5C35] text-sm font-bold tracking-[0.5em] uppercase mb-4">{t('strategic_assets')}</h2>
            <h3 id="network-heading" className="text-4xl md:text-6xl font-black uppercase text-white leading-none font-headline tracking-tight">{t('kingdom_network')}</h3>
          </div>
          <div className="text-gray-400 max-w-md text-sm uppercase tracking-widest leading-relaxed font-bold">
            {t('logistics_desc')}
          </div>
        </header>

        {/* Location Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" role="list">
          {branches.map((branch) => (
            <article 
              key={branch.id}
              role="listitem"
              className={`${branch.span} group relative rounded-2xl ${branch.height} overflow-hidden border-0 bg-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
            >
              <picture>
                <img 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700"
                  alt={branch.alt}
                  src={branch.image}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" aria-hidden="true"></div>
              
              <div className="absolute bottom-0 p-8 md:p-12 w-full flex flex-col md:flex-row md:justify-between md:items-end gap-6 pointer-events-auto z-10">
                <div className="flex-1">
                  {branch.tag && (
                    <span className={`inline-block px-3 py-1 ${branch.tagColor} text-xs font-black uppercase mb-4 rounded-sm shadow-lg`} aria-label={`Tag: ${branch.tag}`}>
                      {branch.tag}
                    </span>
                  )}
                  <h4 className={`font-black uppercase text-white mb-2 font-headline tracking-tight drop-shadow-lg ${branch.span.includes('col-span-8') ? 'text-4xl md:text-5xl' : 'text-3xl'}`}>
                    {branch.name}
                  </h4>
                  <p className="text-gray-300 text-sm tracking-widest uppercase font-bold drop-shadow-md">{branch.location}</p>
                  
                  {branch.supervisor && (
                    <div className="flex items-center gap-2 mt-3 text-[#FF5C35] hover:text-white transition-colors text-sm font-bold tracking-wider drop-shadow-md">
                      <span className="material-symbols-outlined text-sm">call</span>
                      <a href={`tel:${branch.supervisor.replace(/\s+/g, '')}`} className="hover:underline">
                        {branch.supervisorLabel}: {branch.supervisor}
                      </a>
                    </div>
                  )}
                </div> 
                {branch.id !== 7 && (
                  <div className="flex-shrink-0 flex flex-col gap-4">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 group/btn bg-white/[0.05] backdrop-blur-md shadow-inner hover:bg-[#FF5C35] px-6 py-3 rounded-xl transition-all relative z-20"
                      aria-label={`View details for ${branch.name}`}
                    >
                      <a
                        href={branch.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold uppercase tracking-widest text-white transition-colors"
                      >
                        {t('view_location')}
                      </a>

                      <span
                        className="material-symbols-outlined text-[#FF5C35] text-sm group-hover/btn:text-white transition-colors"
                        aria-hidden="true"
                      >
                        arrow_forward
                      </span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 group/btn bg-white/[0.05] backdrop-blur-md shadow-inner hover:bg-[#FF5C35] px-6 py-3 rounded-xl transition-all relative z-20"
                    >
                      <a
                        href="https://linktr.ee/Amany500?utm_source=linktree_profile_share&ltsid=be5c296c-2fe8-4505-bccd-b9dbd6bb4f9d"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold uppercase tracking-widest text-white transition-colors"
                      >
                        More Details
                      </a>

                      <span
                        className="material-symbols-outlined text-[#FF5C35] text-sm group-hover/btn:text-white transition-colors"
                        aria-hidden="true"
                      >
                        arrow_forward
                      </span>
                    </button>
                  </div>
                )}    
              </div>        
            </article>
          ))}
        </div>
      </section>
    </main>
  );
});

export default Branches;