import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../hooks/useLanguage';
import { contactService, authService } from '../services/api';
import { cleanPhoneNumber, buildFullPhone } from '../utils/phone';

// SVG Icons
const GlobeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4 rtl:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-[#5C24EB] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EyeIcon = ({ visible }) => visible ? (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function SeedaPortal({ initialLoginOpen = false }) {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const { language, toggleLanguage } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(initialLoginOpen);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Login Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Contact / Demo Form State
  const [contactData, setContactData] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    industry: '',
    branches: '1',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Sync login modal with hash `#login`
  useEffect(() => {
    if (location.hash === '#login') {
      setIsLoginModalOpen(true);
    }
  }, [location.hash]);

  // Restore rememberMe identifier
  useEffect(() => {
    try {
      const saved = localStorage.getItem('seeda_remember_tech');
      if (saved) {
        setIdentifier(saved);
        setRememberMe(true);
      }
    } catch {}
  }, []);

  const openLoginModal = () => {
    setIsMobileMenuOpen(false);
    setIsLoginModalOpen(true);
    window.location.hash = 'login';
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginError('');
    if (window.location.hash === '#login') {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  // Scroll to section helper
  const scrollTo = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    const trimmedInput = identifier.trim();
    const trimmedPass = password.trim();

    if (!trimmedInput || !trimmedPass) {
      setLoginError(isArabic ? 'يرجى إدخال رقم الهاتف أو الرقم الوظيفي وكلمة المرور' : 'Please enter identifier and password');
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem('seeda_remember_tech', trimmedInput);
      } else {
        localStorage.removeItem('seeda_remember_tech');
      }
    } catch {}

    let credential = trimmedInput;
    const cleanDigits = cleanPhoneNumber(trimmedInput);
    if (!trimmedInput.includes('@') && /^(05|5|\+966)/.test(trimmedInput.replace(/[\s-]/g, '')) && cleanDigits.length >= 9) {
      credential = buildFullPhone(cleanDigits) || trimmedInput;
    }

    setIsLoggingIn(true);
    try {
      // Use portal login with fallback to general login
      const res = await authService.loginWithPassword(credential, trimmedPass, 'technician');
      login({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
        user: res.user,
      });

      const role = res.user?.role;
      const isStaff = role === 'admin' || role === 'super_admin' || Boolean(res.user?.is_super_admin) || Boolean(res.user?.role_id);

      if (isStaff) {
        toast.success(isArabic ? 'مرحباً بك! جارٍ تحويلك إلى لوحة الإدارة...' : 'Welcome back! Redirecting to Admin...');
        window.location.href = `https://admin.reflecto.com.sa/#auth_data=${encodeURIComponent(JSON.stringify({
          access_token: res.access_token,
          refresh_token: res.refresh_token,
          user: res.user
        }))}`;
        return;
      }

      toast.success(isArabic ? `مرحباً بك مجدداً، ${res.user?.full_name || 'الفني'}!` : `Welcome back, ${res.user?.full_name || 'Technician'}!`);
      navigate('/technician', { replace: true });
    } catch (err) {
      setLoginError(err.message || (isArabic ? 'بيانات الدخول غير صحيحة أو ليس لديك صلاحية الدخول' : 'Invalid credentials or permission denied'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Contact / Demo form submission to backend
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactData.fullName.trim() || !contactData.phone.trim()) {
      toast.warning(isArabic ? 'يرجى إدخال الاسم بالكامل ورقم الهاتف' : 'Please enter full name and phone number');
      return;
    }

    setIsSubmittingContact(true);
    try {
      const payload = {
        full_name: contactData.fullName.trim(),
        phone: contactData.phone.trim(),
        email: contactData.email.trim() || null,
        service_type: 'SEEDA Demo Request',
        service_package: contactData.industry || 'General Inquiry',
        notes: `طلب عرض توضيحي (SEEDA)\nاسم المنشأة: ${contactData.company || 'غير محدد'}\nالقطاع: ${contactData.industry || 'غير محدد'}\nعدد الفروع: ${contactData.branches || '1'}\nملاحظات: ${contactData.message || 'لا يوجد'}`,
        reason: 'طلب تجربة واستشارة لنظام سيدا لإدارة مراكز العناية بالسيارات'
      };

      await contactService.submitForm(payload);
      setContactSuccess(true);
      toast.success(isArabic ? 'تم إرسال طلبك بنجاح! سيتواصل معك فريقنا قريباً.' : 'Demo request submitted successfully! We will contact you soon.');
      setContactData({
        fullName: '',
        phone: '',
        email: '',
        company: '',
        industry: '',
        branches: '1',
        message: ''
      });
    } catch (err) {
      toast.error(err.message || (isArabic ? 'تعذر إرسال الطلب، يرجى المحاولة لاحقاً.' : 'Failed to submit request. Please try again.'));
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // 4 Core Pillars
  const pillars = useMemo(() => [
    {
      title: isArabic ? 'تحكم تشغيلي كامل' : 'Operational Control',
      desc: isArabic ? 'أدر كافة عمليات مركزك بسلاسة من مكان واحد.' : 'Manage all shop operations smoothly from one central dashboard.',
      icon: 'tune'
    },
    {
      title: isArabic ? 'تجربة عملاء مترابطة' : 'Connected Customer Experience',
      desc: isArabic ? 'ابنِ علاقات أقوى تدوم طويلاً مع متابعة فورية.' : 'Build stronger, lasting relationships with instant updates.',
      icon: 'groups'
    },
    {
      title: isArabic ? 'سجلات وضمانات رقمية' : 'Digital Service Records & Warranty',
      desc: isArabic ? 'ثقة أكبر وقيمة حقيقية مستمرة مع فواتير وضمانات سحابية.' : 'Greater trust with paperless electronic warranties and history.',
      icon: 'verified_user'
    },
    {
      title: isArabic ? 'قرارات مدعومة بالبيانات' : 'Data-Driven Insights',
      desc: isArabic ? 'قرارات أذكى في وقت أسرع بفضل التقارير التحليلية.' : 'Smarter, faster decisions driven by real-time analytics.',
      icon: 'insights'
    }
  ], [isArabic]);

  // Solutions Modules
  const solutions = useMemo(() => [
    {
      id: 'erp',
      title: isArabic ? 'نظام إدارة مراكز العناية (ERP)' : 'Automotive Service ERP',
      desc: isArabic ? 'إدارة شاملة لجميع أقسام المركز تشمل العملاء، أوامر التشغيل، الفواتير، والتقارير المالية في بيئة سحابية واحدة.' : 'Complete management covering clients, work orders, invoices, and analytics in one unified cloud system.',
      icon: 'hub',
      tags: [isArabic ? 'سحابي متكامل' : 'Unified Cloud', isArabic ? 'دعم الفروع' : 'Multi-Branch']
    },
    {
      id: 'work-orders',
      title: isArabic ? 'أوامر العمل والتشغيل الفني' : 'Work Orders & Field Tasks',
      desc: isArabic ? 'تحويل كل سيارة إلى مسار عمل رقمي منظم، مع متابعة مراحل الإنجاز وتوزيع المهام على الفنيين بالدقيقة.' : 'Turn each incoming vehicle into an organized workflow with step-by-step progress checklists.',
      icon: 'engineering',
      tags: [isArabic ? 'تتبع لحظي' : 'Live Tracking', isArabic ? 'قوائم فحص' : 'Checklists']
    },
    {
      id: 'crm',
      title: isArabic ? 'إدارة العملاء والمركبات (CRM)' : 'CRM & Vehicle History',
      desc: isArabic ? 'ملف متكامل لكل عميل وسجل دقيق لكل مركبة دخلت المركز، مع تذكيرات المتابعة الدورية.' : 'Detailed profile for each customer and historical records of every vehicle serviced at the facility.',
      icon: 'badge',
      tags: [isArabic ? 'سجل المركبة' : 'Vehicle Log', isArabic ? 'متابعة آلية' : 'Follow-ups']
    },
    {
      id: 'warranty',
      title: isArabic ? 'الضمانات الإلكترونية (E-Warranty)' : 'Digital E-Warranties',
      desc: isArabic ? 'إصدار وتوثيق شهادات الضمان إلكترونياً برمز QR سريع يتيح للعميل استعراض التغطية وتفاصيل الحماية في أي وقت.' : 'Issue verified digital warranties with instant QR access for clients to review coverage anytime.',
      icon: 'workspace_premium',
      tags: [isArabic ? 'رمز QR' : 'QR Verification', isArabic ? 'توثيق رسمي' : 'Certified']
    },
    {
      id: 'scheduling',
      title: isArabic ? 'جدولة المواعيد والحجوزات' : 'Smart Appointment Scheduling',
      desc: isArabic ? 'تنظيم تدفق السيارات وتوزيع الطاقة الاستيعابية على الورشة لتقليل أوقات الانتظار وزيادة الإنتاجية.' : 'Balance capacity, avoid bottlenecks, and automate booking reminders for higher workshop throughput.',
      icon: 'calendar_month',
      tags: [isArabic ? 'تنسيق المواعيد' : 'Capacity Sync', isArabic ? 'تنبيهات فورية' : 'Auto Reminders']
    },
    {
      id: 'commissions',
      title: isArabic ? 'بوابة الفنيين والعمولات' : 'Technicians Hub & Commissions',
      desc: isArabic ? 'واجهة مخصصة للفني لمعاينة المهام الموكلة إليه، تحديث نسبة الإنجاز، واحتساب عمولاته ومكافآته بشفافية.' : 'Dedicated portal for technicians to track tasks, log milestones, and view transparent commission earnings.',
      icon: 'payments',
      tags: [isArabic ? 'حساب آلي' : 'Auto Calculate', isArabic ? 'بوابة مستقلة' : 'Dedicated Portal']
    }
  ], [isArabic]);

  // Industries
  const industries = useMemo(() => [
    {
      title: isArabic ? 'مراكز حماية الطلاء (PPF)' : 'PPF & Paint Protection Film',
      desc: isArabic ? 'تتبع الباقات، أمتار الفيلم، الضمانات السنوية، وسجل الفني المنفذ لكل جزء من السيارة بدقة.' : 'Track film rolls, warranty tiers, installation quality, and responsible technicians per panel.',
      icon: 'shield'
    },
    {
      title: isArabic ? 'العزل الحراري والتظليل' : 'Window Tinting & Heat Insulation',
      desc: isArabic ? 'جدولة مواعيد التركيب وتوثيق درجات العزل المعتمدة وشهادات الفحص الإلكتروني.' : 'Schedule installations, record heat reduction percentages, and issue digital certification.',
      icon: 'solar_power'
    },
    {
      title: isArabic ? 'النانو سيراميك والتلميع الساطع' : 'Nano Ceramic & Detailing',
      desc: isArabic ? 'إدارة خطوات المعالجة والتلميع متعددة المراحل مع مواعيد الصيانة الدورية كل 6 أشهر.' : 'Multi-stage paint correction pipelines with scheduled ceramic booster reminders every 6 months.',
      icon: 'auto_fix_high'
    },
    {
      title: isArabic ? 'المنشآت وسلاسل الفروع المتعددة' : 'Multi-Branch Service Chains',
      desc: isArabic ? 'لوحة تحكم إدارية موحدة لمقارنة أداء الفروع وربط المخزون وحساب العمولات مركزياً.' : 'Central management for multi-location businesses with branch benchmarks and cross-store data.',
      icon: 'storefront'
    }
  ], [isArabic]);

  return (
    <div className="min-h-screen bg-white text-[#171D34] font-body selection:bg-[#5C24EB] selection:text-white" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* 1. Header / Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        {/* Navbar container: Always LTR so Logo is on the Left and Tools/Burger on the Right */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between" style={{ direction: 'ltr' }}>
          
          {/* Logo on the left */}
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home'); }} className="flex items-center gap-2 group">
            <img
              src="/assets/photo/seeda-dark-text.png"
              alt="SEEDA"
              className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home'); }} className="hover:text-[#5C24EB] transition-colors">
              {isArabic ? 'الرئيسية' : 'Home'}
            </a>
            <a href="#solutions" onClick={(e) => { e.preventDefault(); scrollTo('solutions'); }} className="hover:text-[#5C24EB] transition-colors">
              {isArabic ? 'الحلول' : 'Solutions'}
            </a>
            <a href="#industries" onClick={(e) => { e.preventDefault(); scrollTo('industries'); }} className="hover:text-[#5C24EB] transition-colors">
              {isArabic ? 'القطاعات' : 'Industries'}
            </a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about'); }} className="hover:text-[#5C24EB] transition-colors">
              {isArabic ? 'عن سيدا' : 'About SEEDA'}
            </a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }} className="hover:text-[#5C24EB] transition-colors">
              {isArabic ? 'تواصل معنا' : 'Contact'}
            </a>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Language Switcher Pill - Always visible right next to burger on mobile! */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Switch Language"
              className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 rounded-full border border-slate-300 hover:border-[#5C24EB] bg-slate-50 hover:bg-purple-50/50 text-slate-800 hover:text-[#5C24EB] font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
            >
              <GlobeIcon />
              <span>{isArabic ? 'English' : 'العربية'}</span>
            </button>

            {/* Desktop Login Button */}
            <button
              type="button"
              onClick={openLoginModal}
              className="hidden sm:inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[#5C24EB] hover:bg-[#4A1BC2] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg shadow-[#5C24EB]/25 transition-all cursor-pointer"
            >
              <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl border border-slate-200 text-slate-700 hover:text-[#5C24EB] hover:border-[#5C24EB] transition-colors cursor-pointer"
            >
              <span className={`block w-5 h-0.5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`} />
              <span className={`block w-5 h-0.5 bg-current transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block w-5 h-0.5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-6 space-y-4 shadow-xl animate-fadeIn">
            <a
              href="#home"
              onClick={(e) => { e.preventDefault(); scrollTo('home'); }}
              className="block py-2 text-base font-bold text-slate-800 border-b border-slate-100"
            >
              {isArabic ? 'الرئيسية' : 'Home'}
            </a>
            <a
              href="#solutions"
              onClick={(e) => { e.preventDefault(); scrollTo('solutions'); }}
              className="block py-2 text-base font-bold text-slate-800 border-b border-slate-100"
            >
              {isArabic ? 'الحلول' : 'Solutions'}
            </a>
            <a
              href="#industries"
              onClick={(e) => { e.preventDefault(); scrollTo('industries'); }}
              className="block py-2 text-base font-bold text-slate-800 border-b border-slate-100"
            >
              {isArabic ? 'القطاعات' : 'Industries'}
            </a>
            <a
              href="#about"
              onClick={(e) => { e.preventDefault(); scrollTo('about'); }}
              className="block py-2 text-base font-bold text-slate-800 border-b border-slate-100"
            >
              {isArabic ? 'عن سيدا' : 'About SEEDA'}
            </a>
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}
              className="block py-2 text-base font-bold text-slate-800 border-b border-slate-100"
            >
              {isArabic ? 'تواصل معنا' : 'Contact'}
            </a>
            
            <div className="pt-2">
              <button
                type="button"
                onClick={openLoginModal}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#5C24EB] text-white font-bold text-sm shadow-md"
              >
                <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-purple-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Text Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#5C24EB]/10 text-[#5C24EB] font-bold text-xs uppercase tracking-wider">
                {isArabic ? 'حلول أعمال ذكية' : 'SMART BUSINESS SOLUTIONS'}
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                {isArabic ? (
                  <>عمليات أكثر ذكاءً.<br /><span className="text-[#5C24EB]">أعمال أكثر نجاحاً.</span></>
                ) : (
                  <>Smarter Operations.<br /><span className="text-[#5C24EB]">Better Business.</span></>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                {isArabic
                  ? 'تساعد سيدا مراكز العناية بالسيارات على تنظيم العمليات، وربط فرق العمل، وإدارة تجربة العملاء، واكتساب رؤية أوضح لأداء الأعمال بدقة وموثوقية.'
                  : 'SEEDA helps car-care businesses organize operations, connect teams, manage customer experiences, and gain clearer visibility into business performance.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => scrollTo('contact')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#5C24EB] hover:bg-[#4A1BC2] text-white font-bold text-base shadow-lg shadow-[#5C24EB]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <span>{isArabic ? 'طلب عرض توضيحي' : 'Request a Demo'}</span>
                  <ArrowRightIcon />
                </button>

                <button
                  type="button"
                  onClick={() => scrollTo('solutions')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-slate-300 hover:border-[#5C24EB] text-slate-700 hover:text-[#5C24EB] font-bold text-base bg-white hover:bg-purple-50/30 transition-all cursor-pointer"
                >
                  <span>{isArabic ? 'استكشف حلولنا' : 'Explore Our Solutions'}</span>
                </button>
              </div>
            </div>

            {/* Visual Shape Column */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md sm:max-w-lg aspect-[4/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                <img
                  src="/assets/hero-car.jpg"
                  alt="SEEDA Smart Operations"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/photo/seeda_hero_car.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-white text-xs sm:text-sm font-bold tracking-wide">
                      {isArabic ? 'نظام متكامل قيد التشغيل للفروع' : 'Integrated Workshop Workflow'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. 4 Pillars / Values */}
      <section className="py-12 border-y border-slate-200/80 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/70 hover:border-[#5C24EB]/50 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5C24EB] flex items-center justify-center mb-4 group-hover:bg-[#5C24EB] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">{pillar.icon}</span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1.5">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Solutions Modules */}
      <section id="solutions" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-purple-50 text-[#5C24EB] font-bold text-xs uppercase tracking-wider">
              {isArabic ? 'الحلول المتخصصة' : 'TAILORED SOLUTIONS'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isArabic ? 'مسارات تشغيلية متكاملة في منصة واحدة' : 'Complete Operational Modules in One Platform'}
            </h2>
            <p className="text-base text-slate-600">
              {isArabic
                ? 'صُممت وحدات سيدا لتلائم احتياجات الورش ومراكز العناية المتقدمة لضبط الجودة وزيادة كفاءة الفنيين.'
                : 'Built specifically for detailing studios and car-care shops to boost throughput and quality.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((sol) => (
              <div
                key={sol.id}
                className="rounded-3xl border border-slate-200 p-8 hover:border-[#5C24EB] hover:shadow-xl transition-all flex flex-col justify-between bg-white group"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#5C24EB] flex items-center justify-center group-hover:bg-[#5C24EB] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-3xl">{sol.icon}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#5C24EB] transition-colors">
                    {sol.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {sol.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap gap-2">
                  {sol.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Industries Section */}
      <section id="industries" className="py-20 bg-slate-50/60 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-purple-50 text-[#5C24EB] font-bold text-xs uppercase tracking-wider">
              {isArabic ? 'القطاعات المستهدفة' : 'TARGET INDUSTRIES'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isArabic ? 'لكافة تخصصات العناية المتقدمة بالسيارات' : 'Tailored For High-End Automotive Care'}
            </h2>
            <p className="text-base text-slate-600">
              {isArabic
                ? 'مرونة عالية تتكيف مع مراكز الفرع الواحد وسلاسل المعارض والورش المتوسعة.'
                : 'Seamlessly adaptable for single-boutique studios or expanding multi-branch networks.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((ind, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#5C24EB] shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5C24EB] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">{ind.icon}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {ind.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {ind.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. About SEEDA */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="px-3.5 py-1 rounded-full bg-purple-50 text-[#5C24EB] font-bold text-xs uppercase tracking-wider">
                {isArabic ? 'عن سيدا' : 'ABOUT SEEDA'}
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {isArabic
                  ? 'برمجيات متخصصة للعمل اليومي وراء كل خدمة احترافية.'
                  : 'Software Dedicated to the Daily Craft Behind Every Service.'}
              </h2>

              <p className="text-base text-slate-600 leading-relaxed">
                {isArabic
                  ? 'تعتمد مراكز العناية بالسيارات على المواعيد، والفنيين، والباقات، والضمانات، والمتابعات. وحينما تتشتت هذه العمليات بين أدوات منفصلة، يفقد المديرون الرؤية الواضحة ويتأثر العملاء بذلك.'
                  : 'Car-care centers run on appointments, technicians, packages, warranties and follow-ups. When these live in separate tools, managers lose visibility and customer loyalty drops.'}
              </p>

              <p className="text-base text-slate-600 leading-relaxed">
                {isArabic
                  ? 'تربط سيدا خدمة العملاء بالعمليات اليومية، لتعمل الفرق والفروع من مصدر بيانات واحد، ويتخذ المديرون القرارات برؤية أكثر شمولاً ودقة.'
                  : 'SEEDA unites customer service with workshop floors, ensuring all staff operate from single live source of truth with automated commission accuracy.'}
              </p>

              <div className="space-y-3 pt-2">
                {[
                  isArabic ? 'رؤية مركزية موحدة لكافة الفروع في شاشة واحدة' : 'Unified multi-branch visibility in a single view',
                  isArabic ? 'مسارات عمل رقمية تحمي من الأخطاء ونسيان تفاصيل أوامر العمل' : 'Standardized digital checklists preventing costly mistakes',
                  isArabic ? 'ضمانات إلكترونية برمز QR معتمد ترفع ثقة العملاء' : 'Certified paperless QR warranties boosting customer retention'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#5C24EB]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                  {isArabic ? 'كيف تعمل سيدا' : 'HOW IT WORKS'}
                </span>
                
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {isArabic ? 'ثلاث خطوات نحو الكفاءة التامة' : 'Three Steps to Operational Flow'}
                </h3>

                <div className="space-y-6">
                  {[
                    {
                      num: '01',
                      title: isArabic ? 'فهم ومراجعة العمليات الحالية' : 'Analyze Current Operations',
                      desc: isArabic ? 'نتعرف على طبيعة خدمات المركز، فريق الفنيين، والأنظمة المتبعة حالياً.' : 'We map out your active services, technicians roster, and existing workflows.'
                    },
                    {
                      num: '02',
                      title: isArabic ? 'تنظيم وضبط مسارات العمل' : 'Structure the Digital Pipeline',
                      desc: isArabic ? 'إعداد الباقات، أوامر العمل، بوابات الفنيين، ونظام الضمانات الذكي.' : 'Set up services, custom checklists, technician portals, and smart warranties.'
                    },
                    {
                      num: '03',
                      title: isArabic ? 'المتابعة والتطوير المستمر' : 'Monitor, Scale & Reward',
                      desc: isArabic ? 'تقارير فورية، إشراف لحظي على جودة التنفيذ، وحساب دقيق للعمولات.' : 'Real-time performance reports, quality gates, and transparent commissions.'
                    }
                  ].map((step, sIdx) => (
                    <div key={sIdx} className="flex gap-4 items-start">
                      <span className="text-xl font-black text-[#8B5CF6] font-mono">{step.num}</span>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white">{step.title}</h4>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Request a Demo / Contact Form */}
      <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-8">
            <div className="text-center space-y-3">
              <span className="px-3.5 py-1 rounded-full bg-purple-50 text-[#5C24EB] font-bold text-xs uppercase tracking-wider">
                {isArabic ? 'تواصل معنا' : 'CONTACT US'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {isArabic ? 'اطلب عرضاً توضيحياً لمنشأتك' : 'Request a Tailored Demo'}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
                {isArabic
                  ? 'أخبرنا عن طبيعة نشاطك وسيقوم مستشارنا بالتواصل معك وشرح كيفية ملاءمة نظام سيدا لمركزك.'
                  : 'Tell us about your operations and our consultant will show you how SEEDA elevates your business.'}
              </p>
            </div>

            {contactSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-2xl">check</span>
                </div>
                <h3 className="font-bold text-lg text-emerald-900">
                  {isArabic ? 'تم استلام طلبك بنجاح!' : 'Request Received Successfully!'}
                </h3>
                <p className="text-sm text-emerald-700">
                  {isArabic ? 'شكراً لتواصلك معنا. سنقوم بمراجعة بياناتك والتواصل معك في أقرب وقت.' : 'Thank you for reaching out. Our team will contact you shortly.'}
                </p>
                <button
                  type="button"
                  onClick={() => setContactSuccess(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  {isArabic ? 'إرسال طلب آخر' : 'Send Another Inquiry'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {isArabic ? 'الاسم بالكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={contactData.fullName}
                      onChange={(e) => setContactData({ ...contactData, fullName: e.target.value })}
                      placeholder={isArabic ? 'مثال: محمد العمري' : 'e.g. John Doe'}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5C24EB] focus:ring-2 focus:ring-[#5C24EB]/20 text-slate-900 text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {isArabic ? 'رقم الهاتف *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5C24EB] focus:ring-2 focus:ring-[#5C24EB]/20 text-slate-900 text-sm outline-none transition-all text-start"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {isArabic ? 'البريد الإلكتروني' : 'Work Email'}
                    </label>
                    <input
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      placeholder="name@company.com"
                      dir="ltr"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5C24EB] focus:ring-2 focus:ring-[#5C24EB]/20 text-slate-900 text-sm outline-none transition-all text-start"
                    />
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {isArabic ? 'اسم المركز / الشركة' : 'Company / Center Name'}
                    </label>
                    <input
                      type="text"
                      value={contactData.company}
                      onChange={(e) => setContactData({ ...contactData, company: e.target.value })}
                      placeholder={isArabic ? 'مركز ريفليكتو لحماية السيارات' : 'Auto Detailing Studio'}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5C24EB] focus:ring-2 focus:ring-[#5C24EB]/20 text-slate-900 text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {isArabic ? 'القطاع الرئيسي' : 'Primary Sector'}
                    </label>
                    <select
                      value={contactData.industry}
                      onChange={(e) => setContactData({ ...contactData, industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5C24EB] focus:ring-2 focus:ring-[#5C24EB]/20 text-slate-900 text-sm outline-none transition-all bg-white"
                    >
                      <option value="">{isArabic ? '-- اختر القطاع --' : '-- Select Industry --'}</option>
                      <option value="PPF">{isArabic ? 'حماية الطلاء (PPF)' : 'PPF & Film Protection'}</option>
                      <option value="Tinting">{isArabic ? 'العزل الحراري والتظليل' : 'Window Tinting'}</option>
                      <option value="Ceramic">{isArabic ? 'النانو سيراميك والتلميع الساطع' : 'Ceramic & Polishing'}</option>
                      <option value="Multi-branch">{isArabic ? 'خدمات سيارات متعددة الفروع' : 'Multi-branch automotive chain'}</option>
                      <option value="Other">{isArabic ? 'قطاع آخر' : 'Other'}</option>
                    </select>
                  </div>

                  {/* Branches */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {isArabic ? 'عدد الفروع' : 'Number of Branches'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={contactData.branches}
                      onChange={(e) => setContactData({ ...contactData, branches: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5C24EB] focus:ring-2 focus:ring-[#5C24EB]/20 text-slate-900 text-sm outline-none transition-all"
                    />
                  </div>

                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {isArabic ? 'تفاصيل إضافية أو استفسارات (اختياري)' : 'Additional Notes / Message (Optional)'}
                  </label>
                  <textarea
                    rows="3"
                    value={contactData.message}
                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                    placeholder={isArabic ? 'اكتب ما تود معرفته عن النظام...' : 'Tell us about your current challenges or questions...'}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5C24EB] focus:ring-2 focus:ring-[#5C24EB]/20 text-slate-900 text-sm outline-none transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full py-4 rounded-xl bg-[#5C24EB] hover:bg-[#4A1BC2] text-white font-bold text-base shadow-lg shadow-[#5C24EB]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingContact ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isArabic ? 'جارٍ إرسال الطلب...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isArabic ? 'إرسال طلب العرض التوضيحي' : 'Submit Demo Request'}</span>
                      <ArrowRightIcon />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-12 bg-white border-t border-slate-200 text-slate-600 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/assets/photo/seeda-dark-text.png" alt="SEEDA" className="h-8 w-auto object-contain" />
            <span className="text-slate-400">|</span>
            <span className="font-semibold text-slate-700">
              {isArabic ? 'منظومة إدارة عمليات مراكز العناية بالسيارات' : 'Automotive Care Operations ERP'}
            </span>
          </div>

          <p className="text-slate-500">
            © {new Date().getFullYear()} SEEDA. {isArabic ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>

      {/* 9. Sign In Cinema Modal / Drawer */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          
          {/* Cinema Card Container */}
          <div className="relative w-full max-w-md sm:max-w-lg rounded-3xl overflow-hidden bg-[#0a0a0f] border border-white/10 shadow-2xl text-white">
            
            {/* Top Bar with SEEDA Brand & Close Button */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <img src="/assets/photo/seeda.png" alt="SEEDA Logo" className="h-7 w-auto object-contain" />
                <span className="text-xs font-bold text-slate-300">
                  {isArabic ? 'بوابة الفنيين والإدارة' : 'Technician & Admin Hub'}
                </span>
              </div>
              <button
                type="button"
                onClick={closeLoginModal}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Video Background Layer */}
            <div className="relative p-6 sm:p-8 space-y-6 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/assets/photo/loginBG.jpg"
                  className="w-full h-full object-cover"
                >
                  <source src="/assets/login-video.webm" type="video/webm" />
                </video>
              </div>

              {/* Form Content */}
              <div className="relative z-10 space-y-5">
                <div className="text-center space-y-1.5">
                  <h3 className="text-2xl font-black text-white">
                    {isArabic ? 'مرحباً بك' : 'Welcome Back'}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    {isArabic
                      ? 'سجل دخولك إلى نظام الفنيين أو النظام الإداري المعتمد'
                      : 'Sign in to access your technician or administrative portal'}
                  </p>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold animate-fadeIn">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  
                  {/* Phone / Employee Code */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-300">
                      {isArabic ? 'رقم الهاتف أو الرقم الوظيفي' : 'Phone Number or Employee Code'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        autoFocus
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={isArabic ? 'أدخل رقم الهاتف أو الرمز' : 'Enter phone or code'}
                        dir="ltr"
                        className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/15 focus:border-[#8B5CF6] text-white text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-300">
                      {isArabic ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        dir="ltr"
                        className="w-full h-12 px-4 pe-12 rounded-xl bg-white/[0.06] border border-white/15 focus:border-[#8B5CF6] text-white text-sm outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-gray-400 hover:text-white"
                      >
                        <EyeIcon visible={showPassword} />
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-gray-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/20 bg-white/10 text-[#5C24EB] focus:ring-0"
                      />
                      <span>{isArabic ? 'تذكرني' : 'Remember me'}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
                    >
                      {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full h-12 rounded-xl bg-[#5C24EB] hover:bg-[#4A1BC2] text-white font-bold text-sm shadow-lg shadow-[#5C24EB]/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{isArabic ? 'جارٍ التحقق والدخول...' : 'Verifying...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
                        <ArrowRightIcon />
                      </>
                    )}
                  </button>

                </form>

                {/* Bottom Powered By */}
                <div className="pt-2 text-center text-[11px] text-gray-500 font-medium">
                  {isArabic ? 'مدعوم بواسطة منصة سيدا الذكية · SEEDA' : 'Powered by SEEDA Platform'}
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* Forgot Password Guidance Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 max-w-sm w-full text-white space-y-4 shadow-2xl">
            <h4 className="font-bold text-base text-purple-400">
              {isArabic ? 'استعادة كلمة المرور' : 'Password Assistance'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isArabic
                ? 'يرجى مراجعة إدارة الورشة أو مدير المركز لإعادة تعيين كلمة مرور حساب الفني أو الحساب الإداري.'
                : 'Please contact the workshop manager or administrator to reset your technician credentials.'}
            </p>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
            >
              {isArabic ? 'حسناً، فهمت' : 'Understood'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

