import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService, roleService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const AddEmployee = React.memo(() => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const canCreate = hasPermission('create_employee');

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    role: 'technician',
    branch_name: 'جدة - الصفا',
    password: '',
    notes: '',
  });

  // Fetch available dynamic roles
  const { data: rolesData } = useQuery({
    queryKey: ['rolesListInAddEmployee'],
    queryFn: () => roleService.getAll(),
  });
  const rolesList = rolesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => clientService.create(data),
    onSuccess: () => {
      toast.success('تم تسجيل الموظف الجديد بنجاح!');
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] });
      queryClient.refetchQueries({ queryKey: ['adminEmployees'] });
      navigate('/admin/employees');
    },
    onError: (err) => {
      toast.error(err.message || 'فشل تسجيل الموظف');
    }
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber) {
      toast.warning('الاسم الكامل ورقم الجوال مطلوبان.');
      return;
    }

    const matchedRole = rolesList.find(r => r.slug === formData.role || r.id === formData.role);

    const payload = {
      full_name: formData.fullName,
      phone: formData.phoneNumber,
      email: formData.emailAddress || undefined,
      password: formData.password || undefined,
      role: formData.role,
      role_id: matchedRole ? matchedRole.id : undefined,
      branch_name: formData.branch_name,
      notes: formData.notes || undefined,
    };

    createMutation.mutate(payload);
  }, [formData, rolesList, createMutation, toast]);

  const handleCancel = useCallback(() => {
    navigate('/admin/employees');
  }, [navigate]);

  const roleLabel = useMemo(() => {
    if (formData.role === 'technician') return 'فني / تيكنيكال (Technician)';
    if (formData.role === 'admin') return 'مدير فرع / أدمن (Admin)';
    const found = rolesList.find(r => r.slug === formData.role || r.id === formData.role);
    return found ? `${found.name} (${found.slug})` : formData.role;
  }, [formData.role, rolesList]);

  if (!canCreate) {
    return (
      <div className="flex bg-[#050505] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0">
        <AdminSidebar />
        <main className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
          <h1 className="text-2xl font-bold text-white">عفواً، لا تملك صلاحية إضافة موظف جديد</h1>
          <p className="text-gray-400 text-sm">تواصل مع السوبر أدمن للحصول على صلاحية (create_employee)</p>
          <button onClick={() => navigate('/admin/employees')} className="px-6 py-2 bg-[#FF5C35] text-white rounded-xl font-bold text-xs cursor-pointer">
            العودة لإدارة الموظفين
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#050505] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0 selection:bg-[#FF5C35]/30">
      
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative" aria-labelledby="add-employee-heading">
        <div className="p-6 md:p-10 pb-32 max-w-6xl mx-auto w-full space-y-8">
          
          {/* Header & Navigation */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
            <div>
              <nav className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-gray-500 mb-2">
                <button type="button" onClick={handleCancel} className="hover:text-gray-300 transition-colors">إدارة الموظفين</button>
                <span>/</span>
                <span className="text-[#FF5C35]">إضافة موظف جديد</span>
              </nav>
              <h1 id="add-employee-heading" className="text-3xl md:text-4xl font-display font-extrabold text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-[#FF5C35]">badge</span>
                تسجيل موظف أو فني جديد
              </h1>
              <p className="text-xs text-gray-400 font-bold mt-1">
                إضافة الكوادر الفنية والإدارية وتحديد الفرع والصلاحيات والبيانات الوظيفية.
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              
              {/* Personal & Account Info */}
              <section className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 text-sm font-bold text-white border-b border-white/10 pb-4">
                  <span className="w-8 h-8 rounded-xl bg-[#FF5C35]/10 flex items-center justify-center text-[#FF5C35] material-symbols-outlined text-base">person</span>
                  البيانات الأساسية والحساب
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400">الاسم الكامل للموظف <span className="text-[#FF5C35]">*</span></label>
                    <input 
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={createMutation.isPending}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#FF5C35] transition-all placeholder-gray-600"
                      placeholder="مثال: أحمد عبد الله المحمادي"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400">رقم الجوال <span className="text-[#FF5C35]">*</span></label>
                    <input 
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      disabled={createMutation.isPending}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#FF5C35] transition-all placeholder-gray-600 font-mono"
                      placeholder="0501234567"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400">البريد الإلكتروني الوظيفي</label>
                    <input 
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleInputChange}
                      disabled={createMutation.isPending}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#FF5C35] transition-all placeholder-gray-600 font-mono"
                      placeholder="employee@reflecto.sa"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400">كلمة المرور الابتدائية</label>
                    <input 
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={createMutation.isPending}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#FF5C35] transition-all placeholder-gray-600 font-mono"
                      placeholder="افتراضي: 00000"
                    />
                  </div>
                </div>
              </section>

              {/* Work & Branch Assignment */}
              <section className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 text-sm font-bold text-white border-b border-white/10 pb-4">
                  <span className="w-8 h-8 rounded-xl bg-[#FF5C35]/10 flex items-center justify-center text-[#FF5C35] material-symbols-outlined text-base">work</span>
                  التكليف الوظيفي والفرع
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400">الصفة / الدور الوظيفي <span className="text-[#FF5C35]">*</span></label>
                    <select 
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={createMutation.isPending}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#FF5C35] transition-all cursor-pointer"
                    >
                      <option value="technician">فني / تيكنيكال (Technician)</option>
                      <option value="admin">مدير فرع / أدمن (Admin)</option>
                      {rolesList.map(r => (
                        <option key={r.id} value={r.slug}>{r.name} ({r.slug})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400">الفرع المخصص <span className="text-[#FF5C35]">*</span></label>
                    <select 
                      name="branch_name"
                      value={formData.branch_name}
                      onChange={handleInputChange}
                      disabled={createMutation.isPending}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#FF5C35] transition-all cursor-pointer"
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

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-gray-400">ملاحظات ومؤهلات الموظف</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    disabled={createMutation.isPending}
                    rows="3"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white focus:outline-none focus:border-[#FF5C35] transition-all placeholder-gray-600 resize-none"
                    placeholder="أدخل أي ملاحظات حول خبرات الفني، الدورات الحاصل عليها، أو المهارات..."
                  />
                </div>
              </section>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <button 
                  type="button"
                  onClick={handleCancel}
                  disabled={createMutation.isPending}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-8 py-3 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white font-bold text-xs rounded-xl transition-all shadow-[0_8px_25px_rgba(255,92,53,0.35)] flex items-center gap-2 cursor-pointer"
                >
                  {createMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  <span className="material-symbols-outlined text-base">how_to_reg</span>
                  حفظ وتسجيل الموظف
                </button>
              </div>
            </form>

            {/* Employee Preview Badge Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-b from-[#18181b] to-[#09090b] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5C35]/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-bold text-[#FF5C35] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">badge</span>
                    بطاقة تعريف الموظف
                  </span>
                  <span className="px-2.5 py-1 bg-white/10 text-white rounded-full text-[10px] font-mono font-bold">STAFF ID</span>
                </div>

                <div className="text-center space-y-3 py-2">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF5C35] to-[#ff7b5c] mx-auto flex items-center justify-center text-white text-3xl font-extrabold shadow-lg border-2 border-white/20">
                    {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '؟'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-snug">{formData.fullName || 'اسم الموظف'}</h3>
                    <p className="text-xs text-[#FF5C35] font-bold mt-1">{formData.role === 'technician' ? 'فني معتمد' : 'حساب إداري'}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/10 text-xs font-bold">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>الصفة الوظيفية:</span>
                    <span className="text-white">{roleLabel}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-400">
                    <span>الفرع:</span>
                    <span className="text-amber-400">{formData.branch_name}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-400">
                    <span>رقم الجوال:</span>
                    <span className="text-white font-mono">{formData.phoneNumber || 'غير مدخل'}</span>
                  </div>

                  {formData.emailAddress && (
                    <div className="flex justify-between items-center text-gray-400">
                      <span>البريد:</span>
                      <span className="text-gray-300 font-mono text-[11px] truncate max-w-[140px]">{formData.emailAddress}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[11px] text-gray-400 font-bold space-y-2">
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#FF5C35]">verified_user</span>
                    معلومات الصلاحيات والدخول
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    {formData.role === 'technician'
                      ? 'عند تسجيل الدخول، سيفتح للحساب تلقائياً لوحة الفني المخصصة لإنجاز وتحديث العمليات.'
                      : 'عند تسجيل الدخول كأدمن، لن يملك الحساب أي صلاحيات افتراضياً حتى يحدد الأدمن العام الصلاحيات المطلوبة له.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
});

export default AddEmployee;
