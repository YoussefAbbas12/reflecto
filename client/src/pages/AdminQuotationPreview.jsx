import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';

const DEFAULT_TERMS = [
  'Quote valid for 7 days from the date of issuance.',
  'Prices are inclusive of VAT.',
  'Final price may vary based on vehicle condition and additional requests.',
  'Warranty is valid according to service terms and conditions.'
];

const AdminQuotationPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const printContainerRef = useRef(null);

  // Load quotation data from location state or sessionStorage fallback
  const [quotationData, setQuotationData] = useState(() => {
    if (location.state && location.state.quoteInfo) {
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem('reflecto_draft_quotation');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback default sample data
    }
    return {
      quoteInfo: {
        language: 'en',
        quoteNo: 'RQ-2026-000458',
        date: '17 Sep 2026',
        clientName: 'Ahmed Al-Fahad',
        phone: '+966 50 123 4567',
        vehicleDetails: 'Toyota Land Cruiser 2024',
        plateNo: 'KSA 1234 ABC',
        taxRate: 15,
        terms: DEFAULT_TERMS
      },
      selectedServices: [
        {
          id: 'ppf',
          title: 'Paint Protection Film (PPF)',
          subtitle: 'Full Body',
          description: 'Premium self-healing film protects against scratches, stone chips and environmental damage.',
          price: 7500,
          imageUrl: '/assets/photo/landing services.jpeg',
          features: [
            'Self-healing technology',
            'Scratch & stone chip protection',
            'UV resistance',
            'Crystal clear finish'
          ]
        },
        {
          id: 'nano-ceramic',
          title: 'Nano Ceramic Coating',
          subtitle: 'Exterior',
          description: 'Long-lasting ceramic coating for high gloss, UV protection and hydrophobic effect.',
          price: 2500,
          imageUrl: '/assets/photo/landaig services.jpeg',
          features: [
            'Long-lasting protection',
            'Hydrophobic effect',
            'UV & chemical resistance',
            'Enhanced gloss'
          ]
        },
        {
          id: 'thermal-tint',
          title: 'Nano Thermal Tint',
          subtitle: 'All Windows',
          description: 'Blocks heat, reduces glare and protects interior from UV rays.',
          price: 1800,
          imageUrl: '/assets/photo/landing servicess.jpeg',
          features: [
            'Heat rejection up to 70%',
            'UV protection (99%)',
            'Reduced glare',
            'Increased privacy'
          ]
        },
        {
          id: 'exterior-polishing',
          title: 'Exterior Polishing',
          subtitle: 'Full Vehicle',
          description: 'Removes minor imperfections and restores original shine.',
          price: 1200,
          imageUrl: '/assets/photo/landing servicesss.jpeg',
          features: [
            'Removes swirl marks',
            'Restores original shine',
            'Smooth finish',
            'Long-lasting results'
          ]
        }
      ]
    };
  });

  const { quoteInfo, selectedServices } = quotationData;

  // Language state for Preview Page
  const [language, setLanguage] = useState(quoteInfo?.language || 'en');
  const isAr = language === 'ar';

  const t = {
    editData: isAr ? 'تعديل البيانات' : '← Edit Details',
    previewTitle: isAr ? 'معاينة عرض السعر' : 'Price Quotation Preview',
    quoteNoLabel: isAr ? 'رقم العرض:' : 'Quote No:',
    totalLabel: isAr ? 'الإجمالي:' : 'Total:',
    downloadBtn: isAr ? 'تنزيل PDF' : 'Download PDF',

    headerTag1: isAr ? 'تقنيات متطورة.' : 'ADVANCED TECHNOLOGY.',
    headerTag2: isAr ? 'حماية مستدامة.' : 'LASTING PROTECTION.',
    heroTag: 'PRICE QUOTATION · عرض سعر',
    heroTitle1: isAr ? 'سيارتك تستحق' : 'Your Vehicle',
    heroTitle2: isAr ? 'الأفضل دائماً' : 'Deserves More',
    heroDesc: isAr
      ? 'نقدم أحدث حلول الحماية المتقدمة باستخدام تكنولوجيا عالية للمحافظة على مظهر سيارتك جديدة لفترة أطول.'
      : 'We provide advanced protection solutions using the latest technologies to keep your vehicle looking newer, longer.',

    lblQuoteNo: isAr ? 'رقم العرض' : 'Quote No.',
    lblClientName: isAr ? 'اسم العميل' : 'Client Name',
    lblVehicle: isAr ? 'تفاصيل السيارة' : 'Vehicle Details',
    lblDate: isAr ? 'التاريخ' : 'Date',
    lblPhone: isAr ? 'رقم الهاتف' : 'Phone',
    lblPlate: isAr ? 'رقم اللوحة' : 'Plate No.',

    tblServiceDetails: isAr ? 'تفاصيل الخدمات' : 'Service Details',
    tblHash: '#',
    tblService: isAr ? 'الخدمة' : 'Service',
    tblDesc: isAr ? 'الوصف' : 'Description',
    tblPrice: isAr ? 'السعر (ر.س)' : 'Price (SAR)',

    badge1Title: isAr ? 'خامات ممتازة' : 'Premium Materials',
    badge1Sub: isAr ? 'أمريكية وكندية فقط' : 'American & Canadian only',
    badge2Title: isAr ? 'ضمان 5 سنوات' : '5 Years Warranty',
    badge2Sub: isAr ? 'لكل خدمة بشكل منفصل' : 'Per service / separate for each',
    badge3Title: isAr ? 'تركيب احترافي' : 'Professional Installation',
    badge3Sub: isAr ? 'فنيين معتمدين' : 'By certified technicians',
    badge4Title: isAr ? 'فروع بجميع المناطق' : 'Nationwide Branches',
    badge4Sub: isAr ? '10 فروع بالمملكة' : '10 branches across KSA',

    termsTitle: isAr ? 'الشروط والأحكام' : 'Terms & Conditions',
    subtotal: isAr ? 'المجموع الفرعي' : 'Subtotal',
    vat: isAr ? `ضريبة القيمة المضافة (${quoteInfo?.taxRate || 15}%)` : `VAT (${quoteInfo?.taxRate || 15}%)`,
    totalAmount: isAr ? 'المبلغ الإجمالي' : 'Total Amount',

    page2Title: isAr ? 'تفاصيل بنود الخدمات' : 'Service Breakdown',

    thankYou: isAr ? 'شكراً لك' : 'Thank You',
    forChoosing: isAr ? 'لاختيارك ريفليكتو' : 'For choosing Reflecto',
    thankYouDesc: isAr
      ? 'نتطلع دائماً لتقديم أعلى مستويات العناية والحماية لسيارتك.'
      : 'We look forward to delivering the best protection for your vehicle.',
    reflectoTeam: isAr ? 'فريق ريفليكتو' : 'Reflecto Team',
    sar: isAr ? 'ر.س' : 'SAR',
    address: quoteInfo?.branch || (isAr ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, KSA'),
    lblBranch: isAr ? 'الفرع' : 'Branch',
    lblDiscount: isAr ? 'الخصم' : 'Discount',
    lblCompany: isAr ? 'الشركة' : 'Company',
    lblTaxNo: isAr ? 'الرقم الضريبي' : 'Tax No.',
    lblCarCount: isAr ? 'عدد السيارات' : 'Car Count',
  };

  // Calculations with discount support
  const subtotal = (selectedServices || []).reduce((acc, s) => acc + (Number(s.price) || 0), 0);
  const discountAmount = Number(quoteInfo?.discountAmount) || 0;
  const afterDiscount = subtotal - discountAmount;
  const vatAmount = Math.round((afterDiscount * ((quoteInfo?.taxRate || 15) / 100)) * 100) / 100;
  const totalAmount = afterDiscount + vatAmount;

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Download PDF Handler
  const handleDownloadPDF = () => {
    const element = printContainerRef.current;
    if (!element) return;

    element.classList.add('pdf-render-mode');

    const opt = {
      margin: 0,
      filename: `Quotation_${quoteInfo?.quoteNo || 'RQ-2026'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    const runPdf = () => {
      window.html2pdf().set(opt).from(element).save().then(() => {
        element.classList.remove('pdf-render-mode');
      }).catch(() => {
        element.classList.remove('pdf-render-mode');
      });
    };

    if (window.html2pdf) {
      runPdf();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        runPdf();
      };
      script.onerror = () => {
        element.classList.remove('pdf-render-mode');
        window.print();
      };
      document.body.appendChild(script);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col font-sans">


      <div className="flex flex-1 pt-20 no-print-pt">
        <div className="no-print">
          <AdminSidebar />
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden flex flex-col items-center">
          {/* Top Control Bar */}
          <div className="no-print w-full max-w-5xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/create-quotation')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/10 cursor-pointer"
              >
                {t.editData}
              </button>
              <div>
                <h1 className="text-base font-black text-white uppercase tracking-wider">
                  {t.previewTitle}
                </h1>
                <p className="text-xs text-gray-400 font-mono">
                  {t.quoteNoLabel} {quoteInfo?.quoteNo} | {t.totalLabel} {totalAmount.toLocaleString()} {t.sar}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${language === 'en' ? 'bg-[#FF5C35] text-white shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  English 🇬🇧
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${language === 'ar' ? 'bg-[#FF5C35] text-white shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  العربية 🇸🇦
                </button>
              </div>

              <button
                onClick={handleDownloadPDF}
                className="px-6 py-2.5 bg-[#FF5C35] hover:bg-[#e04b27] text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_20px_rgba(255,92,53,0.4)] flex items-center gap-2 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                {t.downloadBtn}
              </button>
            </div>
          </div>

          {/* Printable 3-Page Document Container */}
          <div ref={printContainerRef} className="print-container flex flex-col items-center gap-8 print:gap-0 print:m-0 print:p-0">

            {/* ════════════════════════════════════════════════════════
                PAGE 1: Price Quotation Summary (الصفحة الأولى الكبيرة)
               ════════════════════════════════════════════════════════ */}
            <div
              className="quotation-page w-[210mm] min-h-[295mm] h-[295mm] max-h-[295mm] bg-white text-slate-800 p-8 flex flex-col justify-between box-border relative font-sans overflow-hidden page-break shadow-2xl border border-gray-200"
              dir={isAr ? 'rtl' : 'ltr'}
            >

              {/* 1. Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/assets/photo/logo-dark.png" alt="Reflecto" className="h-10 w-auto object-contain" />
                </div>
                <div className={`${isAr ? 'border-r border-gray-300 pr-4 text-right' : 'border-l border-gray-300 pl-4 text-left'}`}>
                  <span className="text-[9px] font-extrabold tracking-widest text-gray-400 uppercase block">{t.headerTag1}</span>
                  <span className="text-[9px] font-extrabold tracking-widest text-gray-400 uppercase block">{t.headerTag2}</span>
                </div>
              </div>

              {/* 2. Dark Hero Section */}
              <div className="my-4 bg-black text-white relative overflow-hidden flex items-center min-h-[160px]">
                {/* Car image */}
                <img
                  src="/assets/photo/hero-dashboaed.jpg"
                  alt="Car"
                  className={`absolute ${isAr ? 'left-0' : 'right-0'} top-0 bottom-0 w-[52%] h-full object-cover object-center`}
                />
                {/* Gradient fade */}
                <div className={`absolute inset-0 bg-gradient-to-${isAr ? 'l' : 'r'} from-black from-40% via-black/80 via-55% to-transparent`}></div>

                {/* Text content */}
                <div className="relative z-10 p-8 max-w-[55%] space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase block">{t.heroTag}</span>
                  <h2 className="text-3xl font-black text-white leading-tight">{t.heroTitle1}<br />{t.heroTitle2}</h2>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-light pt-1">
                    {t.heroDesc}
                  </p>
                </div>
              </div>

              {/* 3. Quote Metadata Grid */}
              <div className="bg-[#f5f5f7] rounded-xl p-4 grid grid-cols-3 gap-y-3 gap-x-4 border border-gray-100 text-xs">
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">{t.lblQuoteNo}</span>
                  <span className="font-mono font-bold text-slate-900">{quoteInfo?.quoteNo}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">{quoteInfo?.clientType === 'company' ? t.lblCompany : t.lblClientName}</span>
                  <span className="font-bold text-slate-900">{quoteInfo?.clientType === 'company' ? (quoteInfo?.companyName || quoteInfo?.clientName) : quoteInfo?.clientName}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">{t.lblVehicle}</span>
                  <span className="font-bold text-slate-900">{quoteInfo?.vehicleDetails}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">{t.lblDate}</span>
                  <span className="font-bold text-slate-900">{quoteInfo?.date}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">{t.lblPhone}</span>
                  <span className="font-mono font-bold text-slate-900">{quoteInfo?.phone}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">{t.lblPlate}</span>
                  <span className="font-mono font-bold text-slate-900">{quoteInfo?.plateNo}</span>
                </div>
                {quoteInfo?.branch && (
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">{t.lblBranch}</span>
                    <span className="font-bold text-slate-900">{quoteInfo.branch}</span>
                  </div>
                )}
                {quoteInfo?.carCount > 1 && (
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">{t.lblCarCount}</span>
                    <span className="font-mono font-bold text-slate-900">{quoteInfo.carCount}</span>
                  </div>
                )}
                {quoteInfo?.clientType === 'company' && quoteInfo?.taxNumber && (
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">{t.lblTaxNo}</span>
                    <span className="font-mono font-bold text-slate-900">{quoteInfo.taxNumber}</span>
                  </div>
                )}
              </div>

              {/* 4. Service Details Table */}
              <div className="my-4 flex-1 flex flex-col justify-start">
                <h3 className="text-xs font-black uppercase text-slate-900 mb-2 tracking-wider">{t.tblServiceDetails}</h3>

                <div className="w-full flex-1 border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                  <table className="w-full border-collapse" style={{ textAlign: isAr ? 'right' : 'left' }}>
                    <thead>
                      <tr className="bg-[#f8f9fa] border-b border-gray-200 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                        <th className="p-3 text-center w-10">{t.tblHash}</th>
                        <th className="p-3 w-44">{t.tblService}</th>
                        <th className="p-3">{t.tblDesc}</th>
                        <th className={`p-3 w-28 ${isAr ? 'text-left' : 'text-right'}`}>{t.tblPrice}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {selectedServices.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="p-3 text-center font-bold text-gray-400 font-mono">{idx + 1}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={item.imageUrl || '/assets/photo/landing services.jpeg'}
                                alt={item.title}
                                className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 text-xs leading-tight">{item.title}</div>
                                {item.subtitle && <div className="text-[10px] text-gray-400">{item.subtitle}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-gray-600 text-[11px] leading-relaxed">
                            {item.description}
                          </td>
                          <td className={`p-3 font-mono font-bold text-slate-900 ${isAr ? 'text-left' : 'text-right'}`}>
                            {Number(item.price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex-1 bg-white"></div>
                </div>
              </div>

              {/* 5. Four Bottom Features Badges */}
              <div className="grid grid-cols-4 gap-3 my-3">
                <div className="bg-[#f8f9fa] p-3 rounded-xl border border-gray-100 text-center space-y-1">
                  <div className="w-6 h-6 mx-auto text-[#FF5C35] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                  </div>
                  <div className="text-[10px] font-black text-slate-900 uppercase">{t.badge1Title}</div>
                  <div className="text-[8px] text-gray-400">{t.badge1Sub}</div>
                </div>

                <div className="bg-[#f8f9fa] p-3 rounded-xl border border-gray-100 text-center space-y-1">
                  <div className="w-6 h-6 mx-auto text-[#FF5C35] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <div className="text-[10px] font-black text-slate-900 uppercase">{t.badge2Title}</div>
                  <div className="text-[8px] text-gray-400">{t.badge2Sub}</div>
                </div>

                <div className="bg-[#f8f9fa] p-3 rounded-xl border border-gray-100 text-center space-y-1">
                  <div className="w-6 h-6 mx-auto text-[#FF5C35] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <polyline points="17 11 19 13 23 9"></polyline>
                    </svg>
                  </div>
                  <div className="text-[10px] font-black text-slate-900 uppercase">{t.badge3Title}</div>
                  <div className="text-[8px] text-gray-400">{t.badge3Sub}</div>
                </div>

                <div className="bg-[#f8f9fa] p-3 rounded-xl border border-gray-100 text-center space-y-1">
                  <div className="w-6 h-6 mx-auto text-[#FF5C35] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div className="text-[10px] font-black text-slate-900 uppercase">{t.badge4Title}</div>
                  <div className="text-[8px] text-gray-400">{t.badge4Sub}</div>
                </div>
              </div>

              {/* 6. Terms & Totals Section */}
              <div className="pt-2 border-t border-gray-200 flex items-end justify-between gap-4">
                <div className="max-w-[55%] text-[9px] text-gray-500 space-y-1">
                  <span className="font-bold text-slate-900 uppercase text-[10px] block">{t.termsTitle}</span>
                  <ul className={`list-disc ${isAr ? 'pr-3' : 'pl-3'} space-y-0.5 leading-tight`}>
                    {(quoteInfo?.terms || DEFAULT_TERMS).map((term, i) => (
                      <li key={i}>{term}</li>
                    ))}
                  </ul>
                </div>

                <div className="w-48 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-gray-500 text-[11px]">
                    <span>{t.subtotal}</span>
                    <span className="font-mono font-bold text-slate-900">{subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-600">
                      <span>{t.lblDiscount}</span>
                      <span className="font-mono font-bold">-{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-gray-500 text-[11px]">
                    <span>{t.vat}</span>
                    <span className="font-mono font-bold text-slate-900">{vatAmount.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-950 text-white p-2.5 rounded-xl flex items-center justify-between font-bold">
                    <span className="text-[10px] uppercase tracking-wider text-gray-300">{t.totalAmount}</span>
                    <span className="font-mono text-sm text-white">{totalAmount.toLocaleString()} {t.sar}</span>
                  </div>
                </div>
              </div>

              {/* 7. Bottom Dark Footer Bar */}
              <div className="mt-4 bg-slate-950 text-white rounded-xl p-3 flex items-center justify-between text-[10px] relative overflow-hidden">
                <div className="flex items-center gap-4 text-gray-300">
                  <span className="flex items-center gap-1 font-mono">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF5C35" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    +966 55 872 2444
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF5C35" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    info@reflecto.com.sa
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF5C35" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {t.address}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-gray-400">
                  <span className="font-mono text-[10px]">reflecto.com.sa</span>
                  <span className="font-bold text-gray-500">1 / 3</span>
                </div>

                <div className={`absolute ${isAr ? 'left-0' : 'right-0'} bottom-0 top-0 w-4 bg-[#FF5C35]`}></div>
              </div>

            </div>


            {/* ════════════════════════════════════════════════════════
                PAGE 2: Service Breakdown (الصفحة الثانية - أعلى اليمين)
               ════════════════════════════════════════════════════════ */}
            <div
              className="quotation-page w-[210mm] min-h-[295mm] h-[295mm] max-h-[295mm] bg-white text-slate-800 p-8 flex flex-col justify-between box-border relative font-sans overflow-hidden page-break shadow-2xl border border-gray-200"
              dir={isAr ? 'rtl' : 'ltr'}
            >

              {/* Header - Using logo-dark.png without invert filter */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/assets/photo/logo-dark.png" alt="Reflecto" className="h-10 w-auto object-contain" />
                </div>
                <div className={`${isAr ? 'border-r border-gray-300 pr-4 text-right' : 'border-l border-gray-300 pl-4 text-left'}`}>
                  <span className="text-[9px] font-extrabold tracking-widest text-gray-400 uppercase block">{t.headerTag1}</span>
                  <span className="text-[9px] font-extrabold tracking-widest text-gray-400 uppercase block">{t.headerTag2}</span>
                </div>
              </div>

              {/* Title section */}
              <div className="my-3">
                <div className="w-6 h-1 bg-[#FF5C35] mb-2 rounded-full"></div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider">{t.page2Title}</h2>
              </div>

              {/* List of services breakdown cards */}
              <div className="flex-1 space-y-4 my-2 overflow-hidden">
                {selectedServices.map((service, index) => (
                  <div key={index} className="bg-[#f8f9fa] rounded-2xl p-4 border border-gray-100 flex items-start gap-4 shadow-sm">
                    <img
                      src={service.imageUrl || '/assets/photo/landing services.jpeg'}
                      alt={service.title}
                      className="w-24 h-24 rounded-xl object-cover border border-gray-200 shrink-0"
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-extrabold text-slate-900 text-sm">{service.title}</h3>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {Number(service.price).toLocaleString()} {t.sar}
                        </span>
                      </div>

                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600">
                        {(service.features && service.features.length > 0 ? service.features : [
                          'Self-healing technology',
                          'Scratch & stone chip protection',
                          'UV resistance',
                          'Crystal clear finish'
                        ]).map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-[#FF5C35]/15 text-[#FF5C35] flex items-center justify-center text-[10px] font-bold shrink-0">
                              ✓
                            </span>
                            <span className="text-[11px]">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Four Bottom Badges */}
              <div className="grid grid-cols-4 gap-3 my-3">
                <div className="bg-[#f8f9fa] p-3 rounded-xl border border-gray-100 text-center space-y-1">
                  <div className="text-[10px] font-black text-slate-900 uppercase">{t.badge1Title}</div>
                </div>
                <div className="bg-[#f8f9fa] p-3 rounded-xl border border-gray-100 text-center space-y-1">
                  <div className="text-[10px] font-black text-slate-900 uppercase">{t.badge3Title}</div>
                </div>
                <div className="bg-[#f8f9fa] p-3 rounded-xl border border-gray-100 text-center space-y-1">
                  <div className="text-[10px] font-black text-slate-900 uppercase">{t.badge2Title}</div>
                </div>
                <div className="bg-[#f8f9fa] p-3 rounded-xl border border-gray-100 text-center space-y-1">
                  <div className="text-[10px] font-black text-slate-900 uppercase">{t.badge4Title}</div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400">
                <img src="/assets/photo/logo-dark.png" alt="Reflecto" className="h-5 w-auto object-contain opacity-70" />
                <div className="flex items-center gap-4">
                  <span className="font-mono">reflecto.com.sa</span>
                  <span className="font-bold">2 / 3</span>
                </div>
              </div>

            </div>


            {/* ════════════════════════════════════════════════════════
                PAGE 3: Thank You Page (الصفحة الثالثة - أسفل اليمين)
               ════════════════════════════════════════════════════════ */}
            <div
              className="quotation-page w-[210mm] min-h-[295mm] h-[295mm] max-h-[295mm] bg-white text-slate-800 p-8 flex flex-col justify-between box-border relative font-sans overflow-hidden page-break shadow-2xl border border-gray-200"
              dir={isAr ? 'rtl' : 'ltr'}
            >

              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/assets/photo/logo-dark.png" alt="Reflecto" className="h-10 w-auto object-contain" />
                </div>
                <div className={`${isAr ? 'border-r border-gray-300 pr-4 text-right' : 'border-l border-gray-300 pl-4 text-left'}`}>
                  <span className="text-[9px] font-extrabold tracking-widest text-gray-400 uppercase block">{t.headerTag1}</span>
                  <span className="text-[9px] font-extrabold tracking-widest text-gray-400 uppercase block">{t.headerTag2}</span>
                </div>
              </div>

              {/* Thank you Message Area */}
              <div className="my-auto py-12 space-y-6">
                <div className="w-8 h-1 bg-[#FF5C35] rounded-full"></div>
                <h2 className="text-4xl font-black text-slate-950 tracking-tight">{t.thankYou}</h2>
                <h3 className="text-xl font-bold text-gray-600">{t.forChoosing}</h3>

                <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                  {t.thankYouDesc}
                </p>

                <div className="pt-8 space-y-2">
                  <div className="w-24 h-10 border-b border-slate-900 font-serif italic text-2xl text-slate-800 flex items-end">
                    Reflecto
                  </div>
                  <span className="text-xs font-black uppercase text-slate-900 block">{t.reflectoTeam}</span>
                </div>
              </div>

              {/* Hero Dark Car Footer Container */}
              <div className="bg-slate-950 text-white rounded-xl p-7 relative overflow-hidden min-h-[210px] flex flex-col justify-between">
                {/* Car image */}
                <img
                  src="/assets/photo/hero-dashboaed.jpg"
                  alt="Car Rear"
                  className={`absolute ${isAr ? 'left-0' : 'right-0'} top-0 bottom-0 w-[55%] h-full object-cover ${isAr ? 'object-left' : 'object-right'}`}
                />
                {/* Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-${isAr ? 'l' : 'r'} from-slate-950 from-40% via-slate-950/70 to-transparent`}></div>

                <div className="relative z-10 space-y-3 text-xs text-gray-300">
                  <div className="flex items-center gap-2 font-mono text-sm text-white font-bold">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5C35" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    +966 55 872 2444
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5C35" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    info@reflecto.com.sa
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5C35" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {t.address}
                  </div>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                  <span className="font-mono">reflecto.com.sa</span>
                  <span className="font-bold">3 / 3</span>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminQuotationPreview;
