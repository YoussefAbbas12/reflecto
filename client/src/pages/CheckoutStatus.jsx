import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { checkoutService } from '../services/api';

const CheckoutStatus = React.memo(({ status }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation(['checkout_status']);
  const isRTL = i18n.language === 'ar';

  // If status is not passed directly, try to infer from pathname
  const currentStatus = status || (location.pathname.includes('success') ? 'success' : 'cancel');
  
  const isSuccess = currentStatus === 'success';

  useEffect(() => {
    const rawPending = sessionStorage.getItem('pending_payment');
    if (rawPending) {
      sessionStorage.removeItem('pending_payment');
      if (isSuccess) {
        try {
          const pending = JSON.parse(rawPending);
          checkoutService.confirmPayment(pending).catch(err => console.error('Confirm error:', err));
        } catch (e) {}
      }
    }
  }, [isSuccess]);

  return (
    <main
      className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center font-body selection:bg-[#FF5C35]/30 relative overflow-hidden px-4"
      aria-labelledby="status-heading"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      
      {/* Background accents */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full blur-[150px] opacity-10 pointer-events-none ${
        isSuccess ? 'bg-[#3EED9A]' : 'bg-[#FF5C35]'
      }`} aria-hidden="true"></div>

      <section className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-10 md:p-16 shadow-2xl relative z-10 max-w-lg w-full text-center border-0">
        
        {/* Icon */}
        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${
          isSuccess 
            ? 'bg-[#3EED9A]/10 text-[#3EED9A] shadow-[#3EED9A]/10' 
            : 'bg-red-500/10 text-red-500 shadow-red-500/10'
        }`} aria-hidden="true">
          <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isSuccess ? 'check_circle' : 'cancel'}
          </span>
        </div>

        {/* Text content */}
        <h1 id="status-heading" className="text-3xl font-black font-headline mb-4 tracking-tight">
          {isSuccess ? t('success_title') : t('cancel_title')}
        </h1>
        
        <p className="text-gray-400 mb-10 text-lg leading-relaxed font-medium">
          {isSuccess ? t('success_message') : t('cancel_message')}
        </p>

        {/* Actions */}
        <nav className="flex flex-col gap-4" aria-label="Status Actions">
          <button 
            type="button"
            onClick={() => { window.location.href = '/clientDashboard'; }}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-[0_8px_30px_rgba(0,0,0,0.2)] active:scale-95 flex items-center justify-center gap-3 ${
              isSuccess 
                ? 'bg-[#3EED9A] text-black shadow-[#3EED9A]/20 hover:brightness-105' 
                : 'bg-[#FF5C35] text-white shadow-[#FF5C35]/20 hover:brightness-110'
            }`}
            aria-label={t('go_to_dashboard')}
          >
            {t('go_to_dashboard')}
          </button>
          
          {!isSuccess && (
            <button 
              type="button"
              onClick={() => navigate('/pricing')}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-white/[0.05] hover:bg-white/[0.1] shadow-inner text-white"
              aria-label={t('return_to_pricing')}
            >
              {t('return_to_pricing')}
            </button>
          )}
        </nav>

      </section>
    </main>
  );
});

export default CheckoutStatus;
