import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pricingService, servicesService } from '../services/api';
import { useTranslation } from 'react-i18next';

/* ─────────────────────────────────────────────────────────────────────
   CSS – injected once into <head>
───────────────────────────────────────────────────────────────────── */
const CSS = `
@keyframes pkgGlowPulse {
  0%,100% { opacity:.45; transform:scale(1);   }
  50%     { opacity:.85; transform:scale(1.04); }
}
@keyframes pkgBadgePop {
  0%   { transform:translateX(-50%) scale(.6); opacity:0; }
  65%  { transform:translateX(-50%) scale(1.08); }
  100% { transform:translateX(-50%) scale(1);  opacity:1; }
}
@keyframes pkgFadeUp {
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0);    }
}
@keyframes pkgSweep {
  0%   { left:-100%; }
  100% { left: 200%; }
}
@keyframes pkgDotPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(255,92,53,.6); }
  50%     { box-shadow: 0 0 0 5px rgba(255,92,53,0); }
}
@keyframes pkgArrowPop {
  0%   { transform:translateY(-50%) scale(.85); opacity:0; }
  100% { transform:translateY(-50%) scale(1);   opacity:1; }
}

/* ── card ── */
.pkg-card {
  position:relative; display:flex; flex-direction:column;
  height:100%; border-radius:20px; padding:22px 20px 20px;
  background:rgba(255,255,255,0.02);
  backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);
  border:0;
  box-shadow:0 8px 30px rgba(0,0,0,0.5);
  transition:transform .35s cubic-bezier(.34,1.3,.64,1), box-shadow .3s;
  overflow:hidden;
  animation:pkgFadeUp .55s ease both;
}
.pkg-card::before {
  content:''; position:absolute; inset:0; border-radius:20px;
  background:linear-gradient(120deg,transparent 0%,rgba(255,92,53,.05) 30%,transparent 60%);
  opacity:0; transition:opacity .4s;
}
.pkg-card:hover { 
  transform:translateY(-8px) scale(1.015);
  box-shadow:0 24px 56px rgba(0,0,0,.65), inset 0 0 0 1px rgba(255,255,255,0.05); 
}
.pkg-card:hover::before { opacity:1; }
.pkg-card::after {
  content:''; position:absolute; top:0; left:-100%; width:40%; height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);
}
.pkg-card:hover::after { animation:pkgSweep .7s ease forwards; }

.pkg-card.pkg-highlighted {
  background:rgba(255,92,53,0.03);
  box-shadow:0 20px 50px rgba(0,0,0,.6), 0 0 50px rgba(255,92,53,.12);
}
.pkg-card.pkg-highlighted:hover {
  transform:translateY(-10px) scale(1.02);
  box-shadow:0 28px 64px rgba(0,0,0,.7), 0 0 60px rgba(255,92,53,.2), inset 0 0 0 1px rgba(255,92,53,0.15);
}

.pkg-glow-blob {
  position:absolute; inset:-10px; border-radius:24px;
  background:radial-gradient(ellipse 80% 55% at 50% -10%,rgba(255,92,53,.32),transparent 68%);
  animation:pkgGlowPulse 2.8s ease-in-out infinite;
  pointer-events:none; z-index:0;
}
.pkg-badge { position:absolute; top:-14px; left:50%; transform:translateX(-50%);
  animation:pkgBadgePop .5s cubic-bezier(.34,1.56,.64,1) both; z-index:10; white-space:nowrap; }
.pkg-badge span { display:inline-block; font-size:9px; font-weight:900; text-transform:uppercase;
  letter-spacing:.2em; padding:4px 12px; border-radius:99px; color:#fff;
  background:linear-gradient(90deg,#FF5C35,#ff8055);
  box-shadow:0 0 16px rgba(255,92,53,.65),0 2px 8px rgba(0,0,0,.4); }
.pkg-watermark { position:absolute; top:8px; right:14px; font-size:64px; font-weight:900;
  line-height:1; color:rgba(255,255,255,.025); user-select:none; pointer-events:none; }
.pkg-price { background:linear-gradient(135deg,#FF5C35 20%,#ff9a6c 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text; font-size:22px; font-weight:900; line-height:1; }
.pkg-feat-icon { display:flex; align-items:center; justify-content:center;
  width:16px; height:16px; border-radius:50%; background:rgba(255,92,53,.1);
  border:0; box-shadow:inset 0 0 0 1px rgba(255,92,53,.28); flex-shrink:0; margin-top:1px;
  transition:background .25s,box-shadow .25s; }
.pkg-card:hover .pkg-feat-icon { background:rgba(255,92,53,.2); 
  box-shadow:inset 0 0 0 1px rgba(255,92,53,.6), 0 0 6px rgba(255,92,53,.3); }
.pkg-cta { display:block; width:100%; padding:11px 0; border-radius:12px;
  font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.18em;
  text-align:center; text-decoration:none;
  transition:letter-spacing .25s,box-shadow .25s,background .25s,filter .25s; border:0; }
.pkg-cta.pkg-cta-solid { background:linear-gradient(135deg,#FF5C35 0%,#d64a28 100%); color:#fff;
  box-shadow:0 4px 20px rgba(255,92,53,.3),inset 0 1px 0 rgba(255,255,255,.12); }
.pkg-cta.pkg-cta-solid:hover { filter:brightness(1.12); letter-spacing:.24em;
  box-shadow:0 6px 30px rgba(255,92,53,.5),inset 0 1px 0 rgba(255,255,255,.18); }
.pkg-cta.pkg-cta-ghost { background:rgba(255,92,53,.09); color:#FF5C35; box-shadow:inset 0 0 0 1px rgba(255,92,53,.22); }
.pkg-cta.pkg-cta-ghost:hover { background:rgba(255,92,53,.18); letter-spacing:.24em;
  box-shadow:inset 0 0 0 1px rgba(255,92,53,.4), 0 0 18px rgba(255,92,53,.18); }

/* ── side arrow buttons ── */
.pkg-side-btn {
  position:absolute; top:50%; z-index:20;
  width:52px; height:52px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:rgba(255,255,255,0.02);
  border:0;
  color:#FF5C35;
  cursor:pointer;
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  box-shadow: inset 0 0 0 1px rgba(255,92,53,.2), 0 8px 30px rgba(0,0,0,.6);
  transition:background .25s, box-shadow .3s, transform .25s;
  animation:pkgArrowPop .4s cubic-bezier(.34,1.56,.64,1) both;
}
.pkg-side-btn:hover:not(:disabled) {
  background:rgba(255,92,53,.18);
  box-shadow:inset 0 0 0 1px rgba(255,92,53,.5), 0 0 28px rgba(255,92,53,.35), 0 8px 30px rgba(0,0,0,.6);
  transform:translateY(-50%) scale(1.1) !important;
}
.pkg-side-btn:disabled {
  opacity:.22; cursor:not-allowed;
  color:rgba(255,255,255,.3);
  background:rgba(255,255,255,.03);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);
}
.pkg-side-btn.pkg-side-left  { left:-14px;  transform:translateY(-50%); }
.pkg-side-btn.pkg-side-right { right:-14px; transform:translateY(-50%); }

@media (min-width: 768px) {
  .pkg-side-btn { width:52px; height:52px; }
  .pkg-side-btn.pkg-side-left  { left:-26px; }
  .pkg-side-btn.pkg-side-right { right:-26px; }
}
@media (max-width: 767px) {
  .pkg-side-btn { width:40px; height:40px; }
}

/* dot */
.pkg-dot { height:6px; border-radius:99px; cursor:pointer;
  transition:width .3s,background .3s,box-shadow .3s; }
.pkg-dot.active { background:linear-gradient(90deg,#FF5C35,#ff8055); width:22px;
  box-shadow:0 0 10px rgba(255,92,53,.55); animation:pkgDotPulse 1.8s ease-in-out infinite; }
.pkg-dot.inactive { background:rgba(255,255,255,.14); width:6px; }
.pkg-dot.inactive:hover { background:rgba(255,255,255,.3); }

/* bg grid */
.pkg-grid-bg { position:absolute; inset:0; pointer-events:none;
  background-image:linear-gradient(rgba(255,92,53,.6) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,92,53,.6) 1px,transparent 1px);
  background-size:56px 56px; opacity:.018; }
.pkg-top-glow { position:absolute; top:-60px; left:50%; transform:translateX(-50%);
  width:900px; height:300px;
  background:radial-gradient(ellipse at 50% 0%,rgba(255,92,53,.18),transparent 68%);
  pointer-events:none; }
`;

function injectCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pkg-carousel-v4')) return;
  const el = document.createElement('style');
  el.id = 'pkg-carousel-v4';
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* ─── CheckIcon ─────────────────────────────────────────────────────── */
const CheckIcon = React.memo(() => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
    stroke="#FF5C35" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
));

/* ─── Arrow SVG ─────────────────────────────────────────────────────── */
const ArrowLeft  = React.memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
));
const ArrowRight = React.memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
));

/* ─── Single package card ───────────────────────────────────────────── */
const PkgCard = React.memo(({ pkg, bookLabel, index }) => {
  const hl    = !!pkg.highlighted;
  const price = typeof pkg.price === 'number' ? pkg.price.toLocaleString() : (pkg.price || '');
  const hasSAR = typeof pkg.price === 'number' || (pkg.price && !isNaN(parseInt(pkg.price)));

  return (
    <article className={`pkg-card${hl ? ' pkg-highlighted' : ''}`}
         style={{ animationDelay: `${index * 0.09}s` }}>
      {hl && <div className="pkg-glow-blob" aria-hidden="true" />}
      <div className="pkg-watermark" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
      {hl && <div className="pkg-badge"><span>★ Most Popular</span></div>}

      {/* header */}
      <header className="relative z-10 mb-5 pb-4"
           style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
          <div style={{
            width:'28px', height:'28px', borderRadius:'8px', flexShrink:0,
            background: hl ? 'rgba(255,92,53,.25)' : 'rgba(255,92,53,.1)',
            boxShadow: `inset 0 0 0 1px rgba(255,92,53,${hl ? '.5' : '.2'})`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }} aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="#FF5C35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            {pkg.label && !pkg.name && (
              <p style={{ fontSize:'9px', fontWeight:700, textTransform:'uppercase',
                          letterSpacing:'.2em', color:'rgba(150,150,150,.8)', marginBottom:'1px' }}>
                {pkg.label}
              </p>
            )}
            {(pkg.name || pkg.label) && (
              <h3 style={{ fontSize:'13px', fontWeight:700, color:'#fff', lineHeight:1.2, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                {pkg.name || pkg.label}
              </h3>
            )}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'baseline', gap:'4px' }}>
          <span className="pkg-price">{price}</span>
          {hasSAR && (
            <span style={{ fontSize:'10px', color:'rgba(150,150,150,.7)', fontWeight:600 }}>SAR</span>
          )}
        </div>
        {pkg.note && (
          <p style={{ fontSize:'10px', color:'rgba(100,100,100,.9)', marginTop:'4px', lineHeight:1.4 }}>
            {pkg.note}
          </p>
        )}
      </header>

      {/* features */}
      <ul className="relative z-10"
          style={{ flex:1, marginBottom:'20px', display:'flex', flexDirection:'column', gap:'10px' }}
          aria-label={`Features of ${pkg.name || pkg.label}`}>
        {Array.isArray(pkg.features) && pkg.features.map((f, j) => (
          <li key={j} style={{ display:'flex', alignItems:'flex-start', gap:'8px',
                                fontSize:'11px', color:'rgba(175,175,175,.9)', lineHeight:1.45 }}>
            <span className="pkg-feat-icon"><CheckIcon /></span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link to="/checkout" state={{ packageId: pkg.id, name: pkg.name || pkg.label, price: pkg.rawPrice || pkg.price }}
        className={`pkg-cta relative z-10 ${hl ? 'pkg-cta-solid' : 'pkg-cta-ghost'}`}
        aria-label={`Book ${pkg.name || pkg.label} package`}
      >
        {bookLabel || 'Book Now'}
      </Link>
    </article>
  );
});

/* ─── PackagesCarousel ──────────────────────────────────────────────── */
const PackagesCarousel = React.memo(({
  packages: propPackages = [],
  title,
  subtitle,
  bookLabel,
  visibleCount = 3,
  serviceId, // optional service ID to filter packages
  serviceSlug, // optional service slug to filter packages
}) => {
  const { t, i18n } = useTranslation(['pricing', 'common']);
  
  const userCompId = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('reflecto_user') || '{}');
      return u?.company_id || u?.company?.id || 'guest';
    } catch { return 'guest'; }
  })();

  // Fetch pricing from the backend
  const { data: response } = useQuery({
    queryKey: ['pricing', userCompId],
    queryFn: () => pricingService.getAll(),
    staleTime: 10 * 1000,
  });

  // Fetch services from the backend to map serviceSlug to id
  const { data: servicesResponse } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesService.getAll(true),
    staleTime: 5 * 60 * 1000,
  });

  const dbPackages = response?.data || [];
  const dbServices = servicesResponse?.data || [];

  // Determine target service ID
  const targetServiceId = useMemo(() => {
    if (serviceId) return serviceId;
    if (serviceSlug) {
      const match = dbServices.find(s => s.slug === serviceSlug);
      return match?.id || null;
    }
    return null;
  }, [serviceId, serviceSlug, dbServices]);

  // Filter packages by serviceId/serviceSlug if provided
  const filteredDbPackages = useMemo(() => {
    const publicPackages = dbPackages.filter(pkg => !pkg.client_id);
    if (serviceId || serviceSlug) {
      if (!targetServiceId) return []; // None match yet
      return publicPackages.filter(pkg => pkg.service_id && String(pkg.service_id) === String(targetServiceId));
    }
    return publicPackages;
  }, [dbPackages, serviceId, serviceSlug, targetServiceId]);
  
  const currentLang = i18n.language || 'ar';
  const isAr = currentLang.startsWith('ar');
  const isRTL = isAr;

  // Map DB packages to match the expected format for the carousel (bilingual)
  const packages = useMemo(() => {
    if (filteredDbPackages.length > 0) {
      return filteredDbPackages.map(tier => {
        const nameEn = tier.name_en || tier.name || 'Package';
        const nameAr = tier.name_ar || tier.name_en || tier.name || 'باقة';
        const taglineEn = tier.tagline_en || tier.description_en || tier.tagline || '';
        const taglineAr = tier.tagline_ar || tier.description_ar || taglineEn;

        let featuresEn = tier.features_en;
        if (typeof featuresEn === 'string') {
          try { featuresEn = JSON.parse(featuresEn); } catch { featuresEn = [featuresEn]; }
        }
        let featuresAr = tier.features_ar;
        if (typeof featuresAr === 'string') {
          try { featuresAr = JSON.parse(featuresAr); } catch { featuresAr = [featuresAr]; }
        }

        const finalName = isAr ? nameAr : nameEn;
        const finalTagline = isAr ? taglineAr : taglineEn;
        const finalFeatures = (isAr ? (featuresAr && featuresAr.length ? featuresAr : featuresEn) : (featuresEn && featuresEn.length ? featuresEn : featuresAr)) || [];

        return {
          id: tier.id,
          label: finalName,
          name: finalName,
          price: typeof tier.price === 'number' ? tier.price : tier.price_amount,
          rawPrice: tier.price || tier.price_amount,
          note: finalTagline,
          features: Array.isArray(finalFeatures) ? finalFeatures : [String(finalFeatures)],
          highlighted: tier.isPopular || tier.is_popular
        };
      });
    }
    
    return propPackages.map(pkg => ({
      ...pkg,
      name: isAr ? (pkg.name_ar || pkg.name || pkg.label) : (pkg.name_en || pkg.name || pkg.label),
      note: isAr ? (pkg.note_ar || pkg.note) : (pkg.note_en || pkg.note),
      features: isAr ? (pkg.features_ar || pkg.features) : (pkg.features_en || pkg.features),
    }));
  }, [filteredDbPackages, propPackages, isAr, currentLang]);

  useEffect(() => { injectCSS(); }, []);

  const [idx,      setIdx]      = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragX  = useRef(null);
  const touchX = useRef(null);
  const carouselRef = useRef(null);
  const [currentVisibleCount, setCurrentVisibleCount] = useState(visibleCount);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCurrentVisibleCount(1); // Mobile
      } else if (window.innerWidth < 1024) {
        setCurrentVisibleCount(2); // Tablet
      } else {
        setCurrentVisibleCount(visibleCount); // Desktop
      }
    };
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visibleCount]);

  const total   = packages.length;
  const maxIdx  = Math.max(0, total - currentVisibleCount);
  const canPrev = idx > 0;
  const canNext = idx < maxIdx;

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx(i => Math.min(maxIdx, i + 1)), [maxIdx]);



  /* drag */
  const onMD = useCallback(e => { dragX.current = e.clientX; setDragging(false); }, []);
  const onMM = useCallback(e => { if (dragX.current !== null && Math.abs(e.clientX - dragX.current) > 6) setDragging(true); }, []);
  const onMU = useCallback(e => {
    if (dragX.current === null) return;
    const d = dragX.current - e.clientX;
    if (Math.abs(d) > 40) {
      if (isRTL) {
        d < 0 ? next() : prev();
      } else {
        d > 0 ? next() : prev();
      }
    }
    dragX.current = null; setDragging(false);
  }, [next, prev, isRTL]);
  const onTS = useCallback(e => { touchX.current = e.touches[0].clientX; }, []);
  const onTE = useCallback(e => {
    if (touchX.current === null) return;
    const d = touchX.current - e.changedTouches[0].clientX;
    if (isRTL) {
      if (d < -50) next(); else if (d > 50) prev();
    } else {
      if (d > 50) next(); else if (d < -50) prev();
    }
    touchX.current = null;
  }, [next, prev, isRTL]);

  const cardW    = 100 / currentVisibleCount;
  const shiftPct = idx * cardW;

  return (
    <section ref={carouselRef} style={{
      position:'relative',
      padding:'96px 24px',
      background:'#000000',
      overflow:'hidden',
    }} aria-label="Pricing Packages">
      <div className="pkg-grid-bg" />
      <div className="pkg-top-glow" />

      {/* left & right fade masks */}
      <div className="hidden md:block" style={{ position:'absolute', left:0,  top:0, bottom:0, width:'60px', zIndex:5,
                    background:'linear-gradient(90deg,#000000,transparent)', pointerEvents:'none' }} aria-hidden="true" />
      <div className="hidden md:block" style={{ position:'absolute', right:0, top:0, bottom:0, width:'60px', zIndex:5,
                    background:'linear-gradient(-90deg,#000000,transparent)', pointerEvents:'none' }} aria-hidden="true" />

      <div style={{ position:'relative', zIndex:6, maxWidth:'1200px', margin:'0 auto' }}>

        {/* ── heading ── */}
        <header style={{ textAlign:'center', marginBottom:'56px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                        gap:'12px', marginBottom:'20px' }} aria-hidden="true">
            <div style={{ height:'1px', width:'48px',
                          background:'linear-gradient(90deg,transparent,rgba(255,92,53,.7))' }} />
            <span style={{ fontSize:'9px', fontWeight:900, textTransform:'uppercase',
                           letterSpacing:'.32em', color:'rgba(255,92,53,.9)' }}>
              Choose Your Plan
            </span>
            <div style={{ height:'1px', width:'48px',
                          background:'linear-gradient(-90deg,transparent,rgba(255,92,53,.7))' }} />
          </div>
          <h2 style={{ fontSize:'clamp(26px,4vw,46px)', fontWeight:900, lineHeight:1.15,
                       letterSpacing:'-.02em', color:'#fff', margin:'0 0 12px', textTransform:'uppercase' }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize:'14px', color:'rgba(130,130,130,.9)',
                        maxWidth:'520px', margin:'0 auto', lineHeight:1.7, fontWeight:700 }}>
              {subtitle}
            </p>
          )}
        </header>

        {/* ── count pill + dots ── */}
        <div style={{ display:'flex', alignItems:'center',
                      justifyContent:'space-between', marginBottom:'28px', padding:'0 2px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase',
                        letterSpacing:'.18em', padding:'6px 14px', borderRadius:'99px',
                        background:'rgba(255,255,255,0.05)', boxShadow:'inset 0 0 0 1px rgba(255,92,53,0.3)',
                        color:'rgba(255,92,53,.85)' }} aria-live="polite">
            {total} Package{total !== 1 ? 's' : ''}
          </div>

          {/* dot indicators */}
          {total > visibleCount && (
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }} role="tablist">
              {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                <button key={i}
                  className={`pkg-dot ${i === idx ? 'active' : 'inactive'}`}
                  onClick={() => setIdx(i)}
                  aria-label={`Slide ${i + 1}`}
                  role="tab"
                  aria-selected={i === idx}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── track wrapper with SIDE ARROWS ── */}
        <div style={{ position:'relative' }}>

          {/* LEFT side arrow */}
          <button
            className="pkg-side-btn pkg-side-left"
            onClick={isRTL ? next : prev}
            disabled={isRTL ? !canNext : !canPrev}
            aria-label={isRTL ? "Next packages" : "Previous packages"}
          >
            <ArrowLeft />
          </button>

          {/* RIGHT side arrow */}
          <button
            className="pkg-side-btn pkg-side-right"
            onClick={isRTL ? prev : next}
            disabled={isRTL ? !canPrev : !canNext}
            aria-label={isRTL ? "Previous packages" : "Next packages"}
          >
            <ArrowRight />
          </button>

          {/* carousel track */}
          <div
            style={{ overflow:'hidden', cursor: dragging ? 'grabbing' : 'grab', padding:'4px 0 16px' }}
            onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU}
            onMouseLeave={() => { dragX.current = null; }}
            onTouchStart={onTS} onTouchEnd={onTE}
          >
            <div style={{
              display:'flex',
              transform:`translateX(${isRTL ? shiftPct : -shiftPct}%)`,
              transition: dragging ? 'none' : 'transform .55s cubic-bezier(.25,.46,.45,.94)',
            }}>
              {packages.map((pkg, i) => (
                <div key={i}
                  style={{ minWidth:`${cardW}%`, flexShrink:0, padding:'0 10px 4px' }}>
                  <PkgCard pkg={pkg} bookLabel={bookLabel} index={i} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── footer strip ── */}
        <div style={{ marginTop:'36px', textAlign:'center', padding:'18px 24px',
                      borderRadius:'16px', background:'rgba(255,255,255,0.02)', backdropFilter:'blur(12px)',
                      boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize:'12px', color:'rgba(120,120,120,.9)', fontWeight:700 }}>
            Not sure which plan fits you?{' '}
            <Link to="/contact"
              style={{ color:'#FF5C35', fontWeight:900, transition:'opacity .2s', textTransform:'uppercase', letterSpacing:'0.05em' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Talk to our experts →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
});

export default PackagesCarousel;
