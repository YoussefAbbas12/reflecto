import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Icon from '../components/Icon';
import { buildFullPhone, cleanPhoneNumber } from '../utils/phone';

const RegisterView = React.memo(() => {
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setPhone: savePhone } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['auth', 'common']);
  const isRTL = i18n.language === 'ar';

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    const rawDigits = cleanPhoneNumber(phone.trim());
    const fullPhone = buildFullPhone(rawDigits);

    if (!fullName.trim()) {
      toast.warning('Please enter your full name');
      return;
    }

    if (!rawDigits) {
      toast.warning('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.sendSignupOTP(fullPhone, email.trim());

      // Save phone and extra data to context for OTP page
      savePhone(fullPhone);
      // Store name/email in sessionStorage for SetPassword step
      sessionStorage.setItem('reflecto_signup_name', fullName.trim());
      if (email.trim()) {
        sessionStorage.setItem('reflecto_signup_email', email.trim());
      }

      toast.success(res.message || 'OTP sent successfully');

      navigate('/register/otp');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [phone, fullName, email, savePhone, toast, navigate]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 bg-[#000000]" aria-labelledby="register-heading" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-xl text-center">
        <div className="w-16 h-16 bg-[#FF5C35]/10 shadow-[0_8px_30px_rgba(255,92,53,0.15)] rounded-2xl flex items-center justify-center text-2xl text-[#FF5C35] mx-auto mb-10">
          <Icon name="shield" aria-hidden="true" />
        </div>

        <h1 id="register-heading" className="text-2xl md:text-4xl font-display font-bold mb-4 tracking-tighter text-white">
          {t('auth:register_title')}
        </h1>
        <p className="text-gray-400 mb-12 font-light">{t('auth:register_subtitle')}</p>

        <form 
          onSubmit={handleSubmit}
          className="bg-white/[0.02] p-10 rounded-3xl shadow-2xl backdrop-blur-2xl relative overflow-hidden group"
          aria-labelledby="register-form-label"
        >
          <h2 id="register-form-label" className="sr-only">Registration Form</h2>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF5C35] blur-[120px] opacity-20 transition-opacity group-hover:opacity-30 pointer-events-none" aria-hidden="true"></div>

          {/* Full Name field */}
          <div className="text-start mb-6">
            <label htmlFor="fullname-input" className="block text-sm font-bold text-gray-200 mb-3">{t('auth:fullname_label')}</label>
            <input
              id="fullname-input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white/[0.05] shadow-inner rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 focus:bg-white/[0.1] transition-all"
              placeholder="Ahmed Mohammed"
              disabled={isLoading}
              required
              aria-required="true"
            />
          </div>

          {/* Phone field with fixed +966 prefix */}
          <div className="text-start mb-6">
            <label htmlFor="phone-input" className="block text-sm font-bold text-gray-200 mb-3">{t('auth:phone_label')}</label>
            <div className="flex items-center rounded-xl overflow-hidden shadow-inner bg-white/[0.05] focus-within:ring-2 focus-within:ring-[#FF5C35]/50 transition-all" dir="ltr">
              <span className="bg-white/[0.08] px-4 py-4 text-white text-sm font-bold select-none whitespace-nowrap border-r border-white/10">
                🇸🇦 +966
              </span>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.startsWith('0')) val = val.replace(/^0+/, '');
                  setPhone(val);
                }}
                className="flex-1 bg-transparent px-4 py-4 text-white focus:outline-none text-left"
                placeholder="501234567"
                disabled={isLoading}
                required
                aria-required="true"
              />
            </div>
          </div>

          {/* Email field (optional) */}
          <div className="text-start mb-8">
            <label htmlFor="email-input" className="block text-sm font-bold text-gray-200 mb-3">{t('auth:email_label')} <span className="text-gray-500 font-normal">{t('auth:optional')}</span></label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.05] shadow-inner rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 focus:bg-white/[0.1] transition-all"
              placeholder="ahmed@example.com"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-[#FF5C35] text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(255,92,53,0.3)] hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" role="status">
                  <span className="sr-only">{t('auth:sending')}</span>
                </div>
                {t('auth:sending')}
              </>
            ) : (
              <>
                {t('auth:send_otp')}
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isRTL ? 'rotate-180' : ''}>
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </>
            )}
          </button>

          <div className="mt-8 text-center">
            <span className="text-gray-400 text-sm">{t('auth:already_have_account')}&nbsp;</span>
            <Link
              to="/login"
              className="text-[#FF5C35] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 rounded px-2 py-1 text-sm"
            >
              {t('auth:login_button')}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
});

export default RegisterView;
