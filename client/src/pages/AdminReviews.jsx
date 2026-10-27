import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { reviewsService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { useAdminTheme } from '../contexts/AdminThemeContext';

const AdminReviews = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { isLight } = useAdminTheme();
  const { hasPermission } = useAuth();
  const canView = hasPermission('view_reviews');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all', 'month', 'year'
  const [searchQuery, setSearchQuery] = useState('');

  if (!canView) {
    return (
      <div className={`min-h-screen flex flex-col lg:flex-row ${isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#050505] text-white admin-dark-theme'}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className={`max-w-md rounded-3xl p-8 space-y-4 shadow-2xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/10'}`}>
            <span className="material-symbols-outlined text-5xl text-red-500 block">lock_person</span>
            <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {isArabic ? 'غير مصرح بالوصول' : 'Access Denied'}
            </h2>
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              {isArabic ? 'لا تملك صلاحية عرض التقييمات. تواصل مع السوبر أدمن للحصول على صلاحية (view_reviews).' : 'You do not have permission to view reviews.'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminReviews', selectedBranch, selectedPeriod],
    queryFn: () => reviewsService.getAdminReviews({ branch: selectedBranch, period: selectedPeriod }),
    refetchInterval: 15000,
  });

  const reviewsList = data?.reviews || [];
  const stats = data?.stats || { total_reviews: 0, avg_rating: 0, satisfaction_rate: 100, total_points_awarded: 0 };
  const branchStats = data?.branchStats || [];
  const timeTrends = data?.timeTrends || [];
  const availableBranches = data?.branches || [];

  // Filter reviews by client search query
  const filteredReviews = useMemo(() => {
    if (!searchQuery.trim()) return reviewsList;
    const q = searchQuery.toLowerCase().trim();
    return reviewsList.filter((r) => {
      const name = (r.client_name || '').toLowerCase();
      const phone = (r.client_phone || '').toLowerCase();
      const comment = (r.comment || '').toLowerCase();
      const wo = (r.work_order_number || '').toLowerCase();
      const branch = (r.branch_name || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || comment.includes(q) || wo.includes(q) || branch.includes(q);
    });
  }, [reviewsList, searchQuery]);

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-300 ${isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#090A0F] text-white admin-dark-theme'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-8 overflow-x-hidden">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-[#5C24EB] flex items-center justify-center text-white font-bold shadow-lg">
                <span className="material-symbols-outlined text-2xl">reviews</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-black tracking-wide font-display ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {isArabic ? 'مراجعات وتقييمات العملاء' : 'Customer Reviews & Ratings'}
              </h1>
            </div>
            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              {isArabic 
                ? 'تابع تحليلات رضا العملاء وتقييمات الفروع وملاحظات الخدمات المقدمة.' 
                : 'Monitor customer satisfaction analytics, branch ratings, and service feedback.'}
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Period selector */}
            <div className={`p-1 rounded-xl border flex items-center gap-1 ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/[0.05] border-white/10'}`}>
              {[
                { id: 'all', labelEn: 'All Time', labelAr: 'الكل' },
                { id: 'month', labelEn: 'This Month', labelAr: 'الشهر الحالي' },
                { id: 'year', labelEn: 'This Year', labelAr: 'السنة الحالية' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriod(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedPeriod === p.id
                      ? 'bg-[#5C24EB] text-white shadow-md'
                      : isLight ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {isArabic ? p.labelAr : p.labelEn}
                </button>
              ))}
            </div>

            {/* Branch selector */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className={`border rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer ${isLight ? 'bg-white border-gray-300 text-gray-800 shadow-sm focus:border-[#5C24EB]' : 'bg-white/[0.05] border-white/10 text-white focus:border-[#5C24EB]'}`}
            >
              <option value="all" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0f0f0f] text-white'}>
                {isArabic ? `كل الفروع (${availableBranches.length})` : `All Branches (${availableBranches.length})`}
              </option>
              {availableBranches.map((b) => (
                <option key={b} value={b} className={isLight ? 'bg-white text-gray-900' : 'bg-[#0f0f0f] text-white'}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Widget Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Avg Rating */}
          <div className={`p-5 rounded-2xl relative overflow-hidden shadow-xl border ${
            isLight ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200' : 'bg-gradient-to-br from-amber-500/10 via-white/[0.02] to-white/[0.01] border-amber-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {isArabic ? 'متوسط التقييم العام' : 'Average Rating'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">star</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-500 font-mono">{stats.avg_rating || '0.0'}</span>
              <span className={`text-xs font-bold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>/ 5.0</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`material-symbols-outlined text-sm ${
                    s <= Math.round(stats.avg_rating || 0) ? 'text-amber-500' : isLight ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  style={{
                    fontVariationSettings: s <= Math.round(stats.avg_rating || 0) ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400"
                  }}
                >
                  star
                </span>
              ))}
            </div>
          </div>

          {/* Satisfaction Rate */}
          <div className={`p-5 rounded-2xl relative overflow-hidden shadow-xl border ${
            isLight ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200' : 'bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-white/[0.01] border-emerald-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {isArabic ? 'نسبة رضا العملاء' : 'Satisfaction Rate'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">sentiment_very_satisfied</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-500 font-mono">{stats.satisfaction_rate}%</span>
            </div>
            <p className={`mt-2 text-[11px] font-medium truncate ${isLight ? 'text-emerald-700' : 'text-emerald-300/70'}`}>
              {isArabic ? 'نسبة التقييمات الإيجابية (4 و 5 نجوم)' : 'Positive reviews (4 & 5 stars)'}
            </p>
          </div>

          {/* Total Reviews */}
          <div className={`p-5 rounded-2xl relative overflow-hidden shadow-xl border ${
            isLight ? 'bg-gradient-to-br from-blue-50 to-white border-blue-200' : 'bg-gradient-to-br from-blue-500/10 via-white/[0.02] to-white/[0.01] border-blue-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {isArabic ? 'إجمالي التقييمات' : 'Total Reviews'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">rate_review</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-blue-500 font-mono">{stats.total_reviews}</span>
            </div>
            <p className={`mt-2 text-[11px] font-medium ${isLight ? 'text-blue-700' : 'text-blue-300/70'}`}>
              {isArabic ? 'مراجعة مسجلة في النظام' : 'Recorded reviews'}
            </p>
          </div>

          {/* Loyalty Points Awarded */}
          <div className={`p-5 rounded-2xl relative overflow-hidden shadow-xl border ${
            isLight ? 'bg-gradient-to-br from-purple-50 to-white border-purple-200' : 'bg-gradient-to-br from-[#5C24EB]/10 via-white/[0.02] to-white/[0.01] border-[#5C24EB]/30'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {isArabic ? 'نقاط ولاء التقييمات' : 'Points Awarded'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#5C24EB]/20 text-[#8B5CF6] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">card_giftcard</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#8B5CF6] font-mono">{stats.total_points_awarded}</span>
              <span className="text-xs font-bold text-[#8B5CF6]">{isArabic ? 'نقطة' : 'Pts'}</span>
            </div>
            <p className={`mt-2 text-[11px] font-medium ${isLight ? 'text-purple-700' : 'text-gray-400'}`}>
              {isArabic ? 'تم مَنح 10 نقاط لكل تقييم' : '10 points per review'}
            </p>
          </div>
        </div>

        {/* 4 Criteria Averages Summary */}
        <div className={`p-5 rounded-2xl shadow-xl space-y-3 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#050505] border-white/10'}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B5CF6] text-lg">insights</span>
            <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {isArabic ? 'متوسط تقييم المعايير الأربعة الأساسية' : 'Core 4 Evaluation Criteria'}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.03] border-white/5'}`}>
              <span className={`text-[10px] font-bold block mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {isArabic ? '✨ جودة الخدمة والنتيجة' : '✨ Service Quality'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-amber-500 font-mono">{stats.avg_quality || '0.0'}</span>
                <span className="text-[10px] text-gray-500 font-bold">/ 5.0</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.03] border-white/5'}`}>
              <span className={`text-[10px] font-bold block mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {isArabic ? '👥 احترافية فريق العمل' : '👥 Staff Professionalism'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-amber-500 font-mono">{stats.avg_staff || '0.0'}</span>
                <span className="text-[10px] text-gray-500 font-bold">/ 5.0</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.03] border-white/5'}`}>
              <span className={`text-[10px] font-bold block mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {isArabic ? '⏱️ الالتزام بالمواعيد' : '⏱️ Timeliness & Delivery'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-amber-500 font-mono">{stats.avg_timing || '0.0'}</span>
                <span className="text-[10px] text-gray-500 font-bold">/ 5.0</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.03] border-white/5'}`}>
              <span className={`text-[10px] font-bold block mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {isArabic ? '📱 سهولة استخدام النظام' : '📱 App & Platform Ease'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-amber-500 font-mono">{stats.avg_system || '0.0'}</span>
                <span className="text-[10px] text-gray-500 font-bold">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Top Branches by Rating */}
          <div className={`rounded-3xl p-6 shadow-2xl space-y-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/10'}`}>
            <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">bar_chart</span>
                </div>
                <div>
                  <h3 className={`text-base font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {isArabic ? 'ترتيب وتقييم الفروع' : 'Branch Ratings & Ranking'}
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    {isArabic ? 'مقارنة متوسط تقييم كل فرع ونسبة الرضا' : 'Branch average rating & satisfaction comparison'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-gray-400 font-bold">
                {branchStats.length} {isArabic ? 'فروع' : 'Branches'}
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {branchStats.length > 0 ? (
                branchStats.map((b, idx) => {
                  const ratingVal = parseFloat(b.avg_rating || 0);
                  const percentage = Math.min(100, Math.max(0, (ratingVal / 5) * 100));

                  return (
                    <div key={b.branch_name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${idx === 0 ? 'bg-amber-400 text-black shadow-md' : isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-gray-400'}`}>
                            #{idx + 1}
                          </span>
                          <span className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{b.branch_name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ({b.review_count} {isArabic ? 'مراجعات' : 'reviews'})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-emerald-500 font-bold">{b.satisfaction_rate}% {isArabic ? 'رضا' : 'Sat'}</span>
                          <span className="text-amber-500 font-black text-sm">⭐ {ratingVal.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Bar Track */}
                      <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 relative ${isLight ? 'bg-gray-100' : 'bg-white/10'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-700 shadow-lg ${idx === 0
                              ? 'bg-gradient-to-r from-amber-500 via-[#5C24EB] to-amber-400'
                              : 'bg-gradient-to-r from-[#5C24EB] to-amber-500 opacity-80'
                            }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-gray-400 text-xs">
                  {isArabic ? 'لا توجد بيانات تقييم للفروع في هذه الفترة.' : 'No branch review data for this period.'}
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Satisfaction Trend Over Time */}
          <div className={`rounded-3xl p-6 shadow-2xl space-y-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/10'}`}>
            <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">trending_up</span>
                </div>
                <div>
                  <h3 className={`text-base font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {isArabic ? 'نسبة رضا العملاء عبر الزمن' : 'Satisfaction Trend'}
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    {isArabic ? 'تطور التقييمات ونسبة الإيجابية شهرياً/سنوياً' : 'Monthly/yearly ratings evolution'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold">
                {isArabic ? 'تدرج زمني' : 'Timeline'}
              </span>
            </div>

            <div className="pt-2">
              {timeTrends.length > 0 ? (
                <div className="space-y-4">
                  {/* Timeline Histogram Bars */}
                  <div className={`h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                    {timeTrends.map((tItem) => {
                      const satRate = parseFloat(tItem.satisfaction_rate || 100);
                      const barHeightPercent = Math.max(15, satRate);

                      return (
                        <div key={tItem.period_key} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          <div className="text-[10px] font-bold text-amber-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-1.5 py-0.5 rounded border border-amber-400/30 whitespace-nowrap mb-1">
                            ⭐ {tItem.avg_rating} ({tItem.count})
                          </div>
                          <div
                            className="w-full max-w-[40px] bg-gradient-to-t from-emerald-600 via-emerald-400 to-amber-400 rounded-t-lg transition-all group-hover:brightness-125 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            style={{ height: `${barHeightPercent}%` }}
                          ></div>
                          <span className={`text-[10px] font-mono truncate ${isLight ? 'text-gray-600 group-hover:text-gray-900' : 'text-gray-400 group-hover:text-white'}`}>
                            {tItem.period_label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`flex items-center justify-between text-xs pt-2 px-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      {isArabic ? 'نسبة الرضا الإيجابي (%)' : 'Positive satisfaction (%)'}
                    </span>
                    <span className="font-mono text-emerald-500 font-bold">
                      {isArabic ? 'أعلى نسبة:' : 'Peak:'} {Math.max(...timeTrends.map(t => parseFloat(t.satisfaction_rate || 0)))}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 text-xs">
                  {isArabic ? 'لا توجد مراجعات زمنية متاحة حالياً.' : 'No time trend reviews available.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Feed Section */}
        <div className={`rounded-3xl p-6 shadow-2xl space-y-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/10'}`}>
          {/* Header & Search */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#5C24EB]/10 text-[#8B5CF6] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">forum</span>
              </div>
              <div>
                <h3 className={`text-base font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {isArabic ? 'سجل مراجعات العملاء التفصيلي' : 'Customer Reviews Log'}
                </h3>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {isArabic ? 'عرض كافة التعليقات والملاحظات والتقييمات للخدمات' : 'Detailed comments, ratings, and feedback'}
                </p>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <span className={`material-symbols-outlined absolute ${isArabic ? 'right-3' : 'left-3'} top-2.5 text-gray-400 text-lg`}>search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'ابحث باسم العميل أو جواله أو تعليقه...' : 'Search by client, phone, or comment...'}
                className={`w-full rounded-xl py-2 text-xs outline-none focus:border-[#5C24EB] transition-all border ${isArabic ? 'pr-9 pl-4' : 'pl-9 pr-4'} ${
                  isLight
                    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    : 'bg-white/[0.05] border-white/10 text-white placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#5C24EB] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-red-400 text-xs font-bold">
              {isArabic ? 'حدث خطأ أثناء تحميل سجل التقييمات.' : 'Failed to load reviews.'} <button onClick={() => refetch()} className="underline cursor-pointer">{isArabic ? 'إعادة المحاولة' : 'Retry'}</button>
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`p-5 rounded-2xl transition-all space-y-3 border ${
                    isLight 
                      ? 'bg-gray-50/70 hover:bg-gray-50 border-gray-200' 
                      : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/5'
                  }`}
                >
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
                    {/* Client info */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => rev.client_id && navigate(`/admin/client-details/${rev.client_id}`)}
                        className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#5C24EB]/20 to-amber-500/20 border border-[#5C24EB]/30 text-[#8B5CF6] flex items-center justify-center font-bold text-sm shrink-0 transition-transform ${rev.client_id ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                        title={rev.client_id ? (isArabic ? 'عرض تفاصيل العميل' : 'View Client Details') : ''}
                      >
                        {rev.client_name ? rev.client_name.charAt(0) : 'C'}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => rev.client_id && navigate(`/admin/client-details/${rev.client_id}`)}
                            className={`text-sm font-extrabold transition-colors ${rev.client_id ? (isLight ? 'text-gray-900 hover:text-[#5C24EB] cursor-pointer underline underline-offset-2 decoration-dotted' : 'text-white hover:text-[#8B5CF6] cursor-pointer underline underline-offset-2 decoration-dotted') : (isLight ? 'text-gray-900 cursor-default' : 'text-white cursor-default')}`}
                          >
                            {rev.client_name || (isArabic ? 'عميل ريفليكتو' : 'Reflecto Client')}
                          </button>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${isLight ? 'bg-gray-200 text-gray-700' : 'bg-white/10 text-gray-300'}`}>
                            {rev.branch_name || (isArabic ? 'فرع غير محدد' : 'Unknown Branch')}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono flex items-center gap-3 mt-0.5">
                          <span>{rev.client_phone || '—'}</span>
                          {rev.work_order_number && (
                            <span className="text-amber-500 font-bold">{isArabic ? 'رقم الطلب:' : 'Order #'} #{rev.work_order_number}</span>
                          )}
                          {rev.vehicle_type && (
                            <span className={isLight ? 'text-gray-600' : 'text-gray-300'}>
                              {isArabic ? 'السيارة:' : 'Vehicle:'} {rev.vehicle_type} {rev.vehicle_model || ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating & Points Badge */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`material-symbols-outlined text-base ${
                              star <= rev.rating ? 'text-amber-500' : isLight ? 'text-gray-300' : 'text-gray-600'
                            }`}
                            style={{
                              fontVariationSettings: star <= rev.rating ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400"
                            }}
                          >
                            star
                          </span>
                        ))}
                        <span className="text-xs font-black text-amber-500 font-mono mr-1 ml-1">{rev.rating}.0</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#8B5CF6] bg-[#5C24EB]/10 px-2 py-1 rounded-lg">
                        +{rev.points_awarded || 10} {isArabic ? 'نقطة' : 'Pts'}
                      </span>
                    </div>
                  </div>

                  {/* 4 Criteria Rating Breakdown */}
                  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t text-[11px] ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
                    <div className={`p-2 rounded-xl flex items-center justify-between border ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/5'}`}>
                      <span className={`text-[10px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{isArabic ? '✨ الجودة:' : '✨ Quality:'}</span>
                      <span className="font-bold text-amber-500 font-mono">⭐ {rev.rating_quality || rev.rating || 5}.0</span>
                    </div>
                    <div className={`p-2 rounded-xl flex items-center justify-between border ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/5'}`}>
                      <span className={`text-[10px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{isArabic ? '👥 الفريق:' : '👥 Staff:'}</span>
                      <span className="font-bold text-amber-500 font-mono">⭐ {rev.rating_staff || rev.rating || 5}.0</span>
                    </div>
                    <div className={`p-2 rounded-xl flex items-center justify-between border ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/5'}`}>
                      <span className={`text-[10px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{isArabic ? '⏱️ الالتزام:' : '⏱️ Timeliness:'}</span>
                      <span className="font-bold text-amber-500 font-mono">⭐ {rev.rating_timing || rev.rating || 5}.0</span>
                    </div>
                    <div className={`p-2 rounded-xl flex items-center justify-between border ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/5'}`}>
                      <span className={`text-[10px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{isArabic ? '📱 النظام:' : '📱 Ease:'}</span>
                      <span className="font-bold text-amber-500 font-mono">⭐ {rev.rating_system || rev.rating || 5}.0</span>
                    </div>
                  </div>

                  {/* Comment */}
                  {rev.comment ? (
                    <div className={`p-3.5 rounded-xl text-xs leading-relaxed relative border ${isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-white/[0.03] border-white/5 text-gray-200'}`}>
                      <span className="material-symbols-outlined text-gray-400 text-sm absolute left-3 top-3">format_quote</span>
                      <p className="pr-1 pl-6 font-medium">"{rev.comment}"</p>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">{isArabic ? 'بدون تعليق مکتوب.' : 'No written comment.'}</div>
                  )}

                  {/* Footer Date */}
                  <div className={`text-[10px] font-mono text-gray-400 ${isArabic ? 'text-left' : 'text-right'}`}>
                    {new Date(rev.created_at).toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              {isArabic ? 'لم يتم العثور على أي مراجعات تطابق البحث الفعلي.' : 'No reviews match your query.'}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminReviews;
