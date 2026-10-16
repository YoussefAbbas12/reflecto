import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '../components/AdminSidebar';
import { reviewsService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminReviews = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { hasPermission } = useAuth();
  const canView = hasPermission('view_reviews');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all', 'month', 'year'
  const [searchQuery, setSearchQuery] = useState('');

  if (!canView) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row" dir={isRTL ? 'rtl' : 'ltr'}>
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl">
            <span className="material-symbols-outlined text-5xl text-red-500 block">lock_person</span>
            <h2 className="text-xl font-bold text-white">غير مصرح بالوصول</h2>
            <p className="text-xs text-gray-400">لا تملك صلاحية عرض التقييمات. تواصل مع السوبر أدمن للحصول على صلاحية (view_reviews).</p>
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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row" dir={isRTL ? 'rtl' : 'ltr'}>
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-[#FF5C35] flex items-center justify-center text-white font-bold shadow-lg">
                <span className="material-symbols-outlined text-2xl">reviews</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-display">
                مراجعات وتقييمات العملاء
              </h1>
            </div>
            <p className="text-xs text-gray-400">
              تابع تحليلات رضا العملاء وتقييمات الفروع وملاحظات الخدمات المقدمة.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Period selector */}
            <div className="bg-white/[0.05] p-1 rounded-xl border border-white/10 flex items-center gap-1">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'month', label: 'الشهر الحالي' },
                { id: 'year', label: 'السنة الحالية' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriod(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedPeriod === p.id
                      ? 'bg-[#FF5C35] text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Branch selector */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-[#FF5C35] cursor-pointer"
            >
              <option value="all" className="bg-[#0f0f0f] text-white">كل الفروع ({availableBranches.length})</option>
              {availableBranches.map((b) => (
                <option key={b} value={b} className="bg-[#0f0f0f] text-white">
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Widget Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Avg Rating */}
          <div className="bg-gradient-to-br from-amber-500/10 via-white/[0.02] to-white/[0.01] border border-amber-500/30 p-5 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">متوسط التقييم العام</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">star</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400 font-mono">{stats.avg_rating || '0.0'}</span>
              <span className="text-xs text-gray-400 font-bold">/ 5.0</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`material-symbols-outlined text-sm ${
                    s <= Math.round(stats.avg_rating || 0) ? 'text-amber-400' : 'text-gray-600'
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
          <div className="bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-white/[0.01] border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">نسبة رضا العملاء</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">sentiment_very_satisfied</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 font-mono">{stats.satisfaction_rate}%</span>
            </div>
            <p className="mt-2 text-[11px] text-emerald-300/70 font-medium truncate">
              نسبة التقييمات الإيجابية (4 و 5 نجوم)
            </p>
          </div>

          {/* Total Reviews */}
          <div className="bg-gradient-to-br from-blue-500/10 via-white/[0.02] to-white/[0.01] border border-blue-500/30 p-5 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">إجمالي التقييمات</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">rate_review</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-blue-400 font-mono">{stats.total_reviews}</span>
            </div>
            <p className="mt-2 text-[11px] text-blue-300/70 font-medium">مراجعة مسجلة في النظام</p>
          </div>

          {/* Loyalty Points Awarded */}
          <div className="bg-gradient-to-br from-[#FF5C35]/10 via-white/[0.02] to-white/[0.01] border border-[#FF5C35]/30 p-5 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">نقاط ولاء التقييمات</span>
              <div className="w-8 h-8 rounded-lg bg-[#FF5C35]/20 text-[#FF5C35] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">card_giftcard</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#FF5C35] font-mono">{stats.total_points_awarded}</span>
              <span className="text-xs font-bold text-[#FF5C35]">Pts</span>
            </div>
            <p className="mt-2 text-[11px] text-gray-400 font-medium">تم مَنح 10 نقاط لكل تقييم</p>
          </div>
        </div>

        {/* 4 Criteria Averages Summary */}
        <div className="bg-[#050505] border border-white/10 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FF5C35] text-lg">insights</span>
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">متوسط تقييم المعايير الأربعة الأساسية (4 Criteria Averages)</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold block mb-1">✨ جودة الخدمة والنتيجة</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-amber-400 font-mono">{stats.avg_quality || '0.0'}</span>
                <span className="text-[10px] text-gray-500 font-bold">/ 5.0</span>
              </div>
            </div>
            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold block mb-1">👥 احترافية فريق العمل</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-amber-400 font-mono">{stats.avg_staff || '0.0'}</span>
                <span className="text-[10px] text-gray-500 font-bold">/ 5.0</span>
              </div>
            </div>
            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold block mb-1">⏱️ الالتزام بالمواعيد والتسليم</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-amber-400 font-mono">{stats.avg_timing || '0.0'}</span>
                <span className="text-[10px] text-gray-500 font-bold">/ 5.0</span>
              </div>
            </div>
            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold block mb-1">📱 سهولة استخدام النظام</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-amber-400 font-mono">{stats.avg_system || '0.0'}</span>
                <span className="text-[10px] text-gray-500 font-bold">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Top Branches by Rating */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">bar_chart</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">ترتيب وتقييم الفروع</h3>
                  <p className="text-xs text-gray-400">مقارنة متوسط تقييم كل فرع ونسبة الرضا</p>
                </div>
              </div>
              <span className="text-xs font-mono text-gray-400 font-bold">{branchStats.length} فروع</span>
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
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${idx === 0 ? 'bg-amber-400 text-black shadow-md' : 'bg-white/10 text-gray-400'
                            }`}>
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-white">{b.branch_name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">({b.review_count} مراجعات)</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-emerald-400 font-bold">{b.satisfaction_rate}% رضا</span>
                          <span className="text-amber-400 font-black text-sm">⭐ {ratingVal.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Bar Track */}
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 relative">
                        <div
                          className={`h-full rounded-full transition-all duration-700 shadow-lg ${idx === 0
                              ? 'bg-gradient-to-r from-amber-500 via-[#FF5C35] to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                              : 'bg-gradient-to-r from-[#FF5C35] to-amber-500 opacity-80'
                            }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-gray-500 text-xs">
                  لا توجد بيانات تقييم للفروع في هذه الفترة.
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Satisfaction Trend Over Time */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">trending_up</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">نسبة رضا العملاء عبر الزمن</h3>
                  <p className="text-xs text-gray-400">تطور التقييمات ونسبة الإيجابية شهرياً/سنوياً</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold">
                تدرج زمني
              </span>
            </div>

            <div className="pt-2">
              {timeTrends.length > 0 ? (
                <div className="space-y-4">
                  {/* Timeline Histogram Bars */}
                  <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-white/10">
                    {timeTrends.map((tItem) => {
                      const satRate = parseFloat(tItem.satisfaction_rate || 100);
                      const barHeightPercent = Math.max(15, satRate);

                      return (
                        <div key={tItem.period_key} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          {/* Tooltip on hover */}
                          <div className="text-[10px] font-bold text-amber-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-1.5 py-0.5 rounded border border-amber-400/30 whitespace-nowrap mb-1">
                            ⭐ {tItem.avg_rating} ({tItem.count})
                          </div>
                          <div
                            className="w-full max-w-[40px] bg-gradient-to-t from-emerald-600 via-emerald-400 to-amber-400 rounded-t-lg transition-all group-hover:brightness-125 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            style={{ height: `${barHeightPercent}%` }}
                          ></div>
                          <span className="text-[10px] font-mono text-gray-400 group-hover:text-white truncate">
                            {tItem.period_label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 px-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      نسبة الرضا الإيجابي (%)
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      أعلى نسبة: {Math.max(...timeTrends.map(t => parseFloat(t.satisfaction_rate || 0)))}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500 text-xs">
                  لا توجد مراجعات زمنية متاحة حالياً.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Feed Section */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF5C35]/10 text-[#FF5C35] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">forum</span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">سجل مراجعات العملاء التفصيلي</h3>
                <p className="text-xs text-gray-400">عرض كافة التعليقات والملاحظات والتقييمات للخدمات</p>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-500 text-lg">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم العميل أو جواله أو تعليقه..."
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#FF5C35] transition-all"
              />
            </div>
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-red-400 text-xs font-bold">
              حدث خطأ أثناء تحميل سجل التقييمات. <button onClick={() => refetch()} className="underline cursor-pointer">إعادة المحاولة</button>
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                    {/* Client info */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => rev.client_id && navigate(`/admin/client-details/${rev.client_id}`)}
                        className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#FF5C35]/20 to-amber-500/20 border border-[#FF5C35]/30 text-[#FF5C35] flex items-center justify-center font-bold text-sm shrink-0 transition-transform ${rev.client_id ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                        title={rev.client_id ? 'عرض تفاصيل العميل' : ''}
                      >
                        {rev.client_name ? rev.client_name.charAt(0) : 'C'}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => rev.client_id && navigate(`/admin/client-details/${rev.client_id}`)}
                            className={`text-sm font-extrabold transition-colors ${rev.client_id ? 'text-white hover:text-[#FF5C35] cursor-pointer underline underline-offset-2 decoration-dotted decoration-white/30 hover:decoration-[#FF5C35]' : 'text-white cursor-default'}`}
                            title={rev.client_id ? 'عرض تفاصيل العميل' : ''}
                          >
                            {rev.client_name || 'عميل ريفليكتو'}
                          </button>
                          <span className="px-2 py-0.5 bg-white/10 text-gray-300 rounded text-[10px] font-mono">
                            {rev.branch_name || 'فرع غير محدد'}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono flex items-center gap-3 mt-0.5">
                          <span>{rev.client_phone || '—'}</span>
                          {rev.work_order_number && (
                            <span className="text-amber-400 font-bold">رقم الطلب: #{rev.work_order_number}</span>
                          )}
                          {rev.vehicle_type && (
                            <span className="text-gray-300">السيارة: {rev.vehicle_type} {rev.vehicle_model || ''}</span>
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
                              star <= rev.rating ? 'text-amber-400' : 'text-gray-600'
                            }`}
                            style={{
                              fontVariationSettings: star <= rev.rating ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400"
                            }}
                          >
                            star
                          </span>
                        ))}
                        <span className="text-xs font-black text-amber-400 font-mono mr-1">{rev.rating}.0</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#FF5C35] bg-[#FF5C35]/10 px-2 py-1 rounded-lg">
                        +{rev.points_awarded || 10} Pts
                      </span>
                    </div>
                  </div>

                  {/* 4 Criteria Rating Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/5 text-[11px]">
                    <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
                      <span className="text-gray-400 text-[10px]">✨ الجودة والنتيجة:</span>
                      <span className="font-bold text-amber-400 font-mono">⭐ {rev.rating_quality || rev.rating || 5}.0</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
                      <span className="text-gray-400 text-[10px]">👥 احترافية الفريق:</span>
                      <span className="font-bold text-amber-400 font-mono">⭐ {rev.rating_staff || rev.rating || 5}.0</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
                      <span className="text-gray-400 text-[10px]">⏱️ الالتزام بالوقت:</span>
                      <span className="font-bold text-amber-400 font-mono">⭐ {rev.rating_timing || rev.rating || 5}.0</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
                      <span className="text-gray-400 text-[10px]">📱 سهولة النظام:</span>
                      <span className="font-bold text-amber-400 font-mono">⭐ {rev.rating_system || rev.rating || 5}.0</span>
                    </div>
                  </div>

                  {/* Comment */}
                  {rev.comment ? (
                    <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-gray-200 leading-relaxed relative">
                      <span className="material-symbols-outlined text-gray-600 text-sm absolute left-3 top-3">format_quote</span>
                      <p className="pr-1 pl-6 font-medium">"{rev.comment}"</p>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">بدون تعليق مکتوب.</div>
                  )}

                  {/* Footer Date */}
                  <div className="text-[10px] font-mono text-gray-500 text-left">
                    {new Date(rev.created_at).toLocaleString('ar-SA', {
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
            <div className="py-12 text-center text-gray-500 text-xs">
              لم يتم العثور على أي مراجعات تطابق البحث الفعلي.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminReviews;
