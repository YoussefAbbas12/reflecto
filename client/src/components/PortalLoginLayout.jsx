import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { cleanPhoneNumber, buildFullPhone } from '../utils/phone';

/**
 * PortalLoginLayout - Matches the exact SEEDA full-screen split login design
 * Left 50% = Dark luxury automotive visual with purple branding
 * Right 50% = Pure white container with centered modern form
 */
const PortalLoginLayout = ({
  portalType = 'admin',
  subtitle = 'Sign in to your SEEDA account to manage your business operations.',
  redirectPath = '/admin',
  storageKey = 'reflecto_remember_admin',
  forgotPasswordMessage = 'Please contact your system administrator or IT support team to assist in retrieving or resetting your portal credentials.',
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { user, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If user is already authenticated with required role, redirect immediately
  useEffect(() => {
    if (user) {
      if (portalType === 'technician' && (user.role === 'technician' || user.role === 'admin' || user.role === 'super_admin')) {
        navigate(redirectPath, { replace: true });
      } else if (portalType === 'admin' && (user.role === 'admin' || user.role === 'super_admin' || Boolean(user.is_super_admin))) {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, portalType, redirectPath, navigate]);

  // Load remembered credential & Auto-Login Handover from SEEDA
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setIdentifier(saved);
        setRememberMe(true);
      }
    } catch {}

    // Check for handover tokens or credentials in URL
    if (typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

        let token = searchParams.get('access_token') || hashParams.get('access_token');
        let refresh = searchParams.get('refresh_token') || hashParams.get('refresh_token');
        let rawUser = searchParams.get('user') || hashParams.get('user');

        const rawAuthData = searchParams.get('auth_data') || hashParams.get('auth_data');
        if (rawAuthData) {
          try {
            const parsed = JSON.parse(decodeURIComponent(rawAuthData));
            if (parsed.access_token) token = parsed.access_token;
            if (parsed.refresh_token) refresh = parsed.refresh_token;
            if (parsed.user) rawUser = JSON.stringify(parsed.user);
          } catch {}
        }

        if (token) {
          let parsedUser = null;
          if (rawUser) {
            try {
              parsedUser = typeof rawUser === 'string' ? JSON.parse(decodeURIComponent(rawUser)) : rawUser;
            } catch {
              parsedUser = rawUser;
            }
          }

          setIsLoading(true);
          authService.getMe()
            .then(meData => {
              login({
                access_token: token,
                refresh_token: refresh,
                user: meData || parsedUser || { role: portalType }
              });
              navigate(redirectPath, { replace: true });
            })
            .catch(() => {
              setIsLoading(false);
            });
        }
      } catch (e) {
        console.error('Handover error:', e);
      }
    }
  }, [storageKey, portalType, redirectPath, login, navigate]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const trimmedInput = identifier.trim();
    const trimmedPass = password.trim();

    if (!trimmedInput) {
      toast.warning('Please enter your email or phone number');
      return;
    }
    if (!trimmedPass) {
      toast.warning('Please enter your password');
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem(storageKey, trimmedInput);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {}

    let credential = trimmedInput;
    const cleanDigits = cleanPhoneNumber(trimmedInput);
    if (!trimmedInput.includes('@') && /^(05|5|\+966)/.test(trimmedInput.replace(/[\s-]/g, '')) && cleanDigits.length >= 9) {
      credential = buildFullPhone(cleanDigits) || trimmedInput;
    }

    setIsLoading(true);
    try {
      const res = await authService.loginWithPassword(credential, trimmedPass, portalType);

      login({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
        user: res.user,
      });

      const name = res.user?.full_name || (portalType === 'admin' ? 'Administrator' : 'Technician');
      toast.success(`Welcome back, ${name}!`);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSsoClick = () => {
    toast.info('SSO is enabled for enterprise accounts. Please sign in with your credentials above or contact support.');
  };

  return (
    <main className="fixed inset-0 w-screen h-screen flex bg-white overflow-hidden select-none z-[9999] font-sans" dir="ltr">
      {/* Left 50% Full-Bleed Vehicle Image & Branding */}
      <div className="hidden lg:block w-1/2 h-full relative overflow-hidden bg-[#05050A] flex-shrink-0">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/assets/photo/login-left-panel.jpg'), url('/assets/photo/loginBG.jpg')"
          }}
        />
      </div>

      {/* Right 50% Pure White Form Pane */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center bg-white p-6 sm:p-10 md:p-14 overflow-y-auto">
        <div className="w-full max-w-[410px]">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-[13.5px] leading-relaxed text-gray-500">
              {subtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
            {/* Email / Identifier */}
            <div className="relative flex items-center w-full h-12 border-[1.5px] border-gray-200 rounded-xl bg-white px-3.5 gap-2.5 transition focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100">
              <span className="text-gray-400 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
              </span>
              <input
                id="portalLoginIdentifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email address"
                className="flex-1 h-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 font-sans"
                autoComplete="username"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password */}
            <div className="relative flex items-center w-full h-12 border-[1.5px] border-gray-200 rounded-xl bg-white px-3.5 gap-2.5 transition focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100">
              <span className="text-gray-400 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="5" y="11" width="14" height="10" rx="2.5" />
                  <circle cx="12" cy="16" r="1.2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              </span>
              <input
                id="portalLoginPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="flex-1 h-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 font-sans"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-[13px] pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 accent-indigo-600 cursor-pointer"
                />
                <span className="text-gray-600">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-indigo-600 hover:text-indigo-800 font-medium transition cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#5842ED] via-[#6851F7] to-[#7C3AED] hover:from-[#4E38DF] hover:to-[#6D28D9] text-white text-[14.5px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(104,81,247,0.35)] transition cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In &nbsp;&rarr;</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5 text-gray-400 text-xs">
            <div className="flex-1 border-b border-gray-100" />
            <span className="px-3.5 text-gray-400">or</span>
            <div className="flex-1 border-b border-gray-100" />
          </div>

          {/* SSO Button */}
          <button
            type="button"
            onClick={handleSsoClick}
            className="w-full h-12 border-[1.5px] border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-[13.5px] font-medium flex items-center justify-center gap-2.5 transition cursor-pointer"
          >
            <span className="text-indigo-600 flex items-center justify-center">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="4" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <span>Continue with SSO</span>
          </button>

          {/* Footer Prompt */}
          <p className="text-center text-[13px] text-gray-500 mt-8 mb-0">
            Don't have an account?{' '}
            <a href="https://seeda.reflecto.com.sa/#contact" className="text-indigo-600 hover:text-indigo-800 font-semibold transition ml-1">
              Contact us
            </a>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
            dir="ltr"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Password Recovery</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              {forgotPasswordMessage}
            </p>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default PortalLoginLayout;
