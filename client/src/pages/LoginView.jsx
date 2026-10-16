import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Icon from '../components/Icon';
import { buildFullPhone, cleanPhoneNumber } from '../utils/phone';

const LoginView = React.memo(() => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['auth', 'common']);
  const isRTL = i18n.language === 'ar';

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    const rawDigits = cleanPhoneNumber(phone.trim());
    const fullPhone = buildFullPhone(rawDigits);
    const trimmedPassword = password.trim();

    if (!rawDigits) {
      toast.warning(t('auth:enter_phone_warning', 'Please enter your phone number'));
      return;
    }
    if (!trimmedPassword) {
      toast.warning(t('auth:enter_password_warning', 'Please enter your password'));
      return;
    }

    setIsLoading(true);
    try {
      // Pass portal_type: 'client' so backend prevents admins or technicians from logging in here
      const res = await authService.loginWithPassword(fullPhone, trimmedPassword, 'client');

      login({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
        user: res.user,
      });

      toast.success(`${t('common:welcome', 'Welcome back')}, ${res.user?.full_name || 'User'}!`);

      const isStaff = res.user && (res.user.role === 'admin' || res.user.role === 'super_admin' || Boolean(res.user.is_super_admin) || Boolean(res.user.role_id) || (res.user.role && res.user.role !== 'client' && res.user.role !== 'technician'));
      if (isStaff) {
        navigate('/admin', { replace: true });
      } else if (res.user?.role === 'technician') {
        navigate('/technician', { replace: true });
      } else {
        navigate('/clientDashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || t('auth:invalid_credentials', 'Invalid credentials. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [phone, password, login, toast, navigate, t]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 bg-[#000000]" aria-labelledby="login-heading" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-xl text-center">
        <div className="w-16 h-16 bg-[#FF5C35]/10 shadow-[0_8px_30px_rgba(255,92,53,0.15)] rounded-2xl flex items-center justify-center text-2xl text-[#FF5C35] mx-auto mb-10">
          <Icon name="shield" aria-hidden="true" />
        </div>

        <h1 id="login-heading" className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tighter text-white">
          {t('auth:login_title')}
        </h1>
        <p className="text-gray-400 mb-12 font-light">{t('auth:login_subtitle')}</p>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.02] p-10 rounded-3xl shadow-2xl backdrop-blur-2xl relative overflow-hidden group"
          aria-labelledby="login-form-label"
        >
          <h2 id="login-form-label" className="sr-only">Login Form</h2>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF5C35] blur-[120px] opacity-20 transition-opacity group-hover:opacity-30 pointer-events-none" aria-hidden="true"></div>

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

          <div className="text-start mb-8">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-[#FF5C35] text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(255,92,53,0.3)] hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" role="status">
                  <span className="sr-only">{t('auth:logging_in')}</span>
                </div>
                {t('auth:logging_in')}
              </>
            ) : (
              <>
                {t('auth:login_button')}
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isRTL ? 'rotate-180' : ''}>
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <span className="text-gray-400 text-sm">{t('auth:no_account')}&nbsp;</span>
            <Link
              to="/register"
              className="text-[#FF5C35] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 rounded px-2 py-1 text-sm"
            >
              {t('auth:sign_up')}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
});

export default LoginView;