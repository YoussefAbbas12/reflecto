import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = React.memo(() => {
  const { t } = useTranslation('common');

  return (
    <footer className="bg-[#000000] pt-20 pb-28 sm:pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] border-0" aria-label="Site Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-8 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 rounded" aria-label="Reflecto Home">
              <span className="text-2xl font-display font-black tracking-widest uppercase text-[#FF5C35]">{t('logo')}</span>
            </Link>
            <p className="text-gray-500 text-[11px] font-bold tracking-wide leading-relaxed uppercase">
              {t('footer.description')}
            </p>
          </div>

          <nav aria-label="Services Navigation">
            <h4 className="text-white font-black text-xs tracking-widest uppercase mb-8">{t('footer.services_title')}</h4>
            <ul className="space-y-4 text-[10px] font-bold tracking-widest uppercase text-gray-500">
              <li><Link to="/services/ppf" className="hover:text-[#FF5C35] transition-colors focus:outline-none focus:text-[#FF5C35]">{t('footer.service_ppf')}</Link></li>
              <li><Link to="/services/nano-ceramic" className="hover:text-[#FF5C35] transition-colors focus:outline-none focus:text-[#FF5C35]">{t('footer.service_nano')}</Link></li>
              <li><Link to="/services/dash-cam" className="hover:text-[#FF5C35] transition-colors focus:outline-none focus:text-[#FF5C35]">{t('footer.service_dash_cam')}</Link></li>
              <li><Link to="/services/window-tint" className="hover:text-[#FF5C35] transition-colors focus:outline-none focus:text-[#FF5C35]">{t('footer.service_insulation')}</Link></li>
            </ul>
          </nav>

          <nav aria-label="Company Navigation">
            <h4 className="text-white font-black text-xs tracking-widest uppercase mb-8">{t('footer.company_title')}</h4>
            <ul className="space-y-4 text-[10px] font-bold tracking-widest uppercase text-gray-500">
              <li><Link to="/" className="hover:text-[#FF5C35] transition-colors focus:outline-none focus:text-[#FF5C35]">{t('footer.company_about')}</Link></li>
              <li><Link to="/pricing" className="hover:text-[#FF5C35] transition-colors focus:outline-none focus:text-[#FF5C35]">{t('footer.company_pricing')}</Link></li>
              <li><Link to="/contact" className="hover:text-[#FF5C35] transition-colors focus:outline-none focus:text-[#FF5C35]">{t('footer.company_contact')}</Link></li>
            </ul>
          </nav>

          <address className="not-italic">
            <h4 className="text-white font-black text-xs tracking-widest uppercase mb-8">{t('footer.contact_title')}</h4>
            <ul className="space-y-4 text-[10px] font-bold tracking-widest uppercase text-gray-500">
              <li><span className="text-white">{t('footer.contact_phone')}:</span> <a href="tel:+966 55 872 2444" className="hover:text-[#FF5C35] transition-colors focus:outline-none focus:text-[#FF5C35]">+966 55 872 2444</a></li>
              <li><span className="text-white">{t('footer.contact_email')}:</span> <a href="mailto:info@reflecto.com.sa" className="hover:text-[#FF5C35] transition-colors focus:outline-none focus:text-[#FF5C35]">info@reflecto.com.sa</a></li>
              <li><span className="text-white">{t('footer.contact_hours')}:</span> {t('footer.contact_hours_value')}</li>
            </ul>
          </address>
        </div>

        <div className="bg-white/[0.02] shadow-inner py-6 text-center text-[10px] font-bold tracking-widest uppercase text-gray-600 rounded-2xl">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
});

export default Footer;
