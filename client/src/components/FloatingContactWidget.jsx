import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FloatingContactWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef(null);
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar' || true; // Default Arabic friendly

  // Close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for event to close this widget when another widget opens
  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener('close-contact-widget', handleClose);
    return () => window.removeEventListener('close-contact-widget', handleClose);
  }, []);

  const toggleOpen = () => {
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('close-ai-assistant'));
    }
    setIsOpen((prev) => !prev);
  };

  const whatsappNumber = '966558722444';
  const phoneCallNumber = '+966558722444';
  const emailAddress = 'info@reflecto.com.sa';
  const defaultMsg = encodeURIComponent('السلام عليكم، أود الاستفسار عن خدمات ريفليكتو للعناية والحماية بالسيارات.');

  return (
    <div ref={widgetRef} className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 flex flex-col items-start select-none font-body">
      {/* Popover Box */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-5rem)] max-w-xs sm:w-96 bg-[#121216]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-3xl p-4 sm:p-5 text-white animate-in fade-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">
          {/* Top Decorative Ambient Light */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF5C35]/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF5C35] to-[#ff8060] flex items-center justify-center shadow-[0_0_15px_rgba(255,92,53,0.4)]">
                <span className="material-symbols-outlined text-white text-xl">headset_mic</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {isAr ? 'مركز تواصل ريفليكتو' : 'Reflecto Support'}
                </h3>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isAr ? 'متصلون الآن بخدمتك' : 'Available Online'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Contact Methods List */}
          <div className="space-y-2.5 relative z-10">
            {/* 1. WhatsApp */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${defaultMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-white transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.031 2c-5.456 0-9.902 4.446-9.902 9.902 0 1.745.457 3.447 1.328 4.954L2 22l5.253-1.378c1.45.79 3.09 1.208 4.778 1.208 5.456 0 9.902-4.446 9.902-9.902 0-5.456-4.446-9.902-9.902-9.902zm5.82 14.161c-.244.686-1.42 1.31-1.96 1.371-.49.055-1.127.086-1.821-.137-.428-.137-.985-.32-1.705-.632-3.003-1.302-4.966-4.33-5.116-4.53-.15-.2-1.22-1.626-1.22-3.1 0-1.474.773-2.2 1.047-2.5.274-.3.6-.375.8-.375.2 0 .4 0 .574.01.184.009.431-.07.674.513.244.584.832 2.032.905 2.18.073.15.122.324.024.522-.097.199-.147.323-.294.498-.147.174-.309.39-.441.524-.147.15-.301.313-.13.606.171.293.762 1.258 1.636 2.037 1.124 1.002 2.072 1.313 2.365 1.46.293.147.465.122.637-.074.171-.196.733-.855.93-1.148.196-.293.391-.244.66-.147.269.098 1.711.807 2.004.954.293.147.489.22.562.343.073.123.073.71-.171 1.396z"/>
                </svg>
              </div>
              <div className="flex-1 text-right">
                <div className="text-xs font-bold text-emerald-400">{isAr ? 'محادثة الواتساب المباشرة' : 'WhatsApp Chat'}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{isAr ? 'تواصل معنا فورا عبر الواتس' : 'Chat instantly via WhatsApp'}</div>
              </div>
              <span className="material-symbols-outlined text-emerald-400 text-sm opacity-60 group-hover:opacity-100 group-hover:translate-x-[-2px] transition-all">arrow_back_ios</span>
            </a>

            {/* 2. Direct Phone Call */}
            <a
              href={`tel:${phoneCallNumber}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FF5C35]/10 hover:bg-[#FF5C35]/20 border border-[#FF5C35]/20 hover:border-[#FF5C35]/40 text-white transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF5C35]/20 text-[#FF5C35] flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xl">call</span>
              </div>
              <div className="flex-1 text-right">
                <div className="text-xs font-bold text-[#FF5C35]">{isAr ? 'الاتصال الهاتفي المباشر' : 'Direct Call'}</div>
                <div className="text-[11px] text-gray-400 mt-0.5" dir="ltr">{phoneCallNumber}</div>
              </div>
              <span className="material-symbols-outlined text-[#FF5C35] text-sm opacity-60 group-hover:opacity-100 group-hover:translate-x-[-2px] transition-all">arrow_back_ios</span>
            </a>

            {/* 3. Email */}
            <a
              href={`mailto:${emailAddress}?subject=${encodeURIComponent('استفسار عن خدمات ريفليكتو')}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-white transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xl">mail</span>
              </div>
              <div className="flex-1 text-right">
                <div className="text-xs font-bold text-blue-400">{isAr ? 'البريد الإلكتروني' : 'Email Us'}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{emailAddress}</div>
              </div>
              <span className="material-symbols-outlined text-blue-400 text-sm opacity-60 group-hover:opacity-100 group-hover:translate-x-[-2px] transition-all">arrow_back_ios</span>
            </a>

            {/* 4. Contact Request Form Link */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/contact');
              }}
              className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white transition-all group cursor-pointer text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 text-gray-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xl">edit_note</span>
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-200">{isAr ? 'إرسال طلب تواصل وخطة حماية' : 'Submit Request Form'}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{isAr ? 'تعبئة النموذج لحساب تكلفة سيارتك' : 'Fill form for custom quotation'}</div>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-sm opacity-60 group-hover:opacity-100 group-hover:translate-x-[-2px] transition-all">arrow_back_ios</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        className="relative group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#FF5C35] via-[#ff7c59] to-[#ff9e85] text-white shadow-[0_0_30px_rgba(255,92,53,0.5)] hover:shadow-[0_0_40px_rgba(255,92,53,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        title={isAr ? 'تواصل معنا' : 'Contact Us'}
        aria-label="Contact options"
      >
        {/* Pulse effect */}
        <span className="absolute inset-0 rounded-full bg-[#FF5C35] animate-ping opacity-20 pointer-events-none"></span>

        {/* Icon toggle */}
        <span className="material-symbols-outlined text-xl sm:text-2xl relative z-10 transition-transform duration-300">
          {isOpen ? 'close' : 'support_agent'}
        </span>

        {/* Status Dot */}
        <span className="absolute top-1 right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-[#121216] rounded-full z-20"></span>
      </button>
    </div>
  );
};

export default FloatingContactWidget;
