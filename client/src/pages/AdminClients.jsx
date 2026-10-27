import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { useAdminTheme } from '../contexts/AdminThemeContext';
import AdminSidebar from '../components/AdminSidebar';
import StatCard from '../components/admin/StatCard';
import ClientCard from '../components/admin/ClientCard';

const AdminClients = React.memo(() => {
  const { toast } = useToast();
  const { user, hasPermission } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { isLight } = useAdminTheme();
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('client');
  const isSuperAdmin = Boolean(
    user?.is_super_admin === 1 ||
    user?.is_super_admin === true ||
    user?.role === 'super_admin' ||
    user?.role === 'admin'
  );
  const [branchFilter, setBranchFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);
  const navigate = useNavigate();

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) {
      setSearchResults(null);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await clientService.search(value, 'client');
        setSearchResults(res?.data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  useEffect(() => () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); }, []);

  // Fetch clients from backend with branch filter
  const { data: clientsData, isLoading, refetch } = useQuery({
    queryKey: ['adminClients', page, roleFilter, searchQuery, branchFilter],
    queryFn: () => clientService.getAll(page, roleFilter, searchQuery, branchFilter),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => clientService.remove(id),
    onSuccess: (res) => {
      toast.success(res.message || (isArabic ? 'تم حذف العميل بنجاح' : 'Client deleted successfully'));
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || (isArabic ? 'فشل حذف العميل' : 'Failed to delete client'));
    }
  });

  const handleDeleteClient = useCallback((id, name) => {
    const confirmMsg = isArabic 
      ? `هل أنت متأكد من حذف العميل "${name}"؟ لا يمكن التراجع عن هذا الإجراء.` 
      : `Are you sure you want to delete client "${name}"? This action cannot be undone.`;
    if (window.confirm(confirmMsg)) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation, isArabic]);

  const clients = useMemo(() => Array.isArray(clientsData) ? clientsData : (clientsData?.data || []), [clientsData]);
  const totalPages = useMemo(() => clientsData?.meta?.total_pages || clientsData?.meta?.last_page || 1, [clientsData]);
  const totalClients = useMemo(() => clientsData?.meta?.total ?? (clientsData ? clients.length : 0), [clientsData, clients.length]);

  const dummyData = useMemo(() => [
    { id: 1, name: 'Elena Rodriguez', role: 'Premium Client', status: 'Active', isActiveStatus: true, company: 'Porsche 911', email: '+966501112222', gradientColorClass: 'from-[#ffb4a7]' },
    { id: 2, name: 'Marcus Thorne', role: 'VIP Subscriber', status: 'Active', isActiveStatus: true, company: 'Mercedes S-Class', email: '+966502223333', gradientColorClass: 'from-[#5a0500]' },
    { id: 3, name: 'Sarah Jenkins', role: 'Standard Client', status: 'Inactive', isActiveStatus: false, company: 'BMW X5', email: '+966503334444', gradientColorClass: null },
    { id: 4, name: 'David Chen', role: 'Loyal Customer', status: 'Active', isActiveStatus: true, company: 'Audi RS7', email: '+966504445555', gradientColorClass: 'from-[#ffb4ab]' }
  ], []);

  const displayClients = useMemo(() => {
    if (!clientsData && isLoading) return dummyData;
    if (clientsData && clients.length === 0) return [];
    return clients.map(c => ({
      id: c.id,
      name: c.full_name || 'Unknown',
      role: c.role_name || ((c.role === 'admin' || c.role === 'super_admin') ? (isArabic ? 'إدارة' : 'Administrator') : (c.role === 'technician' ? (isArabic ? 'فني' : 'Technician') : (c.role === 'client' ? (isArabic ? 'عميل' : 'Client') : c.role))),
      status: c.is_active ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive'),
      isActiveStatus: c.is_active !== false,
      company: c.vehicle || (isArabic ? 'بدون مركبة' : 'No Vehicle'),
      company_name: c.company_name,
      company_discount_percent: c.company_discount_percent,
      branch_name: c.branch_name,
      email: c.phone || c.email || 'N/A',
      avatarUrl: c.avatarUrl || null,
      gradientColorClass: 'from-[#5C24EB]'
    }));
  }, [clientsData, isLoading, clients, dummyData, isArabic]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  return (
    <div className={`flex min-h-screen font-body relative pt-24 md:pt-8 selection:bg-[#5C24EB]/30 transition-colors duration-300 ${
      isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#090A0F] text-[#e5e2e1] admin-dark-theme'
    }`} dir={isArabic ? 'rtl' : 'ltr'}>
      
      <AdminSidebar />
      
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 w-full max-w-7xl mx-auto" aria-labelledby="client-registry-heading">
        
        {/* Hero / Header Section */}
        <header className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-6 ${isLight ? 'border-gray-200' : 'border-white/[0.05]'}`}>
          <div className="max-w-2xl">
            <h1 id="client-registry-heading" className={`text-2xl md:text-3xl font-extrabold font-display tracking-tight leading-tight flex items-center gap-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              <span className="text-[#8B5CF6]">{isArabic ? 'إدارة العملاء' : 'Client Registry'}</span>
              {isLoading && <div className="w-5 h-5 border-2 border-[#5C24EB] border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>}
            </h1>
            <p className={`mt-2 font-bold tracking-wide text-xs sm:text-sm max-w-lg leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              {isArabic 
                ? 'إدارة وقاعدة بيانات عملاء ريفليكتو والتحكم بالحسابات والسيارات والخدمات.' 
                : 'Customer database and account, vehicle and service management for Reflecto.'}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <svg className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder={isArabic ? 'ابحث باسم العميل أو رقم الجوال...' : 'Search by client name or phone...'}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`rounded-xl ${isArabic ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-2.5 text-xs sm:text-sm font-bold w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all border ${
                  isLight 
                    ? 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 shadow-sm' 
                    : 'bg-white/[0.05] border-white/10 text-white placeholder:text-gray-500 shadow-inner'
                }`}
                aria-label="Search clients"
              />
              {isSearching && <div className={`absolute ${isArabic ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#5C24EB] border-t-transparent rounded-full animate-spin`} aria-hidden="true"></div>}
            </div>
            <button 
              type="button"
              onClick={() => {
                if (!hasPermission('create_client')) {
                  alert(isArabic ? 'عفواً، ليس لديك صلاحية إضافة عميل جديد (create_client)' : 'You do not have permission to create clients');
                  return;
                }
                navigate('/admin/add-client');
              }}
              className={`px-5 py-2.5 rounded-xl bg-[#5C24EB] text-white font-bold text-xs tracking-wider shadow-[0_8px_30px_rgba(92, 36, 235, 0.3)] flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer ${!hasPermission('create_client') ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
              aria-label="Register new client"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
                person_add
              </span>
              {isArabic ? 'إضافة عميل جديد' : 'New Client'}
            </button>
          </div>
        </header>

        {/* Search Results Overlay */}
        {searchResults && searchResults.length > 0 && (
          <section className={`rounded-2xl p-4 space-y-2 border shadow-2xl transition-all ${
            isLight ? 'bg-white border-gray-200 shadow-lg' : 'bg-white/[0.02] border-white/10 backdrop-blur-2xl'
          }`} aria-label="Search Results">
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-sm font-bold tracking-widest uppercase ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {isArabic ? `نتائج البحث (${searchResults.length})` : `Search Results (${searchResults.length})`}
              </h2>
              <button 
                type="button" 
                onClick={() => { setSearchResults(null); setSearchQuery(''); }} 
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${isLight ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
              >
                {isArabic ? 'مسح' : 'Clear'}
              </button>
            </div>
            {searchResults.map((r) => (
              <article 
                key={r.id} 
                onClick={() => navigate(`/admin/edit-client?id=${r.id}`)} 
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border ${
                  isLight ? 'bg-gray-50 hover:bg-gray-100 border-gray-200' : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                }`} 
                tabIndex={0} 
                role="button" 
                aria-label={`Edit ${r.full_name}`}
              >
                <div className="w-10 h-10 rounded-full bg-[#5C24EB]/10 flex items-center justify-center text-[#8B5CF6] font-bold text-sm" aria-hidden="true">
                  {r.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-bold truncate tracking-wide ${isLight ? 'text-gray-900' : 'text-white'}`}>{r.full_name}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 font-mono ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>{r.phone} {r.vehicle ? `• ${r.vehicle}` : ''}</p>
                </div>
              </article>
            ))}
          </section>
        )}
        {searchResults && searchResults.length === 0 && searchQuery && (
          <div className={`rounded-2xl p-8 text-center font-bold text-sm border ${
            isLight ? 'bg-white border-gray-200 text-gray-500 shadow-sm' : 'bg-white/[0.02] border-white/5 text-gray-500'
          }`} role="alert">
            {isArabic ? `لا يوجد عملاء يطابقون "${searchQuery}"` : `No clients matching "${searchQuery}"`}
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" aria-label="Client Statistics">
          <StatCard
            title={isArabic ? "إجمالي العملاء" : "Total Clients"}
            value={totalClients.toString()}
            icon="group"
            trendText={isArabic ? "جميع الحسابات المسجلة" : "All registered accounts"}
          />
          <StatCard
            title={isArabic ? "متوسط القيمة" : "Average Value"}
            value="14.2k SAR"
            icon="verified"
            trendText={isArabic ? "نمو شريحة العملاء المميزين" : "VIP growth segment"}
          />
          <StatCard
            isSpecial
            title={isArabic ? "تميز الخدمة" : "Service Excellence"}
            description={isArabic ? "نسبة رضا واستمرار العملاء في ريفليكتو تزيد عن 98.2%" : "Reflecto customer satisfaction rate exceeds 98.2%"}
            icon="workspace_premium"
          />
        </section>

        {/* Table / Grid Toggle & Filter */}
        <section className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-white/[0.05]'}`} aria-label="List Controls">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Client Role Indicator */}
            <span className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider flex items-center gap-1.5 border ${
              isLight ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-white/[0.05] border-white/10 text-gray-300'
            }`}>
              <span className="material-symbols-outlined text-sm text-[#8B5CF6]">person</span>
              {isArabic ? 'سجل العملاء فقط' : 'Clients Only'}
            </span>

            {/* Branch Filter — Only Super Admin can switch branches */}
            {isSuperAdmin ? (
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider border transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 cursor-pointer ${
                  isLight 
                    ? 'bg-white border-gray-200 text-gray-900 shadow-sm' 
                    : 'bg-white/[0.05] border-white/10 text-amber-400'
                }`}
                aria-label="Filter by branch"
              >
                <option value="all" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'جميع الفروع (All Branches)' : 'All Branches'}</option>
                <option value="جدة - شارع صاري" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'جدة - شارع صاري' : 'Jeddah - Sari St.'}</option>
                <option value="جدة - الصفا" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'جدة - الصفا' : 'Jeddah - Al-Safa'}</option>
                <option value="جدة - البوادي" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'جدة - البوادي' : 'Jeddah - Al-Bawadi'}</option>
                <option value="فرع الرياض - الفيصلية 1" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'فرع الرياض - الفيصلية 1' : 'Riyadh - Al Faisaliah 1'}</option>
                <option value="فرع الرياض - الفيصلية 2" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'فرع الرياض - الفيصلية 2' : 'Riyadh - Al Faisaliah 2'}</option>
                <option value="فرع مكة المكرمة" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'فرع مكة المكرمة' : 'Makkah Branch'}</option>
                <option value="فرع الطائف" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'فرع الطائف' : 'Taif Branch'}</option>
                <option value="فرع الدمام" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'فرع الدمام' : 'Dammam Branch'}</option>
                <option value="فرع المدينة المنورة" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'فرع المدينة المنورة' : 'Madinah Branch'}</option>
              </select>
            ) : (
              <span className="bg-[#5C24EB]/10 border border-[#5C24EB]/30 text-[#8B5CF6] px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {isArabic ? `الفرع: ${user?.branch_name || 'فرع جدة'}` : `Branch: ${user?.branch_name || 'Jeddah Branch'}`}
              </span>
            )}

            <div className={`h-6 w-[1px] hidden sm:block ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} aria-hidden="true"></div>
            <p className={`text-xs font-bold tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`} aria-live="polite">
              {isArabic ? (
                <>عرض <span className={`font-mono font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{displayClients.length}</span> من أصل <span className={`font-mono font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{totalClients}</span> عميل</>
              ) : (
                <>Showing <span className={`font-mono font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{displayClients.length}</span> of <span className={`font-mono font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{totalClients}</span> clients</>
              )}
            </p>
          </div>
          <div className={`flex rounded-xl p-1 border ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/[0.02] border-white/5'}`} role="group" aria-label="View layout toggles">
            <button 
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all focus:outline-none cursor-pointer ${viewMode === 'grid' ? 'bg-[#5C24EB] text-white shadow-md' : isLight ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true" data-icon="grid_view">grid_view</span>
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all focus:outline-none cursor-pointer ${viewMode === 'list' ? 'bg-[#5C24EB] text-white shadow-md' : isLight ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
              aria-pressed={viewMode === 'list'}
              aria-label="List view"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true" data-icon="list">list</span>
            </button>
          </div>
        </section>

        {/* Client Grid */}
        {!isLoading && displayClients.length === 0 ? (
          <div className={`rounded-2xl p-12 text-center font-bold border ${
            isLight ? 'bg-white border-gray-200 text-gray-600 shadow-sm' : 'bg-white/[0.02] border-white/[0.05] text-gray-400'
          }`}>
            <span className="material-symbols-outlined text-4xl mb-2 text-gray-400 block">group_off</span>
            <p className={`text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {isArabic ? 'لا يوجد مستخدمين يتطابقون مع الفلتر المختار' : 'No clients found matching the selected filter'}
            </p>
            <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
              {isArabic ? 'جرب تغيير الفلتر أو كلمة البحث' : 'Try changing your filter or search query'}
            </p>
          </div>
        ) : (
          <section className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`} aria-label="Client List">
            {displayClients.map((client) => (
              <ClientCard key={client.id} {...client} onDelete={handleDeleteClient} />
            ))}
          </section>
        )}

        {/* Pagination Container */}
        {totalPages > 1 && (
          <nav className="flex flex-col sm:flex-row items-center justify-between pt-12 pb-12 gap-4" aria-label="Pagination">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-gray-600' : 'text-gray-400'}`} aria-live="polite">
              {isArabic ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
            </p>
            <ul className="flex gap-2">
              <li>
                <button 
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all disabled:opacity-50 cursor-pointer ${
                    isLight 
                      ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm' 
                      : 'bg-white/[0.05] border-white/5 text-gray-300 hover:bg-white/[0.1]'
                  }`}
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">{isArabic ? 'chevron_right' : 'chevron_left'}</span>
                </button>
              </li>
              
              {/* Pagination logic: showing +/- 1 page */}
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                  return (
                    <li key={p}>
                      <button 
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[11px] transition-all cursor-pointer border ${
                          p === page 
                            ? 'bg-[#5C24EB] border-[#5C24EB] text-white shadow-[0_8px_30px_rgba(92, 36, 235, 0.3)]' 
                            : isLight
                            ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm'
                            : 'bg-white/[0.05] border-white/5 text-gray-300 hover:bg-white/[0.1]'
                        }`}
                        aria-current={p === page ? 'page' : undefined}
                        aria-label={`Page ${p}`}
                      >
                        {p}
                      </button>
                    </li>
                  );
                }
                if (p === page - 2 || p === page + 2) {
                  return <li key={p} className="w-10 h-10 flex items-center justify-center text-gray-400" aria-hidden="true">...</li>;
                }
                return null;
              })}

              <li>
                <button 
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all disabled:opacity-50 cursor-pointer ${
                    isLight 
                      ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm' 
                      : 'bg-white/[0.05] border-white/5 text-gray-300 hover:bg-white/[0.1]'
                  }`}
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">{isArabic ? 'chevron_left' : 'chevron_right'}</span>
                </button>
              </li>
            </ul>
          </nav>
        )}

      </main>
    </div>
  );
});

export default AdminClients;
