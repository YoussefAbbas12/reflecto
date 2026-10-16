import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Icon from '../components/Icon';

const SetPasswordView = React.memo(() => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setPhone: clearPhone } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['auth', 'common']);
  const isRTL = i18n.language === 'ar';

  const signupToken = sessionStorage.getItem('reflecto_signup_token');

  useEffect(() => {
    if (!signupToken) {
      toast.error('Signup session expired. Please start over.');
      navigate('/register', { replace: true });
    }
  }, [signupToken, navigate, toast]);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    if (password.length < 6) {
      toast.warning(t('auth:enter_password_warning', 'Password must be at least 6 characters long'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Retrieve stored name/email from registration step
      const full_name = sessionStorage.getItem('reflecto_signup_name') || '';
      const email = sessionStorage.getItem('reflecto_signup_email') || '';

      await authService.completeSignup(signupToken, password, full_name, email);

      // Clear ALL temp storage
      sessionStorage.removeItem('reflecto_signup_token');
      sessionStorage.removeItem('reflecto_signup_name');
      sessionStorage.removeItem('reflecto_signup_email');
      clearPhone(null);

      // Redirect to login with success message and reload
      toast.success(isRTL ? 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.' : 'Account created successfully! Please log in.', 6000);
      navigate('/login', { replace: true });
      window.location.reload();
    } catch (err) {
      toast.error(err.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [password, confirmPassword, signupToken, clearPhone, toast, navigate, t, isRTL]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 bg-[#000000]" aria-labelledby="password-heading" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-xl text-center">
        <div className="w-16 h-16 bg-[#FF5C35]/10 shadow-[0_8px_30px_rgba(255,92,53,0.15)] rounded-2xl flex items-center justify-center text-2xl text-[#FF5C35] mx-auto mb-10">
          <Icon name="shield" aria-hidden="true" />
        </div>

        <h1 id="password-heading" className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tighter text-white">
          {t('auth:set_password_title')}
        </h1>
        <p className="text-gray-400 mb-12 font-light">{t('auth:set_password_subtitle')}</p>

        <form 
          onSubmit={handleSubmit}
          className="bg-white/[0.02] p-10 rounded-3xl shadow-2xl backdrop-blur-2xl relative overflow-hidden group"
          aria-labelledby="password-form-label"
        >
          <h2 id="password-form-label" className="sr-only">Set Password Form</h2>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF5C35] blur-[120px] opacity-20 transition-opacity group-hover:opacity-30 pointer-events-none" aria-hidden="true"></div>

          <div className="text-start mb-6">
            <label htmlFor="password-input" className="block text-sm font-bold text-gray-200 mb-3">{t('auth:password_label')}</label>
            <div className="relative">
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.05] shadow-inner rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 focus:bg-white/[0.1] transition-all"
                placeholder="••••••••"
                disabled={isLoading}
                required
                aria-required="true"
              />
            </div>
          </div>

          <div className="text-start mb-8">
            <label htmlFor="confirm-password-input" className="block text-sm font-bold text-gray-200 mb-3">{t('auth:confirm_password_label')}</label>
            <div className="relative">
              <input
                id="confirm-password-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/[0.05] shadow-inner rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 focus:bg-white/[0.1] transition-all"
                placeholder="••••••••"
                disabled={isLoading}
                required
                aria-required="true"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-[#FF5C35] text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(255,92,53,0.3)] hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" role="status">
                  <span className="sr-only">{t('auth:saving')}</span>
                </div>
                {t('auth:saving')}
              </>
            ) : (
              <>
                {t('auth:create_account_button')}
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isRTL ? 'rotate-180' : ''}>
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
});

export default SetPasswordView;
