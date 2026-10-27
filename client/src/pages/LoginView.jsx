import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { cleanPhoneNumber, buildFullPhone } from '../utils/phone';
import InvertoLogo from '../components/InvertoLogo';

const LoginView = React.memo(() => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { user, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'super_admin' || Boolean(user.is_super_admin) || Boolean(user.role_id)) {
        navigate('/admin', { replace: true });
      } else if (user.role === 'technician') {
        navigate('/technician', { replace: true });
      } else {
        navigate('/clientDashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Load remembered credential
  useEffect(() => {
    try {
      const saved = localStorage.getItem('reflecto_remember_client');
      if (saved) {
        setIdentifier(saved);
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const trimmedInput = identifier.trim();
    const trimmedPass = password.trim();

    if (!trimmedInput) {
      toast.warning('يرجى إدخال البريد الإلكتروني أو رقم الجوال');
      return;
    }
    if (!trimmedPass) {
      toast.warning('يرجى إدخال كلمة المرور');
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem('reflecto_remember_client', trimmedInput);
      } else {
        localStorage.removeItem('reflecto_remember_client');
      }
    } catch {
      // ignore
    }

    let credential = trimmedInput;
    const cleanDigits = cleanPhoneNumber(trimmedInput);
    if (!trimmedInput.includes('@') && /^(05|5|\+966)/.test(trimmedInput.replace(/[\s-]/g, '')) && cleanDigits.length >= 9) {
      credential = buildFullPhone(cleanDigits) || trimmedInput;
    }

    setIsLoading(true);
    try {
      const res = await authService.loginWithPassword(credential, trimmedPass, 'client');

      login({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
        user: res.user,
      });

      const name = res.user?.full_name || 'العميل';
      toast.success(`مرحباً بك مجدداً، ${name}!`);

      const isStaff = res.user && (res.user.role === 'admin' || res.user.role === 'super_admin' || Boolean(res.user.is_super_admin) || Boolean(res.user.role_id) || (res.user.role && res.user.role !== 'client' && res.user.role !== 'technician'));
      if (isStaff) {
        navigate('/admin', { replace: true });
      } else if (res.user?.role === 'technician') {
        navigate('/technician', { replace: true });
      } else {
        navigate('/clientDashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'بيانات الدخول غير صحيحة. يرجى التأكد من البيانات والمحاولة مجدداً');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen w-full relative overflow-x-hidden overflow-y-auto bg-[#07080a] text-white flex items-center select-none"
      dir="ltr"
    >
      {/* Background: Workshop Showcase Car with Reflecto wall logo (/assets/photo/login-client.jpg) */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/assets/photo/login-client.jpg')",
          backgroundPosition: 'left center',
        }}
      >
        {/* Subtle dark gradient overlay: leaves car crisp on the left, darkens right side for the card */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/45 to-black/90 lg:from-black/15 lg:via-black/35 lg:to-[#07080a]/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080a] via-transparent to-black/40" />
      </div>

      {/* Screen Bottom-Left Tagline */}
      <div className="fixed bottom-6 left-8 z-10 hidden md:block pointer-events-none" dir="rtl">
        <p className="text-gray-400/80 text-xs sm:text-sm font-medium tracking-wide">
          حماية تعكس جودة التفاصيل
        </p>
      </div>

      {/* Screen Bottom-Right Corner Glowing Accent Stripe */}
      <div className="fixed bottom-0 right-0 z-10 pointer-events-none overflow-hidden w-[240px] sm:w-[360px] md:w-[440px] h-[180px] sm:h-[260px]">
        <svg
          className="w-full h-full"
          viewBox="0 0 440 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="clientMainCornerOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6A3D" />
              <stop offset="100%" stopColor="#FF4500" />
            </linearGradient>
            <linearGradient id="clientMainCornerDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2e36" />
              <stop offset="100%" stopColor="#14161a" />
            </linearGradient>
          </defs>

          {/* Thin dark accent band */}
          <polygon points="260,260 310,260 440,140 440,90" fill="url(#clientMainCornerDark)" opacity="0.6" />
          {/* Main glowing orange corner wedge */}
          <polygon points="310,260 440,260 440,140" fill="url(#clientMainCornerOrange)" />
        </svg>
      </div>

      {/* Main Container: Explicitly aligned towards the physical RIGHT on desktop */}
      <div className="relative z-20 w-full min-h-screen py-6 px-4 sm:px-6 md:px-12 lg:pr-20 lg:pl-10 flex items-center justify-center lg:justify-end">
        {/* Floating Dark Card (المربع الأسود على اليمين) */}
        <div
          dir="rtl"
          className="w-full max-w-[430px] sm:max-w-[450px] bg-[#0c0d10]/95 backdrop-blur-2xl border border-white/10 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.85)] relative overflow-hidden transition-all duration-300"
          style={{
            boxShadow: '0 25px 70px -10px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          {/* Card Top Header: Reflecto on Left, Inverto on Right (dir="ltr") */}
          <div className="flex items-center justify-center gap-5 sm:gap-6 pb-5 pt-1" dir="ltr">
            {/* Reflecto Logo */}
            <div className="flex items-center">
              <img
                src="/assets/photo/main-logo.png"
                alt="REFLECTO PAINT PROTECTION FILM"
                className="h-8 sm:h-9 w-auto object-contain max-w-[150px]"
                onError={(e) => {
                  if (!e.target.src.includes('logo-dark.png')) {
                    e.target.src = '/assets/photo/logo-dark.png';
                  }
                }}
              />
            </div>

            {/* Vertical Divider */}
            <div className="h-6 w-[1px] bg-white/20" />

            {/* Inverto Logo (Direct Image) */}
            <div className="flex items-center">
              <InvertoLogo className="h-6 sm:h-7 w-auto" />
            </div>
          </div>

          {/* Welcome Heading & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-[34px] font-black text-white tracking-tight mb-2 font-sans">
              مرحباً بك
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-normal">
              سجل دخولك إلى حسابك في ريفليكتو
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Phone Field */}
            <div className="relative flex items-center bg-[#131519] border border-[#23272e] rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-[#FF5722] focus-within:ring-1 focus-within:ring-[#FF5722]/50 shadow-inner">
              <input
                type="text"
                dir="rtl"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="البريد الإلكتروني أو رقم الجوال"
                className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-gray-500 font-medium text-right"
                disabled={isLoading}
                autoComplete="username"
              />
              {/* Mail Icon (Right side in RTL) */}
              <div className="text-gray-400 shrink-0 mr-3 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Password Field */}
            <div className="relative flex items-center bg-[#131519] border border-[#23272e] rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-[#FF5722] focus-within:ring-1 focus-within:ring-[#FF5722]/50 shadow-inner">
              {/* Toggle Password Visibility (Left side in RTL) */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white transition-colors ml-2 shrink-0 cursor-pointer p-0.5 focus:outline-none"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'عرض كلمة المرور'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>

              <input
                type={showPassword ? 'text' : 'password'}
                dir="rtl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-gray-500 font-medium text-right"
                disabled={isLoading}
                autoComplete="current-password"
              />

              {/* Lock Icon (Right side in RTL) */}
              <div className="text-gray-400 shrink-0 mr-3 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* Remember Me Checkbox (Right aligned in RTL) */}
            <div className="flex items-center justify-start pt-1">
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-150 ${
                    rememberMe ? 'bg-[#FF5722] border-[#FF5722]' : 'bg-[#1a1d24] border-[#343a46]'
                  }`}>
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2.5 6 5 8.5 9.5 3.5" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-gray-300 group-hover:text-white transition-colors">
                  تذكرني
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 bg-gradient-to-r from-[#FF5C35] via-[#FF5024] to-[#FF4500] hover:brightness-110 active:scale-[0.99] text-white font-bold py-3.5 sm:py-4 px-6 rounded-xl transition-all duration-200 shadow-[0_8px_25px_-5px_rgba(255,87,34,0.45)] disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Links: Forgot Password + Create Account */}
          <div className="pt-4 text-center space-y-2">
            <div>
              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm text-[#FF7A45] hover:text-[#FFA07A] transition-colors font-medium"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            <div className="pt-2 border-t border-white/5">
              <span className="text-xs sm:text-sm text-gray-400">ليس لديك حساب؟ </span>
              <Link
                to="/register"
                className="text-xs sm:text-sm text-[#FF7A45] hover:text-white font-bold transition-colors underline mr-1"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </div>

          {/* Card Bottom Area: Powered by INVERTO + Corner Diagonal Stripes */}
          <div className="pt-6 sm:pt-8 flex items-center justify-between relative">
            {/* Powered by INVERTO (dir="ltr") */}
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium z-10" dir="ltr">
              <span>Powered by</span>
              <InvertoLogo className="h-3.5 sm:h-4 w-auto" />
            </div>

            {/* Card Bottom-Right Diagonal Stripes Graphic */}
            <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 w-[130px] sm:w-[150px] h-[95px] sm:h-[110px] pointer-events-none overflow-hidden rounded-br-[28px] sm:rounded-br-[32px]">
              <svg
                className="w-full h-full select-none"
                viewBox="0 0 150 110"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="clientCardOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6A3D" />
                    <stop offset="100%" stopColor="#FF4500" />
                  </linearGradient>
                  <linearGradient id="clientCardDark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2c3038" />
                    <stop offset="100%" stopColor="#15171b" />
                  </linearGradient>
                  <linearGradient id="clientCardSubtle" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#663121" />
                    <stop offset="100%" stopColor="#221510" />
                  </linearGradient>
                </defs>

                {/* Outer subtle stripe */}
                <polygon points="75,110 88,110 150,50 150,38" fill="url(#clientCardSubtle)" opacity="0.75" />
                {/* Dark metallic stripe */}
                <polygon points="90,110 108,110 150,70 150,52" fill="url(#clientCardDark)" />
                {/* Sharp black spacer */}
                <polygon points="108,110 112,110 150,74 150,70" fill="#0c0d10" />
                {/* Orange stripe */}
                <polygon points="112,110 128,110 150,90 150,74" fill="url(#clientCardOrange)" />
                {/* Solid corner orange */}
                <polygon points="130,110 150,110 150,92" fill="url(#clientCardOrange)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
});

export default LoginView;