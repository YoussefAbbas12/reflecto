import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService, roleService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const EditEmployee = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser, hasPermission } = useAuth();
  const canEdit = hasPermission('edit_employee');

  const searchParams = new URLSearchParams(location.search);
  const employeeId = params.id || searchParams.get('id');

  const [isActive, setIsActive] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [permissions, setPermissions] = useState({});

  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    employeeCode: '',
    notes: '',
    role: 'technician',
    branch_name: 'جدة - الصفا'
  });

  const { data: employeeData, isLoading: isFetching } = useQuery({
    queryKey: ['adminEmployeeDetail', employeeId],
    queryFn: () => clientService.getById(employeeId),
    enabled: !!employeeId,
  });

  // Fetch available dynamic roles
  const { data: rolesData } = useQuery({
    queryKey: ['rolesListInEditEmployee'],
    queryFn: () => roleService.getAll(),
  });
  const rolesList = rolesData?.data || [];

  // Populate form when data arrives
  useEffect(() => {
    if (employeeData) {
      const matchedRole = rolesList.find(r => r.id === employeeData.role_id || r.slug === employeeData.role || r.name === employeeData.role);
      let initialRole = 'technician';
      if (employeeData.role === 'admin' || employeeData.role === 'technician' || employeeData.role === 'client') {
        initialRole = employeeData.role;
      } else if (matchedRole) {
        initialRole = matchedRole.slug;
      } else if (employeeData.role) {
        initialRole = employeeData.role;
      }

      setFormData({
        fullName: employeeData.full_name || '',
        emailAddress: employeeData.email || '',
        phoneNumber: employeeData.phone || '',
        employeeCode: employeeData.employee_code || '',
        notes: employeeData.notes || '',
        role: initialRole,
        branch_name: employeeData.branch_name || 'جدة - الصفا'
      });
      setIsActive(employeeData.is_active !== false);
      setIsSuperAdmin(!!employeeData.is_super_admin);

      let permsObj = {};
      if (employeeData.permissions) {
        try {
          permsObj = typeof employeeData.permissions === 'string' ? JSON.parse(employeeData.permissions) : employeeData.permissions;
        } catch (_) { }
      }
      setPermissions(permsObj);
    }
  }, [employeeData, rolesList]);

  const updateMutation = useMutation({
    mutationFn: (payload) => clientService.update(employeeId, payload),
    onSuccess: () => {
      toast.success('تم تحديث بيانات الموظف بنجاح');
      queryClient.invalidateQueries({ queryKey: ['adminEmployeeDetail', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] });
      queryClient.invalidateQueries({ queryKey: ['adminClients'] });
      if (formData.role === 'client') {
        navigate('/admin/clients');
      } else {
        navigate('/admin/employees');
      }
    },
    onError: (err) => {
      toast.error(err.message || 'فشل تحديث بيانات الموظف');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => clientService.resetPassword(employeeId),
    onSuccess: (res) => {
      toast.success(res.message || 'تم إعادة تعيين كلمة المرور بنجاح إلى (00000)');
    },
    onError: (err) => {
      toast.error(err.message || 'فشل إعادة تعيين كلمة المرور');
    }
  });

  const handleForceResetPassword = useCallback(() => {
    if (window.confirm('هل أنت تأكد من إعادة تعيين كلمة المرور لهذا الموظف إلى 00000؟')) {
      resetPasswordMutation.mutate();
    }
  }, [resetPasswordMutation]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handlePermissionToggle = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = useCallback(() => {
    if (!formData.fullName || !formData.phoneNumber) {
      toast.warning('الاسم الكامل ورقم الهاتف مطلوبان.');
      return;
    }

    const matchedRole = rolesList.find(r => r.slug === formData.role || r.id === formData.role || r.name === formData.role);
    const payload = {
      full_name: formData.fullName,
      email: formData.emailAddress,
      phone: formData.phoneNumber,
      employee_code: formData.employeeCode?.trim() || null,
      notes: formData.notes,
      role: formData.role,
      role_id: matchedRole ? matchedRole.id : null,
      branch_name: formData.branch_name,
      is_active: isActive,
      is_super_admin: isSuperAdmin,
      permissions: permissions,
    };

    updateMutation.mutate(payload);
  }, [formData, rolesList, isActive, isSuperAdmin, permissions, updateMutation, toast]);

  const handleCancel = useCallback(() => {
    navigate('/admin/employees');
  }, [navigate]);

  const isCurrentSuper = Boolean(
    currentUser?.is_super_admin === 1 ||
    currentUser?.is_super_admin === true ||
    currentUser?.role === 'super_admin'
  );

  if (!canEdit) {
    return (
      <div className="flex bg-[#050505] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0">
        <AdminSidebar />
        <main className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
          <h1 className="text-2xl font-bold text-white">عفواً، لا تملك صلاحية تعديل بيانات الموظف</h1>
          <p className="text-gray-400 text-sm">تواصل مع السوبر أدمن للحصول على صلاحية (edit_employee)</p>
          <button onClick={() => navigate('/admin/employees')} className="px-6 py-2 bg-[#5C24EB] text-white rounded-xl font-bold text-xs cursor-pointer">
            العودة لإدارة الموظفين
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#050505] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0 selection:bg-[#5C24EB]/30">
      
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative" aria-labelledby="edit-employee-heading">
        <div className="p-6 md:p-10 pb-32 max-w-6xl mx-auto w-full space-y-8">
          
          {/* Header & Navigation */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
            <div>
              <nav className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-gray-500 mb-2">
                <button type="button" onClick={handleCancel} className="hover:text-gray-300 transition-colors">إدارة الموظفين</button>
                <span>/</span>
                <span className="text-[#8B5CF6]">تعديل بيانات الموظف</span>
              </nav>
              <h1 id="edit-employee-heading" className="text-3xl md:text-4xl font-display font-extrabold text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-[#8B5CF6]">badge</span>
                تعديل بيانات الموظف
                {isFetching && <div className="w-5 h-5 border-2 border-[#5C24EB] border-t-transparent rounded-full animate-spin"></div>}
              </h1>
              <p className="text-xs text-gray-400 font-bold mt-1">
                تحديث البيانات الشخصية، الفرع، الصلاحيات، وإعادة تعيين كلمة المرور.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              الرجوع لقائمة الموظفين
            </button>
          </div>

          {isFetching ? (
            <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
              <div className="w-8 h-8 border-3 border-[#5C24EB] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-gray-400 font-bold">جاري تحميل بيانات الموظف...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Personal Info */}
                <section className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl">
                  <div className="flex items-center gap-3 text-sm font-bold text-white border-b border-white/10 pb-4">
                    <span className="w-8 h-8 rounded-xl bg-[#5C24EB]/10 flex items-center justify-center text-[#8B5CF6] material-symbols-outlined text-base">person</span>
                    البيانات الشخصية للموظف
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400">الاسم الكامل للموظف <span className="text-[#8B5CF6]">*</span></label>
                      <input 
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        disabled={updateMutation.isPending}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#5C24EB] transition-all placeholder-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400">رقم الجوال <span className="text-[#8B5CF6]">*</span></label>
                      <input 
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        disabled={updateMutation.isPending}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#5C24EB] transition-all placeholder-gray-600 font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400">البريد الإلكتروني الوظيفي</label>
                      <input 
                        type="email"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleInputChange}
                        disabled={updateMutation.isPending}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#5C24EB] transition-all placeholder-gray-600 font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400">
                        الرقم الوظيفي
                        <span className="mr-2 text-[10px] font-medium text-gray-500">
                          ({formData.role === 'technician' ? 'RT-XXXX للفنيين' : 'RM-XXXX للإداريين'})
                        </span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text"
                          name="employeeCode"
                          value={formData.employeeCode || ''}
                          onChange={handleInputChange}
                          disabled={updateMutation.isPending}
                          placeholder={formData.role === 'technician' ? 'مثال: RT-0001' : 'مثال: RM-0001'}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#5C24EB] transition-all placeholder-gray-600 font-mono pr-10"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">
                        يُستخدم هذا الرقم لتسجيل الدخول بدلاً من رقم الجوال
                      </p>
                    </div>
                  </div>
                </section>

                {/* Role & Branch Section */}
                <section className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                  <div className="flex items-center gap-3 text-sm font-bold text-white border-b border-white/10 pb-4">
                    <span className="w-8 h-8 rounded-xl bg-[#5C24EB]/10 flex items-center justify-center text-[#8B5CF6] material-symbols-outlined text-base">work</span>
                    التكليف الوظيفي والفرع والصلاحيات
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400">الصفة / الدور الوظيفي <span className="text-[#8B5CF6]">*</span></label>
                      <select 
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        disabled={updateMutation.isPending}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#5C24EB] transition-all cursor-pointer"
                      >
                        <option value="technician">فني / تيكنيكال (Technician)</option>
                        <option value="admin">مدير فرع / أدمن (Admin)</option>
                        <option value="client">عميل عادي (Client)</option>
                        {rolesList.map(r => (
                          <option key={r.id} value={r.slug}>{r.name} ({r.slug})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400">الفرع المخصص <span className="text-[#8B5CF6]">*</span></label>
                      <select 
                        name="branch_name"
                        value={formData.branch_name}
                        onChange={handleInputChange}
                        disabled={updateMutation.isPending}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#5C24EB] transition-all cursor-pointer"
                      >
                        <option value="جدة - شارع صاري">جدة - شارع صاري</option>
                        <option value="جدة - الصفا">جدة - الصفا</option>
                        <option value="جدة - البوادي">جدة - البوادي</option>
                        <option value="فرع الرياض - الفيصلية 1">فرع الرياض - الفيصلية 1</option>
                        <option value="فرع الرياض - الفيصلية 2">فرع الرياض - الفيصلية 2</option>
                        <option value="فرع مكة المكرمة">فرع مكة المكرمة</option>
                        <option value="فرع الطائف">فرع الطائف</option>
                        <option value="فرع الدمام">فرع الدمام</option>
                        <option value="فرع المدينة المنورة">فرع المدينة المنورة</option>
                      </select>
                    </div>
                  </div>

                  {/* Permissions Management (For Admin/Staff Roles) */}
                  {formData.role !== 'technician' && formData.role !== 'client' && (
                    <div className="pt-4 border-t border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">صلاحيات الوصول والتحكم بالحساب</span>
                        {isSuperAdmin && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            سوبر أدمن (صلاحية كاملة)
                          </span>
                        )}
                      </div>

                      {isCurrentSuper && (
                        <label className="flex items-center gap-3 p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSuperAdmin}
                            onChange={() => setIsSuperAdmin(!isSuperAdmin)}
                            className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                          />
                          <span className="text-xs font-bold text-amber-300">ترقية إلى مدير عام سوبر أدمن (Super Admin)</span>
                        </label>
                      )}

                      {!isSuperAdmin && (
                        <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl space-y-3 text-xs">
                          <div className="font-bold text-gray-300">حدد الصلاحيات المسموح بها لهذا الموظف:</div>
                          {[
                            { key: 'manage_packages', label: 'إدارة وتعديل الباقات (Manage Packages)' },
                            { key: 'manage_coupons', label: 'إدارة وتعديل الكوبونات (Manage Coupons)' },
                            { key: 'manage_companies', label: 'إدارة وتعديل الشركات والجهات (Manage Companies)' },
                            { key: 'delete_clients', label: 'حذف العملاء (Delete Clients)' },
                            { key: 'edit_clients', label: 'تعديل بيانات العملاء (Edit Clients)' },
                            { key: 'view_billing', label: 'عرض الفواتير والمالية (View Billing)' },
                            { key: 'manage_ai', label: 'إدارة الذكاء الاصطناعي (AI Assistant Settings)' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-3 cursor-pointer hover:text-white transition-colors">
                              <input
                                type="checkbox"
                                checked={!!permissions[item.key]}
                                onChange={() => handlePermissionToggle(item.key)}
                                className="accent-[#5C24EB] w-4 h-4 rounded cursor-pointer"
                              />
                              <span className="text-gray-300 font-bold">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-gray-400">ملاحظات ومؤهلات الموظف</label>
                    <textarea 
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      disabled={updateMutation.isPending}
                      rows="3"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white focus:outline-none focus:border-[#5C24EB] transition-all placeholder-gray-600 resize-none"
                    />
                  </div>
                </section>

                {/* Submit & Password Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleForceResetPassword}
                    disabled={resetPasswordMutation.isPending}
                    className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">lock_reset</span>
                    {resetPasswordMutation.isPending ? 'جاري إعادة التعيين...' : 'إعادة تعيين كلمة المرور إلى (00000)'}
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button 
                      type="button"
                      onClick={handleCancel}
                      disabled={updateMutation.isPending}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="button"
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="px-8 py-3 bg-[#5C24EB] hover:bg-[#5C24EB]/90 text-white font-bold text-xs rounded-xl transition-all shadow-[0_8px_25px_rgba(92,36,235,0.35)] flex items-center gap-2 cursor-pointer"
                    >
                      {updateMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                      <span className="material-symbols-outlined text-base">save</span>
                      تحديث بيانات الموظف
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Info & Active Status */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gradient-to-b from-[#18181b] to-[#09090b] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#5C24EB]/10 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">badge</span>
                      بطاقة الموظف
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {isActive ? 'حساب نشط' : 'حساب معطل'}
                    </span>
                  </div>

                  <div className="text-center space-y-3 py-2">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5C24EB] to-[#7B4BF5] mx-auto flex items-center justify-center text-white text-3xl font-extrabold shadow-lg border-2 border-white/20">
                      {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '؟'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-snug">{formData.fullName || 'اسم الموظف'}</h3>
                      <p className="text-xs text-[#8B5CF6] font-bold mt-1">{formData.role === 'technician' ? 'فني معتمد' : (formData.role === 'client' ? 'عميل عادي' : 'حساب إداري')}</p>
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-300">حالة الحساب:</span>
                      <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isActive ? 'مفعل (Active)' : 'معطل (Disabled)'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
});

export default EditEmployee;
