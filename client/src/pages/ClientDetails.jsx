import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import Icon from '../components/Icon';
import WarrantyCertificateModal from '../components/WarrantyCertificateModal';
import { formatPhoneDisplay } from '../utils/phone';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const AdminServiceDetailsModal = React.memo(({ item, onClose, onOpenWarranty, allWarranties }) => {
  useBodyScrollLock(Boolean(item));
  if (!item) return null;

  const calculateDuration = (start, end) => {
    if (!start) return null;
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const diffMs = endTime - startTime;
    if (diffMs <= 0) return null;
    const mins = Math.floor(diffMs / (1000 * 60));
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) return `${hrs} ساعة و ${remMins} دقيقة`;
    return `${mins} دقيقة`;
  };

  const duration = calculateDuration(item.started_at, item.completed_at);
  const progressObj = item.service_progress || {};

  const servicesList = [
    { key: 'heat_insulation', title: 'عازل حراري', items: item.heat_insulation },
    { key: 'polishing', title: 'تلميع ساطع', items: item.polishing },
    { key: 'nano_ceramic', title: 'نانو سيراميك', items: item.nano_ceramic },
    { key: 'ppf', title: 'حماية PPF', items: item.ppf },
    { key: 'removal_services', title: 'خدمات إزالة', items: item.removal_services },
  ].filter(s => Array.isArray(s.items) && s.items.length > 0);

  // Compute all warranties for this service/order
  const serviceWarranties = (() => {
    const matching = (allWarranties || []).filter(w => {
      if (item.work_order_number && w.work_order_number && String(w.work_order_number).trim() === String(item.work_order_number).trim()) return true;
      if (item.work_order_id && w.work_order_id && String(w.work_order_id) === String(item.work_order_id)) return true;
      if (item.id && w.work_order_id && String(w.work_order_id) === String(item.id)) return true;
      if (item.uuid && w.uuid && String(w.uuid) === String(item.uuid)) return true;
      return false;
    });

    if (matching.length > 0) {
      return matching.map(w => ({
        id: w.uuid || w.id,
        service: w.service_name,
        service_name: w.service_name,
        warranty_years: w.coverage_years || 5,
        unit: w.unit || 'years',
        start_date: w.start_date,
        expiry_date: w.expiry_date,
        work_order_number: w.work_order_number || item.work_order_number,
        branch_name: w.branch_name || item.branch_name || 'Reflecto Center',
        brand: w.brand || item.vehicle_type || item.brand,
        model: w.model || item.vehicle_model || item.model,
        year: w.year || item.vehicle_year || item.year,
        color: w.color || item.vehicle_color || item.color,
        vehicle_plate: w.vehicle_plate || item.vehicle_plate || item.plate,
        plate_number: w.plate_number || item.plate_number || item.vehicle_plate || item.plate,
        chassis_number: w.chassis_number || item.chassis_number,
        client_name: w.client_name,
        client_phone: w.client_phone,
      }));
    }

    const SERVICE_KEYS_MAP = {
      heat_insulation:    'عازل حراري (Heat Insulation)',
      polishing:          'تلميع خارجي (External Polishing)',
      nano_ceramic:       'نانو سيراميك (Nano Ceramic)',
      ppf:                'حماية الطلاء PPF (Paint Protection Film)',
      removal_services:   'خدمات إزالة (Removal Services)',
    };

    const spec = item.service_warranties || {};
    const derived = [];
    Object.entries(SERVICE_KEYS_MAP).forEach(([k, label]) => {
      const rawVal = item[k];
      let hasItems = false;
      if (Array.isArray(rawVal) && rawVal.length > 0) hasItems = true;
      else if (typeof rawVal === 'string' && rawVal.trim().length > 0 && rawVal !== '[]' && rawVal !== '""') hasItems = true;

      if (hasItems) {
        const sSpec = spec[k] || {};
        const durationYears = parseInt(sSpec.duration || item.warranty_years || 5);
        derived.push({
          id: `${item.work_order_number || item.id}-${k}`,
          service: label,
          service_name: label,
          warranty_years: durationYears,
          unit: sSpec.unit || 'years',
          work_order_number: item.work_order_number,
          branch_name: item.branch_name || 'Reflecto Center',
          brand: item.vehicle_type || item.brand,
          model: item.vehicle_model || item.model,
          year: item.vehicle_year || item.year,
          color: item.vehicle_color || item.color,
          vehicle_plate: item.vehicle_plate || item.plate || item.plate_number,
          plate_number: item.plate_number || item.vehicle_plate || item.plate,
          chassis_number: item.chassis_number,
          issue_date: item.completed_at || item.started_at,
        });
      }
    });

    if (derived.length > 0) return derived;

    return [{
      id: item.work_order_number || item.id,
      service: item.service || 'خدمة عناية وحماية بالمركبة',
      service_name: item.service || 'خدمة عناية وحماية بالمركبة',
      warranty_years: item.warranty_years || 5,
      work_order_number: item.work_order_number,
      brand: item.vehicle_type || item.brand,
      model: item.vehicle_model || item.model,
      year: item.vehicle_year || item.year,
      color: item.vehicle_color || item.color,
      vehicle_plate: item.vehicle_plate || item.plate,
      plate_number: item.vehicle_plate || item.plate,
      chassis_number: item.chassis_number,
      issue_date: item.completed_at || item.started_at,
    }];
  })();

  const targetOrderId = item.work_order_number || item.work_order_id || item.id || item.uuid;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 h-screen w-screen overflow-hidden overscroll-contain" dir="rtl">
      <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative overflow-hidden max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar overscroll-contain font-body text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5C35]/10 text-[#FF5C35] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">description</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">تفاصيل الخدمة والفحص الشامل</h2>
              <p className="text-xs text-gray-400 font-mono">
                Order ID: {item.work_order_number || item.id || item.uuid?.slice(0, 8)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Technician Info Banner */}
        <div className="p-4 bg-[#FF5C35]/10 border border-[#FF5C35]/20 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#FF5C35] text-2xl">engineering</span>
            <div>
              <span className="text-[11px] text-gray-400 font-bold block">الفني المسؤول عن المركبة:</span>
              <span className="text-sm font-black text-white">{item.technician_name || 'لم يحدد بعد'}</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#FF5C35] text-white rounded-full text-[10px] font-bold">
            {item.status === 'completed' ? 'مكتمل ✅' : (item.status === 'in_progress' ? 'قيد التنفيذ 🛠️' : 'مسجل ⏳')}
          </span>
        </div>

        {/* Vehicle Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-xs">
          <div>
            <span className="text-gray-500 block mb-0.5">نوع وموديل المركبة:</span>
            <span className="font-bold text-white">
              {[
                item.vehicle_type || item.brand || item.car_brand,
                item.vehicle_model || item.model || item.car_model,
                (item.vehicle_year || item.year) ? `(${item.vehicle_year || item.year})` : ''
              ].filter(Boolean).join(' ') || item.vehicle || 'سيارة العميل'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">اللون / اللوحة:</span>
            <span className="font-bold text-white">{item.vehicle_color || item.color || '—'} / {item.vehicle_plate || item.plate || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">رقم الهيكل:</span>
            <span className="font-bold text-gray-300 font-mono text-[10px] truncate block">{item.chassis_number || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">سنة الصنع / العداد:</span>
            <span className="font-bold text-white">{item.vehicle_year || item.year || '—'} / {item.mileage_km ? `${item.mileage_km} KM` : '—'}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">سنوات الضمان:</span>
            <span className="font-bold text-emerald-400">{item.warranty_years || 0} سنوات</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">النقاط المكتسبة:</span>
            <span className="font-bold text-[#FF5C35] font-mono">+{item.points_earned || 50} pts</span>
          </div>
        </div>

        {/* All Warranties for this Service / Order */}
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-lg">verified</span>
              <h3 className="font-extrabold text-white text-xs">
                الضمانات المعتمدة المرتبطة بهذه الخدمة ({serviceWarranties.length}):
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
              معتمد وساري ✓
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {serviceWarranties.map((w, idx) => (
              <div
                key={w.id || idx}
                className="p-3 bg-white/[0.03] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-xl flex items-center justify-between gap-2 transition-all"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-xs block">{w.service || w.service_name}</span>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold block">
                    مدة الضمان: {w.warranty_years} {w.unit === 'months' ? 'شهور' : 'سنوات'}
                  </span>
                  {w.expiry_date && (
                    <span className="text-[10px] text-gray-400 font-mono block">
                      ينتهي: {new Date(w.expiry_date).toLocaleDateString('ar-SA')}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenWarranty(w)}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-xs">print</span>
                  شهادة الضمان
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 text-xs">
          <h3 className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-white/5 pb-2">
            <span className="material-symbols-outlined text-[#FF5C35] text-sm">payments</span>
            العمليات المالية والدفع:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-gray-500 block mb-0.5">الإجمالي:</span>
              <span className="font-bold text-amber-400 font-mono">{(item.total_amount || item.price || 0).toLocaleString()} SAR</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5">المدفوع:</span>
              <span className="font-bold text-emerald-400 font-mono">{(item.paid_amount || 0).toLocaleString()} SAR</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5">المتبقي:</span>
              <span className={`font-bold font-mono ${Number(item.remaining_amount) > 0 ? 'text-[#FF5C35]' : 'text-emerald-400'}`}>
                {(item.remaining_amount || 0).toLocaleString()} SAR
              </span>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5">وسيلة الدفع:</span>
              <span className="font-bold text-white">{item.payment_method || 'مدى / نقداً'}</span>
            </div>
          </div>
        </div>

        {/* Timeline & Duration */}
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 text-xs">
          <h3 className="font-bold text-white text-xs flex items-center gap-1.5 mb-2">
            <span className="material-symbols-outlined text-[#FF5C35] text-sm">schedule</span>
            التوقيت الزمني والأداء:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-gray-500 block">تاريخ / بدء الخدمة:</span>
              <span className="font-bold text-white font-mono">
                {item.started_at ? new Date(item.started_at).toLocaleString('ar-SA') : (item.date || '—')}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">تاريخ / وقت الانتهاء:</span>
              <span className="font-bold text-white font-mono">
                {item.completed_at ? new Date(item.completed_at).toLocaleString('ar-SA') : 'قيد العمل'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">المدة المستغرقة:</span>
              <span className="font-bold text-[#FF5C35] font-mono">
                {duration || 'غير مسجل'}
              </span>
            </div>
          </div>
        </div>

        {/* Services & Checklist Details */}
        {servicesList.length > 0 && (
          <div id="service-checklist-section" className="space-y-3 text-xs">
            <h3 className="font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#FF5C35] text-sm">checklist</span>
              تفاصيل الخدمات والمراحل المختارة (Check List):
            </h3>
            <div className="space-y-2">
              {servicesList.map((sec) => {
                const itemProgress = progressObj[sec.key] || {};
                const isCompleted = Boolean(itemProgress.completed);
                return (
                  <div
                    key={sec.key}
                    className={`p-3 rounded-xl border flex items-center justify-between ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/[0.02] border-white/5'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${isCompleted ? 'bg-emerald-500 text-black font-bold' : 'bg-white/10 text-gray-500'
                        }`}>
                        {isCompleted ? '✓' : '•'}
                      </span>
                      <div>
                        <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>{sec.title}:</span>
                        <span className="text-gray-300 mr-2">{sec.items.join(' ، ')}</span>
                      </div>
                    </div>

                    {itemProgress.completed_at && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                        تم: {new Date(itemProgress.completed_at).toLocaleString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {item.inspection_notes && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs space-y-1">
            <span className="font-bold text-amber-400 block">ملاحظات الفحص والخدوش السابقة:</span>
            <p className="text-amber-200/90 font-medium leading-relaxed">{item.inspection_notes}</p>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="pt-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                if (targetOrderId) {
                  window.open(`/admin/order-details/${targetOrderId}`, '_blank');
                } else {
                  alert('لا يوجد كارت فحص أو أمر عمل مسجل لهذه الخدمة.');
                }
              }}
              className="py-3 px-4 bg-[#FF5C35] hover:bg-[#ff4517] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5C35]/20"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              استعراض وطباعة الـ Check List الكامل
            </button>

            {serviceWarranties.length === 1 ? (
              <button
                type="button"
                onClick={() => onOpenWarranty(serviceWarranties[0])}
                className="py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                عرض شهادة الضمان ({serviceWarranties[0].service || 'الضمان المعتمد'})
              </button>
            ) : (
              <div className="py-3 px-4 bg-white/5 border border-white/10 text-gray-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
                يوجد {serviceWarranties.length} شهادات ضمان (انقر أعلاه)
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
          >
            إغلاق التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
});

const ClientDetails = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get('id') || params.id;
  const [isWarrantyCertOpen, setIsWarrantyCertOpen] = useState(false);
  const [warrantyServiceItem, setWarrantyServiceItem] = useState(null);
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);

  const handleOpenWarrantyFromService = useCallback((serviceItem) => {
    setWarrantyServiceItem(serviceItem);
    setIsWarrantyCertOpen(true);
  }, []);

  // Search state when no client ID selected
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResultsData, isLoading: isSearching } = useQuery({
    queryKey: ['clientSearch', searchQuery],
    queryFn: () => clientService.getAll({ search: searchQuery, limit: 10 }),
    enabled: !clientId && searchQuery.trim().length > 0,
  });

  const searchClientsList = searchResultsData?.data || [];

  // Client profile query
  const { data: clientData, isLoading: isFetching, error } = useQuery({
    queryKey: ['adminClientDetails', clientId],
    queryFn: () => clientService.getById(clientId),
    enabled: !!clientId,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => clientService.resetPassword(clientId),
    onSuccess: () => {
      toast.success('تم إعادة ضبط كلمة المرور إلى 00000 بنجاح');
    },
    onError: (err) => {
      toast.error(err.message || 'فشل إعادة ضبط كلمة المرور');
    }
  });

  const [pointsInput, setPointsInput] = useState('');
  const [pointsAction, setPointsAction] = useState('add');

  const awardPointsMutation = useMutation({
    mutationFn: (data) => clientService.awardPoints(clientId, data.points, data.action, 'تعديل يدوية من لوحة التحكم'),
    onSuccess: () => {
      toast.success('تم تحديث نقاط الولاء بنجاح!');
      setPointsInput('');
      queryClient.invalidateQueries({ queryKey: ['adminClientDetails', clientId] });
    },
    onError: (err) => {
      toast.error(err.message || 'فشل تحديث النقاط');
    }
  });

  const handleUpdatePoints = useCallback((action) => {
    const pts = parseInt(pointsInput, 10);
    if (!pointsInput || isNaN(pts) || pts <= 0) {
      toast.error('يرجى إدخال عدد نقاط صحيح');
      return;
    }
    setPointsAction(action);
    awardPointsMutation.mutate({ points: pts, action });
  }, [pointsInput, clientId, awardPointsMutation, toast]);

  const handleResetPassword = useCallback(() => {
    if (window.confirm('هل أنت تأكد من تعيين كلمة مرور هذا العميل إلى 00000؟')) {
      resetPasswordMutation.mutate();
    }
  }, [resetPasswordMutation]);

  const handleSelectClient = (id) => {
    navigate(`/admin/client-details?id=${id}`);
  };

  const handleBackToSearch = () => {
    navigate('/admin/client-details');
  };

  // Search mode view if no client ID is provided
  if (!clientId) {
    return (
      <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0 selection:bg-[#FF5C35]/30">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-8" dir="rtl">
          <header className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-white">صفحة تفاصيل العملاء والاستعلام الشامل</h1>
            <p className="text-sm text-gray-400">ابحث عن أي عميل برقم الجوال أو الاسم لاستعراض تفاصيله الكاملة وسجل خدماته ونقاط الولاء.</p>
          </header>

          {/* Search Box */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <label className="block text-sm font-bold text-gray-300">البحث بالاسم أو رقم الهاتف:</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
              <input
                type="text"
                autoFocus
                placeholder="أدخل اسم العميل أو رقم الجوال (مثال: 0500000002)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pr-12 pl-4 py-4 text-white text-sm font-bold outline-none focus:border-[#FF5C35] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Results Section */}
            {isSearching ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : searchQuery.trim().length > 0 ? (
              <div className="space-y-3 pt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase">نتائج البحث ({searchClientsList.length}):</h3>
                {searchClientsList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchClientsList.map((c) => (
                      <div
                        key={c.id || c.uuid}
                        onClick={() => handleSelectClient(c.id || c.uuid)}
                        className="p-5 bg-white/[0.03] hover:bg-[#FF5C35]/10 border border-white/5 hover:border-[#FF5C35]/40 rounded-2xl transition-all cursor-pointer space-y-3 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-[#FF5C35]/15 text-[#FF5C35] font-black flex items-center justify-center text-lg">
                            {c.full_name ? c.full_name.charAt(0) : 'C'}
                          </div>
                          <span className="text-[10px] font-bold text-[#FF5C35] bg-[#FF5C35]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-[#FF5C35] group-hover:text-white transition-all">
                            عرض ملف العميل
                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </span>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white group-hover:text-[#FF5C35] transition-colors">{c.full_name}</h4>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{c.phone}</p>
                        </div>
                        {c.company_name && (
                          <div className="text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg font-bold inline-block">
                            شركة: {c.company_name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 font-bold">لم يتم العثور على عملاء ينطبق عليهم البحث.</div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 font-bold space-y-2">
                <span className="material-symbols-outlined text-4xl text-gray-600 block">manage_search</span>
                <p>اكتب اسم العميل أو رقم هاتفه أعلاه للبحث واستعراض الملف بالتفصيل.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Profile data
  const profile = clientData || {};
  const vehicle = (profile.vehicles && profile.vehicles.length > 0)
    ? profile.vehicles.map(v => `${v.brand || ''} ${v.model || ''}${v.year ? ' ' + v.year : ''}${v.plate_number ? ' (' + v.plate_number + ')' : ''}`.trim()).join(' | ')
    : (profile.current_appointment?.vehicle || (profile.car_brand || profile.car_model ? `${profile.car_brand} ${profile.car_model}`.trim() : 'لا يوجد سيارة مسجلة'));
  const loyalty = profile.loyalty || { total_points: 0 };
  const history = profile.service_history || [];
  const loyaltyHistory = loyalty.history || [];
  const vehiclesList = profile.vehicles || [];
  const clientWarranties = profile.warranties || [];

  return (
    <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0 selection:bg-[#FF5C35]/30">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-8" dir="rtl">
        {isFetching ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white/[0.02] rounded-2xl space-y-4">
            <p className="text-red-400 font-bold">تعذر تحميل بيانات العميل المحدد.</p>
            <button type="button" onClick={handleBackToSearch} className="px-6 py-2 bg-[#FF5C35] text-white font-bold rounded-xl">
              العودة لشاشة البحث
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5C35] hover:underline mb-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  العودة للبحث عن عميل آخر
                </button>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  {profile.full_name || 'ملف العميل'}
                </h1>
                <p className="text-gray-400 text-xs mt-1 font-medium font-mono">
                  معرف العميل: {clientId}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetPasswordMutation.isPending}
                  className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">lock_reset</span>
                  إعادة ضبط كلمة المرور (00000)
                </button>
              </div>
            </header>

            {/* Profile Overview Card */}
            <section className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/5">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-[#FF5C35]/15 border border-[#FF5C35]/30 flex items-center justify-center text-3xl font-black text-[#FF5C35] shrink-0">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-2xl font-extrabold text-white">{profile.full_name || '—'}</h2>
                      {profile.company && (
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">business</span>
                          {typeof profile.company === 'object' ? (profile.company.name || profile.company.company_name) : profile.company}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-[#FF5C35]/20 text-[#FF5C35] rounded-full text-xs font-bold">
                        {profile.role || 'client'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-bold">
                      <span className="flex items-center gap-1 text-white font-mono">
                        <span className="material-symbols-outlined text-sm text-gray-400">call</span>
                        {formatPhoneDisplay(profile.phone)}
                      </span>
                      {profile.email && (
                        <span className="flex items-center gap-1 font-mono">
                          <span className="material-symbols-outlined text-sm text-gray-400">mail</span>
                          {profile.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-gray-400">event</span>
                        عضو منذ {profile.member_since ? new Date(profile.member_since).getFullYear() : '2026'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loyalty Points Management */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-gray-400 block">إجمالي عدد سيارات العميل:</span>
                  <span className="text-xl font-black text-white">{vehiclesList.length || (vehicle !== 'لا يوجد سيارة مسجلة' ? 1 : 0)} سيارات</span>
                </div>

                <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 col-span-1 md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 block">رصيد نقاط الولاء الحالية:</span>
                    <span className="text-2xl font-black text-[#FF5C35] font-mono">{loyalty.total_points.toLocaleString()} pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="عدد النقاط..."
                      value={pointsInput}
                      onChange={(e) => setPointsInput(e.target.value)}
                      className="w-32 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#FF5C35] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdatePoints('add')}
                      disabled={awardPointsMutation.isPending}
                      className="px-3.5 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      إضافة
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdatePoints('deduct')}
                      disabled={awardPointsMutation.isPending}
                      className="px-3.5 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                      خصم
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Registered Vehicles Cards */}
            {vehiclesList.length > 0 && (
              <section className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/5 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF5C35]">directions_car</span>
                  مركبات وسيارات العميل المسجلة ({vehiclesList.length}):
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehiclesList.map((v, i) => (
                    <div key={v.id || i} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-xs space-y-1.5 font-bold">
                      <div className="flex items-center justify-between text-sm text-white border-b border-white/5 pb-2">
                        <span>{v.brand} {v.model}</span>
                        <span className="text-[#FF5C35] font-mono">{v.year || ''}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span>اللون: <strong className="text-white">{v.color || 'غير محدد'}</strong></span>
                        <span>اللوحة: <strong className="text-white font-mono">{v.plate || v.plate_number || '—'}</strong></span>
                      </div>
                      {v.chassis_number && (
                        <div className="text-[10px] text-gray-500 font-mono pt-1">
                          الهيكل: {v.chassis_number}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Active Warranties Section */}
            {clientWarranties.length > 0 && (
              <section className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-2xl">verified</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">شهادات الضمان المعتمدة للعميل ({clientWarranties.length})</h3>
                      <p className="text-xs text-gray-400">جميع الضمانات الفعّالة لخدمات ومركبات العميل مع إمكانية المعاينة والطباعة</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold w-fit">
                    مفعلة وسارية ✓
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientWarranties.map((w, i) => (
                    <div
                      key={w.id || w.uuid || i}
                      className="p-5 bg-white/[0.03] hover:bg-emerald-500/5 border border-white/5 hover:border-emerald-500/30 rounded-2xl transition-all space-y-3 font-bold text-xs"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                        <div>
                          <h4 className="text-sm font-black text-white">{w.service_name || w.service}</h4>
                          <span className="text-[11px] text-emerald-400 font-mono">
                            ضمان {w.coverage_years || w.warranty_years || 5} {w.unit === 'months' ? 'شهور' : 'سنوات'}
                          </span>
                        </div>
                        {w.work_order_number && (
                          <span className="text-[10px] bg-white/5 text-gray-300 font-mono px-2 py-0.5 rounded">
                            {w.work_order_number}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-gray-400 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span>المركبة:</span>
                          <span className="text-white font-semibold">{w.vehicle_name || [w.brand, w.model, w.year].filter(Boolean).join(' ') || 'سيارة العميل'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>اللوحة:</span>
                          <span className="text-white font-mono">{w.vehicle_plate || w.plate_number || '—'}</span>
                        </div>
                        {w.expiry_date && (
                          <div className="flex items-center justify-between text-gray-500">
                            <span>تاريخ الانتهاء:</span>
                            <span className="font-mono text-gray-300">{new Date(w.expiry_date).toLocaleDateString('ar-SA')}</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenWarrantyFromService(w)}
                        className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">print</span>
                        عرض وطباعة شهادة الضمان
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Service History & Checklists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Services & Checklists */}
              <section className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#FF5C35] text-2xl">checklist</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">كافة الخدمات والـ Check List</h3>
                    <p className="text-xs text-gray-400">اضغط على أي خدمة لاستعراض حالة الـ Check List والمراحل والفني والدفع</p>
                  </div>
                </div>

                {history.length > 0 ? (
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {history.map((item, i) => (
                      <article
                        key={item.id || i}
                        onClick={() => setSelectedServiceModal(item)}
                        className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-[#FF5C35]/10 hover:border-[#FF5C35]/30 transition-all cursor-pointer space-y-2 group"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-white group-hover:text-[#FF5C35] transition-colors">{item.service}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                            {item.status === 'completed' ? 'مكتمل ✅' : 'قيد العمل 🛠️'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-bold flex items-center justify-between">
                          <span>{item.vehicle}</span>
                          <span className="text-[#FF5C35] text-[11px] font-bold flex items-center gap-1">
                            فحص التفاصيل والـ Checklist
                            <span className="material-symbols-outlined text-xs">visibility</span>
                          </span>
                        </p>
                        <div className="flex justify-between items-center text-xs text-gray-500 border-t border-white/5 pt-2 font-mono">
                          <span>{item.date || item.preferred_date}</span>
                          <span className="text-white font-bold">{item.currency || 'SAR'} {(item.price || 0).toLocaleString()}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 font-bold">لا يوجد سجل خدمات مسجل لهذا العميل.</div>
                )}
              </section>

              {/* Loyalty Transactions Log */}
              <section className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#FF5C35] text-2xl">stars</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">سجل نقاط الولاء التفصيلي</h3>
                    <p className="text-xs text-gray-400">مسجل تحته التاريخ باليوم والساعة والدقيقة وشرح عملية الاكتساب أو التحويل</p>
                  </div>
                </div>

                {loyaltyHistory.length > 0 ? (
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {loyaltyHistory.map((t, i) => {
                      const matchingService = history.find(h => {
                        if (t.work_order_uuid && (h.uuid === t.work_order_uuid || h.id === t.work_order_uuid)) return true;
                        if (t.appointment_id && (h.id === t.appointment_id || h.uuid === t.appointment_id)) return true;
                        if (h.work_order_number && t.description && t.description.includes(h.work_order_number)) return true;
                        if (h.service && t.description && t.description.toLowerCase().includes(h.service.toLowerCase())) return true;
                        return false;
                      }) || (t.description && (t.description.includes('خدمة') || t.description.includes('Check') || t.description.includes('تقييم')) ? history[0] : null);

                      return (
                        <div
                          key={t.id || i}
                          onClick={() => {
                            if (matchingService) {
                              setSelectedServiceModal(matchingService);
                            }
                          }}
                          className={`p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all ${matchingService ? 'hover:bg-[#FF5C35]/10 hover:border-[#FF5C35]/30 cursor-pointer group' : ''
                            }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-white text-sm group-hover:text-[#FF5C35] transition-colors">{t.description || 'معاملة نقاط'}</p>
                              {matchingService && (
                                <span className="text-[10px] bg-[#FF5C35]/20 text-[#FF5C35] px-2 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0">
                                  عرض الخدمة
                                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-[11px] font-mono flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-gray-500">schedule</span>
                              {t.date || '—'}
                            </p>
                          </div>
                          <div className="text-left shrink-0">
                            <span className={`text-base font-black font-mono ${t.points > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {t.points > 0 ? `+${t.points}` : t.points} pts
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 font-bold">لا يوجد معاملات نقاط ولاء مسجلة.</div>
                )}
              </section>
            </div>
          </>
        )}
      </main>

      <WarrantyCertificateModal
        isOpen={isWarrantyCertOpen}
        onClose={() => { setIsWarrantyCertOpen(false); setWarrantyServiceItem(null); }}
        data={warrantyServiceItem ? {
          client_name: warrantyServiceItem.client_name || profile.full_name,
          client_phone: warrantyServiceItem.client_phone || profile.phone,
          client_email: warrantyServiceItem.client_email || profile.email,
          brand: warrantyServiceItem.brand || warrantyServiceItem.vehicle_type || warrantyServiceItem.car_brand || profile.car_brand,
          model: warrantyServiceItem.model || warrantyServiceItem.vehicle_model || warrantyServiceItem.car_model || profile.car_model,
          year: warrantyServiceItem.year || warrantyServiceItem.vehicle_year || warrantyServiceItem.car_year,
          color: warrantyServiceItem.color || warrantyServiceItem.vehicle_color || warrantyServiceItem.car_color,
          vehicle_plate: warrantyServiceItem.plate_number || warrantyServiceItem.vehicle_plate || warrantyServiceItem.plate || profile.plate_number || profile.plate,
          plate_number: warrantyServiceItem.plate_number || warrantyServiceItem.vehicle_plate || warrantyServiceItem.plate || profile.plate_number || profile.plate,
          chassis_number: warrantyServiceItem.chassis_number || profile.chassis_number,
          service: warrantyServiceItem.service_name || warrantyServiceItem.service,
          service_name: warrantyServiceItem.service_name || warrantyServiceItem.service,
          work_order_number: warrantyServiceItem.work_order_number,
          id: warrantyServiceItem.id || warrantyServiceItem.uuid,
          warranty_years: warrantyServiceItem.coverage_years || warrantyServiceItem.warranty_years || 5,
          unit: warrantyServiceItem.unit || 'years',
          branch_name: warrantyServiceItem.branch_name || profile.branch_name || 'Reflecto Center',
          issue_date: warrantyServiceItem.start_date || warrantyServiceItem.issue_date || warrantyServiceItem.completed_at || warrantyServiceItem.started_at,
          expiry_date: warrantyServiceItem.expiry_date,
        } : {
          client_name: profile.full_name,
          client_phone: profile.phone,
          client_email: profile.email,
          brand: profile.car_brand || profile.current_appointment?.vehicle || 'Mercedes-Benz',
          model: profile.car_model || '',
          plate_number: profile.plate_number || profile.plate || profile.vehicle_plate,
          vehicle_plate: profile.plate_number || profile.plate || profile.vehicle_plate,
          service: profile.current_appointment?.service || 'Paint Protection Film (PPF)',
          warranty_years: 10,
        }}
      />
      <AdminServiceDetailsModal
        item={selectedServiceModal}
        onClose={() => setSelectedServiceModal(null)}
        onOpenWarranty={handleOpenWarrantyFromService}
        allWarranties={profile.warranties || []}
      />
    </div>
  );
});

export default ClientDetails;
