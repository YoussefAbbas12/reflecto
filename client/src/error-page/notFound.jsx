import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSubdomainPortal } from '../utils/portal';

const NotFound = React.memo(() => {
  const { t } = useTranslation();
  const portal = useMemo(() => getSubdomainPortal(), []);

  const returnTarget = portal === 'admin' ? '/admin' : portal === 'technical' ? '/technician' : '/';
  const returnLabel = portal === 'admin' ? 'العودة للوحة التحكم (Dashboard)' : portal === 'technical' ? 'العودة لبوابة الفنيين' : t('return_home', 'Return Home');

  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center" aria-labelledby="not-found-title">
      <h1 className="text-8xl md:text-[150px] font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-[#FF5C35] mb-4 drop-shadow-lg uppercase">
        404
      </h1>
      <h2 id="not-found-title" className="text-2xl md:text-3xl font-bold tracking-widest uppercase text-white mb-4">
        {t('not_found_title', 'Page Not Found')}
      </h2>
      <p className="text-gray-400 max-w-md mb-8 text-sm md:text-[11px] font-bold uppercase tracking-widest leading-relaxed">
        {t('not_found_desc', "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.")}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to={returnTarget}
          className="px-8 py-4 bg-white/[0.05] text-white font-black tracking-widest uppercase text-[11px] rounded-xl shadow-inner border-0 hover:bg-[#FF5C35] hover:text-white transition-colors duration-300 text-center backdrop-blur-xl"
          aria-label={returnLabel}
        >
          {returnLabel}
        </Link>
      </div>
    </main>
  );
});

export default NotFound;
