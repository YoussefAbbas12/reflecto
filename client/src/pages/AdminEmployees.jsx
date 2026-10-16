import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService, technicianService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import StatCard from '../components/admin/StatCard';


// ─── Technician Commissions Modal ────────────────────────────────────────────
const TechnicianCommissionsModal = React.memo(({ isOpen, onClose, technician }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">payments</span>
              عمولات الفني
            </h3>
            <p className="text-sm font-bold text-gray-400 mt-1">{technician.full_name}</p>
            <p className="text-[10px] text-gray-600">{technician.branch_name || 'فرع جدة'} • {technician.phone}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-gray-400">جاري تحميل بيانات العمولات...</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                <div className="text-xl font-black text-emerald-400 font-mono">{Number(totalEarned).toLocaleString()}</div>
                <div className="text-[10px] font-bold text-gray-500 mt-1">إجمالي العمولات (ر.س)</div>
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
                <div className="text-xl font-black text-white font-mono">{servicesCount}</div>
                <div className="text-[10px] font-bold text-gray-500 mt-1">خدمات مكتملة</div>
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
                <div className="text-xl font-black text-amber-400 font-mono">
                  {servicesCount > 0 ? Number(totalEarned / servicesCount).toFixed(0) : 0}
                </div>
                <div className="text-[10px] font-bold text-gray-500 mt-1">متوسط العمولة (ر.س)</div>
              </div>
            </div>

            {/* Commissions List */}
            {commissions.length === 0 ? (
              <div className="p-8 text-center bg-white/[0.02] rounded-xl space-y-2">
                <span className="material-symbols-outlined text-3xl text-gray-600">payments</span>
                <p className="text-sm text-gray-400 font-bold">لا توجد عمولات مسجلة لهذا الفني.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">سجل العمولات التفصيلي</h4>
                {commissions.map((c) => (
                  <div key={c.id || c.uuid} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-bold">
                          {c.vehicle_plate || '—'}
                        </span>
                        {c.branch_name && <span className="text-[10px] text-gray-500">{c.branch_name}</span>}
                      </div>
                      <p className="text-sm font-bold text-white">{c.service_name || c.vehicle_info || 'خدمة صيانة'}</p>
                      {c.client_name && <p className="text-[10px] text-gray-500">{c.client_name}</p>}
                      <p className="text-[10px] font-mono text-gray-600">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('ar-SA') : ''}
                      </p>
                    </div>
                    <span className="text-lg font-black text-emerald-400 font-mono shrink-0">+{Number(c.amount).toLocaleString()} ر.س</span>
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
      toast.success(res.message || 'تم حذف الموظف بنجاح');
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'فشل حذف الموظف');
    }
  });

  const handleDeleteStaff = useCallback((id, name) => {
    if (window.confirm(`هل أنت تأكد من حذف الموظف "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

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
      <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative mt-16 md:mt-0">
        <AdminSidebar />
        <main className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
          <h1 className="text-2xl font-bold text-white">عفواً، لا تملك صلاحية عرض قائمة الموظفين</h1>
          <p className="text-gray-400 text-sm">تواصل مع السوبر أدمن للحصول على صلاحية (view_employees)</p>
          <button onClick={() => navigate('/admin')} className="px-6 py-2 bg-[#FF5C35] text-white rounded-xl font-bold text-xs cursor-pointer">
            العودة للرئيسية
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#000000] min-h-[calc(100vh-5rem)] font-body text-[#e5e2e1] selection:bg-[#FF5C35]/30 relative mt-16 md:mt-0">
      
      <AdminSidebar />
      
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 w-full max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/[0.05] pb-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-[#FF5C35] leading-tight flex items-center gap-4">
              إدارة الموظفين والفنيين
              {isLoading && <div className="w-5 h-5 border-2 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>}
            </h1>
            <p className="mt-4 text-gray-400 font-bold tracking-wide text-sm max-w-lg leading-relaxed uppercase">
              إدارة وطاقم العمل والمدراء والفنيين وتعيين الصلاحيات والفروع.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {/* Search Bar */}
            <div className="relative shrink-0">
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="ابحث باسم الموظف أو الرقم..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-white/[0.05] shadow-inner border-0 rounded-xl pr-12 pl-6 py-3 text-sm font-bold w-48 sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all text-white placeholder-gray-500 text-right"
              />
              {isSearching && <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>}
            </div>
            <button 
              type="button"
              onClick={() => {
                if (!canCreate) {
                  alert('عفواً، لا تملك صلاحية إضافة موظف جديد (create_employee)');
                  return;
                }
                navigate('/admin/add-employee');
              }}
              className={`px-6 py-3 rounded-xl bg-[#FF5C35] text-white font-bold text-xs tracking-wider shadow-[0_8px_30px_rgba(255,92,53,0.3)] flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap cursor-pointer ${!canCreate ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined text-sm">badge</span>
              إضافة موظف جديد
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="إجمالي طاقم العمل"
            value={stats.total.toString()}
            icon="badge"
            trendText="المدراء والفنيين المسجلين"
          />
          <StatCard
            title="مدراء الفروع والنظام"
            value={stats.admins.toString()}
            icon="admin_panel_settings"
            trendText="صلاحيات الإدارة والتحكم"
          />
          <StatCard
            isSpecial
            title="الفنيين الخبراء"
            description={`عدد الفنيين في الخدمة: ${stats.techs} فني محترف`}
            icon="engineering"
          />
        </section>

        {/* Filter Controls */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white/[0.05] shadow-inner px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider border-0 hover:bg-white/[0.1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 cursor-pointer text-white"
            >
              <option value="staff" className="bg-black text-white">جميع الموظفين (All Staff)</option>
              <option value="admin" className="bg-black text-white">المدراء فقط (Admins Only)</option>
              <option value="technician" className="bg-black text-white">الفنيين فقط (Technicians Only)</option>
            </select>

            {/* Branch Filter */}
            {isSuperAdmin ? (
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-white/[0.05] shadow-inner px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider border-0 hover:bg-white/[0.1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 cursor-pointer text-amber-400 font-bold"
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
          </div>
        </section>

        {/* Employees Cards Grid */}
        {employees.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-12 text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-gray-600">badge</span>
            <p className="text-gray-400 font-bold">لا يوجد موظفين مسجلين بناءً على خيارات البحث والفلترة.</p>
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
                  className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-5 hover:border-white/20 transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Header: Avatar & Name */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-inner border border-white/10 ${
                          isSuper ? 'bg-amber-500/20 text-amber-400' : isTech ? 'bg-cyan-500/20 text-cyan-400' : 'bg-[#FF5C35]/20 text-[#FF5C35]'
                        }`}>
                          {emp.full_name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{emp.full_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {isSuper ? (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-400/20">
                                <span className="material-symbols-outlined text-xs">verified</span>
                                سوبر أدمن
                              </span>
                            ) : isTech ? (
                              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded flex items-center gap-1 border border-cyan-400/20">
                                <span className="material-symbols-outlined text-xs">engineering</span>
                                فني معتمد
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#FF5C35] bg-[#FF5C35]/10 px-2 py-0.5 rounded flex items-center gap-1 border border-[#FF5C35]/20">
                                <span className="material-symbols-outlined text-xs">admin_panel_settings</span>
                                {emp.Role?.name || emp.role_name || (isAdmin ? 'مدير فرع' : emp.role || 'موظف إداري')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Info */}
                    <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/5 space-y-2 text-xs text-gray-300">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span> الفرع:
                        </span>
                        <span className="font-bold text-white">{emp.branch_name || 'فرع جدة'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">phone</span> الهاتف:
                        </span>
                        <span className="font-bold text-white dir-ltr">{emp.phone || 'غير مسجل'}</span>
                      </div>
                      {emp.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">mail</span> الإيميل:
                          </span>
                          <span className="font-bold text-white text-[11px] truncate max-w-[150px]">{emp.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5 flex-wrap">
                    {isTech && (
                      <button
                        type="button"
                        onClick={() => setSelectedTech(emp)}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">payments</span>
                        تفاصيل العمولات
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!canEdit) {
                          alert('عفواً، لا تملك صلاحية تعديل بيانات الموظف (edit_employee)');
                          return;
                        }
                        navigate(`/admin/edit-employee?id=${emp.id || emp.uuid}`);
                      }}
                      className={`px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${!canEdit ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!canDelete) {
                          alert('عفواً، لا تملك صلاحية حذف الموظف (delete_employee)');
                          return;
                        }
                        handleDeleteStaff(emp.id || emp.uuid, emp.full_name);
                      }}
                      className={`p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer ${!canDelete ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                      title="حذف الموظف"
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
