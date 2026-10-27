import React from 'react';
import ReactDOM from 'react-dom';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const WarrantyCertificateModal = React.memo(({ isOpen, onClose, data }) => {
  useBodyScrollLock(isOpen);

  if (!isOpen || !data) return null;

  const val = (v, fallback = '----') => {
    if (v === null || v === undefined || v === '') return fallback;
    return v;
  };

  const customerName  = val(data.client_name || data.user_name || data.name);
  const phone         = val(data.phone || data.client_phone);
  const email         = val(data.email || data.client_email);
  const brand         = val(data.brand);
  const model         = val(data.model);
  const year          = val(data.year);
  const color         = val(data.color);
  const vin           = val(data.vin_number || data.chassis_number);
  const plate         = val(data.plate_number || data.vehicle_plate || data.plate);
  const branchName    = val(data.branch_name || 'Reflecto Center');
  const warrantyNum   = val(data.warranty_number || data.work_order_number || data.id);
  const serviceName   = val(
    data.service ||
    data.service_name ||
    (Array.isArray(data.services) && data.services[0]?.service_name) ||
    (Array.isArray(data.warranties) && data.warranties[0]?.service_name) ||
    'عازل حراري (Heat Insulation)'
  );
  const serviceDetailsObj = (() => {
    if (typeof data.service_details === 'object' && data.service_details !== null) return data.service_details;
    if (typeof data.service_details === 'string') {
      try { return JSON.parse(data.service_details); } catch (_) {}
    }
    return {};
  })();

  const matchedKey = (() => {
    const sName = String(serviceName).toLowerCase();
    if (sName.includes('heat') || sName.includes('عازل')) return 'heat_insulation';
    if (sName.includes('polish') || sName.includes('تلميع')) return 'polishing';
    if (sName.includes('nano') || sName.includes('نانو')) return 'nano_ceramic';
    if (sName.includes('ppf') || sName.includes('حماية')) return 'ppf';
    if (sName.includes('removal') || sName.includes('إزالة')) return 'removal_services';
    return Object.keys(serviceDetailsObj)[0] || '';
  })();

  const detailForService = serviceDetailsObj[matchedKey] || Object.values(serviceDetailsObj)[0] || {};

  const product       = val(data.product_name || data.product || detailForService.product);
  const productModel  = val(data.product_model || detailForService.product_model);
  const coverageArea  = val(data.coverage_area || detailForService.coverage_area);
  const warrantyYears = data.warranty_years || data.coverage_years || 5;

  const rawDate   = data.issue_date || data.created_at || data.installation_date;
  const issueDate = rawDate ? new Date(rawDate) : new Date();

  const fmtDate = (d) => {
    if (!d || isNaN(d)) return '----';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const expiryDate = new Date(issueDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + Number(warrantyYears));

  const numPadded      = String(warrantyNum).padStart(6, '0');
  const warrantyNumFmt = `REF-${issueDate.getFullYear()}-${numPadded}`;

  const qrData = `https://reflecto.com.sa/verify?num=${warrantyNum}`;
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(qrData)}`;

  const handlePrint = () => window.print();

  const dateBlocks = [
    { en: 'ISSUE DATE',        ar: 'تاريخ إصدار الضمان', icon: 'calendar_today', v: fmtDate(issueDate)  },
    { en: 'INSTALLATION DATE', ar: 'تاريخ تنفيذ الخدمة',  icon: 'published_with_changes', v: fmtDate(issueDate)  },
    { en: 'EXPIRY DATE',       ar: 'تاريخ انتهاء الضمان', icon: 'event_repeat',    v: fmtDate(expiryDate) },
  ];

  const enTerms = [
    '1. The warranty starts from the installation date stated in this certificate.',
    '2. The warranty is valid for the vehicle and service details mentioned above.',
    '3. This warranty does not cover damage caused by misuse, accidents, or improper cleaning.',
    '4. To make a claim, please contact Reflecto and provide your warranty number.',
    '5. Full terms and conditions are available at reflecto.com.sa',
  ];

  const arTerms = [
    '١. يبدأ سريان الضمان من تاريخ التركيب المذكور في هذه الشهادة.',
    '٢. الضمان مرتبط بالمركبة وبياناتها المسجلة في هذه الشهادة.',
    '٣. لا يغطي الضمان الأضرار الناتجة عن سوء الاستخدام أو الحوادث أو التعديلات غير المعتمدة.',
    '٤. للمطالبة بالضمان، يرجى التواصل مع ريفليكتو وتقديم رقم الضمان المذكور أعلاه.',
    '٥. تتوفر جميع الشروط والأحكام الكاملة على الموقع الإلكتروني reflecto.com.sa',
  ];

  const coverageItems = [
    { icon: 'badge',             en: 'PROFESSIONAL', ar: 'تركيب احترافي'     },
    { icon: 'workspace_premium', en: 'PREMIUM',      ar: 'مواد عالية الجودة' },
    { icon: 'military_tech',     en: 'LONG LASTING', ar: 'حماية تدوم طويلاً' },
  ];

  const modalContent = (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body > *:not(#wm-portal) {
            display: none !important;
          }
          #wm-portal {
            position: static !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .wm-topbar, .no-print {
            display: none !important;
          }
          .wm-scroll {
            overflow: visible !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .wm-print-page {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10px 14px !important;
            border: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            height: 282mm !important;
            max-height: 282mm !important;
          }
          .wm-print-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>

      <div id="wm-portal" className="fixed inset-0 z-[9999] flex flex-col bg-[#0b0b0b]">

        {/* Top bar (Control Header) */}
        <div className="wm-topbar shrink-0 bg-[#121212] border-b border-white/10 px-6 py-3.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FF5C35]/20 flex items-center justify-center text-[#FF5C35]">
              <span className="material-symbols-outlined text-lg">verified</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">شهادة الضمان الإلكترونية (3 صفحات رسمية)</p>
              <p className="text-gray-400 text-xs font-mono">Warranty Certificate · {warrantyNumFmt}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5C35] hover:bg-[#e04e2a] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>تنزيل / طباعة الضمان (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer"
              title="إغلاق"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="wm-scroll flex-1 overflow-y-auto bg-[#181818] py-8 px-4 sm:px-8 space-y-8">

          {/* ========================================================================= */}
          {/* PAGE 1: MAIN WARRANTY CERTIFICATE & VEHICLE DETAILS */}
          {/* ========================================================================= */}
          <div className="wm-print-page bg-white text-black max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-100" dir="ltr">
            
            {/* Logo & Brand Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img src="/assets/photo/logo-dark.png" alt="REFLECTO" className="w-auto object-contain" style={{ height: "4rem" }} />
                <div className="border-l border-gray-300 pl-3">
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-tight">PAINT PROTECTION FILM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">AUTHENTIC PROTECTION</p>
                <p className="text-xs font-black uppercase tracking-wide text-black">REFLECTO PREMIUM CAR CARE</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-black text-white text-[7.5px] font-black uppercase tracking-wider mt-0.5">
                  PAGE 1 OF 3 · صفحة ١ من ٣
                </span>
              </div>
            </div>

            {/* Title + Warranty Box Header */}
            <div className="px-6 pt-3.5 pb-2.5 flex flex-col sm:flex-row items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase text-black leading-none tracking-tight">
                  WARRANTY CERTIFICATE
                </h1>
                <p className="text-[#FF5C35] text-lg font-black mt-1" dir="rtl">شهادة ضمان</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">YOUR VEHICLE. OUR COMMITMENT.</p>
              </div>

              <div className="shrink-0 border border-gray-200 rounded-xl p-2.5 flex items-center gap-3 bg-gray-50/50 self-stretch sm:self-auto justify-between sm:justify-start">
                <div className="text-left">
                  <p className="text-[7.5px] text-gray-400 font-bold uppercase tracking-wider">WARRANTY NUMBER</p>
                  <p className="text-[7.5px] text-gray-400 font-bold uppercase tracking-wider" dir="rtl">رقم الضمان</p>
                  <p className="text-[#FF5C35] font-black text-xs sm:text-sm font-mono mt-0.5">{warrantyNumFmt}</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="flex flex-col items-center">
                  <img src={qrUrl} alt="QR Verify" className="w-12 h-12 object-contain" />
                  <p className="text-[6.5px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">VERIFY WARRANTY</p>
                  <p className="text-[6.5px] text-gray-400 font-bold uppercase tracking-wider" dir="rtl">التحقق من الضمان</p>
                </div>
              </div>
            </div>

            {/* Dates Bar */}
            <div className="grid grid-cols-3 gap-2.5 mx-6 mb-2.5">
              {dateBlocks.map(({ en, ar, icon, v }) => (
                <div key={en} className="border border-gray-200 rounded-xl p-2.5 bg-gray-50/30 text-left">
                  <div className="flex items-center gap-1 text-[#FF5C35]">
                    <span className="material-symbols-outlined text-xs">{icon}</span>
                    <span className="text-[8px] font-bold uppercase tracking-wider">{en}</span>
                  </div>
                  <p className="text-[8px] text-gray-400 font-medium mt-0.5" dir="rtl">{ar}</p>
                  <p className="text-xs font-black text-black mt-0.5">{v}</p>
                </div>
              ))}
            </div>

            {/* Customer Information */}
            <div className="mx-6 mb-2.5 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-50 border-b border-gray-200">
                <span className="material-symbols-outlined text-xs text-[#FF5C35]">person</span>
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-black">CUSTOMER INFORMATION</span>
                  <span className="text-[8.5px] text-gray-400 font-semibold ml-2" dir="rtl">بيانات العميل</span>
                </div>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[8px] text-gray-400 font-medium">Customer Name / اسم العميل</p>
                    <p className="text-xs font-black text-black mt-0.5 truncate">{customerName}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-400 font-medium">Phone Number / رقم الجوال</p>
                    <p className="text-xs font-black text-black mt-0.5 font-mono">{phone}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-400 font-medium">Email / البريد الإلكتروني</p>
                    <p className="text-xs font-black text-black mt-0.5 truncate font-mono">{email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="mx-6 mb-2.5 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-50 border-b border-gray-200">
                <span className="material-symbols-outlined text-xs text-[#FF5C35]">directions_car</span>
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-black">VEHICLE INFORMATION</span>
                  <span className="text-[8.5px] text-gray-400 font-semibold ml-2" dir="rtl">بيانات المركبة</span>
                </div>
              </div>
              <div className="p-3 grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <p className="text-[8px] text-gray-400 font-medium">Make / العلامة</p>
                  <p className="text-xs font-black text-black mt-0.5">{brand}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-400 font-medium">Model / الموديل</p>
                  <p className="text-xs font-black text-black mt-0.5">{model}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-400 font-medium">Year / سنة الصنع</p>
                  <p className="text-xs font-black text-black mt-0.5">{year}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-400 font-medium">Color / اللون</p>
                  <p className="text-xs font-black text-black mt-0.5">{color}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-400 font-medium">VIN / رقم الهيكل</p>
                  <p className="text-xs font-black text-black mt-0.5 font-mono">{vin}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-400 font-medium">Plate Number / رقم اللوحة</p>
                  <p className="text-xs font-black text-black mt-0.5">{plate}</p>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="mx-6 mb-2.5 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-50 border-b border-gray-200">
                <span className="material-symbols-outlined text-xs text-[#FF5C35]">verified</span>
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-black">SERVICE DETAILS</span>
                  <span className="text-[8.5px] text-gray-400 font-semibold ml-2" dir="rtl">تفاصيل الخدمة</span>
                </div>
              </div>
              <div className="p-3 grid grid-cols-2 gap-y-2 gap-x-4">
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[8px] text-gray-400 font-medium">Service / نوع الخدمة</p>
                  <p className="text-xs font-black text-[#FF5C35] mt-0.5">{serviceName}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-400 font-medium">Product / المنتج المستخدم</p>
                  <p className="text-xs font-black text-black mt-0.5">{product}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-400 font-medium">Product Model / الفئة</p>
                  <p className="text-xs font-black text-black mt-0.5">{productModel}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-400 font-medium">Coverage Area / المساحة المشمولة</p>
                  <p className="text-xs font-black text-black mt-0.5">{coverageArea}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[8px] text-gray-400 font-medium">Installation Center / مركز التنفيذ</p>
                  <p className="text-xs font-black text-black mt-0.5">{branchName}</p>
                </div>
              </div>
            </div>

            {/* Product Authenticity Box */}
            <div className="mx-6 mb-3 bg-[#111111] text-white rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 border border-zinc-800 shadow-md">
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="bg-zinc-800/80 border border-zinc-700 text-white p-2 rounded-xl text-center min-w-[90px]">
                  <p className="text-base font-black tracking-widest text-white leading-none">APEAX®</p>
                  <p className="text-[6.5px] text-zinc-400 uppercase tracking-widest mt-1 font-semibold">BRITISH TECHNOLOGY</p>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left px-2">
                <p className="text-[11px] font-black text-[#FF5C35]">PRODUCT AUTHENTICITY / أصالة المنتج</p>
                <p className="text-[8px] text-zinc-300 mt-0.5 leading-snug">
                  We confirm that this vehicle has been protected using genuine APEAX products, manufactured with American technology and backed by advanced innovation.
                </p>
                <p className="text-[8px] text-zinc-400 mt-0.5 leading-snug" dir="rtl">
                  نؤكد أن هذه المركبة تم حمايتها باستخدام منتجات أصلية من APEAX، والمصنعة بتكنولوجيا أمريكية متقدمة.
                </p>
              </div>
              <div className="shrink-0 bg-zinc-800/90 border border-zinc-700 p-2 rounded-xl text-center min-w-[70px]">
                <p className="text-xs font-black text-white">US</p>
                <p className="text-[6.5px] text-zinc-400 font-bold uppercase tracking-wider">AMERICAN TECH</p>
              </div>
            </div>

            {/* Bottom Dark Band Page 1 */}
            <div className="bg-black px-6 py-2 flex items-center justify-between mt-auto">
              <p className="text-white text-[8px] font-black uppercase tracking-widest">REFLECTO | PREMIUM CAR PROTECTION</p>
              <p className="text-gray-300 text-[8px] font-bold" dir="rtl">شهادة ضمان معتمدة · صفحة ١ من ٣</p>
            </div>
          </div>

          {/* Screen-Only Visual Separator between Page 1 and Page 2 */}
          <div className="max-w-3xl mx-auto my-4 flex items-center justify-between text-xs text-gray-400 no-print select-none">
            <div className="h-px bg-white/20 flex-1"></div>
            <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-full font-bold text-gray-200 flex items-center gap-2 border border-white/10 shadow-lg">
              <span className="material-symbols-outlined text-sm text-[#FF5C35]">shield</span>
              <span>الصفحة الثانية: نطاق التغطية وشروط وأحكام الضمان (Page 2)</span>
            </span>
            <div className="h-px bg-white/20 flex-1"></div>
          </div>

          {/* ========================================================================= */}
          {/* PAGE 2: WARRANTY COVERAGE, GENERAL TERMS & SIGNATURE */}
          {/* ========================================================================= */}
          <div className="wm-print-page bg-white text-black max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-100" dir="ltr">
            
            {/* Header Page 2 */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <img src="/assets/photo/logo-dark.png" alt="REFLECTO" className="w-auto object-contain" style={{ height: "3.5rem" }} />
                <div className="border-l border-gray-300 pl-3">
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-tight">WARRANTY COVERAGE & TERMS</p>
                  <p className="text-[9px] text-gray-700 font-bold leading-tight" dir="rtl">نطاق الضمان والشروط العامة</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-gray-400 font-mono tracking-wider">{warrantyNumFmt}</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-black text-white text-[7.5px] font-black uppercase tracking-wider mt-0.5">
                  PAGE 2 OF 3 · صفحة ٢ من ٣
                </span>
              </div>
            </div>

            {/* Warranty Coverage Card */}
            <div className="mx-6 mt-4 mb-4 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="material-symbols-outlined text-sm text-[#FF5C35]">shield</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-black">WARRANTY COVERAGE</span>
                  <span className="text-[9px] text-gray-400 font-semibold ml-2" dir="rtl">نطاق الضمان</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[10.5px] text-gray-700 font-semibold leading-relaxed">
                  This warranty covers manufacturing defects and installation-related issues as per the terms stated in this certificate.
                </p>
                <p className="text-[10.5px] text-gray-700 font-semibold leading-relaxed mt-1" dir="rtl">
                  يغطي هذا الضمان العيوب التصنيعية والمشاكل المتعلقة بالتركيب وفقاً للشروط المذكورة في هذه الشهادة.
                </p>

                <div className="grid grid-cols-3 gap-3.5 mt-4">
                  {coverageItems.map(({ icon, en, ar }) => (
                    <div key={en} className="border border-gray-200 rounded-xl p-3.5 text-center bg-gray-50/60 shadow-xs">
                      <span className="material-symbols-outlined text-[#FF5C35] text-2xl">{icon}</span>
                      <p className="text-[10px] font-black uppercase tracking-wider text-black mt-1.5">{en}</p>
                      <p className="text-[9.5px] text-gray-600 font-bold mt-0.5" dir="rtl">{ar}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Terms and Conditions (5 Core Points) */}
            <div className="mx-6 mb-4 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="material-symbols-outlined text-sm text-[#FF5C35]">article</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-black">WARRANTY TERMS & CONDITIONS</span>
                  <span className="text-[9px] text-gray-400 font-semibold ml-2" dir="rtl">شروط وأحكام الضمان</span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 text-left">
                  {enTerms.map((t, i) => (
                    <p key={i} className="text-[9.5px] text-gray-700 leading-snug font-medium">{t}</p>
                  ))}
                </div>
                <div className="space-y-2 text-right" dir="rtl">
                  {arTerms.map((t, i) => (
                    <p key={i} className="text-[9.5px] text-gray-700 leading-snug font-medium">{t}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Signature & Contact Footer */}
            <div className="mx-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-gray-200">
              <div className="text-center sm:text-left">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">AUTHORIZED SIGNATURE</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider" dir="rtl">التوقيع المعتمد</p>
                <p className="text-2xl font-black italic text-black mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                  Reflecto Team
                </p>
                <p className="text-[9px] text-gray-500 font-medium" dir="rtl">فريق ريفليكتو المعتمد</p>
                <div className="w-36 border-b border-dashed border-gray-300 mt-2 mx-auto sm:mx-0" />
              </div>

              <div className="text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-[9.5px] text-gray-700 font-semibold">
                  <span className="material-symbols-outlined text-sm text-[#FF5C35]">call</span>
                  <span>+966 55 872 2444</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[9.5px] text-gray-700 font-semibold">
                  <span className="material-symbols-outlined text-sm text-[#FF5C35]">mail</span>
                  <span>info@reflecto.com.sa</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[9.5px] text-gray-700 font-semibold">
                  <span className="material-symbols-outlined text-sm text-[#FF5C35]">language</span>
                  <span>www.reflecto.com.sa</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[9.5px] text-gray-700 font-semibold" dir="rtl">
                  <span className="material-symbols-outlined text-sm text-[#FF5C35]">location_on</span>
                  <span>الرياض، المملكة العربية السعودية</span>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <img src="/assets/photo/logo-dark.png" alt="REFLECTO" className="h-8 w-auto object-contain mx-auto sm:ml-auto sm:mr-0 mb-1" />
                <p className="text-[8.5px] text-gray-600 font-bold uppercase tracking-widest">PAINT PROTECTION FILM</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">MORE THAN PROTECTION</p>
              </div>
            </div>

            {/* Bottom Dark Band Page 2 */}
            <div className="bg-black px-6 py-2 flex items-center justify-between mt-auto">
              <p className="text-white text-[8px] font-black uppercase tracking-widest">REFLECTO | PREMIUM CAR PROTECTION</p>
              <p className="text-gray-300 text-[8px] font-bold" dir="rtl">حماية متكاملة لسيارتك · صفحة ٢ من ٣</p>
            </div>
          </div>

          {/* Screen-Only Visual Separator between Page 2 and Page 3 */}
          <div className="max-w-3xl mx-auto my-4 flex items-center justify-between text-xs text-gray-400 no-print select-none">
            <div className="h-px bg-white/20 flex-1"></div>
            <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-full font-bold text-gray-200 flex items-center gap-2 border border-white/10 shadow-lg">
              <span className="material-symbols-outlined text-sm text-[#FF5C35]">auto_stories</span>
              <span>الصفحة الثالثة: وثيقة الشروط والسياسات المعتمدة للخدمات (Page 3)</span>
            </span>
            <div className="h-px bg-white/20 flex-1"></div>
          </div>

          {/* ========================================================================= */}
          {/* PAGE 3: TERMS, CONDITIONS & SERVICE DETAILS (Guaranteed Single Page) */}
          {/* ========================================================================= */}
          <div className="wm-print-page bg-white text-black max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-100" dir="ltr">

            {/* Header Page 3 */}
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-200 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <img src="/assets/photo/logo-dark.png" alt="REFLECTO" className="w-auto object-contain" style={{ height: "3.2rem" }} />
                <div className="border-l border-gray-300 pl-3">
                  <p className="text-[8.5px] text-gray-500 font-bold uppercase tracking-widest leading-tight">WARRANTY POLICY & TERMS</p>
                  <p className="text-[8.5px] text-gray-700 font-bold leading-tight" dir="rtl">وثيقة الشروط والضمان المعتمدة</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[7.5px] text-gray-400 font-mono tracking-wider">{warrantyNumFmt}</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-black text-white text-[7.5px] font-black uppercase tracking-wider mt-0.5">
                  PAGE 3 OF 3 · صفحة ٣ من ٣
                </span>
              </div>
            </div>
 
            {/* Top Preamble Banner (Exact from official warranty document) */}
            <div className="mx-5 mt-2 bg-[#0c1020] text-white rounded-xl p-2.5 border border-[#2a3350] shadow-sm">
              <div className="grid grid-cols-2 gap-3 text-[7.5px] leading-[1.35]">
                {/* English Top Banner */}
                <div className="border-r border-zinc-700/80 pr-3 text-zinc-300 text-left" dir="ltr">
                  <p className="font-normal text-gray-200">
                    This certificate is issued by Reflecto Company and becomes valid and enforceable immediately upon completion of the service. No claim or right under this certificate shall be recognized unless it is presented along with the original invoice matching the service details and payments. Please retain both the certificate and the original invoice for future reference.
                  </p>
                  <div className="mt-1.5 pt-1.5 border-t border-zinc-700/60 space-y-0.5 text-[7px]">
                    <p><strong className="text-[#caa765]">Warranty Provider:</strong> Reflecto Company</p>
                    <p><strong className="text-[#caa765]">Warranty Validity:</strong> From the date of service execution.</p>
                    <p><strong className="text-[#caa765]">To benefit:</strong> Present this card + the original matching invoice.</p>
                  </div>
                </div>

                {/* Arabic Top Banner */}
                <div className="pl-3 text-zinc-300 text-right font-body" dir="rtl">
                  <p className="font-normal text-gray-200">
                    هذه الشهادة صادرة عن شركة ريفليكتو وتصبح نافذة وسارية المفعول فور إتمام الخدمة؛ على أنه لا يُعتدّ بأي مطالبة أو حق بموجبها ما لم تُقدَّم الشهادة مرفقة بأصل الفاتورة التجارية المطابقة لبيانات الخدمة والمدفوعات، ويُرجى الاحتفاظ بكل من الشهادة والفاتورة الأصلية للرجوع إليهما عند الحاجه.
                  </p>
                  <div className="mt-1.5 pt-1.5 border-t border-zinc-700/60 space-y-0.5 text-[7px]">
                    <p><strong className="text-[#caa765]">جهة الضمان:</strong> شركة ريفليكتو</p>
                    <p><strong className="text-[#caa765]">سريان الضمان:</strong> من تاريخ تنفيذ الخدمة</p>
                    <p><strong className="text-[#caa765]">للاستفادة:</strong> إبراز هذه البطاقة + الفاتورة الأصلية المطابقة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Bar: How to Request Warranty Service? / كيف تُطلب خدمة الضمان؟ */}
            <div className="mx-5 mt-1.5 bg-[#0c1020] text-white rounded-lg px-3 py-1.5 border border-[#2a3350] shadow-sm">
              <div className="grid grid-cols-2 gap-3 text-[7.5px] items-center relative">
                {/* English Request */}
                <div className="flex items-center justify-between pr-4 border-r border-zinc-700/80" dir="ltr">
                  <div>
                    <p className="font-bold text-[#caa765] text-[8px]">How to Request Warranty Service?</p>
                  </div>
                  <div className="text-[7px] text-gray-300 leading-tight">
                    <p>1.Book with Reflecto Company via:</p>
                    <p className="flex items-center gap-2 font-mono">
                      <span>✆ 0566750797</span>
                      <span>🌐 suntekksa.com</span>
                    </p>
                    <p>2.Bring the car, this card, and the invoice.</p>
                  </div>
                </div>

                {/* Center Question Mark Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#caa765]/20 border border-[#caa765] text-[#caa765] flex items-center justify-center text-[10px] font-black z-10 pointer-events-none">
                  ?
                </div>

                {/* Arabic Request */}
                <div className="flex items-center justify-between pl-4 text-right font-body" dir="rtl">
                  <div>
                    <p className="font-bold text-[#caa765] text-[8px]">كيف تُطلب خدمة الضمان؟</p>
                  </div>
                  <div className="text-[7px] text-gray-300 leading-tight">
                    <p>1.احجز مع شركة ريفليكتو (صن تك) عبر:</p>
                    <p className="flex items-center gap-2 font-mono justify-end">
                      <span>0566750797 ✆</span>
                      <span>🌐 suntekksa.com</span>
                    </p>
                    <p>2 أحضر السيارة والبطاقة والفاتورة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* The 4 Service Cards Grid (Left Column English, Right Column Arabic) */}
            <div className="grid grid-cols-2 gap-3 mx-5 my-2 flex-1">
              
              {/* ======================================================== */}
              {/* CARD 1: Thermal Insulation Tint / تظليل العازل الحراري */}
              {/* ======================================================== */}
              {/* English Card 1 */}
              <div className="border border-[#caa765] rounded-xl pt-2 pb-2 px-2.5 bg-white relative flex flex-col justify-start text-[7.5px] leading-[1.3] text-gray-800" dir="ltr">
                <div className="flex justify-center -mt-3.5 mb-1.5">
                  <span className="bg-[#10172e] text-white text-[8px] font-bold px-3 py-0.5 rounded-full border border-[#2b3a63] shadow-xs whitespace-nowrap">
                    1. Thermal Insulation Tint
                  </span>
                </div>
                <div className="space-y-0.5 text-left">
                  <p><strong className="text-black">Duration:</strong> 5 years.</p>
                  <p><strong className="text-black">Covers:</strong> Film defects and installation errors (measurements - cutting - air or water bubbles).</p>
                  <p><strong className="text-black">Conditions:</strong> • Service performed at Reflecto Company.</p>
                  <p className="pl-3.5">• Regular maintenance with them.</p>
                  <p><strong className="text-black">Excludes:</strong> • Misuse (removal/re-application/painting).</p>
                  <p className="pl-3.5">• Cleaning with unapproved chemicals.</p>
                  <p className="pl-3.5">• Lack of periodic inspection. &nbsp; • Traffic accidents</p>
                  <p className="pl-3.5">• Damage from removing old film.</p>
                </div>
              </div>

              {/* Arabic Card 1 */}
              <div className="border border-[#caa765] rounded-xl pt-2 pb-2 px-2.5 bg-white relative flex flex-col justify-start text-[7.5px] leading-[1.3] text-gray-800 font-body" dir="rtl">
                <div className="flex justify-center -mt-3.5 mb-1.5">
                  <span className="bg-[#10172e] text-white text-[8px] font-bold px-3 py-0.5 rounded-full border border-[#2b3a63] shadow-xs whitespace-nowrap">
                    -1 تظليل العازل الحراري
                  </span>
                </div>
                <div className="space-y-0.5 text-right">
                  <p><strong className="text-black">المدة:</strong> 5 سنوات. &nbsp;&nbsp;&nbsp; <strong className="text-black">يشمل:</strong> عيوب الفيلم وأخطاء التركيب (مقاسات - قص - فقاعات هواء أو ماء).</p>
                  <p><strong className="text-black">شروط:</strong> • الخدمة منفذة لدى شركة محمد حميد الصاعدي أو شركائها</p>
                  <p className="pr-3.5">• صيانة دورية لديهم.</p>
                  <p><strong className="text-black">لا يشمل:</strong> • سوء الاستخدام (إزالة - إعادة لصق - طلاء)</p>
                  <p className="pr-3.5">• تنظيف بمواد كيميائية غير معتمدة</p>
                  <p className="pr-3.5">• الحوادث المرورية &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • عدم المراجعة الدورية</p>
                  <p className="pr-3.5">• أضرار إزالة فيلم قديم.</p>
                  <p><strong className="text-black">إزالة الفيلم:</strong> فك مجاني عند الحاجة مقابل أجور لمدة 5 سنوات.</p>
                </div>
              </div>

              {/* ======================================================== */}
              {/* CARD 2: Paint Protection Film (PPF) / حماية الطلاء */}
              {/* ======================================================== */}
              {/* English Card 2 */}
              <div className="border border-[#caa765] rounded-xl pt-2 pb-2 px-2.5 bg-white relative flex flex-col justify-start text-[7.5px] leading-[1.3] text-gray-800" dir="ltr">
                <div className="flex justify-center -mt-3.5 mb-1.5">
                  <span className="bg-[#10172e] text-white text-[8px] font-bold px-3 py-0.5 rounded-full border border-[#2b3a63] shadow-xs whitespace-nowrap">
                    2. Paint Protection Film (PPF)
                  </span>
                </div>
                <div className="space-y-0.5 text-left">
                  <p><strong className="text-black">Duration:</strong> 5 years.</p>
                  <p><strong className="text-black">Covers:</strong> Film defects and installation errors (measurements/cutting/air or water bubbles).</p>
                  <p><strong className="text-black">Removal &amp; replacement:</strong> Free removal during warranty if replaced due to misuse or accident, with new installation fees payable.</p>
                  <p><strong className="text-black">Conditions:</strong> • Inspection and reporting of any defect within 30 days of delivery.</p>
                  <p className="pl-3.5">• Annual maintenance with the company or partners.</p>
                  <p><strong className="text-black">Excludes:</strong> • Misuse. • Damage from removing old film on used cars (such as paint damage or heater lines).</p>
                  <p className="pl-3.5">• Traffic accidents (warranty void for the damaged part only).</p>
                  <p className="pl-3.5">• Customer removing service outside the center.</p>
                  <p className="pl-3.5">• No inspections within specified intervals.</p>
                </div>
              </div>

              {/* Arabic Card 2 */}
              <div className="border border-[#caa765] rounded-xl pt-2 pb-2 px-2.5 bg-white relative flex flex-col justify-start text-[7.5px] leading-[1.3] text-gray-800 font-body" dir="rtl">
                <div className="flex justify-center -mt-3.5 mb-1.5">
                  <span className="bg-[#10172e] text-white text-[8px] font-bold px-3 py-0.5 rounded-full border border-[#2b3a63] shadow-xs whitespace-nowrap">
                    -2 حماية الطلاء (PPF)
                  </span>
                </div>
                <div className="space-y-0.5 text-right">
                  <p><strong className="text-black">المدة:</strong> 5 سنوات. &nbsp;&nbsp;&nbsp; <strong className="text-black">يشمل:</strong> عيوب الفيلم وأخطاء التركيب (مقاسات - قص - فقاعات هواء أو ماء).</p>
                  <p><strong className="text-black">الإزالة والاستبدال:</strong> فك الحماية مجاناً خلال الضمان إذا استبدلت بسبب سوء استخدام أو حادث، مع دفع رسوم التركيب الجديد.</p>
                  <p><strong className="text-black">شروط:</strong> • فحص وإبلاغ بأي عيب خلال 30 يوماً من الاستلام</p>
                  <p className="pr-3.5">• صيانة سنوية لدى الشركة أو شركائها.</p>
                  <p><strong className="text-black">لا يشمل:</strong> • سوء الاستخدام</p>
                  <p className="pr-3.5">• أضرار إزالة فيلم قديم على سيارات مستعملة (مثل تأثر الطلاء أو خطوط السخان)</p>
                  <p className="pr-3.5">• الحوادث المرورية (يسقط الضمان عن القطعة المتضررة فقط)</p>
                  <p className="pr-3.5">• إزالة العميل للخدمة خارج المركز &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • عدم المراجعة في الفترات المحددة.</p>
                </div>
              </div>

              {/* ======================================================== */}
              {/* CARD 3: Nano Ceramic / نانو سيراميك */}
              {/* ======================================================== */}
              {/* English Card 3 */}
              <div className="border border-[#caa765] rounded-xl pt-2 pb-2 px-2.5 bg-white relative flex flex-col justify-start text-[7.5px] leading-[1.3] text-gray-800" dir="ltr">
                <div className="flex justify-center -mt-3.5 mb-1.5">
                  <span className="bg-[#10172e] text-white text-[8px] font-bold px-3 py-0.5 rounded-full border border-[#2b3a63] shadow-xs whitespace-nowrap">
                    3. Nano Ceramic (Exterior / Interior)
                  </span>
                </div>
                <div className="space-y-0.5 text-left">
                  <p><strong className="text-black">Duration:</strong> 5 years – each layer covered for 1 year.</p>
                  <p><strong className="text-black">Covers:</strong> • Material or installation defects &nbsp;&nbsp; • Abnormal loss of shine.</p>
                  <p><strong className="text-black">Conditions:</strong> Free annual inspection at Reflecto Company.</p>
                  <p><strong className="text-black">Excludes:</strong> • Stubborn stains (e.g., berry juice, coffee, animal blood, etc.)</p>
                  <p className="pl-3.5">• Nano warranty void if polishing done outside the center</p>
                  <p className="pl-3.5">• No inspections within specified intervals &nbsp;&nbsp; • Traffic accidents after installation.</p>
                </div>
              </div>

              {/* Arabic Card 3 */}
              <div className="border border-[#caa765] rounded-xl pt-2 pb-2 px-2.5 bg-white relative flex flex-col justify-start text-[7.5px] leading-[1.3] text-gray-800 font-body" dir="rtl">
                <div className="flex justify-center -mt-3.5 mb-1.5">
                  <span className="bg-[#10172e] text-white text-[8px] font-bold px-3 py-0.5 rounded-full border border-[#2b3a63] shadow-xs whitespace-nowrap">
                    -3 نانو سيراميك (خارجي/داخلي)
                  </span>
                </div>
                <div className="space-y-0.5 text-right">
                  <p><strong className="text-black">المدة:</strong> 5 سنوات - مدة ضمان كل طبقة سنة.</p>
                  <p><strong className="text-black">يشمل:</strong> • عيوب المادة أو التركيب &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • تلاشي لمعة غير طبيعي</p>
                  <p><strong className="text-black">شروط:</strong> • فحص مجاني كل سنة لدى شركة ريفليكتو .</p>
                  <p><strong className="text-black">لا يشمل:</strong> • البقع المستعصية (مثل شراب التوت - القهوة - دم الذبائح ونحوها)</p>
                  <p className="pr-3.5">• سقوط ضمان النانو إذا تم التلميع خارج المركز</p>
                  <p className="pr-3.5">• عدم المراجعة في الفترات المحددة • الحوادث المرورية بعد التركيب.</p>
                </div>
              </div>

              {/* ======================================================== */}
              {/* CARD 4: Exterior Polishing / التلميع الخارجي */}
              {/* ======================================================== */}
              {/* English Card 4 */}
              <div className="border border-[#caa765] rounded-xl pt-2 pb-2 px-2.5 bg-white relative flex flex-col justify-start text-[7.5px] leading-[1.3] text-gray-800" dir="ltr">
                <div className="flex justify-center -mt-3.5 mb-1.5">
                  <span className="bg-[#10172e] text-white text-[8px] font-bold px-3 py-0.5 rounded-full border border-[#2b3a63] shadow-xs whitespace-nowrap">
                    4. Exterior Polishing
                  </span>
                </div>
                <div className="space-y-0.5 text-left">
                  <p><strong className="text-black">Duration:</strong> 7 days.</p>
                  <p><strong className="text-black">Covers:</strong> Swirl marks on paint or scratches caused during service.</p>
                  <p><strong className="text-black">Excludes:</strong> • Interior scratches or abrasions after delivery &nbsp;&nbsp; • Exterior polishing done by other parties.</p>
                </div>
              </div>

              {/* Arabic Card 4 */}
              <div className="border border-[#caa765] rounded-xl pt-2 pb-2 px-2.5 bg-white relative flex flex-col justify-start text-[7.5px] leading-[1.3] text-gray-800 font-body" dir="rtl">
                <div className="flex justify-center -mt-3.5 mb-1.5">
                  <span className="bg-[#10172e] text-white text-[8px] font-bold px-3 py-0.5 rounded-full border border-[#2b3a63] shadow-xs whitespace-nowrap">
                    -4 التلميع الخارجي
                  </span>
                </div>
                <div className="space-y-0.5 text-right">
                  <p><strong className="text-black">المدة:</strong> 7 أيام.</p>
                  <p><strong className="text-black">يشمل:</strong> آثار دوّارة على الطلاء أو خدوش نتجت أثناء الخدمة.</p>
                  <p><strong className="text-black">لا يشمل الداخلي:</strong> • خدوش - حك بعد الاستلام &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • التلميع الخارجي لدى جهات أخرى.</p>
                </div>
              </div>

            </div>

            {/* Bottom Dark Band Page 3 */}
            <div className="bg-black px-6 py-2 flex items-center justify-between mt-auto">
              <p className="text-white text-[8px] font-black uppercase tracking-widest">REFLECTO | OFFICIAL WARRANTY POLICY</p>
              <p className="text-gray-300 text-[8px] font-bold" dir="rtl">وثيقة الضمان المعتمدة · صفحة ٣ من ٣</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modalContent, document.body);
});

export default WarrantyCertificateModal;
