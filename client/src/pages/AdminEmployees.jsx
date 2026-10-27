import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService, technicianService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { useAdminTheme } from '../contexts/AdminThemeContext';
import AdminSidebar from '../components/AdminSidebar';
import StatCard from '../components/admin/StatCard';


// ─── Technician Commissions Modal ────────────────────────────────────────────
const TechnicianCommissionsModal = React.memo(({ isOpen, onClose, technician }) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { isLight } = useAdminTheme();

  const { data, isLoading } = useQuery({
    queryKey: ['techCommissionsByAdmin', technician?.uuid || technician?.id],
    queryFn: () => technicianService.getTechnicianCommissionsByAdmin(technician?.uuid || technician?.id),
    enabled: isOpen && Boolean(technician?.uuid || technician?.id),
  });

  if (!isOpen || !technician) return null;

  const info = data?.data || {};
  const commissions = info.commissions || [];
  const totalEarned = info.total_earned || 0;
  const servicesCount = info.services_count || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose} dir={isArabic ? 'rtl' : 'ltr'}>
      <div
        className={`border rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar transition-colors ${
          isLight ? 'bg-white border-gray-200 text-gray-900 shadow-xl' : 'bg-[#0a0a0a] border-white/10 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              <span className="material-symbols-outlined text-emerald-500">payments</span>
              {isArabic ? 'عمولات الفني' : 'Technician Commissions'}
            </h3>
            <p className={`text-sm font-bold mt-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{technician.full_name}</p>
            <p className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
              {technician.branch_name || (isArabic ? 'فرع جدة' : 'Jeddah Branch')} • {technician.phone}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 transition-colors rounded-lg cursor-pointer ${
              isLight ? 'text-gray-400 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-gray-400">{isArabic ? 'جاري تحميل بيانات العمولات...' : 'Loading commission data...'}</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                <div className="text-xl font-black text-emerald-500 font-mono">{Number(totalEarned).toLocaleString()}</div>
                <div className={`text-[10px] font-bold mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  {isArabic ? 'إجمالي العمولات (ر.س)' : 'Total Commissions (SAR)'}
                </div>
              </div>
              <div className={`border rounded-xl p-4 text-center ${
                isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.03] border-white/10'
              }`}>
                <div className={`text-xl font-black font-mono ${isLight ? 'text-gray-900' : 'text-white'}`}>{servicesCount}</div>
                <div className={`text-[10px] font-bold mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  {isArabic ? 'خدمات مكتملة' : 'Completed Services'}
                </div>
              </div>
              <div className={`border rounded-xl p-4 text-center ${
                isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.03] border-white/10'
              }`}>
                <div className="text-xl font-black text-amber-500 font-mono">
                  {servicesCount > 0 ? Number(totalEarned / servicesCount).toFixed(0) : 0}
                </div>
                <div className={`text-[10px] font-bold mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  {isArabic ? 'متوسط العمولة (ر.س)' : 'Avg Commission (SAR)'}
                </div>
              </div>
            </div>

            {/* Commissions List */}
            {commissions.length === 0 ? (
              <div className={`p-8 text-center rounded-xl space-y-2 border ${
                isLight ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white/[0.02] border-white/5 text-gray-400'
              }`}>
                <span className="material-symbols-outlined text-3xl text-gray-400 block">payments</span>
                <p className="text-sm font-bold">{isArabic ? 'لا توجد عمولات مسجلة لهذا الفني.' : 'No recorded commissions for this technician.'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {isArabic ? 'سجل العمولات التفصيلي' : 'Detailed Commissions History'}
                </h4>
                {commissions.map((c) => (
                  <div key={c.id || c.uuid} className={`border rounded-xl p-4 flex items-center justify-between gap-4 transition-colors ${
                    isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.02] border-white/10'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded font-bold border border-amber-500/20">
                          {c.vehicle_plate || '—'}
                        </span>
                        {c.branch_name && <span className={`text-[10px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{c.branch_name}</span>}
                      </div>
                      <p className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        {c.service_name || c.vehicle_info || (isArabic ? 'خدمة صيانة' : 'Service')}
                      </p>
                      {c.client_name && <p className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{c.client_name}</p>}
                      <p className={`text-[10px] font-mono ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>
                        {c.created_at ? new Date(c.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US') : ''}
                      </p>
                    </div>
                    <span className="text-lg font-black text-emerald-500 font-mono shrink-0">
                      +{Number(c.amount).toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

const AdminEmployees = React.memo(() => {
  const { toast } = useToast();
  const { user, hasPermission } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { isLight } = useAdminTheme();
  const navigate = useNavigate();

  const canView = hasPermission('view_employees');
  const canCreate = hasPermission('create_employee');
  const canEdit = hasPermission('edit_employee');
  const canDelete = hasPermission('delete_employee');

  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('staff'); // 'staff', 'admin', 'technician'
  const [selectedTech, setSelectedTech] = useState(null); // for commissions modal
  const isSuperAdmin = Boolean(
    user?.is_super_admin === 1 ||
    user?.is_super_admin === true ||
    user?.role === 'super_admin' ||
    (user?.role === 'admin' && user?.is_super_admin !== 0 && user?.is_super_admin !== false)
  );

  const [branchFilter, setBranchFilter] = useState(() => {
    return isSuperAdmin ? 'all' : (user?.branch_name || 'فرع جدة');
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

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
        const res = await clientService.search(value, 'staff');
        // Filter only staff members
        const filtered = (res?.data || []).filter(u => u.role === 'admin' || u.role === 'super_admin' || u.role === 'technician');
        setSearchResults(filtered);
      } catch (err) {
        console.error('Search staff error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  useEffect(() => () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); }, []);

  // Fetch staff members from backend
  const { data: employeesData, isLoading, refetch } = useQuery({
    queryKey: ['adminEmployees', page, roleFilter, searchQuery, branchFilter],
    queryFn: () => clientService.getAll(page, roleFilter, searchQuery, branchFilter),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => clientService.remove(id),
    onSuccess: (res) => {
      toast.success(res.message || (isArabic ? 'تم حذف الموظف بنجاح' : 'Staff deleted successfully'));
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || (isArabic ? 'فشل حذف الموظف' : 'Failed to delete staff'));
    }
  });

  const handleDeleteStaff = useCallback((id, name) => {
    const confirmMsg = isArabic 
      ? `هل أنت متأكد من حذف الموظف "${name}"؟ لا يمكن التراجع عن هذا الإجراء.` 
      : `Are you sure you want to delete staff "${name}"? This action cannot be undone.`;
    if (window.confirm(confirmMsg)) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation, isArabic]);

  const employees = useMemo(() => Array.isArray(employeesData) ? employeesData : (employeesData?.data || []), [employeesData]);
  const totalEmployees = useMemo(() => employeesData?.meta?.total ?? (employeesData ? employees.length : 0), [employeesData, employees.length]);

  const stats = useMemo(() => {
    const adminCount = employees.filter(e => e.role === 'admin' || e.role === 'super_admin').length;
    const techCount = employees.filter(e => e.role === 'technician').length;
    return {
      total: totalEmployees,
      admins: adminCount,
      techs: techCount
    };
  }, [employees, totalEmployees]);

  if (!canView) {
    return (
      <div className={`flex min-h-screen font-body relative pt-24 md:pt-8 ${isLight ? 'bg-[#F8FAFC] text-gray-900' : 'bg-[#000000] text-[#e5e2e1]'}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <AdminSidebar />
        <main className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
          <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {isArabic ? 'عفواً، لا تملك صلاحية عرض قائمة الموظفين' : 'Access Denied: View Staff'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isArabic ? 'تواصل مع السوبر أدمن للحصول على صلاحية (view_employees)' : 'Contact system administrator for (view_employees) permission.'}
          </p>
          <button onClick={() => navigate('/admin')} className="px-6 py-2 bg-[#5C24EB] text-white rounded-xl font-bold text-xs cursor-pointer">
            {isArabic ? 'العودة للرئيسية' : 'Back to Dashboard'}
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen font-body relative pt-24 md:pt-8 selection:bg-[#5C24EB]/30 transition-colors duration-300 ${
      isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#090A0F] text-[#e5e2e1] admin-dark-theme'
    }`} dir={isArabic ? 'rtl' : 'ltr'}>
      
      <AdminSidebar />
      
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 w-full max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-6 ${isLight ? 'border-gray-200' : 'border-white/[0.05]'}`}>
          <div className="max-w-2xl">
            <h1 className={`text-2xl md:text-3xl font-extrabold font-display tracking-tight leading-tight flex items-center gap-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              <span className="text-[#8B5CF6]">{isArabic ? 'إدارة الموظفين والفنيين' : 'Staff & Technicians'}</span>
              {isLoading && <div className="w-5 h-5 border-2 border-[#5C24EB] border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>}
            </h1>
            <p className={`mt-2 font-bold tracking-wide text-xs sm:text-sm max-w-lg leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              {isArabic ? 'إدارة طاقم العمل والمدراء والفنيين وتعيين الصلاحيات والفروع.' : 'Manage staff, technicians, roles, and branch assignments.'}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <svg className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder={isArabic ? 'ابحث باسم الموظف أو الرقم...' : 'Search staff by name or phone...'}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`rounded-xl ${isArabic ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-2.5 text-xs sm:text-sm font-bold w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all border ${
                  isLight 
                    ? 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 shadow-sm' 
                    : 'bg-white/[0.05] border-white/10 text-white placeholder:text-gray-500 shadow-inner'
                }`}
              />
              {isSearching && <div className={`absolute ${isArabic ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#5C24EB] border-t-transparent rounded-full animate-spin`}></div>}
            </div>
            <button 
              type="button"
              onClick={() => {
                if (!canCreate) {
                  alert(isArabic ? 'عفواً، لا تملك صلاحية إضافة موظف جديد (create_employee)' : 'You do not have permission to add employees');
                  return;
                }
                navigate('/admin/add-employee');
              }}
              className={`px-5 py-2.5 rounded-xl bg-[#5C24EB] text-white font-bold text-xs tracking-wider shadow-[0_8px_30px_rgba(92, 36, 235, 0.3)] flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap cursor-pointer ${!canCreate ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined text-sm">badge</span>
              {isArabic ? 'إضافة موظف جديد' : 'New Employee'}
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title={isArabic ? "إجمالي طاقم العمل" : "Total Staff"}
            value={stats.total.toString()}
            icon="badge"
            trendText={isArabic ? "المدراء والفنيين المسجلين" : "Registered managers & techs"}
          />
          <StatCard
            title={isArabic ? "مدراء الفروع والنظام" : "Managers & Admins"}
            value={stats.admins.toString()}
            icon="admin_panel_settings"
            trendText={isArabic ? "صلاحيات الإدارة والتحكم" : "Administrative permissions"}
          />
          <StatCard
            isSpecial
            title={isArabic ? "الفنيين الخبراء" : "Certified Technicians"}
            description={isArabic ? `عدد الفنيين في الخدمة: ${stats.techs} فني محترف` : `Active technicians: ${stats.techs} expert techs`}
            icon="engineering"
          />
        </section>

        {/* Filter Controls */}
        <section className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-white/[0.05]'}`}>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider border transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 cursor-pointer ${
                isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-white/[0.05] border-white/10 text-white'
              }`}
            >
              <option value="staff" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'جميع الموظفين (All Staff)' : 'All Staff'}</option>
              <option value="admin" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'المدراء فقط (Admins Only)' : 'Admins Only'}</option>
              <option value="technician" className={isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}>{isArabic ? 'الفنيين فقط (Technicians Only)' : 'Technicians Only'}</option>
            </select>

            {/* Branch Filter */}
            {isSuperAdmin ? (
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider border transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 cursor-pointer ${
                  isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-white/[0.05] border-white/10 text-amber-400'
                }`}
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
          </div>
        </section>

        {/* Employees Cards Grid */}
        {employees.length === 0 ? (
          <div className={`rounded-3xl p-12 text-center space-y-4 border ${
            isLight ? 'bg-white border-gray-200 text-gray-500 shadow-sm' : 'bg-white/[0.02] border-white/10'
          }`}>
            <span className="material-symbols-outlined text-5xl text-gray-400 block">badge</span>
            <p className="font-bold">{isArabic ? 'لا يوجد موظفين مسجلين بناءً على خيارات البحث والفلترة.' : 'No employees registered under current filters.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((emp) => {
              const isSuper = emp.role === 'super_admin' || emp.is_super_admin;
              const isAdmin = emp.role === 'admin';
              const isTech = emp.role === 'technician' || emp.role === 'tech';

              return (
                <div
                  key={emp.id || emp.uuid}
                  className={`rounded-3xl p-6 space-y-5 transition-all flex flex-col justify-between relative overflow-hidden border ${
                    isLight 
                      ? 'bg-white border-gray-200 shadow-sm hover:border-[#5C24EB]/40 hover:shadow-lg' 
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Avatar & Name */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner border shrink-0 ${
                          isSuper 
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-500' 
                            : isTech 
                            ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600' 
                            : 'bg-[#5C24EB]/15 border-[#5C24EB]/30 text-[#8B5CF6]'
                        }`}>
                          {emp.full_name?.charAt(0) || 'M'}
                        </div>
                        <div className="min-w-0">
                          <h3 className={`text-lg font-bold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{emp.full_name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {isSuper ? (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-400/10 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-400/20">
                                <span className="material-symbols-outlined text-xs">verified</span>
                                {isArabic ? 'سوبر أدمن' : 'Super Admin'}
                              </span>
                            ) : isTech ? (
                              <span className="text-[10px] font-bold text-cyan-600 bg-cyan-400/10 px-2 py-0.5 rounded flex items-center gap-1 border border-cyan-400/20">
                                <span className="material-symbols-outlined text-xs">engineering</span>
                                {isArabic ? 'فني معتمد' : 'Technician'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#8B5CF6] bg-[#5C24EB]/10 px-2 py-0.5 rounded flex items-center gap-1 border border-[#5C24EB]/20">
                                <span className="material-symbols-outlined text-xs">admin_panel_settings</span>
                                {emp.Role?.name || emp.role_name || (isAdmin ? (isArabic ? 'مدير فرع' : 'Branch Manager') : emp.role || (isArabic ? 'موظف إداري' : 'Admin Staff'))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Info */}
                    <div className={`p-3 rounded-2xl border space-y-2 text-xs ${
                      isLight ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-white/[0.02] border-white/5 text-gray-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-[#8B5CF6]">badge</span> {isArabic ? 'الرقم الوظيفي:' : 'Emp Code:'}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono font-bold text-xs text-[#8B5CF6]">
                          <span>{emp.employee_code || 'EMP-—'}</span>
                          {emp.employee_code && (
                            <button
                              type="button"
                              title="نسخ الرقم الوظيفي"
                              onClick={() => {
                                navigator.clipboard.writeText(emp.employee_code);
                                toast.success('تم نسخ الرقم الوظيفي');
                              }}
                              className="p-0.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs">content_copy</span>
                            </button>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span> {isArabic ? 'الفرع:' : 'Branch:'}
                        </span>
                        <span className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{emp.branch_name || (isArabic ? 'فرع جدة' : 'Jeddah Branch')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">phone</span> {isArabic ? 'الهاتف:' : 'Phone:'}
                        </span>
                        <span className={`font-bold font-mono ${isLight ? 'text-gray-900' : 'text-white'}`} dir="ltr">{emp.phone || 'N/A'}</span>
                      </div>
                      {emp.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">mail</span> {isArabic ? 'الإيميل:' : 'Email:'}
                          </span>
                          <span className={`font-bold text-[11px] truncate max-w-[150px] font-mono ${isLight ? 'text-gray-900' : 'text-white'}`}>{emp.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`flex items-center justify-end gap-2 pt-3 border-t flex-wrap ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                    {isTech && (
                      <button
                        type="button"
                        onClick={() => setSelectedTech(emp)}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">payments</span>
                        {isArabic ? 'تفاصيل العمولات' : 'Commissions'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!canEdit) {
                          alert(isArabic ? 'عفواً، لا تملك صلاحية تعديل بيانات الموظف (edit_employee)' : 'You do not have permission to edit employees');
                          return;
                        }
                        navigate(`/admin/edit-employee?id=${emp.id || emp.uuid}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                        isLight ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-white border-white/5'
                      } ${!canEdit ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      {isArabic ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!canDelete) {
                          alert(isArabic ? 'عفواً، لا تملك صلاحية حذف الموظف (delete_employee)' : 'You do not have permission to delete employees');
                          return;
                        }
                        handleDeleteStaff(emp.id || emp.uuid, emp.full_name);
                      }}
                      className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border-rose-500/20 ${!canDelete ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                      title={isArabic ? 'حذف الموظف' : 'Delete Staff'}
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Technician Commissions Modal */}
      <TechnicianCommissionsModal
        isOpen={Boolean(selectedTech)}
        onClose={() => setSelectedTech(null)}
        technician={selectedTech}
      />
    </div>
  );
});

export default AdminEmployees;
