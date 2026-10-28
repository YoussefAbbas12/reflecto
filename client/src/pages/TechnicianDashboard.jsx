import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technicianService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../hooks/useLanguage';
import FadeIn from '../components/components/FadeIn';
import EmployeeCodeBadge from '../components/EmployeeCodeBadge';

const ALL_SERVICES_KEYS = [
  { key: 'heat_insulation', titleAr: 'عازل حراري', titleEn: 'Heat Insulation', icon: 'solar_power' },
  { key: 'polishing', titleAr: 'تلميع ساطع', titleEn: 'Polishing & Paint Restoration', icon: 'auto_fix_high' },
  { key: 'nano_ceramic', titleAr: 'نانو سيراميك', titleEn: 'Nano Ceramic', icon: 'shield' },
  { key: 'ppf', titleAr: 'حماية PPF', titleEn: 'Paint Protection Film (PPF)', icon: 'directions_car' },
  { key: 'removal_services', titleAr: 'خدمات إزالة', titleEn: 'Removal Services', icon: 'delete_sweep' },
];

const TechnicianDashboard = React.memo(() => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language, toggleLanguage } = useLanguage();
  const isArabic = language === 'ar';

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history' | 'commissions'
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch active work orders assigned to technician
  const { data: activeData, isLoading: isLoadingActive } = useQuery({
    queryKey: ['technicianActiveOrders'],
    queryFn: () => technicianService.getAssignedOrders(),
    refetchInterval: 15000,
  });

  // Fetch history work orders
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['technicianHistoryOrders'],
    queryFn: () => technicianService.getHistory(),
  });

  // Fetch commissions
  const { data: commissionsData, isLoading: isLoadingCommissions } = useQuery({
    queryKey: ['technicianCommissions'],
    queryFn: () => technicianService.getCommissions(),
    staleTime: 30000,
  });

  const activeOrders = useMemo(() => activeData?.data || [], [activeData]);
  const historyOrders = useMemo(() => historyData?.data || [], [historyData]);
  const commissionsInfo = useMemo(() => commissionsData?.data || { commissions: [], total_earned: 0, services_count: 0 }, [commissionsData]);
  const commissionsList = useMemo(() => commissionsInfo.commissions || [], [commissionsInfo]);

  // Keep selectedOrder in sync with latest query data
  useEffect(() => {
    if (selectedOrder) {
      const allOrders = [...activeOrders, ...historyOrders];
      const updated = allOrders.find(o => o.id === selectedOrder.id || o.uuid === selectedOrder.uuid || String(o.id) === String(selectedOrder.id));
      if (updated) {
        setSelectedOrder(prev => prev ? { ...prev, ...updated } : null);
      }
    }
  }, [activeOrders, historyOrders]);

  // Mutation to update service progress / status
  const updateMutation = useMutation({
    mutationFn: ({ orderId, payload }) => technicianService.updateServiceProgress(orderId, payload),
    onSuccess: (res, variables) => {
      toast.success(res.message || (isArabic ? 'تم تحديث حالة الخدمة بنجاح' : 'Service status updated successfully'));
      queryClient.invalidateQueries({ queryKey: ['technicianActiveOrders'] });
      queryClient.invalidateQueries({ queryKey: ['technicianHistoryOrders'] });
      if (selectedOrder) {
        const isSame = selectedOrder.id === variables.orderId ||
                       selectedOrder.uuid === variables.orderId ||
                       String(selectedOrder.id) === String(variables.orderId) ||
                       String(selectedOrder.uuid) === String(variables.orderId);
        if (isSame) {
          setSelectedOrder(prev => prev ? {
            ...prev,
            service_progress: res.data.service_progress,
            status: res.data.status,
          } : null);
        }
      }
    },
    onError: (err) => {
      toast.error(err.message || (isArabic ? 'فشل تحديث حالة الخدمة' : 'Failed to update service'));
    }
  });

  const handleToggleServiceItem = useCallback((order, serviceKey, currentStatus) => {
    const newStatus = !currentStatus;
    updateMutation.mutate({
      orderId: order.uuid || order.id,
      payload: {
        service_key: serviceKey,
        completed: newStatus
      }
    });
  }, [updateMutation]);

  const handleSetOverallStatus = useCallback((order, newStatus) => {
    if (window.confirm(isArabic ? `هل أنت متأكد من بدء العمل على الطلب #${order.work_order_number || order.id}؟` : `Start work on order #${order.work_order_number || order.id}?`)) {
      updateMutation.mutate({
        orderId: order.uuid || order.id,
        payload: {
          overall_status: newStatus
        }
      });
    }
  }, [updateMutation, isArabic]);

  const handleCompleteMyTasks = useCallback((order) => {
    if (!window.confirm(isArabic ? `هل أنت متأكد من إكمال كافة المهام الموكلة إليك للطلب #${order.work_order_number || order.id} ونقل الطلب لسجل الأعمال المكتملة؟` : `Complete all your assigned tasks for #${order.work_order_number || order.id}?`)) {
      return;
    }
    const serviceTechs = order.service_technicians || {};
    const progressObj = { ...(order.service_progress || {}) };
    const now = new Date().toISOString();

    const isTechMatch = (targetId, u) => {
      if (!targetId || !u) return false;
      const target = String(targetId).trim().toLowerCase();
      const idStr = u.id ? String(u.id).trim().toLowerCase() : '';
      const uuidStr = u.uuid ? String(u.uuid).trim().toLowerCase() : '';
      const nameStr = u.full_name ? String(u.full_name).trim().toLowerCase() : '';
      return target === idStr || target === uuidStr || target === nameStr;
    };

    ALL_SERVICES_KEYS.forEach(({ key }) => {
      const rawVal = order[key];
      let items = [];
      if (Array.isArray(rawVal)) items = rawVal;
      else if (typeof rawVal === 'string' && rawVal.trim().length > 0) {
        try { const parsed = JSON.parse(rawVal); items = Array.isArray(parsed) ? parsed : [rawVal]; } catch { items = [rawVal]; }
      } else if (rawVal && typeof rawVal === 'object') items = Object.values(rawVal);

      if (items.length === 0) return;

      const assignedTechId = serviceTechs[key];
      const isAssignedToMe = assignedTechId
        ? isTechMatch(assignedTechId, user)
        : (isTechMatch(order.technician_id, user) || isTechMatch(order.technician_name, user) || (!order.technician_id && !order.technician_name));

      if (isAssignedToMe) {
        progressObj[key] = {
          ...(progressObj[key] || {}),
          completed: true,
          started_at: progressObj[key]?.started_at || now,
          completed_at: now
        };
      }
    });

    updateMutation.mutate({
      orderId: order.uuid || order.id,
      payload: { service_progress: progressObj }
    });
  }, [user, updateMutation, isArabic]);

  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e2e1] font-body pb-20 pt-20 px-4 sm:px-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <FadeIn>
          <header className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5C24EB]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-3">
                <img src="/assets/photo/seeda.png" alt="Seeda Logo" className="h-9 w-auto object-contain" />
                <span className="px-3 py-1 bg-[#5C24EB]/20 border border-[#5C24EB]/40 text-[#8B5CF6] rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5C24EB] animate-pulse"></span>
                  {isArabic ? 'لوحة تحكم الفني المختص' : 'Technician Hub'}
                </span>
                
                {/* Language Switcher */}
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[11px] font-bold text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  {isArabic ? 'English' : 'العربية'}
                </button>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2 flex-wrap">
                  {isArabic ? 'أهلاً بك،' : 'Welcome,'} <span className="text-[#8B5CF6]">{user?.full_name || (isArabic ? 'الفني المختص' : 'Technician')}</span>
                </h1>
                <EmployeeCodeBadge isLight={false} variant="hero" />
                <span className="text-xl">🛠️</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-bold max-w-xl">
                {isArabic 
                  ? 'إدارة وسجل المهام الموكلة إليك، فحص أجزاء السيارات، ومتابعة تنفيذ الخدمات خطوة بخطوة.' 
                  : 'Manage assigned tasks, vehicle checklists, and track service progress.'}
              </p>
            </div>

            <div className="flex items-center gap-3 relative z-10 w-full md:w-auto flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`flex-1 md:flex-initial px-6 py-3 rounded-2xl font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'active'
                    ? 'bg-[#5C24EB] text-white shadow-[0_8px_25px_rgba(92,36,235,0.35)]'
                    : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-sm">engineering</span>
                {isArabic ? `المهام النشطة (${activeOrders.length})` : `Active Tasks (${activeOrders.length})`}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex-1 md:flex-initial px-6 py-3 rounded-2xl font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-[#5C24EB] text-white shadow-[0_8px_25px_rgba(92,36,235,0.35)]'
                    : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-sm">history</span>
                {isArabic ? `السجل المكتمل (${historyOrders.length})` : `Completed (${historyOrders.length})`}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('commissions')}
                className={`flex-1 md:flex-initial px-6 py-3 rounded-2xl font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'commissions'
                    ? 'bg-emerald-500 text-white shadow-[0_8px_25px_rgba(16,185,129,0.35)]'
                    : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-sm">payments</span>
                {isArabic ? `العمولات (${commissionsList.length})` : `Commissions (${commissionsList.length})`}
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (logout) await logout();
                  window.location.href = 'https://seeda.reflecto.com.sa/#login';
                }}
                className="px-4 py-3 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-2xl font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                title={isArabic ? 'تسجيل الخروج' : 'Log Out'}
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                {isArabic ? 'تسجيل الخروج' : 'Log Out'}
              </button>
            </div>
          </header>
        </FadeIn>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto space-y-4">

          {/* ── Commissions Tab ── */}
          {activeTab === 'commissions' && (
            <div className="space-y-6">
              {isLoadingCommissions ? (
                <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-gray-400 font-bold">{isArabic ? 'جاري تحميل بيانات العمولات...' : 'Loading commissions data...'}</p>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
                      <span className="material-symbols-outlined text-emerald-400 text-2xl">payments</span>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        {Number(commissionsInfo.total_earned || 0).toLocaleString()} <span className="text-sm font-bold">{isArabic ? 'ر.س' : 'SAR'}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-400">{isArabic ? 'إجمالي العمولات المكتسبة' : 'Total Earned Commissions'}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2">
                      <span className="material-symbols-outlined text-[#8B5CF6] text-2xl">task_alt</span>
                      <div className="text-2xl font-black text-white font-mono">{commissionsInfo.services_count || 0}</div>
                      <p className="text-xs font-bold text-gray-400">{isArabic ? 'إجمالي الخدمات المكتملة بعمولة' : 'Services with Commission'}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2">
                      <span className="material-symbols-outlined text-amber-400 text-2xl">trending_up</span>
                      <div className="text-2xl font-black text-amber-400 font-mono">
                        {commissionsInfo.services_count > 0 ? Number(commissionsInfo.total_earned / commissionsInfo.services_count).toFixed(0) : 0} <span className="text-sm font-bold">{isArabic ? 'ر.س' : 'SAR'}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-400">{isArabic ? 'متوسط العمولة للخدمة' : 'Avg Commission / Service'}</p>
                    </div>
                  </div>

                  {/* Commission List */}
                  {commissionsList.length === 0 ? (
                    <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl space-y-3">
                      <span className="material-symbols-outlined text-4xl text-gray-600">payments</span>
                      <p className="text-sm text-gray-400 font-bold">{isArabic ? 'لا توجد عمولات مسجلة حتى الآن.' : 'No commissions recorded yet.'}</p>
                      <p className="text-xs text-gray-500">{isArabic ? 'ستظهر العمولات هنا بعد تأكيد خدماتك من الإدارة.' : 'Commissions will appear once verified by administration.'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-2">
                        <span className="material-symbols-outlined text-emerald-400 text-base">receipt_long</span>
                        {isArabic ? 'سجل العمولات التفصيلي' : 'Commission Details Log'}
                      </h3>
                      {commissionsList.map((c) => (
                        <div
                          key={c.id || c.uuid}
                          className="bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md font-bold uppercase">
                                {c.vehicle_plate || '—'}
                              </span>
                              {c.branch_name && (
                                <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                                  {c.branch_name}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-white">{c.service_name || (isArabic ? 'خدمة صيانة' : 'Service')}</p>
                            {c.vehicle_info && (
                              <p className="text-xs text-gray-400">
                                <span className="material-symbols-outlined text-[10px] align-middle ml-1 mr-1">directions_car</span>
                                {c.vehicle_info}
                              </p>
                            )}
                            <p className="text-[10px] font-mono text-gray-500">
                              {c.created_at ? new Date(c.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xl font-black text-emerald-400 font-mono">
                              +{Number(c.amount).toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-emerald-400/70">{isArabic ? 'ر.س' : 'SAR'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Active / History Tabs ── */}
          {activeTab !== 'commissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8B5CF6] text-base">list_alt</span>
                  {activeTab === 'active' 
                    ? (isArabic ? 'أوامر العمل القائمة' : 'Active Work Orders')
                    : (isArabic ? 'الخدمات المكتملة سابقاً' : 'Completed Work Orders')}
                </h2>
                <span className="text-xs font-mono text-gray-500">Total: {displayedOrders.length}</span>
              </div>

          {(activeTab === 'active' ? isLoadingActive : isLoadingHistory) ? (
            <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="w-8 h-8 border-3 border-[#5C24EB] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-gray-400 font-bold">{isArabic ? 'جاري تحميل بيانات الأوامر والسيارات...' : 'Loading work orders...'}</p>
            </div>
          ) : displayedOrders.length === 0 ? (
            <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl space-y-3">
              <span className="material-symbols-outlined text-4xl text-gray-600">task_alt</span>
              <p className="text-sm text-gray-400 font-bold">
                {activeTab === 'active' 
                  ? (isArabic ? 'لا توجد سيارات موكلة إليك حالياً.' : 'No vehicles currently assigned to you.')
                  : (isArabic ? 'لا توجد خدمات مكتملة بالسجل.' : 'No completed services found.')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id || selectedOrder?.uuid === order.uuid;
                const progressObj = order.service_progress || {};
                
                // Calculate progress percentage
                let totalItems = 0;
                let doneItems = 0;
                ALL_SERVICES_KEYS.forEach(({ key }) => {
                  const rawVal = order[key];
                  let items = [];
                  if (Array.isArray(rawVal)) items = rawVal;
                  else if (typeof rawVal === 'string' && rawVal.trim().length > 0) {
                    try { const parsed = JSON.parse(rawVal); items = Array.isArray(parsed) ? parsed : [rawVal]; } catch { items = [rawVal]; }
                  } else if (rawVal && typeof rawVal === 'object') items = Object.values(rawVal);

                  if (items.length > 0) {
                    totalItems += 1;
                    if (progressObj[key]?.completed) doneItems += 1;
                  }
                });
                const pct = order.status === 'completed'
                  ? 100
                  : (totalItems > 0 ? Math.round((doneItems / totalItems) * 90) : 0);

                return (
                  <article
                    key={order.id}
                    className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                      isSelected
                        ? 'bg-white/[0.04] border-[#5C24EB] shadow-[0_10px_35px_rgba(92,36,235,0.25)] ring-1 ring-[#5C24EB]'
                        : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-white/20'
                    }`}
                  >
                    {/* Expandable Header Banner */}
                    <div
                      onClick={() => setSelectedOrder(isSelected ? null : order)}
                      className="p-6 cursor-pointer select-none space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[#8B5CF6] bg-[#5C24EB]/15 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                              WO-{order.work_order_number || order.id}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-xs text-gray-400 font-bold">{order.order_date?.slice(0, 10)}</span>
                          </div>
                          <h3 className="text-xl font-black text-white flex items-center gap-2">
                            <span>{order.vehicle_type || (isArabic ? 'سيارة' : 'Vehicle')}</span>
                            <span className="text-gray-400 font-normal text-sm">{order.vehicle_model} {order.vehicle_year}</span>
                          </h3>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : (pct >= 90
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30')
                          }`}>
                            {order.status === 'completed'
                              ? (isArabic ? 'مكتمل ✅' : 'Completed ✅')
                              : (pct >= 90 
                                ? (isArabic ? 'مكتمل الفنيين (90%) ⏳' : 'Tech Completed (90%) ⏳') 
                                : (order.status === 'in_progress' ? (isArabic ? 'قيد التنفيذ 🛠️' : 'In Progress 🛠️') : (isArabic ? 'جديد ⏳' : 'New ⏳')))
                            }
                          </span>
                          <span className={`material-symbols-outlined text-gray-400 text-2xl transition-transform duration-300 ${isSelected ? 'rotate-180 text-[#8B5CF6]' : ''}`}>
                            keyboard_arrow_down
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5 text-xs">
                        <div>
                          <span className="text-gray-500 block mb-0.5">{isArabic ? 'رقم اللوحة' : 'Plate Number'}</span>
                          <span className="font-bold text-amber-400 font-mono truncate block">{order.vehicle_plate || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-0.5">{isArabic ? 'الفرع' : 'Branch'}</span>
                          <span className="font-bold text-gray-300 truncate block">{order.branch_name || (isArabic ? 'فرع جدة' : 'Jeddah Branch')}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-gray-400">
                          <span>{isArabic ? 'إنجاز المهام' : 'Tasks Progress'}</span>
                          <span className="text-[#8B5CF6] font-mono">{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#5C24EB] to-[#8B5CF6] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED DETAILS BODY */}
                    {isSelected && (
                      <div className="p-6 pt-0 border-t border-white/10 space-y-6 animate-fadeIn">
                        
                        {/* Vehicle Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-2xl text-xs mt-4">
                          <div>
                            <span className="text-gray-500 block mb-1">{isArabic ? 'لون السيارة' : 'Color'}</span>
                            <span className="font-bold text-white">{order.vehicle_color || '—'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">{isArabic ? 'رقم اللوحة' : 'Plate'}</span>
                            <span className="font-bold text-amber-400 font-mono">{order.vehicle_plate || '—'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">{isArabic ? 'رقم الهيكل' : 'Chassis #'}</span>
                            <span className="font-bold text-gray-300 font-mono text-[10px] truncate block">{order.chassis_number || '—'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">{isArabic ? 'العداد (KM)' : 'Mileage (KM)'}</span>
                            <span className="font-bold text-white font-mono">{order.mileage_km || '—'}</span>
                          </div>
                        </div>

                        {/* Inspection Notes */}
                        {order.inspection_notes && (
                          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1">
                            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                              <span className="material-symbols-outlined text-sm">warning</span>
                              <span>{isArabic ? 'ملاحظات الفحص والخدوش السابقة:' : 'Pre-existing inspection notes & scratches:'}</span>
                            </div>
                            <p className="text-xs text-amber-200/90 leading-relaxed font-semibold">
                              {order.inspection_notes}
                            </p>
                          </div>
                        )}

                        {/* Requested Services Interactive Checkboxes */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#8B5CF6]">checklist</span>
                              {isArabic ? 'قائمة الخدمات والمهام المطلوبة للسيارة' : 'Requested Services Checklist'}
                            </h3>
                            <span className="text-xs text-gray-400 font-bold">{isArabic ? 'انقر للإكمال' : 'Click to complete'}</span>
                          </div>

                          <div className="space-y-3">
                            {ALL_SERVICES_KEYS.map(({ key, titleAr, titleEn, icon }) => {
                              const rawVal = order[key];
                              let items = [];
                              if (Array.isArray(rawVal)) {
                                items = rawVal;
                              } else if (typeof rawVal === 'string' && rawVal.trim().length > 0) {
                                try {
                                  const parsed = JSON.parse(rawVal);
                                  items = Array.isArray(parsed) ? parsed : [rawVal];
                                } catch {
                                  items = [rawVal];
                                }
                              } else if (rawVal && typeof rawVal === 'object') {
                                items = Object.values(rawVal);
                              }

                              const progressItem = (order.service_progress || {})[key] || {};
                              const serviceDetails = order.heat_insulation_details || {};
                              const serviceTechs = order.service_technicians || {};
                              const assignedTechId = serviceTechs[key];
                              
                              const isTechMatch = (targetId, u) => {
                                if (!targetId || !u) return false;
                                const target = String(targetId).trim().toLowerCase();
                                const idStr = u.id ? String(u.id).trim().toLowerCase() : '';
                                const uuidStr = u.uuid ? String(u.uuid).trim().toLowerCase() : '';
                                const nameStr = u.full_name ? String(u.full_name).trim().toLowerCase() : '';
                                return target === idStr || target === uuidStr || target === nameStr;
                              };

                              const isAssignedToMe = assignedTechId
                                ? isTechMatch(assignedTechId, user)
                                : (
                                    !order.technician_id && !order.technician_name
                                      ? true
                                      : isTechMatch(order.technician_id, user) || isTechMatch(order.technician_name, user)
                                  );

                              if (!isAssignedToMe) {
                                return null;
                              }

                              const validItems = items.filter(x => x !== null && x !== undefined && x !== '' && x !== 'null' && x !== '[]');
                              const hasItems = validItems.length > 0;
                              if (!hasItems && !progressItem.completed) {
                                return null;
                              }

                              const isMyAssignedService = !assignedTechId || isAssignedToMe;
                              const isDone = Boolean(progressItem.completed);

                              return (
                                <div
                                  key={key}
                                  className={`p-5 rounded-2xl border transition-all ${
                                    isDone
                                      ? 'bg-emerald-500/10 border-emerald-500/30'
                                      : isMyAssignedService
                                      ? 'bg-white/[0.04] border-[#5C24EB]/40 hover:border-[#5C24EB]'
                                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleServiceItem(order, key, isDone);
                                        }}
                                        className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                                          isDone
                                            ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                            : 'bg-white/5 border-white/20 text-transparent hover:border-[#5C24EB]'
                                        }`}
                                      >
                                        <span className="material-symbols-outlined text-base font-black">check</span>
                                      </button>

                                      <div className="space-y-1">
                                        <h4 className={`text-sm font-bold flex flex-wrap items-center gap-2 ${isDone ? 'text-emerald-400 line-through' : 'text-white'}`}>
                                          <span className="material-symbols-outlined text-sm text-[#8B5CF6]">{icon}</span>
                                          <span>{isArabic ? titleAr : titleEn}</span>
                                          {assignedTechId && isAssignedToMe && (
                                            <span className="px-2 py-0.5 bg-[#5C24EB]/20 border border-[#5C24EB]/40 text-[#8B5CF6] rounded-md text-[10px] font-bold">
                                              {isArabic ? 'موكل إليك 🛠️' : 'Assigned to you 🛠️'}
                                            </span>
                                          )}
                                        </h4>
                                        
                                        {/* List of sub-items */}
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                          {items.map((sub, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[11px] font-bold text-gray-300">
                                              {sub}{key === 'heat_insulation' && serviceDetails[sub] ? `: ${isArabic ? 'درجة' : 'shade'} ${serviceDetails[sub]}` : ''}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {progressItem.completed_at && (
                                      <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 whitespace-nowrap">
                                        {isArabic ? 'تم:' : 'Done:'} {new Date(progressItem.completed_at).toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Status Action Buttons */}
                        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                          {order.status !== 'completed' ? (
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              {order.status === 'pending' && (
                                <button
                                  type="button"
                                  disabled={updateMutation.isPending}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetOverallStatus(order, 'in_progress');
                                  }}
                                  className="flex-1 sm:flex-none px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-base">play_arrow</span>
                                  {isArabic ? 'بدء العمل على السيارة' : 'Start Working'}
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={updateMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteMyTasks(order);
                                }}
                                className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl shadow-[0_8px_25px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-base">task_alt</span>
                                {isArabic ? 'إكمال وتسليم المهام الموكلة إلي ✅' : 'Mark My Tasks Complete ✅'}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl">
                              <span className="material-symbols-outlined text-base">verified</span>
                              <span>{isArabic ? 'تمت عملية الصيانة والتسليم بنجاح' : 'Service Completed & Delivered'}</span>
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                  </article>
                );
              })}
            </div>
          )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default TechnicianDashboard;
