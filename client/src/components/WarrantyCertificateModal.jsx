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
    { icon: 'badge',         en: 'PROFESSIONAL', ar: 'تركيب احترافي'     },
    { icon: 'workspace_premium', en: 'PREMIUM',      ar: 'مواد عالية الجودة' },
    { icon: 'military_tech', en: 'LONG LASTING', ar: 'حماية تدوم طويلاً' },
  ];

  const modalContent = (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
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
          .wm-topbar {
            display: none !important;
          }
          .wm-scroll {
            overflow: visible !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .wm-cert {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
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
              <p className="text-white font-bold text-sm">شهادة الضمان الإلكترونية</p>
              <p className="text-gray-400 text-xs font-mono">Warranty Certificate · {warrantyNumFmt}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5C35] hover:bg-[#e04e2a] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>تنزيل الضمان (PDF)</span>
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
        <div className="wm-scroll flex-1 overflow-y-auto bg-[#181818] py-8 px-4 sm:px-8">
          <div className="wm-cert bg-white text-black max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-100" dir="ltr">

            {/* Logo & Brand Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img src="/assets/photo/logo-dark.png" alt="REFLECTO" className="w-auto object-contain" style={{height:"4.5rem"}} />
                <div className="border-l border-gray-300 pl-3">
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-tight">PAINT PROTECTION FILM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">AUTHENTIC PROTECTION</p>
                <p className="text-xs font-black uppercase tracking-wide text-black">REFLECTO PREMIUM CAR CARE</p>
              </div>
            </div>

            {/* Title + Warranty Box Header */}
            <div className="px-6 pt-5 pb-4 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-3xl font-black uppercase text-black leading-none tracking-tight">
                  WARRANTY CERTIFICATE
                </h1>
                <p className="text-[#FF5C35] text-xl font-black mt-1.5" dir="rtl">شهادة ضمان</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">YOUR VEHICLE. OUR COMMITMENT.</p>
              </div>

              <div className="shrink-0 border border-gray-200 rounded-xl p-3 flex items-center gap-4 bg-gray-50/50 self-stretch sm:self-auto justify-between sm:justify-start">
                <div className="text-left">
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">WARRANTY NUMBER</p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider" dir="rtl">رقم الضمان</p>
                  <p className="text-[#FF5C35] font-black text-sm font-mono mt-1">{warrantyNumFmt}</p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div className="flex flex-col items-center">
                  <img src={qrUrl} alt="QR Verify" className="w-14 h-14 object-contain" />
                  <p className="text-[7px] text-gray-400 font-bold uppercase tracking-wider mt-1">VERIFY WARRANTY</p>
                  <p className="text-[7px] text-gray-400 font-bold uppercase tracking-wider" dir="rtl">التحقق من الضمان</p>
                </div>
              </div>
            </div>

            {/* Dates Bar */}
            <div className="grid grid-cols-3 gap-3 mx-6 mb-4">
              {dateBlocks.map(({ en, ar, icon, v }) => (
                <div key={en} className="border border-gray-200 rounded-xl p-3 bg-gray-50/30 text-left">
                  <div className="flex items-center gap-1.5 text-[#FF5C35]">
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider">{en}</span>
                  </div>
                  <p className="text-[9px] text-gray-400 font-medium mt-0.5" dir="rtl">{ar}</p>
                  <p className="text-sm font-black text-black mt-1">{v}</p>
                </div>
              ))}
            </div>

            {/* Customer Information */}
            <div className="mx-6 mb-4 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="material-symbols-outlined text-sm text-[#FF5C35]">person</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-black">CUSTOMER INFORMATION</span>
                  <span className="text-[9px] text-gray-400 font-semibold ml-2" dir="rtl">بيانات العميل</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-[9px] text-gray-400 font-medium">Customer Name / اسم العميل</p>
                    <p className="text-xs font-black text-black mt-0.5">{customerName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-medium">Phone Number / رقم الجوال</p>
                    <p className="text-xs font-black text-black mt-0.5">{phone}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-medium">Email / البريد الإلكتروني</p>
                    <p className="text-xs font-black text-black mt-0.5">{email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="mx-6 mb-4 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="material-symbols-outlined text-sm text-[#FF5C35]">directions_car</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-black">VEHICLE INFORMATION</span>
                  <span className="text-[9px] text-gray-400 font-semibold ml-2" dir="rtl">بيانات المركبة</span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-6">
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">Make / العلامة</p>
                  <p className="text-xs font-black text-black mt-0.5">{brand}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">Model / الموديل</p>
                  <p className="text-xs font-black text-black mt-0.5">{model}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">Year / سنة الصنع</p>
                  <p className="text-xs font-black text-black mt-0.5">{year}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">Color / اللون</p>
                  <p className="text-xs font-black text-black mt-0.5">{color}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">VIN / رقم الهيكل</p>
                  <p className="text-xs font-black text-black mt-0.5">{vin}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">Plate Number / رقم اللوحة</p>
                  <p className="text-xs font-black text-black mt-0.5">{plate}</p>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="mx-6 mb-4 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="material-symbols-outlined text-sm text-[#FF5C35]">verified</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-black">SERVICE DETAILS</span>
                  <span className="text-[9px] text-gray-400 font-semibold ml-2" dir="rtl">تفاصيل الخدمة</span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-6">
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[9px] text-gray-400 font-medium">Service / نوع الخدمة</p>
                  <p className="text-xs font-black text-[#FF5C35] mt-0.5">{serviceName}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">Product / المنتج المستخدم</p>
                  <p className="text-xs font-black text-black mt-0.5">{product}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">Product Model / الفئة</p>
                  <p className="text-xs font-black text-black mt-0.5">{productModel}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">Coverage Area / المساحة المشمولة</p>
                  <p className="text-xs font-black text-black mt-0.5">{coverageArea}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[9px] text-gray-400 font-medium">Installation Center / مركز التنفيذ</p>
                  <p className="text-xs font-black text-black mt-0.5">{branchName}</p>
                </div>
              </div>
            </div>

            {/* Product Authenticity Box */}
            <div className="mx-6 mb-4 bg-[#111111] text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-zinc-800 shadow-md">
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-zinc-800/80 border border-zinc-700 text-white p-2.5 rounded-xl text-center min-w-[100px]">
                  <p className="text-lg font-black tracking-widest text-white leading-none">APEAX®</p>
                  <p className="text-[7px] text-zinc-400 uppercase tracking-widest mt-1 font-semibold">BRITISH TECHNOLOGY</p>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left px-2">
                <p className="text-xs font-black text-[#FF5C35]">PRODUCT AUTHENTICITY / أصالة المنتج</p>
                <p className="text-[9px] text-zinc-300 mt-1 leading-snug">
                  We confirm that this vehicle has been protected using genuine APEAX products, manufactured with American technology and backed by advanced innovation and trusted performance.
                </p>
                <p className="text-[9px] text-zinc-400 mt-0.5 leading-snug" dir="rtl">
                  نؤكد أن هذه المركبة تم حمايتها باستخدام منتجات أصلية من APEAX، والمصنعة بتكنولوجيا امريكيه متقدمة، والتأكد من الأداء الموثوق.
                </p>
              </div>
              <div className="shrink-0 bg-zinc-800/90 border border-zinc-700 p-2.5 rounded-xl text-center min-w-[75px]">
                <p className="text-xs font-black text-white">US</p>
                <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-wider">AMERICAN TECH</p>
              </div>
            </div>

            {/* Warranty Coverage */}
            <div className="mx-6 mb-4 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="material-symbols-outlined text-sm text-[#FF5C35]">shield</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-black">WARRANTY COVERAGE</span>
                  <span className="text-[9px] text-gray-400 font-semibold ml-2" dir="rtl">نطاق الضمان</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-gray-600 font-semibold leading-relaxed">
                  This warranty covers manufacturing defects and installation-related issues as per the terms stated in this certificate.
                </p>
                <p className="text-[10px] text-gray-600 font-semibold leading-relaxed mt-0.5" dir="rtl">
                  يغطي هذا الضمان العيوب التصنيعية والمشاكل المتعلقة بالتركيب وفقاً للشروط المذكورة في هذه الشهادة.
                </p>

                <div className="grid grid-cols-3 gap-3 mt-3">
                  {coverageItems.map(({ icon, en, ar }) => (
                    <div key={en} className="border border-gray-200 rounded-xl p-3 text-center bg-gray-50/50">
                      <span className="material-symbols-outlined text-[#FF5C35] text-xl">{icon}</span>
                      <p className="text-[9px] font-black uppercase tracking-wider text-black mt-1">{en}</p>
                      <p className="text-[9px] text-gray-500 font-semibold mt-0.5" dir="rtl">{ar}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mx-6 mb-4 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="material-symbols-outlined text-sm text-[#FF5C35]">article</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-black">WARRANTY TERMS & CONDITIONS</span>
                  <span className="text-[9px] text-gray-400 font-semibold ml-2" dir="rtl">شروط وأحكام الضمان</span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  {enTerms.map((t, i) => (
                    <p key={i} className="text-[9px] text-gray-600 leading-snug font-medium">{t}</p>
                  ))}
                </div>
                <div className="space-y-1.5" dir="rtl">
                  {arTerms.map((t, i) => (
                    <p key={i} className="text-[9px] text-gray-600 leading-snug font-medium">{t}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Signature & Contact Footer */}
            <div className="mx-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-6 pt-3 border-t border-gray-200">
              <div className="text-center sm:text-left">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">AUTHORIZED SIGNATURE</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider" dir="rtl">التوقيع المعتمد</p>
                <p className="text-xl font-black italic text-black mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                  Reflecto Team
                </p>
                <p className="text-[9px] text-gray-400 font-medium" dir="rtl">فريق ريفليكتو</p>
                <div className="w-32 border-b border-dashed border-gray-300 mt-2 mx-auto sm:mx-0" />
              </div>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-600 font-semibold">
                  <span className="material-symbols-outlined text-xs text-[#FF5C35]">call</span>
                  <span>+966 55 872 2444</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-600 font-semibold">
                  <span className="material-symbols-outlined text-xs text-[#FF5C35]">mail</span>
                  <span>info@reflecto.com.sa</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-600 font-semibold">
                  <span className="material-symbols-outlined text-xs text-[#FF5C35]">language</span>
                  <span>www.reflecto.com.sa</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-600 font-semibold" dir="rtl">
                  <span className="material-symbols-outlined text-xs text-[#FF5C35]">location_on</span>
                  <span>الرياض، المملكة العربية السعودية</span>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <img src="/assets/photo/logo-dark.png" alt="REFLECTO" className="h-7 w-auto object-contain mx-auto sm:ml-auto sm:mr-0 mb-1" />
                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">PAINT PROTECTION FILM</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">MORE THAN PROTECTION</p>
              </div>
            </div>

            {/* Bottom Dark Band */}
            <div className="bg-black px-6 py-2.5 flex items-center justify-between">
              <p className="text-white text-[9px] font-black uppercase tracking-widest">REFLECTO | PREMIUM CAR PROTECTION</p>
              <p className="text-gray-300 text-[9px] font-bold" dir="rtl">حماية متكاملة لسيارتك</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modalContent, document.body);
});

export default WarrantyCertificateModal;

