import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import StatCard from '../components/admin/StatCard';
import ClientCard from '../components/admin/ClientCard';

const AdminClients = React.memo(() => {
  const { toast } = useToast();
  const { user, hasPermission } = useAuth();
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
  const { t } = useTranslation(['admin_clients']);
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
      toast.success(res.message || 'Client deleted successfully');
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete client');
    }
  });

  const handleDeleteClient = useCallback((id, name) => {
    if (window.confirm(`Are you sure you want to delete client "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

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
      role: c.role_name || ((c.role === 'admin' || c.role === 'super_admin') ? 'Administrator' : (c.role === 'technician' ? 'Technician (فني)' : (c.role === 'client' ? 'Client' : c.role))),
      status: c.is_active ? 'Active' : 'Inactive',
      isActiveStatus: c.is_active !== false,
      company: c.vehicle || 'No Vehicle',
      company_name: c.company_name,
      company_discount_percent: c.company_discount_percent,
      branch_name: c.branch_name,
      email: c.phone || c.email || 'N/A',
      avatarUrl: c.avatarUrl || null,
      gradientColorClass: 'from-[#FF5C35]'
    }));
  }, [clientsData, isLoading, clients, dummyData]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  return (
    <div className="flex bg-[#000000] min-h-[calc(100vh-5rem)] font-body text-[#e5e2e1] selection:bg-[#FF5C35]/30 relative mt-16 md:mt-0">
      
      <AdminSidebar />
      
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 w-full max-w-7xl mx-auto" aria-labelledby="client-registry-heading">
        
        {/* Hero / Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/[0.05] pb-6">
          <div className="max-w-2xl">
            <h1 id="client-registry-heading" className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-[#FF5C35] leading-tight flex items-center gap-4">
              إدارة العملاء (Client Registry)
              {isLoading && <div className="w-5 h-5 border-2 border-[#FF5C35] border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>}
            </h1>
            <p className="mt-4 text-gray-400 font-bold tracking-wide text-sm max-w-lg leading-relaxed uppercase">
              إدارة وقاعدة بيانات عملاء ريفليكتو والتحكم بالحسابات والسيارات والخدمات.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {/* Search Bar */}
            <div className="relative shrink-0">
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="ابحث باسم العميل أو رقم الجوال..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-white/[0.05] shadow-inner border-0 rounded-xl pr-12 pl-6 py-3 text-sm font-bold w-48 sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all text-white placeholder-gray-500 text-right"
                aria-label="Search clients"
              />
              {isSearching && <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#FF5C35] border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>}
            </div>
            <button 
              type="button"
              onClick={() => {
                if (!hasPermission('create_client')) {
                  alert('عفواً، ليس لديك صلاحية إضافة عميل جديد (create_client)');
                  return;
                }
                navigate('/admin/add-client');
              }}
              className={`px-6 py-3 rounded-xl bg-[#FF5C35] text-white font-bold text-xs tracking-wider shadow-[0_8px_30px_rgba(255,92,53,0.3)] flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white/50 ${!hasPermission('create_client') ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
              aria-label="Register new client"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
                person_add
              </span>
              إضافة عميل جديد
            </button>
          </div>
        </header>

        {/* Search Results Overlay */}
        {searchResults && searchResults.length > 0 && (
          <section className="bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-0 rounded-2xl p-4 space-y-2 backdrop-blur-2xl" aria-label="Search Results">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white tracking-widest uppercase">نتائج البحث ({searchResults.length})</h2>
              <button type="button" onClick={() => { setSearchResults(null); setSearchQuery(''); }} className="text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors focus:outline-none">مسح</button>
            </div>
            {searchResults.map((r) => (
              <article key={r.id} onClick={() => navigate(`/admin/edit-client?id=${r.id}`)} className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-xl shadow-inner border-0 hover:bg-white/[0.05] cursor-pointer transition-all" tabIndex={0} role="button" aria-label={`Edit ${r.full_name}`}>
                <div className="w-10 h-10 rounded-full bg-[#FF5C35]/10 shadow-inner flex items-center justify-center text-[#FF5C35] font-bold text-sm" aria-hidden="true">
                  {r.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate tracking-wide">{r.full_name}</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{r.phone} {r.vehicle ? `• ${r.vehicle}` : ''}</p>
                </div>
              </article>
            ))}
          </section>
        )}
        {searchResults && searchResults.length === 0 && searchQuery && (
          <div className="bg-white/[0.02] shadow-inner border-0 rounded-2xl p-8 text-center text-gray-500 font-bold text-sm uppercase tracking-widest" role="alert">
            لا يوجد عملاء يطابقون "{searchQuery}"
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" aria-label="Client Statistics">
          <StatCard
            title="إجمالي العملاء"
            value={totalClients.toString()}
            icon="group"
            trendText="جميع الحسابات المسجلة"
          />
          <StatCard
            title="متوسط القيمة"
            value="14.2k SAR"
            icon="verified"
            trendText="نمو شريحة العملاء المميزين"
          />
          <StatCard
            isSpecial
            title="تميز الخدمة"
            description="نسبة رضا واستمرار العملاء في ريفليكتو تزيد عن 98.2%"
            icon="workspace_premium"
          />
        </section>

        {/* Table / Grid Toggle & Filter */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.05]" aria-label="List Controls">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Client Role Indicator */}
            <span className="bg-white/[0.05] border border-white/10 text-gray-300 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#FF5C35]">person</span>
              سجل العملاء فقط
            </span>

            {/* Branch Filter — Only Super Admin can switch branches */}
            {isSuperAdmin ? (
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-white/[0.05] shadow-inner px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider border-0 hover:bg-white/[0.1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 cursor-pointer text-amber-400 font-bold"
                aria-label="Filter by branch"
              >
                <option value="all" className="bg-black text-white">جميع الفروع (All Branches)</option>
                <option value="جدة - شارع صاري" className="bg-black text-white">جدة - شارع صاري</option>
                <option value="جدة - الصفا" className="bg-black text-white">جدة - الصفا</option>
                <option value="جدة - البوادي" className="bg-black text-white">جدة - البوادي</option>
                <option value="فرع الرياض - الفيصلية 1" className="bg-black text-white">فرع الرياض - الفيصلية 1</option>
                <option value="فرع الرياض - الفيصلية 2" className="bg-black text-white">فرع الرياض - الفيصلية 2</option>
                <option value="فرع مكة المكرمة" className="bg-black text-white">فرع مكة المكرمة</option>
                <option value="فرع الطائف" className="bg-black text-white">فرع الطائف</option>
                <option value="فرع الدمام" className="bg-black text-white">فرع الدمام</option>
                <option value="فرع المدينة المنورة" className="bg-black text-white">فرع المدينة المنورة</option>
              </select>
            ) : (
              <span className="bg-[#FF5C35]/10 border border-[#FF5C35]/30 text-[#FF5C35] px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">location_on</span>
                الفرع: {user?.branch_name || 'فرع جدة'}
              </span>
            )}

            <div className="h-6 w-[1px] bg-white/10 hidden sm:block" aria-hidden="true"></div>
            <p className="text-xs font-bold tracking-wider text-gray-400" aria-live="polite">
              عرض <span className="text-white font-mono">{displayClients.length}</span> من أصل <span className="text-white font-mono">{totalClients}</span> عميل
            </p>
          </div>
          <div className="flex bg-white/[0.02] shadow-inner rounded-xl p-1 border-0" role="group" aria-label="View layout toggles">
            <button 
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all focus:outline-none ${viewMode === 'grid' ? 'bg-[#FF5C35] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}`}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true" data-icon="grid_view">grid_view</span>
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all focus:outline-none ${viewMode === 'list' ? 'bg-[#FF5C35] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}`}
              aria-pressed={viewMode === 'list'}
              aria-label="List view"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true" data-icon="list">list</span>
            </button>
          </div>
        </section>

        {/* Client Grid */}
        {!isLoading && displayClients.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-12 text-center text-gray-400 font-bold">
            <span className="material-symbols-outlined text-4xl mb-2 text-gray-500">group_off</span>
            <p className="text-base text-white">لا يوجد مستخدمين يتطابقون مع الفلتر المختار</p>
            <p className="text-xs text-gray-500 mt-1">جرب تغيير الفلتر أو كلمة البحث</p>
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
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest" aria-live="polite">Page {page} of {totalPages}</p>
            <ul className="flex gap-2">
              <li>
                <button 
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border-0 shadow-inner bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50"
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined" aria-hidden="true" data-icon="chevron_left">chevron_left</span>
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
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[11px] transition-all focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 ${
                          p === page 
                            ? 'bg-[#FF5C35] text-white shadow-[0_8px_30px_rgba(255,92,53,0.3)]' 
                            : 'bg-white/[0.05] shadow-inner text-gray-300 border-0 hover:bg-white/[0.1]'
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
                  return <li key={p} className="w-10 h-10 flex items-center justify-center text-gray-500" aria-hidden="true">...</li>;
                }
                return null;
              })}

              <li>
                <button 
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border-0 shadow-inner bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50"
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined" aria-hidden="true" data-icon="chevron_right">chevron_right</span>
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
