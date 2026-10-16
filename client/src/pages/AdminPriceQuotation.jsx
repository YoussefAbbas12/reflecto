import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import { pricingService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const BRANCHES = [
  "جدة - شارع صاري","جدة - الصفا","جدة - البوادي",
  "فرع الرياض - الفيصلية 1","فرع الرياض - الفيصلية 2",
  "فرع مكة المكرمة","فرع الطائف","فرع الدمام","فرع المدينة المنورة",
];

const QUOTATION_STATUSES = [
  { id: "draft",    label: "مسودة",       color: "text-gray-400 bg-gray-400/10 border-gray-400/20", dot: "bg-gray-400" },
  { id: "sent",     label: "تم الارسال",  color: "text-blue-400 bg-blue-400/10 border-blue-400/20", dot: "bg-blue-400" },
  { id: "approved", label: "تم الموافقة", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
  { id: "rejected", label: "مرفوض",       color: "text-red-400 bg-red-400/10 border-red-400/20", dot: "bg-red-400" },
];

const PRESET_SERVICES = [
  {
    id: "ppf", title: "Paint Protection Film (PPF)", subtitle: "Full Body",
    description: "Premium self-healing film protects against scratches and stone chips.",
    price: 7500, imageUrl: "/assets/photo/landing services.jpeg",
    features: ["Self-healing technology","Scratch protection","UV resistance","Crystal clear finish"],
  },
  {
    id: "nano-ceramic", title: "Nano Ceramic Coating", subtitle: "Exterior",
    description: "Long-lasting ceramic coating for high gloss and hydrophobic effect.",
    price: 2500, imageUrl: "/assets/photo/landaig services.jpeg",
    features: ["Long-lasting protection","Hydrophobic effect","UV resistance","Enhanced gloss"],
  },
  {
    id: "thermal-tint", title: "Nano Thermal Tint", subtitle: "All Windows",
    description: "Blocks heat and reduces glare from all windows.",
    price: 1800, imageUrl: "/assets/photo/landing servicess.jpeg",
    features: ["Heat rejection 70%","UV protection 99%","Reduced glare","Increased privacy"],
  },
  {
    id: "exterior-polishing", title: "Exterior Polishing", subtitle: "Full Vehicle",
    description: "Removes minor imperfections and restores original shine.",
    price: 1200, imageUrl: "/assets/photo/landing servicesss.jpeg",
    features: ["Removes swirl marks","Restores shine","Smooth finish","Long-lasting results"],
  },
  {
    id: "dash-cam", title: "Dash Cam Systems", subtitle: "Front and Rear 4K",
    description: "High definition 24/7 surveillance with night vision.",
    price: 1500, imageUrl: "/assets/photo/dash-came.jpeg",
    features: ["4K Ultra HD","24/7 Surveillance","Night Vision","GPS and Wi-Fi"],
  },
  {
    id: "commercial-tint", title: "Commercial Window Tinting", subtitle: "Building and Glass",
    description: "Solar control film for residential and commercial structures.",
    price: 2000, imageUrl: "/assets/photo/1.jpeg",
    features: ["Heat Reduction","Energy Savings","UV Protection","Sleek Finish"],
  },
];

const DEFAULT_TERMS = [
  "Quote valid for 7 days from issuance.",
  "Prices are inclusive of VAT (15%).",
  "Final price may vary based on vehicle condition.",
  "Warranty is valid per service terms and conditions.",
];

const STORAGE_KEY = "reflecto_quotations_list";

const generateQuoteNo = (list) => {
  const year = new Date().getFullYear();
  const nums = list
    .map(q => { const m = (q.quoteInfo?.quoteNo || "").match(/RQ-\d{4}-(\d+)/); return m ? parseInt(m[1]) : 0; })
    .filter(n => n > 0);
  const next = String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, "0");
  return "RQ-" + year + "-" + next;
};

const loadQs = () => { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; } };
const saveQs = (list) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {} };

const StatusBadge = ({ status }) => {
  const s = QUOTATION_STATUSES.find(x => x.id === status) || QUOTATION_STATUSES[0];
  return (
    <span className={"inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border " + s.color}>
      <span className={"w-1.5 h-1.5 rounded-full " + s.dot} />
      {s.label}
    </span>
  );
};

const buildNew = (list) => ({
  language: "en",
  quoteNo: generateQuoteNo(list),
  date: new Date().toISOString().slice(0, 10),
  clientType: "individual",
  clientName: "",
  phone: "",
  companyName: "",
  taxNumber: "",
  commercialRegister: "",
  vehicleDetails: "",
  plateNo: "",
  carCount: 1,
  branch: "جدة - الصفا",
  taxRate: 15,
  discountType: "none",
  discountValue: 0,
  status: "draft",
  terms: DEFAULT_TERMS,
});

const AdminPriceQuotation = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canView   = hasPermission('view_quotations');
  const canCreate = hasPermission('create_quotation');
  const canEdit   = hasPermission('edit_quotation');
  const canDelete = hasPermission('delete_quotation');

  const [view, setView] = useState("list");
  const [editIdx, setEditIdx] = useState(null);
  const [quotations, setQuotations] = useState(() => loadQs());
  const [apiPkgs, setApiPkgs] = useState([]);
  const [quoteInfo, setQuoteInfo] = useState(() => buildNew(loadQs()));
  const [services, setServices] = useState([
    PRESET_SERVICES[0], PRESET_SERVICES[1], PRESET_SERVICES[2], PRESET_SERVICES[3],
  ]);

  useEffect(() => {
    pricingService.getAll().then(r => { if (r?.data) setApiPkgs(r.data); }).catch(() => {});
  }, []);

  const subtotal = useMemo(() => services.reduce((a, s) => a + (Number(s.price) || 0), 0), [services]);

  const discAmt = useMemo(() => {
    if (quoteInfo.discountType === "amount") return Number(quoteInfo.discountValue) || 0;
    if (quoteInfo.discountType === "percent") return Math.round(subtotal * (Number(quoteInfo.discountValue) || 0) / 100);
    return 0;
  }, [subtotal, quoteInfo.discountType, quoteInfo.discountValue]);

  const afterDisc = subtotal - discAmt;
  const vatAmt = useMemo(() => Math.round(afterDisc * (quoteInfo.taxRate / 100) * 100) / 100, [afterDisc, quoteInfo.taxRate]);
  const total = afterDisc + vatAmt;

  const addPreset = (id) => {
    const f = PRESET_SERVICES.find(p => p.id === id);
    if (f) setServices(p => [...p, { ...f, id: f.id + "-" + Date.now() }]);
  };
  const addApiPkg = (pkg) => setServices(p => [...p, {
    id: "api-" + (pkg.id || Date.now()),
    title: pkg.name_en || pkg.name || "Package",
    subtitle: pkg.tagline_en || "",
    description: pkg.description || "",
    price: Number(pkg.price) || 0,
    imageUrl: "/assets/photo/landing services.jpeg",
    features: Array.isArray(pkg.features_en) ? pkg.features_en : [],
  }]);
  const addCustom = () => setServices(p => [...p, {
    id: "custom-" + Date.now(), title: "Custom Service", subtitle: "Optional",
    description: "Custom solution.", price: 1000, imageUrl: "/assets/photo/landing services.jpeg",
    features: ["Professional Service"],
  }]);
  const removeSvc = (i) => setServices(p => p.filter((_, idx) => idx !== i));
  const updateSvc = (i, field, val) => setServices(p => { const u = [...p]; u[i] = { ...u[i], [field]: val }; return u; });
  const updateFeat = (si, fi, v) => setServices(p => {
    const u = [...p]; const f = [...(u[si].features || [])]; f[fi] = v; u[si] = { ...u[si], features: f }; return u;
  });
  const addFeat = (si) => setServices(p => {
    const u = [...p]; u[si] = { ...u[si], features: [...(u[si].features || []), "New feature"] }; return u;
  });
  const removeFeat = (si, fi) => setServices(p => {
    const u = [...p]; u[si] = { ...u[si], features: (u[si].features || []).filter((_, i) => i !== fi) }; return u;
  });

  const openNew = () => {
    setQuoteInfo(buildNew(quotations));
    setServices([PRESET_SERVICES[0], PRESET_SERVICES[1], PRESET_SERVICES[2], PRESET_SERVICES[3]]);
    setEditIdx(null); setView("form");
  };
  const openEdit = (idx) => {
    const q = quotations[idx];
    setQuoteInfo({ ...q.quoteInfo });
    setServices(q.services || []);
    setEditIdx(idx); setView("form");
  };

  const doPreview = (overrideIdx = null) => {
    const payload = overrideIdx !== null
      ? { quoteInfo: quotations[overrideIdx].quoteInfo, selectedServices: quotations[overrideIdx].services || [] }
      : { quoteInfo: { ...quoteInfo, discountAmount: discAmt }, selectedServices: services };
    sessionStorage.setItem("reflecto_draft_quotation", JSON.stringify(payload));
    navigate("/admin/quotation-preview", { state: payload });
  };

  const doSave = () => {
    const entry = {
      id: editIdx !== null ? quotations[editIdx].id : Date.now(),
      quoteInfo: { ...quoteInfo, discountAmount: discAmt },
      services,
      savedAt: new Date().toISOString(),
    };
    const nl = editIdx !== null
      ? quotations.map((q, i) => i === editIdx ? entry : q)
      : [entry, ...quotations];
    setQuotations(nl); saveQs(nl); setView("list"); setEditIdx(null);
  };

  const updateStatus = (idx, st) => {
    const nl = quotations.map((q, i) => i === idx ? { ...q, quoteInfo: { ...q.quoteInfo, status: st } } : q);
    setQuotations(nl); saveQs(nl);
  };

  const doDelete = (idx) => {
    if (!window.confirm("هل أنت متأكد من حذف عرض السعر هذا؟")) return;
    const nl = quotations.filter((_, i) => i !== idx);
    setQuotations(nl); saveQs(nl);
  };

  const inp = "w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:border-[#FF5C35] focus:outline-none transition-colors";
  const lbl = "block text-gray-400 mb-1.5 text-xs font-bold";

  /* ═══════════ LIST VIEW ═══════════ */
  if (view === "list") return (
    <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-24 md:pt-8 selection:bg-[#FF5C35]/30">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-12 pt-8 space-y-8" aria-labelledby="quotations-heading">

        {/* Access Guard */}
        {!canView ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
            <h2 className="text-2xl font-bold text-white">عفواً، لا تملك صلاحية عرض عروض الأسعار</h2>
            <p className="text-gray-400 text-sm">تواصل مع السوبر أدمن للحصول على صلاحية (view_quotations)</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-2 text-xs font-bold uppercase tracking-wider">
                  <span>Reflecto Admin</span>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <span className="text-[#FF5C35]">Price Quotations</span>
                </div>
                <h1 id="quotations-heading" className="text-3xl md:text-5xl font-display font-black text-white tracking-tight flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl md:text-4xl text-[#FF5C35] bg-[#FF5C35]/10 p-2 rounded-2xl border border-[#FF5C35]/20 shadow-inner" aria-hidden="true">request_quote</span>
                  <span>عروض الأسعار <span className="text-lg font-normal text-gray-400">(Price Quotations)</span></span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">إدارة وإنشاء عروض الأسعار الاحترافية للعملاء — {quotations.length} عرض محفوظ</p>
              </div>

              <button
                onClick={() => {
                  if (!canCreate) {
                    alert('عفواً، لا تملك صلاحية إنشاء عروض أسعار جديدة (create_quotation)');
                    return;
                  }
                  openNew();
                }}
                className={`px-6 py-3.5 bg-[#FF5C35] hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-[0_8px_30px_rgba(255,92,53,0.3)] transition-all flex items-center gap-2 w-fit active:scale-95 cursor-pointer ${!canCreate ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                عرض سعر جديد (New Quotation)
              </button>
            </header>

            {/* Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Quotations Stats">
              {[
                { label: 'إجمالي عروض الأسعار', value: quotations.length, icon: 'request_quote', color: 'text-[#FF5C35] bg-[#FF5C35]/10' },
                { label: 'مسودة', value: quotations.filter(q => (q.quoteInfo?.status || 'draft') === 'draft').length, icon: 'edit_note', color: 'text-gray-400 bg-gray-400/10' },
                { label: 'تم الارسال', value: quotations.filter(q => q.quoteInfo?.status === 'sent').length, icon: 'send', color: 'text-blue-400 bg-blue-400/10' },
                { label: 'تمت الموافقة', value: quotations.filter(q => q.quoteInfo?.status === 'approved').length, icon: 'check_circle', color: 'text-emerald-400 bg-emerald-400/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/[0.02] backdrop-blur-xl p-5 rounded-2xl shadow-xl flex items-center justify-between border-0">
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</div>
                    <div className={`text-2xl font-black ${stat.color.split(' ')[0]}`}>{stat.value}</div>
                  </div>
                  <span className={`material-symbols-outlined text-3xl p-2.5 rounded-xl ${stat.color}`}>{stat.icon}</span>
                </div>
              ))}
            </section>

            {/* Table */}
            <section className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-0 overflow-hidden">
              {quotations.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">request_quote</span>
                  <p className="text-gray-400 font-bold text-lg mb-2">لا توجد عروض أسعار بعد</p>
                  <p className="text-gray-600 text-xs mb-6">اضغط على زر "عرض سعر جديد" للبدء</p>
                  {canCreate && (
                    <button onClick={openNew} className="px-6 py-2.5 bg-[#FF5C35] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">
                      إنشاء عرض سعر
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="pb-4 px-4 text-right">رقم العرض</th>
                        <th className="pb-4 px-4 text-right">العميل</th>
                        <th className="pb-4 px-4 text-right">الفرع</th>
                        <th className="pb-4 px-4 text-right">التاريخ</th>
                        <th className="pb-4 px-4 text-right">الإجمالي</th>
                        <th className="pb-4 px-4 text-center">الحالة</th>
                        <th className="pb-4 px-4 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {quotations.map((q, idx) => {
                        const info = q.quoteInfo || {};
                        const sub = (q.services || []).reduce((a, s) => a + (Number(s.price) || 0), 0);
                        const disc = info.discountAmount || 0;
                        const tot = (sub - disc) + Math.round((sub - disc) * ((info.taxRate || 15) / 100) * 100) / 100;
                        const stObj = QUOTATION_STATUSES.find(s => s.id === info.status) || QUOTATION_STATUSES[0];
                        return (
                          <tr key={q.id || idx} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#FF5C35]/10 border border-[#FF5C35]/20 text-[#FF5C35] flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                                  {String(idx + 1).padStart(2, "0")}
                                </div>
                                <span className="text-white font-bold text-sm font-mono">{info.quoteNo || ("RQ-" + (idx + 1))}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-white text-sm">
                                {info.clientType === "company" ? (info.companyName || "—") : (info.clientName || "—")}
                              </div>
                              <div className="text-xs text-gray-400 font-mono">{info.phone || "—"}</div>
                            </td>
                            <td className="py-4 px-4 text-gray-300 text-xs">{info.branch || "—"}</td>
                            <td className="py-4 px-4 text-gray-400 text-xs font-mono">{info.date || "—"}</td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-emerald-400 font-mono">SAR {tot.toLocaleString()}</div>
                              <div className="text-gray-500 text-[10px]">{(q.services || []).length} خدمة شامل الضريبة</div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <select
                                value={info.status || "draft"}
                                onChange={e => updateStatus(idx, e.target.value)}
                                className={`text-[10px] font-bold px-2 py-1.5 rounded-xl border cursor-pointer outline-none bg-transparent ${stObj.color}`}
                              >
                                {QUOTATION_STATUSES.map(s => <option key={s.id} value={s.id} className="bg-[#111] text-white">{s.label}</option>)}
                              </select>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* Preview (Eye) — needs only view_quotations */}
                                <button
                                  onClick={() => doPreview(idx)}
                                  title="معاينة عرض السعر"
                                  className="p-2 rounded-lg bg-white/[0.05] hover:bg-[#FF5C35] hover:text-white text-gray-300 transition-colors shadow-inner cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-sm">visibility</span>
                                </button>
                                {/* Edit */}
                                <button
                                  onClick={() => {
                                    if (!canEdit) {
                                      alert('عفواً، لا تملك صلاحية تعديل عروض الأسعار (edit_quotation)');
                                      return;
                                    }
                                    openEdit(idx);
                                  }}
                                  title="تعديل"
                                  className={`p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white transition-colors shadow-inner ${!canEdit ? 'opacity-40 filter grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                {/* Delete */}
                                <button
                                  onClick={() => {
                                    if (!canDelete) {
                                      alert('عفواً، لا تملك صلاحية حذف عروض الأسعار (delete_quotation)');
                                      return;
                                    }
                                    doDelete(idx);
                                  }}
                                  title="حذف"
                                  className={`p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors shadow-inner ${!canDelete ? 'opacity-40 filter grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );

  /* ═══════════ FORM VIEW ═══════════ */
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col font-sans">
      <div className="flex flex-1 pt-20">
        <AdminSidebar />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden flex flex-col items-center">
          <div className="w-full max-w-4xl space-y-6">

            {/* Form header */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setView("list")} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                </button>
                <div>
                  <h1 className="text-base font-bold text-white">
                    {editIdx !== null ? "تعديل عرض سعر" : "عرض سعر جديد"}
                    <span className="text-xs text-gray-400 font-normal ml-2">(عرض سعر / Quotation)</span>
                  </h1>
                  <p className="text-[10px] text-gray-500 font-mono">{quoteInfo.quoteNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editIdx !== null ? (
                  /* ─── Edit mode: only Save ─── */
                  <button
                    onClick={doSave}
                    className="px-6 py-2.5 bg-[#FF5C35] hover:bg-[#e04b27] text-white rounded-xl text-xs font-bold shadow-[0_4px_20px_rgba(255,92,53,0.4)] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                    حفظ التعديلات
                  </button>
                ) : (
                  /* ─── New mode: Save + Preview ─── */
                  <>
                    <button onClick={doSave} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/10 cursor-pointer flex items-center gap-2 transition-all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                      حفظ
                    </button>
                    <button onClick={() => doPreview(null)} className="px-5 py-2.5 bg-[#FF5C35] hover:bg-[#e04b27] text-white rounded-xl text-xs font-bold shadow-[0_4px_20px_rgba(255,92,53,0.4)] flex items-center gap-2 cursor-pointer transition-all">
                      معاينة وتنزيل PDF
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Section 1: Client Info */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-xs font-bold text-[#FF5C35] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF5C35]" /> بيانات العميل وعرض السعر
                </h2>
                <span className="text-[10px] text-gray-400 bg-white/5 px-3 py-1 rounded-full font-mono">غير مرتبط بعميل محدد</span>
              </div>

              {/* Toggles row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="block text-gray-400 text-[10px] font-bold mb-2">لغة الوثيقة</span>
                  <div className="flex gap-2">
                    {["en", "ar"].map(lang => (
                      <button key={lang} type="button" onClick={() => setQuoteInfo(p => ({ ...p, language: lang }))}
                        className={"flex-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer " + (quoteInfo.language === lang ? "bg-[#FF5C35] text-white" : "bg-white/5 text-gray-400 border border-white/10")}>
                        {lang === "en" ? "English" : "العربية"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <label className={lbl}>حالة عرض السعر</label>
                  <select value={quoteInfo.status || "draft"} onChange={e => setQuoteInfo(p => ({ ...p, status: e.target.value }))} className={inp}>
                    {QUOTATION_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="block text-gray-400 text-[10px] font-bold mb-2">نوع العميل</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setQuoteInfo(p => ({ ...p, clientType: "individual" }))}
                      className={"flex-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer " + (quoteInfo.clientType === "individual" ? "bg-[#FF5C35] text-white" : "bg-white/5 text-gray-400 border border-white/10")}>
                      عميل
                    </button>
                    <button type="button" onClick={() => setQuoteInfo(p => ({ ...p, clientType: "company" }))}
                      className={"flex-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer " + (quoteInfo.clientType === "company" ? "bg-[#FF5C35] text-white" : "bg-white/5 text-gray-400 border border-white/10")}>
                      شركة
                    </button>
                  </div>
                </div>
              </div>

              {/* Main fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={lbl}>رقم عرض السعر (Quote No)</label>
                  <input type="text" value={quoteInfo.quoteNo} onChange={e => setQuoteInfo(p => ({ ...p, quoteNo: e.target.value }))} className={inp + " font-mono"} />
                </div>
                <div>
                  <label className={lbl}>تاريخ الإصدار (Date)</label>
                  <input type="date" value={quoteInfo.date} onChange={e => setQuoteInfo(p => ({ ...p, date: e.target.value }))} className={inp} />
                </div>

                {quoteInfo.clientType === "individual" && (<>
                  <div>
                    <label className={lbl}>اسم العميل (Client Name)</label>
                    <input type="text" value={quoteInfo.clientName} onChange={e => setQuoteInfo(p => ({ ...p, clientName: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>رقم الهاتف (Phone)</label>
                    <input type="text" value={quoteInfo.phone} onChange={e => setQuoteInfo(p => ({ ...p, phone: e.target.value }))} className={inp + " font-mono"} />
                  </div>
                </>)}

                {quoteInfo.clientType === "company" && (<>
                  <div>
                    <label className={lbl}>اسم الشركة (Company Name)</label>
                    <input type="text" value={quoteInfo.companyName || ""} onChange={e => setQuoteInfo(p => ({ ...p, companyName: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>رقم الهاتف (Phone)</label>
                    <input type="text" value={quoteInfo.phone} onChange={e => setQuoteInfo(p => ({ ...p, phone: e.target.value }))} className={inp + " font-mono"} />
                  </div>
                  <div>
                    <label className={lbl}>الرقم الضريبي (Tax Number)</label>
                    <input type="text" value={quoteInfo.taxNumber || ""} onChange={e => setQuoteInfo(p => ({ ...p, taxNumber: e.target.value }))} className={inp + " font-mono"} />
                  </div>
                  <div>
                    <label className={lbl}>السجل التجاري (Commercial Register)</label>
                    <input type="text" value={quoteInfo.commercialRegister || ""} onChange={e => setQuoteInfo(p => ({ ...p, commercialRegister: e.target.value }))} className={inp + " font-mono"} />
                  </div>
                </>)}

                <div>
                  <label className={lbl}>تفاصيل السيارة (Vehicle Details)</label>
                  <input type="text" value={quoteInfo.vehicleDetails} onChange={e => setQuoteInfo(p => ({ ...p, vehicleDetails: e.target.value }))} className={inp} placeholder="مثال: Toyota Land Cruiser 2024" />
                </div>
                <div>
                  <label className={lbl}>رقم اللوحة (Plate No)</label>
                  <input type="text" value={quoteInfo.plateNo} onChange={e => setQuoteInfo(p => ({ ...p, plateNo: e.target.value }))} className={inp + " font-mono"} placeholder="KSA 1234 ABC" />
                </div>
                <div>
                  <label className={lbl}>عدد السيارات (Car Count)</label>
                  <input type="number" min="1" value={quoteInfo.carCount || 1} onChange={e => setQuoteInfo(p => ({ ...p, carCount: Math.max(1, parseInt(e.target.value) || 1) }))} className={inp + " font-mono"} />
                </div>
                <div>
                  <label className={lbl}>الفرع (Branch)</label>
                  <select value={quoteInfo.branch || "جدة - الصفا"} onChange={e => setQuoteInfo(p => ({ ...p, branch: e.target.value }))} className={inp + " cursor-pointer"}>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Services */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <h2 className="text-xs font-bold text-[#FF5C35] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF5C35]" /> الخدمات (Services Checklist)
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <select onChange={e => { if (e.target.value) { addPreset(e.target.value); e.target.value = ""; } }} className="bg-black/70 border border-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:border-[#FF5C35] focus:outline-none cursor-pointer">
                    <option value="">+ إضافة خدمة</option>
                    {PRESET_SERVICES.map(s => <option key={s.id} value={s.id}>{s.title} ({s.price} SAR)</option>)}
                  </select>
                  {apiPkgs.length > 0 && (
                    <select onChange={e => { if (e.target.value) { const p = apiPkgs.find(x => String(x.id) === e.target.value); if (p) addApiPkg(p); e.target.value = ""; } }} className="bg-black/70 border border-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:border-[#FF5C35] focus:outline-none cursor-pointer">
                      <option value="">+ باقات الداتابيز</option>
                      {apiPkgs.map(p => <option key={p.id} value={p.id}>{p.name_en || p.name} ({p.price} SAR)</option>)}
                    </select>
                  )}
                  <button onClick={addCustom} className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/10 cursor-pointer">+ مخصصة</button>
                </div>
              </div>

              <div className="space-y-4">
                {services.map((svc, index) => (
                  <div key={svc.id || index} className="bg-black/50 border border-white/10 rounded-xl p-4 space-y-3 relative">
                    <button onClick={() => removeSvc(index)} className="absolute top-3 left-3 w-7 h-7 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center text-xs cursor-pointer">✕</button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pr-2">
                      <div className="sm:col-span-2">
                        <label className="block text-gray-400 mb-1 font-bold">اسم الخدمة</label>
                        <input type="text" value={svc.title} onChange={e => updateSvc(index, "title", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-[#FF5C35] focus:outline-none text-xs" />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1 font-bold">Subtitle</label>
                        <input type="text" value={svc.subtitle} onChange={e => updateSvc(index, "subtitle", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FF5C35] focus:outline-none text-xs" />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1 font-bold">السعر (SAR)</label>
                        <input type="number" value={svc.price} onChange={e => updateSvc(index, "price", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono font-bold focus:border-[#FF5C35] focus:outline-none text-xs" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-gray-400 mb-1 font-bold">الوصف</label>
                        <input type="text" value={svc.description} onChange={e => updateSvc(index, "description", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FF5C35] focus:outline-none text-xs" />
                      </div>
                    </div>
                    <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400">المميزات:</span>
                        <button onClick={() => addFeat(index)} className="text-[10px] text-[#FF5C35] font-bold cursor-pointer">+ إضافة</button>
                      </div>
                      {(svc.features || []).map((feat, fi) => (
                        <div key={fi} className="flex items-center gap-2 text-xs">
                          <span className="text-[#FF5C35] font-bold">✔</span>
                          <input type="text" value={feat} onChange={e => updateFeat(index, fi, e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded px-2.5 py-1 text-white text-xs focus:border-[#FF5C35] focus:outline-none" />
                          <button onClick={() => removeFeat(index, fi)} className="text-gray-500 hover:text-red-400 text-xs px-1 cursor-pointer">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-xs border border-dashed border-white/10 rounded-xl">لم يتم إضافة أي خدمات. اختر من القائمة أعلاه.</div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-bold">إجمالي الخدمات: <span className="text-white font-mono">{services.length}</span></span>
                <span className="text-gray-400 font-bold">
                  المجموع: <span className="text-white font-mono">{subtotal.toLocaleString()} SAR</span>
                  {discAmt > 0 && <span className="text-emerald-400 ml-2">(-{discAmt.toLocaleString()} خصم)</span>}
                </span>
              </div>
            </div>

            {/* Section 3: Discount + Tax + Terms */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
              <h2 className="text-xs font-bold text-[#FF5C35] uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="w-2 h-2 rounded-full bg-[#FF5C35]" /> الخصومات والضريبة والشروط
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={lbl}>نوع الخصم</label>
                  <select value={quoteInfo.discountType} onChange={e => setQuoteInfo(p => ({ ...p, discountType: e.target.value, discountValue: 0 }))} className={inp + " cursor-pointer"}>
                    <option value="none">بدون خصم</option>
                    <option value="amount">خصم بمبلغ ثابت (SAR)</option>
                    <option value="percent">خصم بنسبة مئوية (%)</option>
                  </select>
                </div>
                {quoteInfo.discountType !== "none" && (
                  <div>
                    <label className={lbl}>{quoteInfo.discountType === "amount" ? "مبلغ الخصم (SAR)" : "نسبة الخصم (%)"}</label>
                    <input type="number" min="0" max={quoteInfo.discountType === "percent" ? 100 : undefined} value={quoteInfo.discountValue} onChange={e => setQuoteInfo(p => ({ ...p, discountValue: e.target.value }))} className={inp + " font-mono"} />
                  </div>
                )}
                <div>
                  <label className={lbl}>نسبة الضريبة (%)</label>
                  <input type="number" value={quoteInfo.taxRate} onChange={e => setQuoteInfo(p => ({ ...p, taxRate: Number(e.target.value) || 0 }))} className={inp + " font-mono"} />
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-4 border border-white/10 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono text-white">{subtotal.toLocaleString()} SAR</span>
                </div>
                {discAmt > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>الخصم ({quoteInfo.discountType === "percent" ? quoteInfo.discountValue + "%" : "ثابت"}):</span>
                    <span className="font-mono">-{discAmt.toLocaleString()} SAR</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>الضريبة ({quoteInfo.taxRate}%):</span>
                  <span className="font-mono text-white">{vatAmt.toLocaleString()} SAR</span>
                </div>
                <div className="flex justify-between text-[#FF5C35] font-bold pt-2 border-t border-white/10 text-sm">
                  <span>الإجمالي النهائي:</span>
                  <span className="font-mono">{total.toLocaleString()} SAR</span>
                </div>
              </div>

              <div>
                <label className={lbl}>الشروط والأحكام (كل شرط في سطر):</label>
                <textarea rows="4" value={quoteInfo.terms.join("\n")} onChange={e => setQuoteInfo(p => ({ ...p, terms: e.target.value.split("\n") }))} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:border-[#FF5C35] focus:outline-none text-xs leading-relaxed" />
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end pb-8">
              {editIdx !== null ? (
                <button
                  onClick={doSave}
                  className="px-10 py-3.5 bg-[#FF5C35] hover:bg-[#e04b27] text-white rounded-2xl text-sm font-bold shadow-[0_6px_30px_rgba(255,92,53,0.5)] flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-95"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                  حفظ التعديلات
                </button>
              ) : (
                <>
                  <button onClick={doSave} className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all">
                    حفظ عرض السعر
                  </button>
                  <button onClick={() => doPreview(null)} className="px-8 py-3.5 bg-[#FF5C35] hover:bg-[#e04b27] text-white rounded-2xl text-sm font-bold shadow-[0_6px_30px_rgba(255,92,53,0.5)] flex items-center justify-center gap-3 cursor-pointer transition-all">
                    معاينة عرض السعر وتنزيل PDF
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPriceQuotation;
