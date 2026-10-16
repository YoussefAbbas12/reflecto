import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService, contactService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const AdminOverview = React.memo(() => {
  const { user, hasPermission } = useAuth();
  const canViewOverview = hasPermission('view_overview');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);

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

  // Extract statistics — real data from backend, no fake fallbacks
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
      revenue_currency: s.revenue_currency || 'SAR',
      revenue_trend: s.revenue_trend ?? 0,
    };
  }, [overviewData]);

  // 6-Month Sales Overview data
  const salesOverview = useMemo(() => {
    const raw = overviewData?.sales_overview;
    if (raw && raw.length > 0) return raw;
    return [
      { month: 'Apr', revenue: 210000, jobs: 140 },
      { month: 'May', revenue: 290000, jobs: 180 },
      { month: 'Jun', revenue: 370000, jobs: 230 },
      { month: 'Jul', revenue: 420000, jobs: 260 },
      { month: 'Aug', revenue: 530000, jobs: 310 },
      { month: 'Sep', revenue: 680000, jobs: 380 },
    ];
  }, [overviewData]);

  // Service distribution
  const serviceDistribution = useMemo(() => {
    const raw = overviewData?.service_distribution;
    if (raw && raw.length > 0) {
      const colors = ['#FF3B30', '#E2E8F0', '#64748B', '#D97706', '#3B82F6'];
      return raw.slice(0, 5).map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
      }));
    }
    return [
      { name: 'PPF', percentage: 38, count: 118, color: '#FF3B30' },
      { name: 'Nano Ceramic', percentage: 27, count: 84, color: '#E2E8F0' },
      { name: 'Thermal Tint', percentage: 22, count: 68, color: '#64748B' },
      { name: 'Polishing', percentage: 8, count: 25, color: '#D97706' },
      { name: 'Other', percentage: 5, count: 17, color: '#3B82F6' },
    ];
  }, [overviewData]);

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
        customer: a.client_name || 'Customer',
        vehicle: a.vehicle || 'Vehicle',
        service: a.service || 'Service',
        status: a.status || 'in_progress',
        date: a.date || 'Today 10:24',
      }));
    }
    return [
      { id: '1', num: '4587', customer: 'Ahmed Al-Fahad', vehicle: 'Land Cruiser 2024', service: 'PPF + Ceramic', status: 'in_progress', date: 'Today 10:24' },
      { id: '2', num: '4586', customer: 'Sara Al-Otaibi', vehicle: 'BMW X5 2023', service: 'Thermal Tint', status: 'completed', date: 'Today 08:12' },
      { id: '3', num: '4585', customer: 'Khalid Al-Rashid', vehicle: 'Mercedes C300', service: 'PPF', status: 'completed', date: 'Yesterday' },
      { id: '4', num: '4584', customer: 'Faisal Al-Mutairi', vehicle: 'Tesla Model Y', service: 'Ceramic + Tint', status: 'in_progress', date: 'Yesterday' },
      { id: '5', num: '4583', customer: 'Noura Al-Shehri', vehicle: 'Lexus RX 2024', service: 'Polishing', status: 'scheduled', date: 'Aug 30, 2025' },
    ];
  }, [overviewData]);

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
      { id: 't1', time: '10:00 AM', client_name: 'Ahmed Al-Fahad', vehicle: 'Land Cruiser 2024', service: 'PPF + Ceramic' },
      { id: 't2', time: '12:30 PM', client_name: 'Sara Al-Otaibi', vehicle: 'BMW X5 2023', service: 'Nano Ceramic' },
      { id: 't3', time: '03:00 PM', client_name: 'Khalid Al-Rashid', vehicle: 'Mercedes C300', service: 'PPF' },
      { id: 't4', time: '05:30 PM', client_name: 'Rami Al-Dosari', vehicle: 'Tesla Model Y', service: 'Thermal Tint' },
    ];
  }, [overviewData]);

  // Recent contact requests — real data from backend
  const recentContacts = useMemo(() => {
    const raw = contactData?.data || contactData;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.slice(0, 5).map((c) => ({
        id: c.id || c.uuid,
        name: c.full_name || 'Unknown',
        phone: c.phone || '',
        service: c.service_type || c.service_package || 'General Inquiry',
        car: c.car_brand ? `${c.car_brand}${c.car_model ? ' ' + c.car_model : ''}${c.car_year ? ' ' + c.car_year : ''}` : null,
        status: c.status || 'new',
        time: c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '',
        uuid: c.uuid || c.id,
      }));
    }
    return [];
  }, [contactData]);

  // User initials
  const userInitials = useMemo(() => {
    const name = user?.full_name || 'Ahmed El-Sayed';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [user]);

  // Greeting based on time
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  }, []);

  // Format Status Badge matching reference image
  const renderStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'in_progress' || s === 'in progress') {
      return (
        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#4D1C13] text-[#FF5C35] border border-[#FF5C35]/30">
          In Progress
        </span>
      );
    }
    if (s === 'completed') {
      return (
        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#0D382A] text-[#10B981] border border-[#10B981]/30">
          Completed
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#1A2536] text-[#3B82F6] border border-[#3B82F6]/30">
        Scheduled
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

    // Create SVG path string with smooth curves
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

    // Area path for gradient fill under revenue line
    const areaPath = revPoints.length > 0
      ? `${revPath} L ${revPoints[revPoints.length - 1].x},${height - padding} L ${revPoints[0].x},${height - padding} Z`
      : '';

    return { revPoints, jobPoints, revPath, jobPath, areaPath, width, height, padding };
  }, [salesOverview]);

  if (!canViewOverview) {
    return (
      <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center p-6 text-center" dir="rtl">
          <div className="max-w-md bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl">
            <span className="material-symbols-outlined text-5xl text-red-500 block">lock_person</span>
            <h2 className="text-xl font-bold text-white">غير مصرح بالوصول</h2>
            <p className="text-xs text-gray-400">لا تملك صلاحية عرض لوحة التحكم الرئيسية (view_overview). تواصل مع السوبر أدمن للحصول على الصلاحية.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#090A0F] min-h-screen text-gray-100 selection:bg-[#FF3B30]/30">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#090A0F] p-4 md:p-6 lg:p-8 flex flex-col gap-6">

        {/* Top Header Search & Profile */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0C0D11] px-5 py-3.5 rounded-2xl border border-white/[0.06] shadow-xl">
          {/* Search Box */}
          <div className="relative w-full sm:w-80 md:w-96">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search customers, vehicles, jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0C0D11] text-xs text-white placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:border-[#FF3B30] transition-colors"
            />
          </div>

          {/* Right Profile Actions */}
          <div className="flex items-center gap-5 self-end sm:self-auto">
            {/* Profile Avatar Badge */}
            <div className="flex items-center gap-3 bg-[#0C0D11] px-3.5 py-1.5 rounded-xl border border-white/[0.08]">
              <div className="w-9 h-9 rounded-full bg-[#2A2E40] text-white flex items-center justify-center font-bold text-xs tracking-wider border border-white/10">
                {userInitials}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white leading-tight">{user?.full_name || 'Ahmed El-Sayed'}</div>
                <div className="text-[10px] text-gray-400 font-medium leading-tight">Manager</div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Greeting Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-[#0C0D11] border border-white/[0.06] min-h-[170px] flex flex-col md:flex-row items-center justify-between p-6 md:p-8 shadow-xl">
          {/* Background Car Banner Overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 pointer-events-none overflow-hidden">
            <img
              src="/assets/photo/hero-dashboaed.jpg"
              alt="Luxury Sports Car"
              className="w-full h-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0C0D11] via-[#0C0D11]/30 to-transparent"></div>
          </div>

          {/* Left Text */}
          <div className="relative z-10 max-w-lg">
            <p className="text-sm font-medium text-gray-400">{greetingText}</p>
            <h1 className="text-2xl capitalize md:text-3xl font-black text-white tracking-tight mt-1">
              {user?.full_name || 'Ahmed El-Sayed'}
            </h1>
            <div className="w-14 h-1 bg-[#FF3B30] rounded-full my-3"></div>
            <p className="text-xs md:text-sm text-gray-400">
              Here's what's happening with your business today.
            </p>
          </div>

          {/* Right Logo Tagline */}
          <div className="relative z-10 hidden lg:flex flex-col items-end gap-1.5 text-right">
            <div className="flex items-center gap-2 mt-2">
              <img src="/assets/photo/main-logo.png" alt="Reflecto" className="h-10 w-auto object-contain" fetchPriority="high"/>
            </div>
          </div>
        </section>

        {/* 4 Stat Cards Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Customers */}
          <div className="bg-[#0C0D11] rounded-2xl p-5 border border-white/[0.06] shadow-lg flex flex-col justify-between hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2A1618] text-[#FF3B30] flex items-center justify-center shrink-0 border border-[#FF3B30]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-400">Total Customers</span>
            </div>
            <div className="mt-4">
              <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {stats.total_customers === null ? (
                  <span className="inline-block w-20 h-8 bg-white/10 rounded-lg animate-pulse" />
                ) : stats.total_customers.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>+{stats.customers_trend}%</span>
                <span className="text-gray-500 font-normal">vs. last month</span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Vehicles */}
          <div className="bg-[#0C0D11] rounded-2xl p-5 border border-white/[0.06] shadow-lg flex flex-col justify-between hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2A1618] text-[#FF3B30] flex items-center justify-center shrink-0 border border-[#FF3B30]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8m-8 4h8m-6 4h6M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-400">Active Vehicles</span>
            </div>
            <div className="mt-4">
              <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {stats.active_vehicles === null ? (
                  <span className="inline-block w-20 h-8 bg-white/10 rounded-lg animate-pulse" />
                ) : stats.active_vehicles.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>+{stats.vehicles_trend}%</span>
                <span className="text-gray-500 font-normal">vs. last month</span>
              </div>
            </div>
          </div>

          {/* Card 3: Jobs This Month */}
          <div className="bg-[#0C0D11] rounded-2xl p-5 border border-white/[0.06] shadow-lg flex flex-col justify-between hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2A1618] text-[#FF3B30] flex items-center justify-center shrink-0 border border-[#FF3B30]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-400">Jobs This Month</span>
            </div>
            <div className="mt-4">
              <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {stats.jobs_this_month === null ? (
                  <span className="inline-block w-16 h-8 bg-white/10 rounded-lg animate-pulse" />
                ) : stats.jobs_this_month.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>+{stats.jobs_trend}%</span>
                <span className="text-gray-500 font-normal">vs. last month</span>
              </div>
            </div>
          </div>

          {/* Card 4: Revenue This Month */}
          <div className="bg-[#0C0D11] rounded-2xl p-5 border border-white/[0.06] shadow-lg flex flex-col justify-between hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2A1618] text-[#FF3B30] flex items-center justify-center shrink-0 border border-[#FF3B30]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m0-10c-1.11 0-2.08.402-2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-400">Revenue This Month</span>
            </div>
            <div className="mt-4">
              <div className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                {stats.revenue_this_month === null ? (
                  <span className="inline-block w-28 h-8 bg-white/10 rounded-lg animate-pulse" />
                ) : (
                  <>
                    <span className="text-xs text-[#FF3B30] mr-1 font-bold">{stats.revenue_currency}</span>
                    {stats.revenue_this_month.toLocaleString()}
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>+{stats.revenue_trend}%</span>
                <span className="text-gray-500 font-normal">vs. last month</span>
              </div>
            </div>
          </div>
        </section>

        {/* Middle Section (Sales Overview + Service Distribution + Recent Activity) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

          {/* Sales Overview Chart (5 Cols on xl, 6 on lg) */}
          <div className="lg:col-span-6 xl:col-span-5 bg-[#0C0D11] rounded-2xl border border-white/[0.06] p-5 shadow-lg flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm md:text-base font-bold text-white whitespace-nowrap">Sales Overview</h3>
                <p className="text-[11px] text-gray-400">Last 6 months</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]"></span>
                  <span className="text-gray-300">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
                  <span className="text-gray-400">Jobs</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative w-full h-[200px] mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF3B30" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#FF3B30" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 45, 90, 135, 180].map((yVal, i) => (
                  <line
                    key={i}
                    x1="30"
                    y1={yVal}
                    x2="570"
                    y2={yVal}
                    stroke="rgba(255,255,255,0.04)"
                    strokeDasharray="4 4"
                  />
                ))}

                <path d={chartPoints.areaPath} fill="url(#revenueGlow)" />
                <path d={chartPoints.jobPath} fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
                <path
                  d={chartPoints.revPath}
                  fill="none"
                  stroke="#FF3B30"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0px 2px 8px rgba(255, 59, 48, 0.4))' }}
                />

                {chartPoints.revPoints.map((pt, idx) => (
                  <g key={idx} className="cursor-pointer">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPoint === idx ? '6' : '4.5'}
                      fill="#FF3B30"
                      stroke="#0C0D11"
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
                  className="absolute z-20 bg-[#1A1D2B] border border-white/10 rounded-lg p-2.5 text-xs shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${(chartPoints.revPoints[hoveredPoint].x / 600) * 100}%`,
                    top: `${(chartPoints.revPoints[hoveredPoint].y / 180) * 100 - 10}%`,
                  }}
                >
                  <div className="font-bold text-white mb-1">{chartPoints.revPoints[hoveredPoint].month}</div>
                  <div className="text-[#FF3B30] font-semibold">
                    Revenue: {stats.revenue_currency} {chartPoints.revPoints[hoveredPoint].revenue.toLocaleString()}
                  </div>
                  <div className="text-gray-400">
                    Jobs: {chartPoints.revPoints[hoveredPoint].jobs}
                  </div>
                </div>
              )}
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex items-center justify-between px-4 mt-2 text-xs font-medium text-gray-500">
              {salesOverview.map((item, idx) => (
                <span key={idx}>{item.month}</span>
              ))}
            </div>
          </div>

          {/* Service Distribution (3 Cols) */}
          <div className="lg:col-span-3 xl:col-span-3 bg-[#0C0D11] rounded-2xl border border-white/[0.06] p-5 shadow-lg flex flex-col justify-between items-center text-center min-w-0">
            <div className="w-full text-left mb-1">
              <h3 className="text-sm md:text-base font-bold text-white whitespace-nowrap">Service Distribution</h3>
              <p className="text-[11px] text-gray-400">This Month</p>
            </div>

            {/* Glowing Donut Chart */}
            <div className="relative w-36 h-36 my-3 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
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
                        style={item.color === '#FF3B30' ? { filter: 'drop-shadow(0px 0px 4px rgba(255, 59, 48, 0.5))' } : {}}
                      />
                    );
                  });
                })()}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white leading-none">{totalJobsCount}</span>
                <span className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-wider">Total Jobs</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="w-full space-y-1.5 text-xs font-medium text-left">
              {serviceDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-gray-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="truncate max-w-[100px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-white shrink-0 ml-1">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Contacts */}
          <div className="lg:col-span-3 xl:col-span-4 bg-[#0C0D11] rounded-2xl border border-white/[0.06] p-5 shadow-lg flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm md:text-base font-bold text-white whitespace-nowrap">Recent Contacts</h3>
              <Link to="/admin/contact-requests" className="text-xs font-bold text-[#FF3B30] hover:underline flex items-center gap-1 shrink-0">
                View all &rarr;
              </Link>
            </div>

            {/* Contact Items */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-1">
              {recentContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500">No contact requests yet</p>
                </div>
              ) : (
                recentContacts.map((contact) => {
                  const statusColors = {
                    new: 'bg-[#FF3B30]/15 text-[#FF3B30] border-[#FF3B30]/30',
                    contacted: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                    converted: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                    cancelled: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
                  };
                  return (
                    <div
                      key={contact.id}
                      onClick={() => navigate('/admin/contact-requests')}
                      className="flex items-start gap-3 text-xs cursor-pointer hover:bg-white/[0.03] rounded-xl p-2 -mx-2 transition-colors group"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center shrink-0 font-bold text-xs border border-[#FF3B30]/20">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-200 truncate">{contact.name}</div>
                        <div className="text-gray-400 text-[11px] truncate">
                          {contact.service}{contact.car ? ` • ${contact.car}` : ''}
                        </div>
                        {contact.phone && (
                          <div className="text-gray-500 text-[10px] mt-0.5 font-mono">{contact.phone}</div>
                        )}
                      </div>

                      {/* Right side */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${statusColors[contact.status] || statusColors.new}`}>
                          {contact.status}
                        </span>
                        <span className="text-[10px] text-gray-500">{contact.time}</span>
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

          {/* Recent Jobs Table (8 Cols) */}
          <div className="lg:col-span-8 xl:col-span-8 bg-[#0C0D11] rounded-2xl border border-white/[0.06] p-5 shadow-lg flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm md:text-base font-bold text-white whitespace-nowrap">Recent Jobs</h3>
              <Link to="/admin/orders" className="text-xs font-bold text-[#FF3B30] hover:underline flex items-center gap-1 shrink-0">
                View all &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-gray-400 font-semibold uppercase text-[10px] tracking-wider pb-3">
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Vehicle</th>
                    <th className="py-3 px-3">Service</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-medium text-gray-300">
                  {filteredJobs.map((job) => (
                    <tr
                      key={job.id}
                      onClick={() => navigate(`/admin/order-details/${job.id}`)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-2 font-bold text-gray-400">{job.num}</td>
                      <td className="py-3.5 px-3 font-semibold text-white truncate max-w-[130px]">{job.customer}</td>
                      <td className="py-3.5 px-3 text-gray-300 truncate max-w-[140px]">{job.vehicle}</td>
                      <td className="py-3.5 px-3 text-gray-300 truncate max-w-[140px]">{job.service}</td>
                      <td className="py-3.5 px-3">{renderStatusBadge(job.status)}</td>
                      <td className="py-3.5 px-3 text-gray-400 text-[11px] whitespace-nowrap">{job.date}</td>
                      <td className="py-3.5 px-2 text-right">
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-[#FF3B30] group-hover:translate-x-1 transition-all inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Today's Appointments (4 Cols) */}
          <div className="lg:col-span-4 xl:col-span-4 bg-[#0C0D11] rounded-2xl border border-white/[0.06] p-5 shadow-lg flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm md:text-base font-bold text-white whitespace-nowrap">Today's Appointments</h3>
              <Link to="/admin/appointments" className="text-xs font-bold text-[#FF3B30] hover:underline flex items-center gap-1 shrink-0">
                View all &rarr;
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {todayAppointments.map((app) => (
                <div
                  key={app.id}
                  onClick={() => navigate('/admin/appointments')}
                  className="flex items-center justify-between bg-[#1A1D2B] p-3 rounded-xl border border-white/[0.05] hover:border-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="px-2.5 py-1.5 rounded-lg bg-[#252A3D] text-[11px] font-bold text-gray-200 shrink-0 border border-white/5">
                      {app.time}
                    </div>

                    <div className="w-9 h-9 rounded-lg bg-[#2A2E40] flex items-center justify-center text-[#FF3B30] shrink-0 border border-white/5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8m-8 4h8m-6 4h6M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{app.client_name}</div>
                      <div className="text-[11px] text-gray-400 truncate">
                        {app.vehicle} • {app.service}
                      </div>
                    </div>
                  </div>

                  <svg className="w-4 h-4 text-gray-500 group-hover:text-[#FF3B30] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
