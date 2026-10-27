import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService, contactService, clientService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useAdminTheme } from '../contexts/AdminThemeContext';
import { useLanguage } from '../hooks/useLanguage';
import AdminSidebar from '../components/AdminSidebar';
import EmployeeCodeBadge from '../components/EmployeeCodeBadge';

const AdminOverview = React.memo(() => {
  const { user, hasPermission } = useAuth();
  const { theme, isLight } = useAdminTheme();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const canViewOverview = hasPermission('view_overview');
  const navigate = useNavigate();

  // Search State & Dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null); // { customers: [], staff: [] }
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);

  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Fetch overview data from backend
  const { data: overviewData } = useQuery({
    queryKey: ['adminOverview'],
    queryFn: adminService.getOverview,
    refetchInterval: 30000,
  });

  // Fetch recent contact requests
  const { data: contactData } = useQuery({
    queryKey: ['contactRequests'],
    queryFn: () => contactService.getAll({ limit: 5 }),
    refetchInterval: 30000,
  });

  // Extract statistics
  const stats = useMemo(() => {
    const s = overviewData?.stats || {};
    const hasData = overviewData !== undefined;
    return {
      total_customers: hasData ? (s.total_customers ?? 0) : null,
      customers_trend: s.customers_trend ?? 0,
      active_vehicles: hasData ? (s.active_vehicles ?? 0) : null,
      vehicles_trend: s.vehicles_trend ?? 0,
      jobs_this_month: hasData ? (s.jobs_this_month ?? 0) : null,
      jobs_trend: s.jobs_trend ?? 0,
      revenue_this_month: hasData ? (s.revenue_this_month ?? 0) : null,
      revenue_currency: isArabic ? 'ر.س' : (s.revenue_currency || 'SAR'),
      revenue_trend: s.revenue_trend ?? 0,
    };
  }, [overviewData, isArabic]);

  // 6-Month Sales Overview data
  const salesOverview = useMemo(() => {
    const raw = overviewData?.sales_overview;
    if (raw && raw.length > 0) return raw;
    return [
      { month: isArabic ? 'أبريل' : 'Apr', revenue: 210000, jobs: 140 },
      { month: isArabic ? 'مايو' : 'May', revenue: 290000, jobs: 180 },
      { month: isArabic ? 'يونيو' : 'Jun', revenue: 370000, jobs: 230 },
      { month: isArabic ? 'يوليو' : 'Jul', revenue: 420000, jobs: 260 },
      { month: isArabic ? 'أغسطس' : 'Aug', revenue: 530000, jobs: 310 },
      { month: isArabic ? 'سبتمبر' : 'Sep', revenue: 680000, jobs: 380 },
    ];
  }, [overviewData, isArabic]);

  // Service distribution
  const serviceDistribution = useMemo(() => {
    const raw = overviewData?.service_distribution;
    if (raw && raw.length > 0) {
      const colors = ['#5C24EB', '#8B5CF6', '#A78BFA', '#D97706', '#3B82F6'];
      return raw.slice(0, 5).map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
      }));
    }
    return [
      { name: isArabic ? 'أفلام حماية PPF' : 'PPF', percentage: 38, count: 118, color: '#5C24EB' },
      { name: isArabic ? 'نانو سيراميك' : 'Nano Ceramic', percentage: 27, count: 84, color: isLight ? '#94A3B8' : '#E2E8F0' },
      { name: isArabic ? 'عازل حراري' : 'Thermal Tint', percentage: 22, count: 68, color: '#64748B' },
      { name: isArabic ? 'تلميع ساطع' : 'Polishing', percentage: 8, count: 25, color: '#D97706' },
      { name: isArabic ? 'خدمات أخرى' : 'Other', percentage: 5, count: 17, color: '#3B82F6' },
    ];
  }, [overviewData, isArabic, isLight]);

  const totalJobsCount = useMemo(() => {
    return serviceDistribution.reduce((sum, item) => sum + (item.count || 0), 0) || stats.jobs_this_month;
  }, [serviceDistribution, stats]);

  // Recent jobs table
  const recentJobs = useMemo(() => {
    const raw = overviewData?.recent_appointments;
    if (raw && raw.length > 0) {
      return raw.slice(0, 5).map((a, idx) => ({
        id: a.id || a.uuid,
        num: a.internal_id ? `${a.internal_id}` : `${4587 - idx}`,
        customer: a.client_name || (isArabic ? 'عميل' : 'Customer'),
        vehicle: a.vehicle || (isArabic ? 'مركبة' : 'Vehicle'),
        service: a.service || (isArabic ? 'خدمة' : 'Service'),
        status: a.status || 'in_progress',
        date: a.date || (isArabic ? 'اليوم 10:24' : 'Today 10:24'),
      }));
    }
    return [
      { id: '1', num: '4587', customer: 'أحمد الفهد', vehicle: 'Land Cruiser 2024', service: 'PPF + نانو سيراميك', status: 'in_progress', date: isArabic ? 'اليوم 10:24' : 'Today 10:24' },
      { id: '2', num: '4586', customer: 'سارة العتيبي', vehicle: 'BMW X5 2023', service: 'عازل حراري كامل', status: 'completed', date: isArabic ? 'اليوم 08:12' : 'Today 08:12' },
      { id: '3', num: '4585', customer: 'خالد الرشيد', vehicle: 'Mercedes C300', service: 'حماية مقدمة PPF', status: 'completed', date: isArabic ? 'أمس' : 'Yesterday' },
      { id: '4', num: '4584', customer: 'فيصل المطيري', vehicle: 'Tesla Model Y', service: 'سيراميك + تظليل', status: 'in_progress', date: isArabic ? 'أمس' : 'Yesterday' },
      { id: '5', num: '4583', customer: 'نورة الشهري', vehicle: 'Lexus RX 2024', service: 'تلميع ومعالجة طلاء', status: 'scheduled', date: isArabic ? '30 أغسطس 2025' : 'Aug 30, 2025' },
    ];
  }, [overviewData, isArabic]);

  // Filtered recent jobs based on search input
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return recentJobs;
    const q = searchQuery.toLowerCase();
    return recentJobs.filter(
      (job) =>
        job.num.toLowerCase().includes(q) ||
        job.customer.toLowerCase().includes(q) ||
        job.vehicle.toLowerCase().includes(q) ||
        job.service.toLowerCase().includes(q)
    );
  }, [recentJobs, searchQuery]);

  // Today's appointments
  const todayAppointments = useMemo(() => {
    const raw = overviewData?.today_appointments;
    if (raw && raw.length > 0) {
      return raw.slice(0, 4);
    }
    return [
      { id: 't1', time: '10:00 AM', client_name: 'أحمد الفهد', vehicle: 'Land Cruiser 2024', service: 'PPF + سيراميك' },
      { id: 't2', time: '12:30 PM', client_name: 'سارة العتيبي', vehicle: 'BMW X5 2023', service: 'نانو سيراميك' },
      { id: 't3', time: '03:00 PM', client_name: 'خالد الرشيد', vehicle: 'Mercedes C300', service: 'حماية PPF' },
      { id: 't4', time: '05:30 PM', client_name: 'رامي الدوسري', vehicle: 'Tesla Model Y', service: 'عازل حراري' },
    ];
  }, [overviewData]);

  // Recent contact requests
  const recentContacts = useMemo(() => {
    const raw = contactData?.data || contactData;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.slice(0, 5).map((c) => ({
        id: c.id || c.uuid,
        name: c.full_name || (isArabic ? 'بدون اسم' : 'Unknown'),
        phone: c.phone || '',
        service: c.service_type || c.service_package || (isArabic ? 'استفسار عام' : 'General Inquiry'),
        car: c.car_brand ? `${c.car_brand}${c.car_model ? ' ' + c.car_model : ''}${c.car_year ? ' ' + c.car_year : ''}` : null,
        status: c.status || 'new',
        time: c.created_at ? new Date(c.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-GB', { day: '2-digit', month: 'short' }) : '',
        uuid: c.uuid || c.id,
      }));
    }
    return [];
  }, [contactData, isArabic]);

  // User initials
  const userInitials = useMemo(() => {
    const name = user?.full_name || 'Admin';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [user]);

  // Greeting based on time
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (isArabic) {
      if (hour < 12) return 'صباح الخير،';
      return 'مساء الخير،';
    }
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  }, [isArabic]);

  // Live Search Handler
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!val.trim()) {
      setSearchResults(null);
      setShowSearchDropdown(false);
      return;
    }
    setShowSearchDropdown(true);
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await clientService.search(val.trim());
        const data = res?.data || [];
        const customers = data.filter((u) => u.role === 'client' || !u.role);
        const staff = data.filter((u) => u.role === 'admin' || u.role === 'super_admin' || u.role === 'technician');
        setSearchResults({ customers, staff, all: data });
      } catch (err) {
        console.error('Search error in overview:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);
  };

  // Status Badge
  const renderStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'in_progress' || s === 'in progress') {
      return (
        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#5C24EB]/15 text-[#8B5CF6] border border-[#5C24EB]/30">
          {isArabic ? 'قيد التنفيذ' : 'In Progress'}
        </span>
      );
    }
    if (s === 'completed') {
      return (
        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#0D382A] text-[#10B981] border border-[#10B981]/30">
          {isArabic ? 'مكتمل' : 'Completed'}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#1A2536] text-[#3B82F6] border border-[#3B82F6]/30">
        {isArabic ? 'مؤكد' : 'Scheduled'}
      </span>
    );
  };

  // SVG Chart calculation helper
  const chartPoints = useMemo(() => {
    const width = 600;
    const height = 180;
    const padding = 30;

    const maxRev = Math.max(...salesOverview.map((d) => d.revenue), 800000);
    const maxJobs = Math.max(...salesOverview.map((d) => d.jobs), 500);

    const totalPoints = salesOverview.length > 1 ? salesOverview.length - 1 : 1;

    const revPoints = salesOverview.map((d, index) => {
      const x = padding + (index * (width - 2 * padding)) / totalPoints;
      const y = height - padding - (d.revenue / maxRev) * (height - 2 * padding);
      return { x, y, revenue: d.revenue, jobs: d.jobs, month: d.month };
    });

    const jobPoints = salesOverview.map((d, index) => {
      const x = padding + (index * (width - 2 * padding)) / totalPoints;
      const y = height - padding - (d.jobs / maxJobs) * (height - 2 * padding);
      return { x, y };
    });

    const createSmoothPath = (points) => {
      if (points.length === 0) return '';
      let path = `M ${points[0].x},${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const cpX = (curr.x + next.x) / 2;
        path += ` C ${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y}`;
      }
      return path;
    };

    const revPath = createSmoothPath(revPoints);
    const jobPath = createSmoothPath(jobPoints);

    const areaPath = revPoints.length > 0
      ? `${revPath} L ${revPoints[revPoints.length - 1].x},${height - padding} L ${revPoints[0].x},${height - padding} Z`
      : '';

    return { revPoints, jobPoints, revPath, jobPath, areaPath, width, height, padding };
  }, [salesOverview]);

  if (!canViewOverview) {
    return (
      <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center p-6 text-center" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="max-w-md bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl">
            <span className="material-symbols-outlined text-5xl text-red-500 block">lock_person</span>
            <h2 className="text-xl font-bold text-white">{isArabic ? 'غير مصرح بالوصول' : 'Access Denied'}</h2>
            <p className="text-xs text-gray-400">
              {isArabic 
                ? 'لا تملك صلاحية عرض لوحة التحكم الرئيسية (view_overview). تواصل مع السوبر أدمن للحصول على الصلاحية.'
                : 'You do not have permission to view the overview dashboard (view_overview). Contact the administrator.'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen selection:bg-[#5C24EB]/30 transition-colors duration-300 ${
      isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#090A0F] text-gray-100 admin-dark-theme'
    }`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Area */}
      <main className={`flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 transition-colors duration-300 ${
        isLight ? 'bg-[#F8FAFC]' : 'bg-[#090A0F]'
      }`}>

        {/* Top Header Search & Profile */}
        <header className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border transition-all duration-300 relative ${
          isLight 
            ? 'bg-white border-gray-200 shadow-sm' 
            : 'bg-[#0C0D11] border-white/[0.06] shadow-xl'
        }`}>
          {/* Search Box with Real Search for Customers, Employees, and Jobs */}
          <div ref={searchContainerRef} className="relative w-full sm:w-80 md:w-96">
            <svg 
              className={`w-4 h-4 absolute ${isArabic ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={isArabic ? 'البحث عن العملاء، الموظفين، المركبات...' : 'Search customers, employees, vehicles...'}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true); }}
              className={`w-full text-xs rounded-xl border ${isArabic ? 'pr-10 pl-8' : 'pl-10 pr-8'} py-2.5 focus:outline-none focus:border-[#5C24EB] transition-colors ${
                isLight 
                  ? 'bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200 focus:bg-white' 
                  : 'bg-[#0C0D11] text-white placeholder-gray-400 border-white/[0.08]'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults(null);
                  setShowSearchDropdown(false);
                }}
                className={`absolute ${isArabic ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer p-0.5`}
                title={isArabic ? 'مسح البحث' : 'Clear search'}
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}

            {/* Live Interactive Search Results Dropdown */}
            {showSearchDropdown && (
              <div
                className={`absolute top-full mt-2 w-full sm:w-[420px] ${isArabic ? 'right-0' : 'left-0'} z-50 rounded-2xl border shadow-2xl overflow-hidden max-h-[460px] overflow-y-auto ${
                  isLight
                    ? 'bg-white border-gray-200 text-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.12)]'
                    : 'bg-[#0f1015] border-white/10 text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)]'
                }`}
              >
                <div className={`p-3 border-b text-[11px] font-bold flex items-center justify-between ${
                  isLight ? 'bg-gray-50 border-gray-100 text-gray-600' : 'bg-white/[0.02] border-white/5 text-gray-400'
                }`}>
                  <span>{isArabic ? 'نتائج البحث السريع' : 'Quick Search Results'}</span>
                  {isSearching && (
                    <div className="flex items-center gap-1.5 text-[#8B5CF6]">
                      <div className="w-3.5 h-3.5 border-2 border-[#5C24EB] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px]">{isArabic ? 'جاري البحث...' : 'Searching...'}</span>
                    </div>
                  )}
                </div>

                <div className="p-2 space-y-3">
                  {/* Customers Section */}
                  {searchResults?.customers && searchResults.customers.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">person</span>
                        <span>{isArabic ? 'العملاء' : 'Customers'} ({searchResults.customers.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {searchResults.customers.map((c) => (
                          <div
                            key={c.id || c.uuid}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              navigate(`/admin/clients?search=${encodeURIComponent(c.full_name || c.phone)}`);
                            }}
                            className={`p-2 rounded-xl flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                              isLight ? 'hover:bg-gray-100' : 'hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-[#5C24EB]/15 text-[#8B5CF6] flex items-center justify-center font-bold text-xs shrink-0">
                                {(c.full_name || 'C').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className={`font-bold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{c.full_name}</div>
                                <div className={`text-[10px] font-mono truncate ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {c.phone} {c.vehicle ? `• ${c.vehicle}` : ''}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0 font-bold">
                              {isArabic ? 'عميل' : 'Client'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Staff / Employees Section */}
                  {searchResults?.staff && searchResults.staff.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">badge</span>
                        <span>{isArabic ? 'الموظفون والفنيون' : 'Staff & Technicians'} ({searchResults.staff.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {searchResults.staff.map((s) => (
                          <div
                            key={s.id || s.uuid}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              navigate(`/admin/employees`);
                            }}
                            className={`p-2 rounded-xl flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                              isLight ? 'hover:bg-gray-100' : 'hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                                {(s.full_name || 'S').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className={`font-bold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{s.full_name}</div>
                                <div className={`text-[10px] font-mono truncate ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {s.phone} {s.branch_name ? `• ${s.branch_name}` : ''}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0 font-bold">
                              {s.role === 'technician' ? (isArabic ? 'فني' : 'Technician') : (isArabic ? 'إدارة' : 'Admin')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Recent Orders/Jobs */}
                  {filteredJobs.length > 0 && searchQuery.trim() && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">assignment</span>
                        <span>{isArabic ? 'أوامر العمل' : 'Work Orders'} ({filteredJobs.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {filteredJobs.slice(0, 3).map((job) => (
                          <div
                            key={job.id}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              navigate(`/admin/order-details/${job.id}`);
                            }}
                            className={`p-2 rounded-xl flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                              isLight ? 'hover:bg-gray-100' : 'hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className={`font-bold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                #{job.num} - {job.customer}
                              </div>
                              <div className={`text-[10px] truncate ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                {job.vehicle} • {job.service}
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono shrink-0">{job.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!isSearching &&
                    (!searchResults?.customers || searchResults.customers.length === 0) &&
                    (!searchResults?.staff || searchResults.staff.length === 0) &&
                    filteredJobs.length === 0 && (
                      <div className="py-8 text-center px-4">
                        <span className="material-symbols-outlined text-3xl text-gray-400 mb-2 block">person_search</span>
                        <p className={`text-xs font-bold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                          {isArabic ? `لا توجد نتائج مطابقة لـ "${searchQuery}"` : `No results matching "${searchQuery}"`}
                        </p>
                        <p className={`text-[10px] mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                          {isArabic ? 'تأكد من كتابة اسم العميل، رقم الهاتف، أو اسم الموظف بشكل صحيح' : 'Search by client name, phone number, or employee name'}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Right Profile Actions (Theme toggle icon removed per user request) */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Profile Avatar Badge */}
            <div className={`flex items-center gap-3 px-3.5 py-1.5 rounded-xl border transition-colors ${
              isLight 
                ? 'bg-gray-50 border-gray-200 text-gray-900' 
                : 'bg-[#0C0D11] border-white/[0.08] text-white'
            }`}>
              <div className="w-9 h-9 rounded-full bg-[#5C24EB] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
                {userInitials}
              </div>
              <div className={`${isArabic ? 'text-right' : 'text-left'} hidden md:block`}>
                <div className={`text-xs font-bold leading-tight ${isLight ? 'text-gray-900' : 'text-white'} flex items-center gap-1.5`}>
                  <span>{user?.full_name || 'Admin'}</span>
                  <EmployeeCodeBadge isLight={isLight} variant="compact" />
                </div>
                <div className="text-[10px] text-gray-400 font-medium leading-tight">
                  {user?.role === 'technician' 
                    ? (isArabic ? 'فني مختص' : 'Technician')
                    : (isArabic ? 'المدير العام' : 'Manager')}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Greeting Banner - High Contrast in Light & Dark Mode */}
        <section className={`relative overflow-hidden rounded-2xl border min-h-[170px] flex flex-col md:flex-row items-center justify-between p-6 md:p-8 transition-colors duration-300 ${
          isLight
            ? 'bg-white border-gray-200 shadow-sm'
            : 'bg-[#0C0D11] border-white/[0.06] shadow-xl'
        }`}>
          {/* Background Car Banner Overlay with contrast-preserving gradient */}
          <div className={`absolute top-0 bottom-0 pointer-events-none overflow-hidden ${
            isArabic 
              ? 'left-0 w-full md:w-3/5' 
              : 'right-0 w-full md:w-3/5'
          }`}>
            <img
              src="/assets/photo/hero-dashboaed.jpg"
              alt="Luxury Sports Car"
              className={`w-full h-full object-cover transition-opacity duration-300 ${isArabic ? 'object-left' : 'object-right'} ${isLight ? 'opacity-25' : 'opacity-85'}`}
            />
            <div className={`absolute inset-0 transition-colors duration-300 ${
              isArabic
                ? (isLight 
                    ? 'bg-gradient-to-l from-white via-white/90 to-transparent' 
                    : 'bg-gradient-to-l from-[#0C0D11] via-[#0C0D11]/85 to-transparent')
                : (isLight 
                    ? 'bg-gradient-to-r from-white via-white/90 to-transparent' 
                    : 'bg-gradient-to-r from-[#0C0D11] via-[#0C0D11]/85 to-transparent')
            }`}></div>
          </div>

          {/* Banner Text */}
          <div className="relative z-10 max-w-lg">
            <p className={`text-sm font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              {greetingText}
            </p>
            <div className="flex items-center gap-2.5 flex-wrap mt-1">
              <h1 className={`text-2xl capitalize md:text-3xl font-black tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {user?.full_name || 'Admin'}
              </h1>
              <EmployeeCodeBadge isLight={isLight} variant="hero" />
            </div>
            <div className="w-14 h-1 bg-[#5C24EB] rounded-full my-3"></div>
            <p className={`text-xs md:text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              {isArabic 
                ? 'إليك ملخص ما يحدث في عملك وتفاصيل نشاط المركز اليوم.' 
                : "Here's what's happening with your business today."}
            </p>
          </div>

          {/* Right Logo Tagline */}
          <div className="relative z-10 hidden lg:flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2 mt-2">
              <img 
                src={isLight ? '/assets/photo/seeda-dark-text.png' : '/assets/photo/seeda.png'} 
                alt="Seeda" 
                className="h-10 w-auto object-contain transition-all duration-300" 
                fetchPriority="high"
              />
            </div>
          </div>
        </section>

        {/* 4 Stat Cards Row - Full Light/Dark Responsive */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Customers */}
          <div className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-colors ${
            isLight
              ? 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
              : 'bg-[#0C0D11] border-white/[0.06] shadow-lg hover:border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5C24EB]/15 text-[#8B5CF6] flex items-center justify-center shrink-0 border border-[#5C24EB]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className={`text-xs font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {isArabic ? 'إجمالي العملاء' : 'Total Customers'}
              </span>
            </div>
            <div className="mt-4">
              <div className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {stats.total_customers === null ? (
                  <span className={`inline-block w-20 h-8 rounded-lg animate-pulse ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
                ) : stats.total_customers.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>+{stats.customers_trend}%</span>
                <span className={`font-normal ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  {isArabic ? 'مقارنة بالشهر السابق' : 'vs. last month'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Vehicles */}
          <div className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-colors ${
            isLight
              ? 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
              : 'bg-[#0C0D11] border-white/[0.06] shadow-lg hover:border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5C24EB]/15 text-[#8B5CF6] flex items-center justify-center shrink-0 border border-[#5C24EB]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8m-8 4h8m-6 4h6M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <span className={`text-xs font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {isArabic ? 'المركبات النشطة' : 'Active Vehicles'}
              </span>
            </div>
            <div className="mt-4">
              <div className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {stats.active_vehicles === null ? (
                  <span className={`inline-block w-20 h-8 rounded-lg animate-pulse ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
                ) : stats.active_vehicles.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>+{stats.vehicles_trend}%</span>
                <span className={`font-normal ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  {isArabic ? 'مقارنة بالشهر السابق' : 'vs. last month'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Jobs This Month */}
          <div className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-colors ${
            isLight
              ? 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
              : 'bg-[#0C0D11] border-white/[0.06] shadow-lg hover:border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5C24EB]/15 text-[#8B5CF6] flex items-center justify-center shrink-0 border border-[#5C24EB]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className={`text-xs font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {isArabic ? 'طلبات هذا الشهر' : 'Jobs This Month'}
              </span>
            </div>
            <div className="mt-4">
              <div className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {stats.jobs_this_month === null ? (
                  <span className={`inline-block w-16 h-8 rounded-lg animate-pulse ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
                ) : stats.jobs_this_month.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>+{stats.jobs_trend}%</span>
                <span className={`font-normal ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  {isArabic ? 'مقارنة بالشهر السابق' : 'vs. last month'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Revenue This Month */}
          <div className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-colors ${
            isLight
              ? 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
              : 'bg-[#0C0D11] border-white/[0.06] shadow-lg hover:border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5C24EB]/15 text-[#8B5CF6] flex items-center justify-center shrink-0 border border-[#5C24EB]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m0-10c-1.11 0-2.08.402-2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className={`text-xs font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {isArabic ? 'إيرادات هذا الشهر' : 'Revenue This Month'}
              </span>
            </div>
            <div className="mt-4">
              <div className={`text-xl md:text-2xl font-extrabold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {stats.revenue_this_month === null ? (
                  <span className={`inline-block w-28 h-8 rounded-lg animate-pulse ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
                ) : (
                  <>
                    <span className="text-xs text-[#8B5CF6] mx-1 font-bold">{stats.revenue_currency}</span>
                    {stats.revenue_this_month.toLocaleString()}
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>+{stats.revenue_trend}%</span>
                <span className={`font-normal ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  {isArabic ? 'مقارنة بالشهر السابق' : 'vs. last month'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Middle Section (Sales Overview + Service Distribution + Recent Activity) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

          {/* Sales Overview Chart */}
          <div className={`lg:col-span-6 xl:col-span-5 rounded-2xl border p-5 shadow-sm flex flex-col justify-between min-w-0 transition-colors ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#0C0D11] border-white/[0.06] shadow-lg'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className={`text-sm md:text-base font-bold whitespace-nowrap ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {isArabic ? 'نظرة عامة على المبيعات' : 'Sales Overview'}
                </h3>
                <p className={`text-[11px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {isArabic ? 'آخر 6 أشهر' : 'Last 6 months'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5C24EB]"></span>
                  <span className={isLight ? 'text-gray-700 font-semibold' : 'text-gray-300'}>
                    {isArabic ? 'الإيرادات' : 'Revenue'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                  <span className={isLight ? 'text-gray-500 font-semibold' : 'text-gray-400'}>
                    {isArabic ? 'الطلبات' : 'Jobs'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative w-full h-[200px] mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5C24EB" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#5C24EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 45, 90, 135, 180].map((yVal, i) => (
                  <line
                    key={i}
                    x1="30"
                    y1={yVal}
                    x2="570"
                    y2={yVal}
                    stroke={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)'}
                    strokeDasharray="4 4"
                  />
                ))}

                <path d={chartPoints.areaPath} fill="url(#revenueGlow)" />
                <path d={chartPoints.jobPath} fill="none" stroke={isLight ? '#94A3B8' : '#64748B'} strokeWidth="2.5" strokeLinecap="round" />
                <path
                  d={chartPoints.revPath}
                  fill="none"
                  stroke="#5C24EB"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0px 2px 8px rgba(92, 36, 235, 0.4))' }}
                />

                {chartPoints.revPoints.map((pt, idx) => (
                  <g key={idx} className="cursor-pointer">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPoint === idx ? '6' : '4.5'}
                      fill="#5C24EB"
                      stroke={isLight ? '#FFFFFF' : '#0C0D11'}
                      strokeWidth="2"
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="transition-all"
                    />
                  </g>
                ))}
              </svg>

              {/* Tooltip */}
              {hoveredPoint !== null && chartPoints.revPoints[hoveredPoint] && (
                <div
                  className={`absolute z-20 rounded-lg p-2.5 text-xs shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full border ${
                    isLight 
                      ? 'bg-white border-gray-200 text-gray-900 shadow-lg' 
                      : 'bg-[#1A1D2B] border-white/10 text-white'
                  }`}
                  style={{
                    left: `${(chartPoints.revPoints[hoveredPoint].x / 600) * 100}%`,
                    top: `${(chartPoints.revPoints[hoveredPoint].y / 180) * 100 - 10}%`,
                  }}
                >
                  <div className={`font-bold mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>{chartPoints.revPoints[hoveredPoint].month}</div>
                  <div className="text-[#8B5CF6] font-semibold">
                    {isArabic ? 'الإيرادات: ' : 'Revenue: '} {stats.revenue_currency} {chartPoints.revPoints[hoveredPoint].revenue.toLocaleString()}
                  </div>
                  <div className={isLight ? 'text-gray-600' : 'text-gray-400'}>
                    {isArabic ? 'الطلبات: ' : 'Jobs: '} {chartPoints.revPoints[hoveredPoint].jobs}
                  </div>
                </div>
              )}
            </div>

            {/* X-Axis Month Labels */}
            <div className={`flex items-center justify-between px-4 mt-2 text-xs font-semibold ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
              {salesOverview.map((item, idx) => (
                <span key={idx}>{item.month}</span>
              ))}
            </div>
          </div>

          {/* Service Distribution */}
          <div className={`lg:col-span-3 xl:col-span-3 rounded-2xl border p-5 shadow-sm flex flex-col justify-between items-center text-center min-w-0 transition-colors ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#0C0D11] border-white/[0.06] shadow-lg'
          }`}>
            <div className={`w-full ${isArabic ? 'text-right' : 'text-left'} mb-1`}>
              <h3 className={`text-sm md:text-base font-bold whitespace-nowrap ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {isArabic ? 'توزيع الخدمات' : 'Service Distribution'}
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                {isArabic ? 'هذا الشهر' : 'This Month'}
              </p>
            </div>

            {/* Glowing Donut Chart */}
            <div className="relative w-36 h-36 my-3 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'} strokeWidth="12" />
                {(() => {
                  let accumulatedPercent = 0;
                  const circumference = 2 * Math.PI * 38;
                  return serviceDistribution.map((item, i) => {
                    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                    accumulatedPercent += item.percentage;

                    return (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                        style={item.color === '#5C24EB' ? { filter: 'drop-shadow(0px 0px 4px rgba(92, 36, 235, 0.5))' } : {}}
                      />
                    );
                  });
                })()}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black leading-none ${isLight ? 'text-gray-900' : 'text-white'}`}>{totalJobsCount}</span>
                <span className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {isArabic ? 'إجمالي الطلبات' : 'Total Jobs'}
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className={`w-full space-y-1.5 text-xs font-medium ${isArabic ? 'text-right' : 'text-left'}`}>
              {serviceDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className={`truncate max-w-[120px] font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{item.name}</span>
                  </div>
                  <span className={`font-bold shrink-0 mx-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Contacts */}
          <div className={`lg:col-span-3 xl:col-span-4 rounded-2xl border p-5 shadow-sm flex flex-col justify-between min-w-0 transition-colors ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#0C0D11] border-white/[0.06] shadow-lg'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm md:text-base font-bold whitespace-nowrap ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {isArabic ? 'أحدث رسائل التواصل' : 'Recent Contacts'}
              </h3>
              <Link to="/admin/contact-requests" className="text-xs font-bold text-[#8B5CF6] hover:underline flex items-center gap-1 shrink-0">
                {isArabic ? 'عرض الكل ←' : 'View all →'}
              </Link>
            </div>

            {/* Contact Items */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-1">
              {recentContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isLight ? 'bg-gray-100 text-gray-500' : 'bg-white/5 text-gray-500'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                    {isArabic ? 'لا توجد طلبات تواصل جديدة' : 'No contact requests yet'}
                  </p>
                </div>
              ) : (
                recentContacts.map((contact) => {
                  const statusColors = {
                    new: 'bg-[#5C24EB]/15 text-[#8B5CF6] border-[#5C24EB]/30',
                    contacted: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
                    converted: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
                    cancelled: 'bg-gray-500/15 text-gray-500 border-gray-500/30',
                  };
                  return (
                    <div
                      key={contact.id}
                      onClick={() => navigate('/admin/contact-requests')}
                      className={`flex items-start gap-3 text-xs cursor-pointer rounded-xl p-2 -mx-2 transition-colors group ${
                        isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-[#5C24EB]/15 text-[#8B5CF6] flex items-center justify-center shrink-0 font-bold text-xs border border-[#5C24EB]/20">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{contact.name}</div>
                        <div className={`text-[11px] truncate ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                          {contact.service}{contact.car ? ` • ${contact.car}` : ''}
                        </div>
                        {contact.phone && (
                          <div className={`text-[10px] mt-0.5 font-mono ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>{contact.phone}</div>
                        )}
                      </div>

                      {/* Right side */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${statusColors[contact.status] || statusColors.new}`}>
                          {isArabic
                            ? (contact.status === 'contacted' ? 'تم التواصل' : contact.status === 'converted' ? 'تم التحويل' : contact.status === 'cancelled' ? 'ملغي' : 'جديد')
                            : contact.status}
                        </span>
                        <span className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>{contact.time}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </section>

        {/* Bottom Section (Recent Jobs Table + Today's Appointments) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

          {/* Recent Jobs Table */}
          <div className={`lg:col-span-8 xl:col-span-8 rounded-2xl border p-5 shadow-sm flex flex-col justify-between min-w-0 transition-colors ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#0C0D11] border-white/[0.06] shadow-lg'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm md:text-base font-bold whitespace-nowrap ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {isArabic ? 'أحدث أوامر العمل' : 'Recent Jobs'}
              </h3>
              <Link to="/admin/orders" className="text-xs font-bold text-[#8B5CF6] hover:underline flex items-center gap-1 shrink-0">
                {isArabic ? 'عرض الكل ←' : 'View all →'}
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full ${isArabic ? 'text-right' : 'text-left'} text-xs border-collapse`}>
                <thead>
                  <tr className={`border-b font-bold uppercase text-[10px] tracking-wider pb-3 ${
                    isLight 
                      ? 'border-gray-200 text-gray-600 bg-gray-50' 
                      : 'border-white/[0.06] text-gray-400'
                  }`}>
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-3">{isArabic ? 'العميل' : 'Customer'}</th>
                    <th className="py-3 px-3">{isArabic ? 'المركبة' : 'Vehicle'}</th>
                    <th className="py-3 px-3">{isArabic ? 'الخدمة' : 'Service'}</th>
                    <th className="py-3 px-3">{isArabic ? 'الحالة' : 'Status'}</th>
                    <th className="py-3 px-3">{isArabic ? 'التاريخ' : 'Date'}</th>
                    <th className="py-3 px-2 text-center"></th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-medium ${
                  isLight ? 'divide-gray-100 text-gray-700' : 'divide-white/[0.04] text-gray-300'
                }`}>
                  {filteredJobs.map((job) => (
                    <tr
                      key={job.id}
                      onClick={() => navigate(`/admin/order-details/${job.id}`)}
                      className={`transition-colors cursor-pointer group ${
                        isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <td className={`py-3.5 px-2 font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{job.num}</td>
                      <td className={`py-3.5 px-3 font-semibold truncate max-w-[130px] ${isLight ? 'text-gray-900' : 'text-white'}`}>{job.customer}</td>
                      <td className={`py-3.5 px-3 truncate max-w-[140px] ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{job.vehicle}</td>
                      <td className={`py-3.5 px-3 truncate max-w-[140px] ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{job.service}</td>
                      <td className="py-3.5 px-3">{renderStatusBadge(job.status)}</td>
                      <td className={`py-3.5 px-3 text-[11px] whitespace-nowrap ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{job.date}</td>
                      <td className="py-3.5 px-2 text-center">
                        <svg className={`w-4 h-4 text-gray-400 group-hover:text-[#8B5CF6] transition-all inline-block ${isArabic ? 'transform rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className={`lg:col-span-4 xl:col-span-4 rounded-2xl border p-5 shadow-sm flex flex-col justify-between min-w-0 transition-colors ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#0C0D11] border-white/[0.06] shadow-lg'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm md:text-base font-bold whitespace-nowrap ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {isArabic ? 'مواعيد اليوم' : "Today's Appointments"}
              </h3>
              <Link to="/admin/appointments" className="text-xs font-bold text-[#8B5CF6] hover:underline flex items-center gap-1 shrink-0">
                {isArabic ? 'عرض الكل ←' : 'View all →'}
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {todayAppointments.map((app) => (
                <div
                  key={app.id}
                  onClick={() => navigate('/admin/appointments')}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer group ${
                    isLight
                      ? 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      : 'bg-[#1A1D2B] border-white/[0.05] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 border ${
                      isLight 
                        ? 'bg-white text-gray-800 border-gray-200 shadow-sm' 
                        : 'bg-[#252A3D] text-gray-200 border-white/5'
                    }`}>
                      {app.time}
                    </div>

                    <div className="w-9 h-9 rounded-lg bg-[#5C24EB]/15 flex items-center justify-center text-[#8B5CF6] shrink-0 border border-[#5C24EB]/20">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8m-8 4h8m-6 4h6M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{app.client_name}</div>
                      <div className={`text-[11px] truncate ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        {app.vehicle} • {app.service}
                      </div>
                    </div>
                  </div>

                  <svg className={`w-4 h-4 text-gray-400 group-hover:text-[#8B5CF6] transition-all shrink-0 mx-2 ${isArabic ? 'transform rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>
    </div>
  );
});

export default AdminOverview;
