import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkoutService } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { useAdminTheme } from '../contexts/AdminThemeContext';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../contexts/ToastContext';

// Helper for status badges
const getStatusBadge = (status, isLight, isArabic) => {
  const s = (status || '').toLowerCase();
  
  if (s === 'paid' || s === 'completed') {
    return {
      label: isArabic ? 'مدفوع ومكتمل' : 'Paid & Completed',
      badgeClass: isLight 
        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
      dotClass: 'bg-emerald-500 animate-pulse',
      icon: 'check_circle'
    };
  }
  if (s === 'pending') {
    return {
      label: isArabic ? 'معلق وقيد الانتظار' : 'Pending Payment',
      badgeClass: isLight 
        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
      dotClass: 'bg-amber-500',
      icon: 'hourglass_empty'
    };
  }
  if (s === 'overdue' || s === 'failed' || s === 'cancelled') {
    return {
      label: s === 'overdue' 
        ? (isArabic ? 'متأخر' : 'Overdue') 
        : (s === 'cancelled' ? (isArabic ? 'ملغي' : 'Cancelled') : (isArabic ? 'فشل الدفع' : 'Failed')),
      badgeClass: isLight 
        ? 'bg-rose-100 text-rose-800 border border-rose-300' 
        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
      dotClass: 'bg-rose-500',
      icon: 'error_outline'
    };
  }
  
  return {
    label: status || (isArabic ? 'غير محدد' : 'Unknown'),
    badgeClass: isLight 
      ? 'bg-slate-100 text-slate-800 border border-slate-300' 
      : 'bg-slate-500/10 text-slate-400 border border-slate-500/30',
    dotClass: 'bg-slate-500',
    icon: 'help_outline'
  };
};

const getPaymentMethodInfo = (method, isArabic) => {
  const m = (method || '').toLowerCase();
  if (m.includes('tabby')) {
    return { name: 'Tabby (تابي)', color: 'from-[#3EF0B2] to-[#2ECC71]', text: 'text-[#1ABC9C]', bg: 'bg-[#1ABC9C]/10', isBranded: true };
  }
  if (m.includes('tamara')) {
    return { name: 'Tamara (تمارا)', color: 'from-[#FFA372] to-[#FF6B6B]', text: 'text-[#FF8A65]', bg: 'bg-[#FF8A65]/10', isBranded: true };
  }
  if (m.includes('card') || m.includes('mada') || m.includes('visa')) {
    return { name: isArabic ? 'بطاقة ائتمان / مدى' : 'Mada / Credit Card', color: 'from-[#3B82F6] to-[#6366F1]', text: 'text-blue-500', bg: 'bg-blue-500/10', isBranded: false };
  }
  return { name: method || (isArabic ? 'دفع إلكتروني' : 'Electronic Payment'), color: 'from-[#8B5CF6] to-[#5C24EB]', text: 'text-purple-500', bg: 'bg-purple-500/10', isBranded: false };
};

const DUMMY_ORDERS = [
  { id: 'ORD-88214921', client_name: 'أحمد السيد', client_phone: '0501234567', payment_method: 'Tabby Payment', service: 'حماية وتلميع VIP', created_at: '2026-10-18T10:00:00Z', amount: 4500, status: 'paid', currency: 'SAR' },
  { id: 'ORD-88193312', client_name: 'محمد بن راشد', client_phone: '0559876543', payment_method: 'Tamara Installments', service: 'نانو سيراميك 10H', created_at: '2026-10-17T14:30:00Z', amount: 12200, status: 'pending', currency: 'SAR' },
  { id: 'ORD-88129981', client_name: 'فهد القحطاني', client_phone: '0543210987', payment_method: 'Tabby Payment', service: 'تظليل عازل حراري', created_at: '2026-10-15T09:15:00Z', amount: 2100, status: 'overdue', currency: 'SAR' },
  { id: 'ORD-88051102', client_name: 'سارة العتيبي', client_phone: '0567891234', payment_method: 'Mada Card', service: 'غسيل وتلميع ساطع', created_at: '2026-10-14T11:20:00Z', amount: 850, status: 'paid', currency: 'SAR' },
  { id: 'ORD-87905544', client_name: 'عبدالله الشهري', client_phone: '0598765432', payment_method: 'Tamara Installments', service: 'باقة التجديد الشاملة', created_at: '2026-10-12T16:45:00Z', amount: 6400, status: 'paid', currency: 'SAR' },
];

const OrdersBilling = React.memo(() => {
  const { isLight } = useAdminTheme();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: checkoutData, isLoading, refetch } = useQuery({
    queryKey: ['adminCheckouts'],
    queryFn: checkoutService.getAll,
  });

  const rawOrders = checkoutData?.data || [];
  const baseOrders = rawOrders.length > 0 ? rawOrders : DUMMY_ORDERS;

  // Memoize filtering and statistics
  const { filteredOrders, stats } = useMemo(() => {
    const now = new Date();

    const filtered = baseOrders.filter(order => {
      // 1. Status Filter
      if (statusFilter !== 'All') {
        const s = (order.status || '').toLowerCase();
        if (statusFilter === 'paid' && s !== 'paid' && s !== 'completed') return false;
        if (statusFilter === 'pending' && s !== 'pending') return false;
        if (statusFilter === 'overdue' && s !== 'overdue' && s !== 'failed' && s !== 'cancelled') return false;
      }

      // 2. Search Filter (by client name, phone, order ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = (order.client_name || '').toLowerCase().includes(query);
        const phoneMatch = (order.client_phone || '').includes(query);
        const idMatch = (order.id || '').toLowerCase().includes(query);
        const methodMatch = (order.payment_method || '').toLowerCase().includes(query);
        if (!nameMatch && !phoneMatch && !idMatch && !methodMatch) return false;
      }

      // 3. Custom Date Range
      const orderDate = new Date(order.created_at || order.createdAt || Date.now());
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }

      // 4. Time presets
      if (!startDate && !endDate && timeFilter !== 'All Time') {
        if (timeFilter === 'Last 7 Days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < sevenDaysAgo) return false;
        } else if (timeFilter === 'Last 30 Days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (orderDate < thirtyDaysAgo) return false;
        } else if (timeFilter === 'Last 3 Months') {
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          if (orderDate < ninetyDaysAgo) return false;
        }
      }

      return true;
    });

    // Compute stats
    let totalRevenue = 0;
    let pendingRevenue = 0;
    let paidOrdersCount = 0;
    let pendingCount = 0;

    filtered.forEach(o => {
      const amt = parseFloat(o.amount) || 0;
      const s = (o.status || '').toLowerCase();
      if (s === 'paid' || s === 'completed') {
        totalRevenue += amt;
        paidOrdersCount += 1;
      } else if (s === 'pending') {
        pendingRevenue += amt;
        pendingCount += 1;
      }
    });

    const avgTicket = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

    return {
      filteredOrders: filtered,
      stats: {
        totalRevenue,
        pendingRevenue,
        totalOrdersCount: filtered.length,
        paidOrdersCount,
        pendingCount,
        avgTicket,
      }
    };
  }, [baseOrders, statusFilter, searchQuery, startDate, endDate, timeFilter]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast?.warning?.(isArabic ? 'لا توجد بيانات لتصديرها' : 'No data to export');
      return;
    }

    const headers = isArabic
      ? ['رقم الطلب', 'العميل', 'رقم الجوال', 'وسيلة الدفع', 'المبلغ (SAR)', 'الحالة', 'تاريخ الطلب']
      : ['Order ID', 'Client Name', 'Phone', 'Payment Method', 'Amount (SAR)', 'Status', 'Date'];

    const rows = filteredOrders.map(o => [
      `"${o.id || ''}"`,
      `"${o.client_name || o.client?.full_name || ''}"`,
      `"${o.client_phone || o.client?.phone || ''}"`,
      `"${o.payment_method || o.service || ''}"`,
      o.amount || 0,
      `"${o.status || ''}"`,
      `"${o.created_at || o.createdAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast?.success?.(isArabic ? 'تم تصدير تقرير الطلبات بنجاح' : 'Report exported successfully');
  };

  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    toast?.success?.(isArabic ? `تم نسخ رقم الطلب #${id.substring(0, 8)}` : `Copied #${id.substring(0, 8)}`);
  };

  const clearAllFilters = () => {
    setStatusFilter('All');
    setTimeFilter('All Time');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = statusFilter !== 'All' || timeFilter !== 'All Time' || searchQuery || startDate || endDate;

  return (
    <div className={`flex min-h-screen font-body transition-colors duration-300 ${isLight ? 'bg-[#F8FAFC] text-slate-800 admin-light-theme' : 'bg-[#07080B] text-white admin-dark-theme'} pt-20`} dir={isArabic ? 'rtl' : 'ltr'}>
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/[0.06]'}`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#5C24EB]/10 text-[#8B5CF6] border border-[#5C24EB]/20">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></span>
                {isArabic ? 'بوابة الإدارة المالية والمدفوعات' : 'Financial & Billing Gateway'}
              </span>
              {isLoading && (
                <span className="flex items-center gap-1 text-xs text-[#8B5CF6]">
                  <span className="w-3.5 h-3.5 border-2 border-[#5C24EB]/40 border-t-[#5C24EB] rounded-full animate-spin"></span>
                  {isArabic ? 'جاري التحديث...' : 'Updating...'}
                </span>
              )}
            </div>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isArabic ? 'الطلبات والفواتير الإلكترونية' : 'Orders & Invoices'}
            </h1>
            <p className={`text-sm mt-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {isArabic 
                ? 'متابعة فواتير وبوابات الدفع (تابي، تمارا، مدى) والعمليات المكتملة والمستحقات' 
                : 'Monitor payment gateways (Tabby, Tamara, Mada), completed transactions, and dues'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => refetch()}
              type="button"
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                isLight 
                  ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm' 
                  : 'bg-[#12131A] border border-white/10 text-slate-300 hover:bg-[#1A1C25]'
              }`}
              title={isArabic ? 'تحديث البيانات' : 'Refresh'}
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              type="button"
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#5C24EB] to-[#7C3AED] hover:from-[#6D28D9] hover:to-[#8B5CF6] text-white shadow-[0_4px_20px_rgba(92,36,235,0.35)] hover:shadow-[0_6px_25px_rgba(92,36,235,0.5)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">file_download</span>
              {isArabic ? 'تصدير التقرير (CSV)' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* 4 Financial Stat Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" aria-label="Financial Highlights">
          {/* 1. Total Paid Revenue */}
          <div className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 group hover:translate-y-[-2px] ${
            isLight 
              ? 'bg-white border border-slate-200 shadow-sm hover:shadow-md' 
              : 'bg-gradient-to-br from-[#12131C] to-[#0D0E15] border border-[#5C24EB]/25 shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:border-[#5C24EB]/50'
          }`}>
            <div className="absolute top-0 left-0 w-24 h-24 bg-[#5C24EB]/15 rounded-full blur-2xl pointer-events-none group-hover:bg-[#5C24EB]/25 transition-all"></div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isArabic ? 'إجمالي الإيرادات المحصلة' : 'Collected Revenue'}
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#5C24EB]/15 text-[#8B5CF6] flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">payments</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-extrabold text-[#8B5CF6]">{isArabic ? 'ر.س' : 'SAR'}</span>
            </div>
            <div className={`mt-3 flex items-center justify-between text-xs pt-3 border-t ${isLight ? 'border-slate-100' : 'border-white/[0.06]'}`}>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {stats.paidOrdersCount} {isArabic ? 'عملية مكتملة' : 'completed'}
              </span>
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{isArabic ? 'مدفوع بالكامل' : 'Fully Paid'}</span>
            </div>
          </div>

          {/* 2. Pending Revenue */}
          <div className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 group hover:translate-y-[-2px] ${
            isLight 
              ? 'bg-white border border-slate-200 shadow-sm hover:shadow-md' 
              : 'bg-gradient-to-br from-[#12131C] to-[#0D0E15] border border-amber-500/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:border-amber-500/40'
          }`}>
            <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isArabic ? 'المبالغ المعلقة' : 'Pending Revenue'}
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">hourglass_top</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {stats.pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-extrabold text-amber-500">{isArabic ? 'ر.س' : 'SAR'}</span>
            </div>
            <div className={`mt-3 flex items-center justify-between text-xs pt-3 border-t ${isLight ? 'border-slate-100' : 'border-white/[0.06]'}`}>
              <span className="text-amber-500 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {stats.pendingCount} {isArabic ? 'فاتورة قيد الانتظار' : 'pending invoices'}
              </span>
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{isArabic ? 'في انتظار السداد' : 'Awaiting Payment'}</span>
            </div>
          </div>

          {/* 3. Total Orders Count */}
          <div className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 group hover:translate-y-[-2px] ${
            isLight 
              ? 'bg-white border border-slate-200 shadow-sm hover:shadow-md' 
              : 'bg-gradient-to-br from-[#12131C] to-[#0D0E15] border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:border-white/20'
          }`}>
            <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isArabic ? 'إجمالي عدد الطلبات' : 'Total Orders Count'}
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">receipt_long</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {stats.totalOrdersCount}
              </span>
              <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{isArabic ? 'طلب' : 'orders'}</span>
            </div>
            <div className={`mt-3 flex items-center justify-between text-xs pt-3 border-t ${isLight ? 'border-slate-100' : 'border-white/[0.06]'}`}>
              <span className="text-blue-500 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">filter_alt</span>
                {isArabic ? 'حسب الفلترة الحالية' : 'Current filter'}
              </span>
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{isArabic ? 'سجل العمليات' : 'Log'}</span>
            </div>
          </div>

          {/* 4. Average Ticket Size */}
          <div className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 group hover:translate-y-[-2px] ${
            isLight 
              ? 'bg-white border border-slate-200 shadow-sm hover:shadow-md' 
              : 'bg-gradient-to-br from-[#12131C] to-[#0D0E15] border border-indigo-500/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:border-indigo-500/40'
          }`}>
            <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isArabic ? 'متوسط قيمة الطلب' : 'Average Order Value'}
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">analytics</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {stats.avgTicket.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs font-extrabold text-indigo-500">{isArabic ? 'ر.س' : 'SAR'}</span>
            </div>
            <div className={`mt-3 flex items-center justify-between text-xs pt-3 border-t ${isLight ? 'border-slate-100' : 'border-white/[0.06]'}`}>
              <span className="text-indigo-500 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                {isArabic ? 'معدل السلة' : 'Avg Basket'}
              </span>
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{isArabic ? 'للطلبات المدفوعة' : 'Paid Orders'}</span>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight 
            ? 'bg-white border-slate-200 shadow-sm' 
            : 'bg-[#0E0F16]/90 border-white/[0.08] backdrop-blur-xl shadow-xl'
        }`}>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <span className={`material-symbols-outlined absolute ${isArabic ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none`}>
                search
              </span>
              <input
                type="text"
                placeholder={isArabic ? 'ابحث بالاسم، رقم الجوال، أو رقم الطلب...' : 'Search by client, phone, or order ID...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-2.5 rounded-xl text-sm transition-all outline-none border ${isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'} ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#5C24EB]' 
                    : 'bg-[#151620] border-white/10 text-white placeholder-slate-500 focus:border-[#5C24EB]'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute ${isArabic ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer`}
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>

            {/* Quick Status Tabs */}
            <div className={`flex items-center p-1 rounded-xl border overflow-x-auto ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#151620] border-white/10'
            }`}>
              {[
                { id: 'All', labelEn: 'All', labelAr: 'الكل', count: baseOrders.length },
                { id: 'paid', labelEn: 'Paid', labelAr: 'مدفوع', count: baseOrders.filter(o => o.status === 'paid' || o.status === 'completed').length },
                { id: 'pending', labelEn: 'Pending', labelAr: 'معلق', count: baseOrders.filter(o => o.status === 'pending').length },
                { id: 'overdue', labelEn: 'Overdue / Cancelled', labelAr: 'متأخر / ملغي', count: baseOrders.filter(o => o.status === 'overdue' || o.status === 'failed' || o.status === 'cancelled').length },
              ].map(tab => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    type="button"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#5C24EB] text-white shadow-md'
                        : isLight 
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive 
                        ? 'bg-white/20 text-white font-mono' 
                        : isLight 
                          ? 'bg-slate-200 text-slate-600' 
                          : 'bg-white/10 text-slate-300'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Time Filter Select */}
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className={`w-full lg:w-auto py-2.5 rounded-xl text-xs font-bold appearance-none outline-none cursor-pointer border ${isArabic ? 'pr-9 pl-4' : 'pl-9 pr-4'} ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-800' 
                    : 'bg-[#151620] border-white/10 text-slate-200 hover:border-white/20'
                }`}
              >
                <option value="All Time" className={isLight ? 'bg-white text-slate-900' : 'bg-[#151620] text-white'}>{isArabic ? 'جميع الأوقات' : 'All Time'}</option>
                <option value="Last 7 Days" className={isLight ? 'bg-white text-slate-900' : 'bg-[#151620] text-white'}>{isArabic ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
                <option value="Last 30 Days" className={isLight ? 'bg-white text-slate-900' : 'bg-[#151620] text-white'}>{isArabic ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
                <option value="Last 3 Months" className={isLight ? 'bg-white text-slate-900' : 'bg-[#151620] text-white'}>{isArabic ? 'آخر 3 أشهر' : 'Last 3 Months'}</option>
                <option value="This Year" className={isLight ? 'bg-white text-slate-900' : 'bg-[#151620] text-white'}>{isArabic ? 'هذا العام' : 'This Year'}</option>
              </select>
              <span className={`material-symbols-outlined absolute ${isArabic ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none`}>
                calendar_month
              </span>
            </div>

            {/* Date Range Inputs */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151620] border-white/10'
            }`}>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400">{isArabic ? 'من:' : 'From:'}</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`bg-transparent text-xs outline-none ${isLight ? 'text-slate-800' : 'text-slate-200'}`}
                />
              </div>
              <span className="text-slate-400">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400">{isArabic ? 'إلى:' : 'To:'}</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`bg-transparent text-xs outline-none ${isLight ? 'text-slate-800' : 'text-slate-200'}`}
                />
              </div>
            </div>

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-3 py-2 rounded-xl text-xs font-bold text-[#8B5CF6] hover:bg-[#5C24EB]/10 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                {isArabic ? 'إلغاء الفلاتر' : 'Reset'}
              </button>
            )}
          </div>
        </div>

        {/* Orders Table Container */}
        <section className={`rounded-2xl border overflow-hidden shadow-2xl transition-all ${
          isLight 
            ? 'bg-white border-slate-200' 
            : 'bg-[#0E0F16]/95 border-white/[0.08] backdrop-blur-xl'
        }`} aria-label="Orders Data Table">
          
          <div className={`px-6 py-4 flex items-center justify-between border-b ${isLight ? 'border-slate-200' : 'border-white/[0.06]'}`}>
            <div className="flex items-center gap-3">
              <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span className="material-symbols-outlined text-[#8B5CF6] text-xl">table_chart</span>
                {isArabic ? 'قائمة المعاملات والطلبات' : 'Transactions & Orders List'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5C24EB]/15 text-[#8B5CF6] border border-[#5C24EB]/20">
                {filteredOrders.length} {isArabic ? 'طلب' : 'Orders'}
              </span>
            </div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {isArabic ? 'مرتبة حسب التاريخ (الأحدث أولاً)' : 'Sorted by date (newest first)'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full border-collapse min-w-[900px] ${isArabic ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className={`${isLight ? 'bg-slate-50 text-slate-600 border-b border-slate-200' : 'bg-[#14151F]/90 text-slate-300 border-b border-white/[0.08]'}`}>
                  <th scope="col" className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider">{isArabic ? 'رقم الطلب' : 'Order ID'}</th>
                  <th scope="col" className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider">{isArabic ? 'العميل' : 'Client'}</th>
                  <th scope="col" className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider">{isArabic ? 'وسيلة الدفع' : 'Payment Method'}</th>
                  <th scope="col" className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider">{isArabic ? 'تاريخ الطلب' : 'Order Date'}</th>
                  <th scope="col" className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider">{isArabic ? 'المبلغ' : 'Amount'}</th>
                  <th scope="col" className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider">{isArabic ? 'الحالة' : 'Status'}</th>
                  <th scope="col" className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-center">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              
              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-white/[0.04]'}`}>
                {filteredOrders.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400">
                          <span className="material-symbols-outlined text-3xl">search_off</span>
                        </div>
                        <p className={`font-bold text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          {isArabic ? 'لم يتم العثور على أي طلبات تطابق الفلترة الحالية' : 'No orders matched current filter'}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {isArabic ? 'جرب تغيير معايير البحث أو اختيار فترة زمنية أخرى' : 'Try adjusting search or date range'}
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={clearAllFilters}
                            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#5C24EB] text-white hover:bg-[#6D28D9] transition-all cursor-pointer"
                          >
                            {isArabic ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {filteredOrders.map((order, index) => {
                  const clientName = order.client_name || order.client?.full_name || (isArabic ? 'عميل نقدي' : 'Cash Client');
                  const clientPhone = order.client_phone || order.client?.phone || (isArabic ? 'غير مسجل' : 'N/A');
                  const initials = clientName.split(' ').map(n => n[0]).slice(0, 2).join('');
                  const dateObj = new Date(order.created_at || order.createdAt || Date.now());
                  const formattedDate = dateObj.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                  const formattedTime = dateObj.toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
                  const badge = getStatusBadge(order.status, isLight, isArabic);
                  const methodInfo = getPaymentMethodInfo(order.payment_method || order.service, isArabic);
                  const displayId = order.id ? (order.id.length > 12 ? order.id.substring(0, 8) + '...' : order.id) : `ORD-${index + 1000}`;

                  return (
                    <tr
                      key={order.id || index}
                      className={`transition-colors duration-150 group ${
                        isLight 
                          ? 'hover:bg-slate-50' 
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Order ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#8B5CF6] tracking-wider">
                            #{displayId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyOrderId(order.id || displayId)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                            title={isArabic ? 'نسخ رقم الطلب' : 'Copy Order ID'}
                          >
                            <span className="material-symbols-outlined text-sm">content_copy</span>
                          </button>
                        </div>
                      </td>

                      {/* Client Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5C24EB] to-[#9061F9] text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                            {initials || 'ع'}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold group-hover:text-[#8B5CF6] transition-colors ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {clientName}
                            </span>
                            <span className={`text-[11px] font-mono flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              <span className="material-symbols-outlined text-[12px]">call</span>
                              {clientPhone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${methodInfo.bg} ${methodInfo.text} border border-current/15`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {methodInfo.name}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs">
                          <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{formattedDate}</span>
                          <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{formattedTime}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <div className="flex items-baseline gap-1.5 font-mono">
                          <span className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {(Number(order.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-bold text-[#8B5CF6]">
                            {order.currency || (isArabic ? 'ر.س' : 'SAR')}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${badge.badgeClass}`}>
                          <span className={`w-2 h-2 rounded-full ${badge.dotClass}`}></span>
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 mx-auto cursor-pointer ${
                            isLight
                              ? 'bg-slate-100 text-slate-700 hover:bg-[#5C24EB] hover:text-white border border-slate-200'
                              : 'text-slate-300 hover:text-white bg-white/[0.04] hover:bg-[#5C24EB] border border-white/10'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          {isArabic ? 'التفاصيل' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className={`px-6 py-3.5 flex items-center justify-between border-t ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#12131D]/80 border-white/[0.06] text-slate-400'
          } text-xs`}>
            <span>{isArabic ? `عرض ${filteredOrders.length} من أصل ${baseOrders.length} طلب` : `Showing ${filteredOrders.length} of ${baseOrders.length} orders`}</span>
            <span>{isArabic ? 'بوابة ريفليكتو للمدفوعات الآمنة' : 'Reflecto Secure Payments'}</span>
          </div>
        </section>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedOrder(null)} dir={isArabic ? 'rtl' : 'ltr'}>
            <div 
              className={`w-full max-w-lg rounded-2xl p-6 sm:p-7 border shadow-2xl relative transition-all ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#12131C] border-white/10 text-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`flex items-center justify-between pb-4 border-b ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5C24EB]/15 text-[#8B5CF6] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">receipt</span>
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isArabic ? 'تفاصيل العملية المالية' : 'Transaction Details'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">#{selectedOrder.id || 'N/A'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="py-5 space-y-4">
                {/* Status Box */}
                <div className={`flex items-center justify-between p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                  <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isArabic ? 'حالة الدفع الحالية' : 'Payment Status'}
                  </span>
                  {(() => {
                    const badge = getStatusBadge(selectedOrder.status, isLight, isArabic);
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.badgeClass}`}>
                        <span className={`w-2 h-2 rounded-full ${badge.dotClass}`}></span>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Financial Summary */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-purple-50/60 border-purple-200' : 'bg-gradient-to-br from-[#5C24EB]/10 to-transparent border border-[#5C24EB]/20'
                }`}>
                  <div>
                    <span className="text-xs text-[#8B5CF6] font-bold block mb-1">
                      {isArabic ? 'المبلغ الإجمالي' : 'Total Amount'}
                    </span>
                    <span className={`text-3xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {(Number(selectedOrder.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-bold text-[#8B5CF6] mr-1.5 ml-1.5">
                      {selectedOrder.currency || (isArabic ? 'ر.س' : 'SAR')}
                    </span>
                  </div>
                  <div className={isArabic ? 'text-left' : 'text-right'}>
                    <span className={`text-[11px] block mb-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isArabic ? 'طريقة الدفع' : 'Payment Method'}
                    </span>
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {selectedOrder.payment_method || selectedOrder.service || (isArabic ? 'إلكتروني' : 'Online')}
                    </span>
                  </div>
                </div>

                {/* Client Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                    <span className={`block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{isArabic ? 'اسم العميل' : 'Client Name'}</span>
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedOrder.client_name || (isArabic ? 'عميل نقدي' : 'Cash Client')}</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                    <span className={`block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{isArabic ? 'رقم الجوال' : 'Phone'}</span>
                    <span className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedOrder.client_phone || (isArabic ? 'غير مسجل' : 'N/A')}</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                    <span className={`block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{isArabic ? 'تاريخ المعاملة' : 'Date'}</span>
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {new Date(selectedOrder.created_at || Date.now()).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                    <span className={`block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{isArabic ? 'معرف الجلسة / الفاتورة' : 'Session / Invoice ID'}</span>
                    <span className={`font-bold font-mono truncate block ${isLight ? 'text-slate-900' : 'text-white'}`} title={selectedOrder.session_id || 'N/A'}>
                      {selectedOrder.session_id ? selectedOrder.session_id.substring(0, 14) + '...' : (isArabic ? 'غير متوفر' : 'N/A')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`}>
                {selectedOrder.client_phone && (
                  <a
                    href={`https://wa.me/${selectedOrder.client_phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    {isArabic ? 'تواصل واتساب' : 'WhatsApp'}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-white/10 hover:bg-white/15 text-white'}`}
                >
                  {isArabic ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
});

export default OrdersBilling;