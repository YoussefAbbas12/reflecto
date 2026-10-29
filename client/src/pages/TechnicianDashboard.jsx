import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  ClipboardCheck, 
  ArrowLeft, 
  ArrowRight, 
  CheckCheck, 
  Wrench, 
  AlarmClock, 
  PackagePlus, 
  LogIn, 
  LogOut,
  Wallet, 
  User, 
  Car, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Search, 
  Calendar,
  X,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Globe,
  CalendarDays,
  LayoutGrid,
  History,
  FileText,
  HelpCircle,
  Info,
  ChevronDown
} from 'lucide-react';
import { technicianService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../hooks/useLanguage';
import { Logo, VehicleArt, VehicleThumb } from '../components/seeda/Brand';
import { Card, Badge, TASK_TONE, ATT_TONE, COMM_TONE, EmptyState, Avatar } from '../components/seeda/UI';
import { TechBottomNav, TechSideNav } from '../components/seeda/TechNav';

const SERVICE_KEYS = [
  { key: 'heat_insulation', titleAr: 'عازل حراري', titleEn: 'Heat Insulation' },
  { key: 'polishing', titleAr: 'تلميع ساطع', titleEn: 'Polishing & Restoration' },
  { key: 'nano_ceramic', titleAr: 'نانو سيراميك', titleEn: 'Nano Ceramic' },
  { key: 'ppf', titleAr: 'حماية PPF', titleEn: 'PPF Film' },
  { key: 'removal_services', titleAr: 'خدمات إزالة', titleEn: 'Removal Services' },
];

export default function TechnicianDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language, toggleLanguage } = useLanguage();
  const isArabic = language === 'ar';
  const Arrow = isArabic ? ArrowLeft : ArrowRight;
  const Chevron = isArabic ? ChevronLeft : ChevronRight;

  // Active Tab: 'home' | 'tasks' | 'schedule' | 'more' | 'attendance' | 'commissions' | 'history' | 'notifications'
  const [activeTab, setActiveTab] = useState('home');
  const [taskFilter, setTaskFilter] = useState('mine'); // 'mine' | 'available' | 'in_progress' | 'completed'
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceBusy, setAttendanceBusy] = useState(false);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(0); // 0 = today, 1..6

  // 1. Fetch Assigned / Active Orders
  const { data: activeData, isLoading: isLoadingActive } = useQuery({
    queryKey: ['technicianActiveOrders'],
    queryFn: () => technicianService.getAssignedOrders(),
    refetchInterval: 15000,
  });

  // 2. Fetch Completed History Orders
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['technicianHistoryOrders'],
    queryFn: () => technicianService.getHistory(),
  });

  // 3. Fetch Commissions
  const { data: commissionsData, isLoading: isLoadingCommissions } = useQuery({
    queryKey: ['technicianCommissions'],
    queryFn: () => technicianService.getCommissions(),
    staleTime: 30000,
  });

  // 4. Fetch Attendance Today
  const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['technicianAttendanceToday'],
    queryFn: () => technicianService.getTodayAttendance(),
  });

  // 5. Fetch Attendance Month
  const { data: attendanceMonthData } = useQuery({
    queryKey: ['technicianAttendanceMonth'],
    queryFn: () => technicianService.getAttendanceMonth(),
  });

  const activeOrders = useMemo(() => activeData?.data || [], [activeData]);
  const historyOrders = useMemo(() => historyData?.data || [], [historyData]);
  const commissionsInfo = useMemo(() => commissionsData?.data || { commissions: [], total_earned: 0, services_count: 0 }, [commissionsData]);
  const commissionsList = useMemo(() => commissionsInfo.commissions || [], [commissionsInfo]);
  const todayAtt = useMemo(() => attendanceData?.data?.record || null, [attendanceData]);
  const monthSummary = useMemo(() => attendanceMonthData?.data?.summary || { present: 0, late: 0, workedMinutes: 0 }, [attendanceMonthData]);
  const monthRecords = useMemo(() => attendanceMonthData?.data?.records || [], [attendanceMonthData]);

  // Keep selectedTask in sync with latest query updates
  useEffect(() => {
    if (selectedTask) {
      const all = [...activeOrders, ...historyOrders];
      const found = all.find(o => String(o.id) === String(selectedTask.id) || String(o.uuid) === String(selectedTask.uuid));
      if (found) {
        setSelectedTask(prev => ({ ...prev, ...found }));
      }
    }
  }, [activeOrders, historyOrders]);

  const techId = user?.internal_id || user?.id;
  const isMine = useCallback((o) => {
    if (!o || !techId) return false;
    return String(o.technician_id) === String(techId) || String(o.technician_id) === String(user?.id) || (user?.full_name && o.technician_name === user.full_name);
  }, [techId, user?.full_name]);

  const isAvailable = useCallback((o) => {
    return !o.technician_id && !o.technician_name && o.status !== 'completed';
  }, []);

  // Filtered Tasks
  const displayedTasks = useMemo(() => {
    let list = [];
    if (taskFilter === 'mine') {
      list = activeOrders.filter(o => isMine(o));
    } else if (taskFilter === 'available') {
      list = activeOrders.filter(o => isAvailable(o));
    } else if (taskFilter === 'in_progress') {
      list = activeOrders.filter(o => isMine(o) && o.status === 'in_progress');
    } else if (taskFilter === 'completed') {
      list = historyOrders;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(o => 
        (o.client_name && o.client_name.toLowerCase().includes(q)) ||
        (o.vehicle_plate && o.vehicle_plate.toLowerCase().includes(q)) ||
        (o.vehicle_model && o.vehicle_model.toLowerCase().includes(q)) ||
        (o.work_order_number && o.work_order_number.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeOrders, historyOrders, taskFilter, searchQuery, isMine, isAvailable]);

  // Stats Counters
  const counts = useMemo(() => {
    const mineActive = activeOrders.filter(o => isMine(o));
    const available = activeOrders.filter(o => isAvailable(o)).length;
    const completedToday = historyOrders.filter(o => {
      if (!o.completed_at) return false;
      const today = new Date().toISOString().slice(0, 10);
      return String(o.completed_at).slice(0, 10) === today;
    }).length;
    const inProgress = mineActive.filter(o => o.status === 'in_progress').length;
    return {
      today: mineActive.length,
      available,
      completedToday,
      inProgress,
    };
  }, [activeOrders, historyOrders, isMine, isAvailable]);

  // Schedule Days (next 7 days)
  const scheduleDays = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      arr.push({
        index: i,
        date: d,
        dateStr: d.toISOString().slice(0, 10),
        weekdayShort: d.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        fullDateStr: d.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }),
      });
    }
    return arr;
  }, [isArabic]);

  // Schedule Tasks for selected day
  const scheduleTasks = useMemo(() => {
    const selDate = scheduleDays[selectedScheduleDay]?.dateStr;
    const all = [...activeOrders, ...historyOrders];
    return all.filter(o => {
      const d = o.order_date || o.created_at;
      return d && String(d).slice(0, 10) === selDate;
    });
  }, [activeOrders, historyOrders, scheduleDays, selectedScheduleDay]);

  // ─── Mutations ──────────────────────────────────────────────
  const claimMutation = useMutation({
    mutationFn: (orderId) => technicianService.claimOrder(orderId),
    onSuccess: (res) => {
      toast.success(res.message || (isArabic ? 'تم استلام المهمة بنجاح' : 'Task claimed successfully'));
      queryClient.invalidateQueries({ queryKey: ['technicianActiveOrders'] });
    },
    onError: (err) => {
      toast.error(err.message || (isArabic ? 'فشل استلام المهمة' : 'Failed to claim task'));
    }
  });

  const progressMutation = useMutation({
    mutationFn: ({ orderId, payload }) => technicianService.updateServiceProgress(orderId, payload),
    onSuccess: (res, vars) => {
      toast.success(isArabic ? 'تم تحديث حالة الخدمة' : 'Service status updated');
      queryClient.invalidateQueries({ queryKey: ['technicianActiveOrders'] });
      queryClient.invalidateQueries({ queryKey: ['technicianHistoryOrders'] });
      if (selectedTask && (String(selectedTask.id) === String(vars.orderId) || String(selectedTask.uuid) === String(vars.orderId))) {
        setSelectedTask(prev => prev ? {
          ...prev,
          service_progress: res.data?.service_progress,
          status: res.data?.status || prev.status
        } : null);
      }
    },
    onError: (err) => {
      toast.error(err.message || (isArabic ? 'فشل تحديث الخدمة' : 'Failed to update progress'));
    }
  });

  const handleToggleService = (task, serviceKey, currentStatus) => {
    progressMutation.mutate({
      orderId: task.id || task.uuid,
      payload: {
        service_key: serviceKey,
        completed: !currentStatus
      }
    });
  };

  const handlePunch = async (action, useGeo = false) => {
    setAttendanceBusy(true);
    let lat = null;
    let lng = null;

    if (useGeo && navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (e) {
        toast.warning(isArabic ? 'تعذر جلب الموقع الجغرافي، سيتم التسجيل يدوياً' : 'Could not fetch geolocation');
      }
    }

    try {
      const res = await technicianService.punchAttendance({
        action,
        method: useGeo && lat ? 'geofence' : 'manual',
        latitude: lat,
        longitude: lng
      });
      toast.success(res.message || (action === 'in' ? (isArabic ? 'تم تسجيل الحضور بنجاح' : 'Checked in') : (isArabic ? 'تم تسجيل الانصراف بنجاح' : 'Checked out')));
      queryClient.invalidateQueries({ queryKey: ['technicianAttendanceToday'] });
      queryClient.invalidateQueries({ queryKey: ['technicianAttendanceMonth'] });
    } catch (err) {
      toast.error(err.message || (isArabic ? 'فشل تسجيل الحضور' : 'Failed to punch attendance'));
    } finally {
      setAttendanceBusy(false);
    }
  };

  const getPrimaryServiceName = (o) => {
    if (o.heat_insulation?.length) return isArabic ? 'عازل حراري' : 'Heat Insulation';
    if (o.ppf?.length) return isArabic ? 'حماية PPF' : 'PPF Protection';
    if (o.nano_ceramic?.length) return isArabic ? 'نانو سيراميك' : 'Nano Ceramic';
    if (o.polishing?.length) return isArabic ? 'تلميع ساطع' : 'Polishing';
    if (o.removal_services?.length) return isArabic ? 'خدمات إزالة' : 'Removal Services';
    return isArabic ? 'خدمة عناية بالسيارة' : 'Car Care Service';
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch { return ''; }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 
    ? (isArabic ? 'صباح الخير' : 'Good Morning') 
    : (isArabic ? 'مساء الخير' : 'Good Evening');

  return (
    <div className="seeda-portal min-h-screen bg-[#F7F7FA] text-ink font-sans pb-20 lg:pb-0 lg:flex select-none">
      {/* Desktop Sidebar (TechSideNav) */}
      <TechSideNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        onLogout={logout}
        onToggleLang={toggleLanguage}
        isArabic={isArabic}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (TechTopBar) */}
        {activeTab !== 'more' && (
          <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur safe-top">
            <Logo height={28} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className="relative grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:bg-surface-sunken transition"
                aria-label="Notifications"
              >
                <Bell className="h-[21px] w-[21px]" />
                {counts.available > 0 && (
                  <span className="absolute end-2 top-2 h-2.5 w-2.5 rounded-full bg-bad-600 ring-2 ring-white" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('more')}
                className="transition hover:opacity-80"
              >
                <Avatar name={user?.full_name} size={36} />
              </button>
            </div>
          </header>
        )}

        {/* Dynamic Screens */}
        <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
          {/* ═════════════════════════════════════════════════════════════
              1. HOME (الرئيسية)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              {/* Header Title & Date */}
              <section className="mt-1">
                <p className="text-sm text-ink-muted">
                  {greeting} · {new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <h1 className="mt-0.5 text-[22px] font-bold text-ink">
                  {user?.full_name || (isArabic ? 'فني سيدا' : 'Technician')}
                </h1>
                <p className="text-sm text-ink-muted flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-brand-700">{user?.employee_code || 'RT-001'}</span>
                  <span>·</span>
                  <span>{user?.branch_name || (isArabic ? 'فرع جدة' : 'Jeddah Branch')}</span>
                </p>
              </section>

              {/* Today's Tasks Banner */}
              <button
                type="button"
                onClick={() => { setActiveTab('tasks'); setTaskFilter('mine'); }}
                className="card w-full flex items-center gap-4 p-4 text-start transition hover:shadow-lift"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <ClipboardCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{isArabic ? 'مهام اليوم' : "Today's Tasks"}</p>
                  <p className="text-xs text-ink-muted">{isArabic ? 'المهام المسندة إليك والمجدولة لليوم' : 'Assigned tasks scheduled today'}</p>
                </div>
                <div className="flex flex-col items-center text-brand-700">
                  <span className="num text-3xl font-bold leading-none">{counts.today}</span>
                  <Arrow className="mt-1 h-4 w-4" />
                </div>
              </button>

              {/* Claim New Task CTA Banner */}
              <button
                type="button"
                onClick={() => { setActiveTab('tasks'); setTaskFilter('available'); }}
                className="w-full flex items-center gap-4 rounded-2xl bg-gradient-to-l from-brand-700 to-brand-600 p-4 text-white shadow-cta transition active:scale-[.99] rtl:bg-gradient-to-r text-start"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15">
                  <PackagePlus className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-bold">{isArabic ? 'استلام مهمة جديدة' : 'Claim New Task'}</p>
                  <p className="text-xs text-white/75">
                    {counts.available > 0 
                      ? (isArabic ? `يوجد ${counts.available} مهمة متاحة للاستلام` : `${counts.available} tasks available to claim`) 
                      : (isArabic ? 'لا توجد مهام بانتظار الاستلام حالياً' : 'No available tasks currently')}
                  </p>
                </div>
                <Arrow className="h-5 w-5 opacity-80 shrink-0" />
              </button>

              {/* 3 Quick Counters */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => { setActiveTab('history'); }}
                  className="card flex flex-col items-center px-2 py-3.5 text-center transition hover:shadow-lift"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-ok-50 text-ok-600">
                    <CheckCheck className="h-[18px] w-[18px]" />
                  </span>
                  <span className="num mt-2 text-xl font-bold text-ink">{counts.completedToday}</span>
                  <span className="text-[11px] font-medium text-ink-muted">{isArabic ? 'منجز اليوم' : 'Done Today'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('tasks'); setTaskFilter('in_progress'); }}
                  className="card flex flex-col items-center px-2 py-3.5 text-center transition hover:shadow-lift"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Wrench className="h-[18px] w-[18px]" />
                  </span>
                  <span className="num mt-2 text-xl font-bold text-brand-700">{counts.inProgress}</span>
                  <span className="text-[11px] font-medium text-ink-muted">{isArabic ? 'قيد التنفيذ' : 'In Progress'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('tasks'); setTaskFilter('mine'); }}
                  className="card flex flex-col items-center px-2 py-3.5 text-center transition hover:shadow-lift"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-sunken text-ink-muted">
                    <AlarmClock className="h-[18px] w-[18px]" />
                  </span>
                  <span className="num mt-2 text-xl font-bold text-ink">{counts.today}</span>
                  <span className="text-[11px] font-medium text-ink-muted">{isArabic ? 'مهامي' : 'My Tasks'}</span>
                </button>
              </div>

              {/* Attendance Card */}
              <button
                type="button"
                onClick={() => setActiveTab('attendance')}
                className="card w-full flex items-center gap-3 p-3.5 text-start transition hover:shadow-lift"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
                  <LogIn className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{isArabic ? 'سجل الحضور اليومي' : 'Attendance Log'}</p>
                  <p className="text-xs text-ink-muted">
                    {todayAtt?.check_in_at 
                      ? (isArabic ? `تم تسجيل الدخول: ${formatTime(todayAtt.check_in_at)}` : `Checked in: ${formatTime(todayAtt.check_in_at)}`)
                      : (isArabic ? 'الوردية: 09:00 ص – 06:00 م' : 'Shift: 09:00 AM – 06:00 PM')}
                  </p>
                </div>
                <Badge tone={todayAtt ? (todayAtt.status === 'late' ? 'warn' : 'ok') : 'neutral'}>
                  {todayAtt ? (todayAtt.status === 'late' ? (isArabic ? 'متأخر' : 'Late') : (isArabic ? 'حاضر' : 'Present')) : (isArabic ? 'لم يسجل' : 'Not In')}
                </Badge>
              </button>

              {/* Commission Card */}
              <button
                type="button"
                onClick={() => setActiveTab('commissions')}
                className="card w-full block p-4 text-start transition hover:shadow-lift"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-brand-700" />
                  <p className="text-sm font-semibold">{isArabic ? 'عمولاتي ومستحقاتي' : 'My Commission'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="num text-sm font-bold">{commissionsInfo.total_earned?.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
                    <p className="text-[11px] text-ink-muted">{isArabic ? 'مستحق' : 'Earned'}</p>
                  </div>
                  <div>
                    <p className="num text-sm font-bold text-warn-700">{commissionsInfo.services_count || 0}</p>
                    <p className="text-[11px] text-ink-muted">{isArabic ? 'خدمات' : 'Services'}</p>
                  </div>
                  <div>
                    <p className="num text-sm font-bold text-ok-700">{commissionsInfo.total_earned?.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
                    <p className="text-[11px] text-ink-muted">{isArabic ? 'معتمد' : 'Confirmed'}</p>
                  </div>
                </div>
              </button>

              {/* Upcoming Appointments Preview */}
              <section className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-ink">{isArabic ? 'أقرب المواعيد والمهام' : 'Upcoming Tasks'}</h2>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('tasks'); setTaskFilter('mine'); }}
                    className="text-xs text-brand-700 font-semibold hover:underline"
                  >
                    {isArabic ? 'عرض الكل' : 'View all'}
                  </button>
                </div>

                {activeOrders.length === 0 ? (
                  <EmptyState title={isArabic ? 'لا توجد مهام نشطة حالياً' : 'No active tasks'} />
                ) : (
                  <div className="card divide-y divide-line-soft overflow-hidden">
                    {activeOrders.slice(0, 4).map((task) => (
                      <div
                        key={task.id || task.uuid}
                        onClick={() => setSelectedTask(task)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition hover:bg-surface-subtle"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">{getPrimaryServiceName(task)}</p>
                          <p className="truncate text-xs text-ink-muted">
                            {task.vehicle_model || 'سيارة'} · <span className="font-semibold text-ink-soft">{task.vehicle_plate || '—'}</span> · {task.branch_name || 'جدة'}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="num flex items-center gap-1 text-xs font-medium text-ink-soft">
                            <Clock className="h-3 w-3" />
                            {formatTime(task.created_at)}
                          </span>
                          <Badge tone={task.status === 'in_progress' ? 'brand' : (task.technician_id ? 'navy' : 'info')}>
                            {task.status === 'in_progress' ? (isArabic ? 'قيد العمل' : 'In Progress') : (task.technician_id ? (isArabic ? 'مسند' : 'Assigned') : (isArabic ? 'متاح' : 'Available'))}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              2. TASKS (المهام)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-ink">{isArabic ? 'المهام وأوامر العمل' : 'Tasks'}</h1>
                  <p className="text-xs text-ink-muted">{isArabic ? 'إدارة وتنفيذ ومتابعة أوامر العمل' : 'Manage and execute tasks'}</p>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'mine', label: isArabic ? 'مهامي' : 'My Tasks', count: counts.today },
                  { id: 'available', label: isArabic ? 'متاح للاستلام' : 'Available', count: counts.available },
                  { id: 'in_progress', label: isArabic ? 'قيد التنفيذ' : 'In Progress', count: counts.inProgress },
                  { id: 'completed', label: isArabic ? 'المكتملة' : 'Completed', count: historyOrders.length },
                ].map((f) => {
                  const active = taskFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setTaskFilter(f.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                        active
                          ? 'bg-brand-700 text-white shadow-sm'
                          : 'bg-white text-ink-soft border border-line hover:bg-surface-sunken'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-2xs ${active ? 'bg-white/20 text-white' : 'bg-surface-sunken text-ink-muted'}`}>
                        {f.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute start-3.5 top-3 h-4 w-4 text-ink-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'ابحث باللوحة أو اسم العميل أو الموديل...' : 'Search plate, client, car...'}
                  className="input ps-10 h-10 text-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute end-3 top-3 text-ink-muted hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Tasks List */}
              {displayedTasks.length === 0 ? (
                <EmptyState
                  title={isArabic ? 'لا توجد مهام مطابقة' : 'No tasks found'}
                  hint={isArabic ? 'اختر قسماً آخر أو قم بإفراغ خانة البحث' : 'Try switching filter or clear search'}
                />
              ) : (
                <div className="space-y-3">
                  {displayedTasks.map((task) => {
                    const taskUnassigned = isAvailable(task);
                    return (
                      <article key={task.id || task.uuid} className="card overflow-hidden transition hover:shadow-lift">
                        <div className="flex gap-3 p-3.5">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-1.5">
                              <Badge tone={task.status === 'completed' ? 'ok' : (task.status === 'in_progress' ? 'brand' : (taskUnassigned ? 'info' : 'navy'))} dot>
                                {task.status === 'completed' 
                                  ? (isArabic ? 'مكتمل' : 'Completed') 
                                  : (task.status === 'in_progress' ? (isArabic ? 'قيد التنفيذ' : 'In Progress') : (taskUnassigned ? (isArabic ? 'متاح للاستلام' : 'Available') : (isArabic ? 'مسند' : 'Assigned')))}
                              </Badge>
                              <span className="text-2xs font-mono text-ink-muted">#{task.work_order_number || task.id}</span>
                            </div>

                            <h3 
                              onClick={() => setSelectedTask(task)}
                              className="cursor-pointer truncate text-[15px] font-bold text-ink hover:text-brand-700"
                            >
                              {getPrimaryServiceName(task)}
                            </h3>

                            <ul className="mt-1.5 space-y-1 text-[13px] text-ink-muted">
                              <li className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{task.client_name || (isArabic ? 'عميل ريفليكتو' : 'Client')}</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Car className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{task.vehicle_model || 'سيارة'} {task.vehicle_year || ''} · {task.vehicle_plate || '—'}</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                <span className="num">{formatTime(task.created_at)}</span>
                                <span className="text-ink-faint">·</span>
                                <span>{formatDate(task.created_at)}</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{task.branch_name || (isArabic ? 'فرع جدة' : 'Branch')}</span>
                              </li>
                            </ul>
                          </div>

                          <div 
                            onClick={() => setSelectedTask(task)}
                            className="w-[104px] sm:w-[120px] shrink-0 self-start cursor-pointer"
                          >
                            <VehicleThumb color={task.vehicle_color} className="aspect-[4/3] w-full rounded-xl" />
                          </div>
                        </div>

                        {/* Action bottom bar */}
                        <div className="flex items-center justify-between border-t border-line-soft px-3.5 py-2.5 bg-surface-subtle">
                          {taskUnassigned ? (
                            <button
                              type="button"
                              disabled={claimMutation.isPending}
                              onClick={() => claimMutation.mutate(task.id || task.uuid)}
                              className="px-4 py-2 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition flex items-center gap-1.5 shadow-cta"
                            >
                              {claimMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
                              <span>{isArabic ? 'استلام المهمة' : 'Claim Task'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedTask(task)}
                              className="px-3.5 py-2 rounded-xl bg-white border border-line text-brand-700 text-xs font-semibold hover:bg-brand-50 transition flex items-center gap-1.5"
                            >
                              <Wrench className="h-4 w-4" />
                              <span>{isArabic ? 'فتح المهمة والتنفيذ' : 'Open & Execute'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedTask(task)}
                            className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1"
                          >
                            <span>{isArabic ? 'التفاصيل' : 'Details'}</span>
                            <Arrow className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              3. SCHEDULE (المواعيد)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-ink">{isArabic ? 'جدول المواعيد' : 'Schedule'}</h1>
                <p className="text-xs text-ink-muted">{isArabic ? 'المواعيد وأوامر العمل المجدولة للأيام القادمة' : 'Scheduled tasks for upcoming days'}</p>
              </div>

              {/* 7-Days Horizontal Slider */}
              <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
                {scheduleDays.map((item) => {
                  const active = selectedScheduleDay === item.index;
                  return (
                    <button
                      key={item.index}
                      type="button"
                      onClick={() => setSelectedScheduleDay(item.index)}
                      className={`flex w-14 shrink-0 flex-col items-center rounded-2xl py-2.5 transition ${
                        active 
                          ? 'bg-brand-700 text-white shadow-cta' 
                          : 'bg-white text-ink ring-1 ring-line hover:bg-surface-subtle'
                      }`}
                    >
                      <span className={`text-[11px] ${active ? 'text-white/80' : 'text-ink-muted'}`}>
                        {item.weekdayShort}
                      </span>
                      <span className="num text-lg font-bold">{item.dayNum}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Heading */}
              <p className="text-sm font-semibold text-ink-soft">
                {scheduleDays[selectedScheduleDay]?.fullDateStr}
              </p>

              {/* Tasks for that Day */}
              {scheduleTasks.length === 0 ? (
                <EmptyState 
                  title={isArabic ? 'لا توجد مواعيد مجدولة في هذا اليوم' : 'No scheduled tasks today'} 
                  hint={isArabic ? 'يمكنك استلام مهام جديدة من قسم المهام' : 'Check available tasks in the Tasks tab'}
                />
              ) : (
                <div className="card divide-y divide-line-soft overflow-hidden">
                  {scheduleTasks.map((task) => (
                    <div
                      key={task.id || task.uuid}
                      onClick={() => setSelectedTask(task)}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition hover:bg-surface-subtle"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{getPrimaryServiceName(task)}</p>
                        <p className="truncate text-xs text-ink-muted">
                          {task.vehicle_model || 'سيارة'} · {task.vehicle_plate || '—'} · {task.client_name || 'العميل'}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="num flex items-center gap-1 text-xs font-medium text-ink-soft">
                          <Clock className="h-3 w-3" />
                          {formatTime(task.created_at)}
                        </span>
                        <Badge tone={task.status === 'completed' ? 'ok' : 'brand'}>
                          {task.status === 'completed' ? (isArabic ? 'مكتمل' : 'Done') : (isArabic ? 'مجدول' : 'Scheduled')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              4. MORE (المزيد)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'more' && (
            <div className="-mx-4 -mt-4 space-y-4">
              {/* Header Gradient Banner matching seeda */}
              <section className="safe-top relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-700 to-navy-700 px-5 pb-8 pt-5 text-white lg:rounded-b-3xl">
                <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                <div className="flex justify-end">
                  <Logo variant="white" height={26} />
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <Avatar name={user?.full_name} size={64} className="ring-4 ring-white/25 text-xl bg-white text-brand-700" />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold">{user?.full_name || (isArabic ? 'فني سيدا' : 'Technician')}</p>
                    <p className="text-sm text-white/75">
                      {isArabic ? 'فني عناية بالسيارات' : 'Automotive Care Tech'} · <span className="num">{user?.employee_code || 'RT-001'}</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Rows List */}
              <div className="space-y-4 px-4 py-2">
                <div className="card divide-y divide-line-soft overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveTab('notifications')}
                    className="w-full flex items-center gap-3.5 px-4 py-4 transition hover:bg-surface-subtle text-start"
                  >
                    <Bell className="h-5 w-5 text-ink-soft" strokeWidth={1.8} />
                    <span className="flex-1 text-[15px] font-medium text-ink">{isArabic ? 'الإشعارات' : 'Notifications'}</span>
                    <Chevron className="h-4 w-4 text-ink-faint" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="w-full flex items-center gap-3.5 px-4 py-4 transition hover:bg-surface-subtle text-start"
                  >
                    <Globe className="h-5 w-5 text-ink-soft" strokeWidth={1.8} />
                    <span className="flex-1 text-[15px] font-medium text-ink">{isArabic ? 'اللغة' : 'Language'}</span>
                    <span className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs text-ink-soft font-semibold">{isArabic ? 'English' : 'العربية'}</span>
                    <Chevron className="h-4 w-4 text-ink-faint" />
                  </button>
                </div>

                <div>
                  <p className="mb-2 px-1 text-xs font-semibold text-ink-muted">{isArabic ? 'سجلي ومستنداتي' : 'My Records'}</p>
                  <div className="card divide-y divide-line-soft overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActiveTab('attendance')}
                      className="w-full flex items-center gap-3.5 px-4 py-4 transition hover:bg-surface-subtle text-start"
                    >
                      <Clock className="h-5 w-5 text-ink-soft" strokeWidth={1.8} />
                      <span className="flex-1 text-[15px] font-medium text-ink">{isArabic ? 'سجل الحضور والانصراف' : 'Attendance Log'}</span>
                      <Chevron className="h-4 w-4 text-ink-faint" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('history')}
                      className="w-full flex items-center gap-3.5 px-4 py-4 transition hover:bg-surface-subtle text-start"
                    >
                      <History className="h-5 w-5 text-ink-soft" strokeWidth={1.8} />
                      <span className="flex-1 text-[15px] font-medium text-ink">{isArabic ? 'سجل العمليات السابقة' : 'Task History'}</span>
                      <Chevron className="h-4 w-4 text-ink-faint" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('commissions')}
                      className="w-full flex items-center gap-3.5 px-4 py-4 transition hover:bg-surface-subtle text-start"
                    >
                      <Wallet className="h-5 w-5 text-ink-soft" strokeWidth={1.8} />
                      <span className="flex-1 text-[15px] font-medium text-ink">{isArabic ? 'العمولات والمستحقات المالية' : 'Commissions & Earnings'}</span>
                      <Chevron className="h-4 w-4 text-ink-faint" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('schedule')}
                      className="w-full flex items-center gap-3.5 px-4 py-4 transition hover:bg-surface-subtle text-start"
                    >
                      <CalendarDays className="h-5 w-5 text-ink-soft" strokeWidth={1.8} />
                      <span className="flex-1 text-[15px] font-medium text-ink">{isArabic ? 'جدول المواعيد والورديات' : 'Schedule'}</span>
                      <Chevron className="h-4 w-4 text-ink-faint" />
                    </button>
                  </div>
                </div>

                {/* About & Info */}
                <div className="card divide-y divide-line-soft overflow-hidden">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3.5 px-4 py-4 text-start">
                      <HelpCircle className="h-5 w-5 text-ink-soft" strokeWidth={1.8} />
                      <span className="flex-1 text-[15px] font-medium">{isArabic ? 'المساعدة والدعم' : 'Help & Support'}</span>
                      <ChevronDown className="h-4 w-4 text-ink-faint transition group-open:rotate-180" />
                    </summary>
                    <p className="px-4 pb-4 text-xs text-ink-muted leading-relaxed">
                      {isArabic 
                        ? 'تطبيق فنيي سيدا يتيح لك استلام المهام ومتابعة حالة تنفيذ كل سيارة، وتسجيل الحضور، والاطلاع على رصيد العمولات المعتمدة بشكل لحظي.' 
                        : 'SEEDA technician portal allows tracking vehicle care tasks, attendance, and instant commission balances.'}
                    </p>
                  </details>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3.5 px-4 py-4 text-start">
                      <Info className="h-5 w-5 text-ink-soft" strokeWidth={1.8} />
                      <span className="flex-1 text-[15px] font-medium">{isArabic ? 'عن نظام سيدا' : 'About SEEDA'}</span>
                      <ChevronDown className="h-4 w-4 text-ink-faint transition group-open:rotate-180" />
                    </summary>
                    <div className="px-4 pb-4">
                      <Logo height={24} />
                      <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                        {isArabic ? 'منصة تشغيل وإدارة عمليات متكاملة لمراكز العناية بالسيارات.' : 'Complete automotive care operations system.'}
                      </p>
                      <p className="num mt-1 text-2xs text-ink-faint">v1.2.0</p>
                    </div>
                  </details>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl font-semibold border border-line bg-white text-brand-700 hover:border-brand-300 hover:text-brand-800 transition"
                >
                  <LogOut className="h-5 w-5 rtl:-scale-x-100" />
                  <span>{isArabic ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              5. ATTENDANCE (الحضور والانصراف)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setActiveTab('more')} className="lg:hidden text-ink-muted hover:text-ink">
                  <Arrow className="h-5 w-5 rotate-180" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-ink">{isArabic ? 'تسجيل وسجل الحضور' : 'Attendance'}</h1>
                  <p className="text-xs text-ink-muted">{isArabic ? 'متابعة الدوام اليومي والورديات' : 'Daily punch and shift records'}</p>
                </div>
              </div>

              {/* Punch Card */}
              <Card className="p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold">
                      {new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="num text-xs text-ink-muted">
                      {isArabic ? 'الوردية: 09:00 ص – 06:00 م' : 'Shift: 09:00 AM – 06:00 PM'}
                    </p>
                  </div>
                  <Badge tone={todayAtt ? (todayAtt.status === 'late' ? 'warn' : 'ok') : 'neutral'}>
                    {todayAtt ? (todayAtt.status === 'late' ? (isArabic ? 'متأخر' : 'Late') : (isArabic ? 'حاضر' : 'Present')) : (isArabic ? 'لم يسجل' : 'Not Checked In')}
                  </Badge>
                </div>

                {todayAtt?.check_in_at && (
                  <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-surface-subtle p-3 text-center">
                    <div>
                      <p className="text-[11px] text-ink-muted">{isArabic ? 'دخول' : 'In'}</p>
                      <p className="num text-sm font-bold text-ink">{formatTime(todayAtt.check_in_at)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-muted">{isArabic ? 'خروج' : 'Out'}</p>
                      <p className="num text-sm font-bold text-ink">{todayAtt.check_out_at ? formatTime(todayAtt.check_out_at) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-muted">{isArabic ? 'التأخير' : 'Late'}</p>
                      <p className={`num text-sm font-bold ${todayAtt.late_minutes > 0 ? 'text-warn-700' : 'text-ok-700'}`}>
                        {todayAtt.late_minutes > 0 ? `${todayAtt.late_minutes} ${isArabic ? 'دقيقة' : 'min'}` : (isArabic ? 'في الموعد' : 'On time')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {!todayAtt?.check_in_at ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={attendanceBusy}
                        onClick={() => handlePunch('in', false)}
                        className="h-12 w-full rounded-xl bg-brand-700 text-white font-bold text-sm hover:bg-brand-800 transition flex items-center justify-center gap-2 shadow-cta"
                      >
                        {attendanceBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                        <span>{isArabic ? 'تسجيل الحضور' : 'Check In'}</span>
                      </button>
                      <button
                        type="button"
                        disabled={attendanceBusy}
                        onClick={() => handlePunch('in', true)}
                        className="h-12 w-full rounded-xl bg-brand-50 text-brand-700 font-bold text-sm hover:bg-brand-100 transition flex items-center justify-center gap-2"
                      >
                        <MapPin className="h-5 w-5" />
                        <span>{isArabic ? 'تحديد الموقع الجغرافي' : 'With GPS'}</span>
                      </button>
                    </div>
                  ) : !todayAtt?.check_out_at ? (
                    <button
                      type="button"
                      disabled={attendanceBusy}
                      onClick={() => handlePunch('out', false)}
                      className="h-12 w-full rounded-xl bg-bad-600 text-white font-bold text-sm hover:bg-bad-700 transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      {attendanceBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
                      <span>{isArabic ? 'تسجيل الانصراف' : 'Check Out'}</span>
                    </button>
                  ) : (
                    <div className="rounded-xl bg-ok-50 p-3 text-center text-xs font-bold text-ok-700">
                      ✓ {isArabic ? 'تم اكتمال حضور وانصراف اليوم بنجاح' : 'Today attendance recorded successfully'}
                    </div>
                  )}
                </div>
              </Card>

              {/* Monthly Summary */}
              <section className="space-y-2">
                <h2 className="text-sm font-bold text-ink">{isArabic ? 'ملخص الشهر' : 'Monthly Summary'}</h2>
                <div className="grid grid-cols-3 gap-2">
                  <Card className="p-3 text-center">
                    <p className="num text-xl font-bold text-ok-700">{monthSummary.present || 0}</p>
                    <p className="text-[11px] text-ink-muted">{isArabic ? 'أيام الحضور' : 'Present'}</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="num text-xl font-bold text-warn-700">{monthSummary.late || 0}</p>
                    <p className="text-[11px] text-ink-muted">{isArabic ? 'أيام التأخير' : 'Late'}</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="num text-xl font-bold text-brand-700">
                      {Math.round((monthSummary.workedMinutes || 0) / 60)} {isArabic ? 'س' : 'hrs'}
                    </p>
                    <p className="text-[11px] text-ink-muted">{isArabic ? 'ساعات العمل' : 'Hours'}</p>
                  </Card>
                </div>
              </section>

              {/* Log List */}
              <section className="space-y-2">
                <h2 className="text-sm font-bold text-ink">{isArabic ? 'سجل الأيام السابقة' : 'Past Records'}</h2>
                {monthRecords.length === 0 ? (
                  <EmptyState title={isArabic ? 'لا توجد سجلات سابقة لهذا الشهر' : 'No attendance logs'} />
                ) : (
                  <div className="card divide-y divide-line-soft overflow-hidden">
                    {monthRecords.map((r) => (
                      <div key={r.id || r.work_date} className="flex items-center justify-between p-3.5 text-xs">
                        <div>
                          <p className="font-bold text-ink">{formatDate(r.work_date)}</p>
                          <p className="text-ink-muted text-2xs mt-0.5">
                            {r.check_in_at ? `${isArabic ? 'دخول:' : 'In:'} ${formatTime(r.check_in_at)}` : ''} 
                            {r.check_out_at ? ` · ${isArabic ? 'خروج:' : 'Out:'} ${formatTime(r.check_out_at)}` : ''}
                          </p>
                        </div>
                        <Badge tone={r.status === 'late' ? 'warn' : 'ok'}>
                          {r.status === 'late' ? (isArabic ? 'متأخر' : 'Late') : (isArabic ? 'حاضر' : 'Present')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              6. COMMISSIONS (العمولات والأرباح)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'commissions' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setActiveTab('more')} className="lg:hidden text-ink-muted hover:text-ink">
                  <Arrow className="h-5 w-5 rotate-180" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-ink">{isArabic ? 'العمولات والمستحقات' : 'Earnings'}</h1>
                  <p className="text-xs text-ink-muted">{isArabic ? 'الرصيد المكتسب وكشف العمليات المعتمدة' : 'Confirmed commission balance'}</p>
                </div>
              </div>

              {/* Gradient Banner matching seeda */}
              <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-navy-700 p-5 text-white shadow-cta">
                <p className="text-sm text-white/75">{isArabic ? 'المستحقات المعتمدة القابلة للصرف' : 'Payable Remaining'}</p>
                <p className="num mt-1 text-3xl font-bold">
                  {commissionsInfo.total_earned?.toLocaleString()} <span className="text-lg font-normal">{isArabic ? 'ر.س' : 'SAR'}</span>
                </p>
                <p className="mt-1 text-xs text-white/70">
                  {isArabic ? `إجمالي الخدمات المنفذة: ${commissionsInfo.services_count || 0}` : `Total Services: ${commissionsInfo.services_count || 0}`}
                </p>
              </section>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3.5">
                  <p className="text-xs text-ink-muted">{isArabic ? 'المكتسب' : 'Earned'}</p>
                  <p className="num mt-1 text-[17px] font-bold text-ink">{commissionsInfo.total_earned?.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
                </Card>
                <Card className="p-3.5">
                  <p className="text-xs text-ink-muted">{isArabic ? 'المعتمد' : 'Confirmed'}</p>
                  <p className="num mt-1 text-[17px] font-bold text-ok-700">{commissionsInfo.total_earned?.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
                </Card>
              </div>

              {/* Commission Ledger */}
              <section className="space-y-2">
                <h2 className="text-sm font-bold text-ink">{isArabic ? 'سجل العمليات والعمولات' : 'Commission Ledger'}</h2>
                {commissionsList.length === 0 ? (
                  <EmptyState title={isArabic ? 'لا توجد عمولات مسجلة بعد' : 'No commission records'} />
                ) : (
                  <div className="card divide-y divide-line-soft overflow-hidden">
                    {commissionsList.map((comm) => (
                      <div key={comm.id || comm.uuid} className="p-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-ink truncate">{comm.service_name}</p>
                          <p className="num text-xs text-ink-muted truncate mt-0.5">
                            {formatDate(comm.created_at)} · #{comm.work_order_number || 'WO'}
                          </p>
                          <p className="text-xs text-ink-muted truncate mt-0.5">
                            {comm.vehicle_info || 'سيارة'} · <span className="font-mono font-semibold">{comm.vehicle_plate || '—'}</span>
                          </p>
                        </div>
                        <div className="text-end shrink-0">
                          <p className="num text-base font-bold text-ok-700">
                            +{comm.amount?.toLocaleString()} <span className="text-xs font-normal">{comm.currency || 'SAR'}</span>
                          </p>
                          <Badge tone="ok" className="mt-1">
                            {isArabic ? 'معتمد' : 'Confirmed'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              7. TASK HISTORY (سجل العمليات)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setActiveTab('more')} className="lg:hidden text-ink-muted hover:text-ink">
                  <Arrow className="h-5 w-5 rotate-180" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-ink">{isArabic ? 'سجل العمليات السابقة' : 'Task History'}</h1>
                  <p className="text-xs text-ink-muted">{isArabic ? 'أرشيف كافة أوامر العمل المكتملة' : 'Completed work orders archive'}</p>
                </div>
              </div>

              {historyOrders.length === 0 ? (
                <EmptyState title={isArabic ? 'لا توجد عمليات مكتملة سابقة' : 'No completed tasks'} />
              ) : (
                <div className="card divide-y divide-line-soft overflow-hidden">
                  {historyOrders.map((task) => (
                    <div
                      key={task.id || task.uuid}
                      onClick={() => setSelectedTask(task)}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition hover:bg-surface-subtle"
                    >
                      <VehicleThumb color={task.vehicle_color} className="h-11 w-14 rounded-lg shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{getPrimaryServiceName(task)}</p>
                        <p className="truncate text-xs text-ink-muted">
                          {task.vehicle_model || 'سيارة'} · {task.vehicle_plate || '—'} · {task.client_name || 'العميل'}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="num text-xs font-medium text-ink-soft">{formatDate(task.completed_at || task.created_at)}</span>
                        <Badge tone="ok">{isArabic ? 'مكتمل' : 'Completed'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              8. NOTIFICATIONS (الإشعارات)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setActiveTab('home')} className="lg:hidden text-ink-muted hover:text-ink">
                  <Arrow className="h-5 w-5 rotate-180" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-ink">{isArabic ? 'الإشعارات' : 'Notifications'}</h1>
                  <p className="text-xs text-ink-muted">{isArabic ? 'تحديثات المهام والمهام الجديدة' : 'Task alerts and updates'}</p>
                </div>
              </div>

              <div className="card divide-y divide-line-soft overflow-hidden">
                {counts.available > 0 && (
                  <div 
                    onClick={() => { setActiveTab('tasks'); setTaskFilter('available'); }}
                    className="flex items-start gap-3 px-4 py-3.5 hover:bg-surface-subtle cursor-pointer"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">
                        {isArabic ? `يوجد ${counts.available} مهمة جديدة متاحة للاستلام الآن` : `${counts.available} new tasks available`}
                      </p>
                      <p className="num text-xs text-ink-faint mt-0.5">{isArabic ? 'اليوم' : 'Today'}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-surface-subtle">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-line" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink-soft">
                      {isArabic ? 'مرحباً بك في منصة سيدا للفنيين' : 'Welcome to SEEDA technician platform'}
                    </p>
                    <p className="num text-xs text-ink-faint mt-0.5">{isArabic ? 'النظام' : 'System'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (4 primary items matching seeda) */}
      <TechBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isArabic={isArabic}
        unreadCount={counts.available}
      />

      {/* ═════════════════════════════════════════════════════════════
          TASK DETAILS & EXECUTION MODAL
         ═════════════════════════════════════════════════════════════ */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full sm:max-w-xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-2xs font-bold text-brand-700 uppercase">
                  #{selectedTask.work_order_number || selectedTask.id}
                </p>
                <h2 className="text-base font-bold text-ink mt-0.5">
                  {getPrimaryServiceName(selectedTask)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-muted hover:bg-surface-sunken hover:text-ink transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Vehicle Art Banner */}
              <div className="rounded-2xl overflow-hidden border border-line">
                <VehicleThumb color={selectedTask.vehicle_color} className="h-28 w-full" />
                <div className="p-3 bg-surface-subtle flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-ink">{selectedTask.vehicle_model || 'سيارة'} {selectedTask.vehicle_year || ''}</span>
                    <span className="text-ink-muted ms-1.5">({selectedTask.vehicle_color || (isArabic ? 'أبيض' : 'White')})</span>
                  </div>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-line text-ink">
                    {selectedTask.vehicle_plate || '—'}
                  </span>
                </div>
              </div>

              {/* Client Info */}
              <div className="rounded-xl border border-line p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">{isArabic ? 'العميل:' : 'Client:'}</span>
                  <span className="font-bold text-ink">{selectedTask.client_name || '—'}</span>
                </div>
                {selectedTask.client_phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-ink-muted">{isArabic ? 'رقم الهاتف:' : 'Phone:'}</span>
                    <a href={`tel:${selectedTask.client_phone}`} className="font-mono text-brand-700 font-bold hover:underline flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{selectedTask.client_phone}</span>
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">{isArabic ? 'الفرع:' : 'Branch:'}</span>
                  <span className="text-ink font-semibold">{selectedTask.branch_name || (isArabic ? 'فرع جدة' : 'Jeddah')}</span>
                </div>
              </div>

              {/* Services Checklist */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                  {isArabic ? 'قائمة الخدمات المطلوبة (أشّر لإنجاز الخدمة)' : 'Required Services Checklist'}
                </h3>
                <div className="space-y-2">
                  {SERVICE_KEYS.map(({ key, titleAr, titleEn }) => {
                    const rawVal = selectedTask[key];
                    const hasItems = (Array.isArray(rawVal) && rawVal.length > 0) || (typeof rawVal === 'string' && rawVal.trim().length > 0);
                    if (!hasItems) return null;

                    const progress = selectedTask.service_progress || {};
                    const isDone = Boolean(progress[key]?.completed);

                    return (
                      <div
                        key={key}
                        onClick={() => handleToggleService(selectedTask, key, isDone)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer select-none ${
                          isDone 
                            ? 'border-ok-200 bg-ok-50/50' 
                            : 'border-line bg-white hover:border-brand-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-ok-600 shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-ink-muted shrink-0" />
                          )}
                          <span className={`text-sm font-semibold ${isDone ? 'text-ok-800 line-through' : 'text-ink'}`}>
                            {isArabic ? titleAr : titleEn}
                          </span>
                        </div>
                        <Badge tone={isDone ? 'ok' : 'neutral'}>
                          {isDone ? (isArabic ? 'مكتملة' : 'Done') : (isArabic ? 'قيد التنفيذ' : 'Pending')}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inspection Notes */}
              {selectedTask.inspection_notes && (
                <div className="rounded-xl bg-surface-subtle p-3 text-xs">
                  <p className="font-semibold text-ink-soft mb-1">{isArabic ? 'ملاحظات الفحص:' : 'Inspection Notes:'}</p>
                  <p className="text-ink-muted">{selectedTask.inspection_notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-line p-4 bg-surface-subtle flex items-center justify-between gap-3">
              {isAvailable(selectedTask) ? (
                <button
                  type="button"
                  disabled={claimMutation.isPending}
                  onClick={() => claimMutation.mutate(selectedTask.id || selectedTask.uuid)}
                  className="w-full h-11 rounded-xl bg-brand-700 text-white font-bold text-sm hover:bg-brand-800 transition flex items-center justify-center gap-2 shadow-cta"
                >
                  {claimMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
                  <span>{isArabic ? 'استلام هذه المهمة الآن' : 'Claim Task Now'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="w-full h-11 rounded-xl bg-brand-700 text-white font-bold text-sm hover:bg-brand-800 transition flex items-center justify-center gap-2 shadow-cta"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>{isArabic ? 'حفظ وإغلاق' : 'Save & Close'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
