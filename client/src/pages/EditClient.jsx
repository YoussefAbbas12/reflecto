import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService, companyService, roleService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { getCompanyLogoUrl } from '../utils/imageUrl';

const EditClient = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser, hasPermission } = useAuth();
  const canEdit = hasPermission('edit_client');

  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get('id');

  const [premiumSupport, setPremiumSupport] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);

  const [permissions, setPermissions] = useState({});

  // Local form state
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    city: '',
    address: '',
    vehicleBrand: '',
    vehicleModel: '',
    notes: '',
    role: 'client',
    branch_name: 'جدة - الصفا'
  });

  const { data: clientData, isLoading: isFetching } = useQuery({
    queryKey: ['adminClient', clientId],
    queryFn: () => clientService.getById(clientId),
    enabled: !!clientId,
  });

  // Fetch available companies
  const { data: companiesData } = useQuery({
    queryKey: ['adminCompaniesList'],
    queryFn: () => companyService.getAll(),
  });
  const companiesList = companiesData?.data || [];

  // Fetch available dynamic roles
  const { data: rolesData } = useQuery({
    queryKey: ['rolesListInEditClient'],
    queryFn: () => roleService.getAll(),
  });
  const rolesList = rolesData?.data || [];

  // Fetch available company logos
  const { data: companyIconsData, refetch: refetchIcons } = useQuery({
    queryKey: ['companyIcons'],
    queryFn: () => clientService.getCompanyIcons(),
    staleTime: 30000,
  });

  // Populate form when data arrives
  useEffect(() => {
    if (clientData) {
      const matchedRole = rolesList.find(r => r.id === clientData.role_id || r.slug === clientData.role || r.name === clientData.role);
      let initialRole = 'client';
      if (clientData.role === 'admin' || clientData.role === 'technician' || clientData.role === 'client') {
        initialRole = clientData.role;
      } else if (matchedRole) {
        initialRole = matchedRole.slug;
      } else if (clientData.role) {
        initialRole = clientData.role;
      }

      let vehiclesArr = [];
      if (Array.isArray(clientData.vehicles) && clientData.vehicles.length > 0) {
        vehiclesArr = clientData.vehicles.map(v => ({
          brand: v.brand || '',
          model: v.model || '',
          year: v.year || '',
          color: v.color || '',
          plate_number: v.plate || v.plate_number || '',
          mileage: v.mileage || '',
          chassis_number: v.chassis_number || ''
        }));
      } else if (clientData.car_brand || clientData.car_model) {
        vehiclesArr = [{
          brand: clientData.car_brand || '',
          model: clientData.car_model || '',
          year: clientData.car_year || '',
          color: clientData.car_color || '',
          plate_number: clientData.car_plate || '',
          mileage: clientData.car_mileage || '',
          chassis_number: clientData.chassis_number || ''
        }];
      } else {
        vehiclesArr = [{ brand: '', model: '', year: new Date().getFullYear(), color: '', plate_number: '', mileage: '', chassis_number: '' }];
      }

      setFormData({
        fullName: clientData.full_name || '',
        emailAddress: clientData.email || '',
        phoneNumber: clientData.phone || '',
        city: clientData.city || '',
        address: clientData.address || '',
        notes: clientData.notes || '',
        role: initialRole,
        branch_name: clientData.branch_name || 'جدة - الصفا',
        vehicles: vehiclesArr
      });
      setIsActive(clientData.is_active !== false);
      setPremiumSupport(clientData.is_premium === true);
      setIsSuperAdmin(!!clientData.is_super_admin);
      setCompanyId(clientData.company_id || '');
      setSelectedAvatarUrl(clientData.avatarUrl || clientData.avatar_url || '');

      let permsObj = {};
      if (clientData.permissions) {
        try {
          permsObj = typeof clientData.permissions === 'string' ? JSON.parse(clientData.permissions) : clientData.permissions;
        } catch (_) { }
      }
      setPermissions(permsObj);
    }
  }, [clientData, rolesList]);

  const updateMutation = useMutation({
    mutationFn: (payload) => clientService.update(clientId, payload),
    onSuccess: () => {
      toast.success('تم تحديث البيانات بنجاح');
      queryClient.invalidateQueries({ queryKey: ['adminClient', clientId] });
      queryClient.invalidateQueries({ queryKey: ['adminClients'] });
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] });
      if (formData.role !== 'client') {
        navigate('/admin/employees');
      }
    },
    onError: (err) => {
      toast.error(err.message || 'فشل تحديث بيانات العميل');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => clientService.resetPassword(clientId),
    onSuccess: (res) => {
      toast.success(res.message || 'تم إعادة تعيين كلمة المرور بنجاح إلى (00000)');
    },
    onError: (err) => {
      toast.error(err.message || 'فشل إعادة تعيين كلمة المرور');
    }
  });

  const handleForceResetPassword = useCallback(() => {
    if (window.confirm('هل أنت تأكد من إعادة تعيين كلمة المرور لهذا الحساب إلى 00000؟')) {
      resetPasswordMutation.mutate();
    }
  }, [resetPasswordMutation]);

  const handleInputChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);

  const handleVehicleChange = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      vehicles: (prev.vehicles || []).map((v, i) => i === index ? { ...v, [field]: value } : v)
    }));
  }, []);

  const addVehicle = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...(prev.vehicles || []), { brand: '', model: '', year: new Date().getFullYear(), color: '', plate_number: '', mileage: '', chassis_number: '' }]
    }));
  }, []);

  const removeVehicle = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      vehicles: (prev.vehicles || []).filter((_, i) => i !== index)
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
    const validVehicles = (formData.vehicles || []).filter(v => v.brand || v.model || v.plate_number || v.chassis_number);
    const firstVeh = validVehicles[0] || {};

    const payload = {
      full_name: formData.fullName,
      email: formData.emailAddress,
      phone: formData.phoneNumber,
      city: formData.city,
      address: formData.address,
      car_brand: firstVeh.brand || undefined,
      car_model: firstVeh.model || undefined,
      car_year: firstVeh.year || undefined,
      car_color: firstVeh.color || undefined,
      car_plate: firstVeh.plate_number || undefined,
      car_mileage: firstVeh.mileage || undefined,
      chassis_number: firstVeh.chassis_number || undefined,
      vehicles: validVehicles,
      notes: formData.notes,
      role: formData.role,
      role_id: matchedRole ? matchedRole.id : null,
      branch_name: formData.branch_name,
      is_active: isActive,
      is_premium: premiumSupport,
      is_super_admin: isSuperAdmin,
      company_id: companyId ? parseInt(companyId) : null,
      is_corporate: companyId ? 1 : 0,
      permissions: permissions,
      avatar_url: selectedAvatarUrl || null,
    };

    updateMutation.mutate(payload);
  }, [formData, rolesList, isActive, premiumSupport, isSuperAdmin, companyId, permissions, selectedAvatarUrl, updateMutation, toast]);

  const handleLogoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }
    setIsUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const base64 = ev.target.result;
          const filename = file.name.replace(/[^a-zA-Z0-9._\- ]/g, '');
          const res = await clientService.uploadCompanyIcon(filename, base64);
          if (res?.data?.url) {
            setSelectedAvatarUrl(res.data.url);
            refetchIcons();
            toast.success('تم رفع الشعار بنجاح!');
          } else {
            toast.error(res?.message || 'فشل رفع الشعار');
          }
        } catch (err) {
          toast.error('فشل رفع الشعار');
        } finally {
          setIsUploadingLogo(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingLogo(false);
    }
  }, [toast, refetchIcons]);

  const handleCancel = useCallback(() => {
    navigate('/clientsDashboard');
  }, [navigate]);

  const inputStyle = "w-full bg-white/[0.05] backdrop-blur-md text-white border-0 shadow-inner focus:ring-2 focus:ring-[#5C24EB]/50 rounded-md py-3 px-4 font-medium outline-none transition-all disabled:opacity-50";
  const labelStyle = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2";

  if (!canEdit) {
    return (
      <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0">
        <AdminSidebar />
        <main className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
          <h1 className="text-2xl font-bold text-white">عفواً، لا تملك صلاحية تعديل بيانات العملاء</h1>
          <p className="text-gray-400 text-sm">تواصل مع السوبر أدمن للحصول على صلاحية (edit_client)</p>
          <button onClick={() => navigate('/admin/clients')} className="px-6 py-2 bg-[#5C24EB] text-white rounded-xl font-bold text-xs cursor-pointer">
            العودة لإدارة العملاء
          </button>
        </main>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] items-center justify-center">
        <div className="text-center bg-white/[0.02] backdrop-blur-xl p-8 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-4">No Client ID Provided</h2>
          <button type="button" onClick={handleCancel} className="text-[#8B5CF6] hover:underline focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 rounded px-2">Go back to Clients</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12" aria-labelledby="edit-client-heading">
        {isFetching ? (
          <div className="flex items-center justify-center h-64" aria-live="polite">
            <div className="w-8 h-8 border-4 border-[#5C24EB] border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
            <span className="sr-only">Loading client details...</span>
          </div>
        ) : (
          <>
            {/* Breadcrumb & Hero */}
            <header>
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-gray-500 mb-4 text-sm font-medium">
                <button type="button" className="cursor-pointer hover:text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 rounded px-1" onClick={handleCancel}>Clients</button>
                <span className="material-symbols-outlined text-xs" aria-hidden="true">chevron_right</span>
                <span className="font-bold text-[#e5e2e1]" aria-current="page">Edit Client Details</span>
              </nav>
              <h1 id="edit-client-heading" className="text-4xl font-black font-headline text-white mb-2 tracking-tight">Modify Profile</h1>
              <p className="text-gray-400">Update the executive profile and configuration for client <span className="font-mono text-white">{clientId.substring(0, 8)}...</span></p>
            </header>

            <form className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32" onSubmit={(e) => e.preventDefault()}>

              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">

                {/* Personal Information Panel */}
                <fieldset className="bg-white/[0.02] backdrop-blur-xl rounded-xl p-8 shadow-2xl border-0">
                  <legend className="text-lg font-bold font-headline text-white mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#8B5CF6] bg-[#5C24EB]/10 p-1.5 rounded-lg" aria-hidden="true">person</span>
                    Personal Information
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className={labelStyle}>Full Name *</label>
                      <input className={inputStyle} id="fullName" type="text" value={formData.fullName} onChange={handleInputChange} disabled={updateMutation.isPending} aria-required="true" />
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className={labelStyle}>Phone Number *</label>
                      <input className={inputStyle} id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} disabled={updateMutation.isPending} aria-required="true" />
                    </div>
                    <div>
                      <label htmlFor="emailAddress" className={labelStyle}>Email Address</label>
                      <input className={inputStyle} id="emailAddress" type="email" value={formData.emailAddress} onChange={handleInputChange} disabled={updateMutation.isPending} />
                    </div>
                    <div>
                      <label htmlFor="role" className={labelStyle}>System Role (الدور والصلاحيات)</label>
                      {(currentUser?.is_super_admin || currentUser?.role === 'admin') ? (
                        <select className={`${inputStyle} appearance-none cursor-pointer`} id="role" value={formData.role} onChange={handleInputChange} disabled={updateMutation.isPending}>
                          <option value="client">Client (عميل)</option>
                          <option value="technician">Technician (فني / تيكنيكال)</option>
                          <option value="admin">Admin (مدير عام)</option>
                          {rolesList.map(r => (
                            <option key={r.id || r.slug} value={r.slug}>{r.name} (دور مخصص)</option>
                          ))}
                        </select>
                      ) : (
                        <div className={`${inputStyle} flex items-center gap-2 cursor-not-allowed opacity-70`}>
                          <span className={`w-2 h-2 rounded-full ${formData.role === 'admin' ? 'bg-amber-400' : (formData.role === 'technician' ? 'bg-blue-400' : 'bg-[#5C24EB]')}`} aria-hidden="true"></span>
                          <span className="capitalize">{formData.role === 'admin' ? 'Administrator' : (formData.role === 'technician' ? 'Technician (فني)' : formData.role)}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="branch_name" className={labelStyle}>الفرع (Branch)</label>
                      <select className={`${inputStyle} appearance-none cursor-pointer`} id="branch_name" value={formData.branch_name} onChange={handleInputChange} disabled={updateMutation.isPending}>
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
                    <div>
                      <label htmlFor="company_id" className={labelStyle}>الجهة / الشركة التابع لها (Corporate / Company)</label>
                      <select
                        id="company_id"
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                        className={`${inputStyle} appearance-none cursor-pointer`}
                        disabled={updateMutation.isPending}
                      >
                        <option value="">عميل فردي (بدون شركة)</option>
                        {companiesList.map((comp) => (
                          <option key={comp.id} value={comp.id}>
                            {comp.name} (خصم {comp.discount_percent}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </fieldset>

                {/* Vehicles Details Panel */}
                <fieldset className="bg-white/[0.02] backdrop-blur-xl rounded-xl p-8 shadow-2xl border-0">
                  <legend className="text-lg font-bold font-headline text-white mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#8B5CF6] bg-[#5C24EB]/10 p-1.5 rounded-lg" aria-hidden="true">directions_car</span>
                    بيانات سيارات العميل (Client Vehicles)
                  </legend>
                  
                  <div className="space-y-6">
                    {(formData.vehicles || []).map((vehicle, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative">
                        <div className="md:col-span-3 flex items-center justify-between border-b border-white/10 pb-3 mb-1">
                          <span className="text-xs font-black text-[#8B5CF6] uppercase tracking-wider">السيارة {index + 1}</span>
                          {(formData.vehicles || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVehicle(index)}
                              className="text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              حذف السيارة
                            </button>
                          )}
                        </div>

                        <div>
                          <label htmlFor={`editVehicleBrand-${index}`} className={labelStyle}>اسم / ماركة السيارة *</label>
                          <input className={inputStyle} id={`editVehicleBrand-${index}`} type="text" value={vehicle.brand || ''} onChange={e => handleVehicleChange(index, 'brand', e.target.value)} disabled={updateMutation.isPending} placeholder="مثال: مرسيدس / Porsche" />
                        </div>
                        <div>
                          <label htmlFor={`editVehicleModel-${index}`} className={labelStyle}>الموديل / الفئة *</label>
                          <input className={inputStyle} id={`editVehicleModel-${index}`} type="text" value={vehicle.model || ''} onChange={e => handleVehicleChange(index, 'model', e.target.value)} disabled={updateMutation.isPending} placeholder="مثال: S-Class" />
                        </div>
                        <div>
                          <label htmlFor={`editVehicleYear-${index}`} className={labelStyle}>سنة الصنع</label>
                          <input className={inputStyle} id={`editVehicleYear-${index}`} type="number" value={vehicle.year || ''} onChange={e => handleVehicleChange(index, 'year', e.target.value)} disabled={updateMutation.isPending} placeholder="مثال: 2024" />
                        </div>
                        <div>
                          <label htmlFor={`editVehicleColor-${index}`} className={labelStyle}>لون السيارة</label>
                          <input className={inputStyle} id={`editVehicleColor-${index}`} type="text" value={vehicle.color || ''} onChange={e => handleVehicleChange(index, 'color', e.target.value)} disabled={updateMutation.isPending} placeholder="مثال: أسود" />
                        </div>
                        <div>
                          <label htmlFor={`editVehiclePlate-${index}`} className={labelStyle}>رقم اللوحة</label>
                          <input className={inputStyle} id={`editVehiclePlate-${index}`} type="text" value={vehicle.plate_number || ''} onChange={e => handleVehicleChange(index, 'plate_number', e.target.value)} disabled={updateMutation.isPending} placeholder="أ ب ج 1234" dir="ltr" />
                        </div>
                        <div>
                          <label htmlFor={`editVehicleMileage-${index}`} className={labelStyle}>عدد الكيلوميترات (KM)</label>
                          <input className={inputStyle} id={`editVehicleMileage-${index}`} type="number" value={vehicle.mileage || ''} onChange={e => handleVehicleChange(index, 'mileage', e.target.value)} disabled={updateMutation.isPending} placeholder="مثال: 45000" />
                        </div>
                        <div className="md:col-span-3">
                          <label htmlFor={`editChassisNumber-${index}`} className={labelStyle}>رقم الهيكل / VIN (اختياري)</label>
                          <input className={`${inputStyle} font-mono`} id={`editChassisNumber-${index}`} type="text" value={vehicle.chassis_number || ''} onChange={e => handleVehicleChange(index, 'chassis_number', e.target.value)} disabled={updateMutation.isPending} placeholder="مثال: WBA33AH040FP12345 (اختياري)" dir="ltr" />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addVehicle}
                      disabled={updateMutation.isPending}
                      className="w-full py-3.5 rounded-2xl border border-dashed border-[#5C24EB]/50 text-[#8B5CF6] font-bold text-xs hover:bg-[#5C24EB]/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      + إضافة سيارة أخرى للعميل
                    </button>
                  </div>
                </fieldset>

                {/* Location & Notes Panel */}
                <fieldset className="bg-white/[0.02] backdrop-blur-xl rounded-xl p-8 shadow-2xl border-0">
                  <legend className="text-lg font-bold font-headline text-white mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#8B5CF6] bg-[#5C24EB]/10 p-1.5 rounded-lg" aria-hidden="true">location_on</span>
                    العنوان والملاحظات (Location & Notes)
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="city" className={labelStyle}>المدينة (City)</label>
                      <input className={inputStyle} id="city" type="text" name="city" value={formData.city || ''} onChange={handleInputChange} disabled={updateMutation.isPending} />
                    </div>
                    <div>
                      <label htmlFor="address" className={labelStyle}>العنوان / الحي (Address)</label>
                      <input className={inputStyle} id="address" type="text" name="address" value={formData.address || ''} onChange={handleInputChange} disabled={updateMutation.isPending} />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="notes" className={labelStyle}>ملاحظات داخلية (Internal Notes)</label>
                      <textarea className={`${inputStyle} resize-y min-h-[100px]`} id="notes" name="notes" rows="4" value={formData.notes || ''} onChange={handleInputChange} disabled={updateMutation.isPending} placeholder="أدخل أي ملاحظات تفصيلية أو تعليمات خاصة بالعميل..." />
                    </div>
                  </div>
                </fieldset>

              </div>

              {/* Right Column */}
              <div className="space-y-6">

                {/* Account Status Panel */}
                <section className="bg-white/[0.02] backdrop-blur-xl rounded-xl p-8 shadow-2xl relative overflow-hidden border-0" aria-label="Account Status">
                  <span className="material-symbols-outlined absolute top-4 right-4 text-[120px] text-white opacity-[0.02] pointer-events-none" aria-hidden="true">shield</span>

                  <h3 className="text-lg font-bold font-headline text-white mb-6 flex items-center gap-3 relative z-10">
                    <span className="material-symbols-outlined text-[#8B5CF6] bg-[#5C24EB]/10 p-1.5 rounded-lg" aria-hidden="true">settings</span>
                    Account Status
                  </h3>

                  <div className="space-y-6 relative z-10">

                    {/* Current State */}
                    <div className="bg-white/[0.03] backdrop-blur-md shadow-inner p-4 rounded-lg flex justify-between items-center border-0">
                      <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Current State</span>
                        <span className={`font-bold text-sm ${isActive ? 'text-green-500' : 'text-red-500'}`} aria-live="polite">
                          {isActive ? 'Active Member' : 'Inactive / Suspended'}
                        </span>
                      </div>
                      <span className={`material-symbols-outlined rounded-full ${isActive ? 'text-green-500 bg-green-500/20' : 'text-red-500 bg-red-500/20'}`} aria-hidden="true">
                        {isActive ? 'check_circle' : 'cancel'}
                      </span>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4">
                      <label className="flex items-center gap-4 cursor-pointer">
                        <div className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                            disabled={updateMutation.isPending}
                            aria-label="Toggle active account status"
                          />
                          <div className={`w-11 h-6 rounded-full peer transition-all duration-300 relative shadow-inner ${isActive ? 'bg-[#5C24EB]' : 'bg-white/10'}`}>
                            <div className={`absolute top-[2px] w-5 h-5 bg-white shadow-md rounded-full transition-all duration-300 ${isActive ? 'left-[22px]' : 'left-[2px]'}`}></div>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-white">Active Account</span>
                      </label>

                      <label className="flex items-center gap-4 cursor-pointer">
                        <div className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={premiumSupport}
                            onChange={() => setPremiumSupport(!premiumSupport)}
                            disabled={updateMutation.isPending}
                            aria-label="Toggle premium client status"
                          />
                          <div className={`w-11 h-6 rounded-full peer transition-all duration-300 relative shadow-inner ${premiumSupport ? 'bg-[#5C24EB]' : 'bg-white/10'}`}>
                            <div className={`absolute top-[2px] w-5 h-5 bg-white shadow-md rounded-full transition-all duration-300 ${premiumSupport ? 'left-[22px]' : 'left-[2px]'}`}></div>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-white">Premium Client</span>
                      </label>

                      {/* Super Admin Control Panel (Visible for Super Admins) */}
                      {(currentUser?.is_super_admin || currentUser?.role === 'super_admin') && (
                        <div className="pt-4 border-t border-white/10 space-y-4">
                          <h4 className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">إدارة صلاحيات المسؤول (Super Admin Controls)</h4>

                          <label className="flex items-center gap-4 cursor-pointer">
                            <div className="relative inline-flex items-center">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isSuperAdmin}
                                onChange={() => setIsSuperAdmin(!isSuperAdmin)}
                                disabled={updateMutation.isPending}
                              />
                              <div className={`w-11 h-6 rounded-full peer transition-all duration-300 relative shadow-inner ${isSuperAdmin ? 'bg-amber-500' : 'bg-white/10'}`}>
                                <div className={`absolute top-[2px] w-5 h-5 bg-white shadow-md rounded-full transition-all duration-300 ${isSuperAdmin ? 'left-[22px]' : 'left-[2px]'}`}></div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-amber-400">ترقية إلى مدير عام (Super Admin)</span>
                          </label>

                          {formData.role === 'admin' && !isSuperAdmin && (
                            <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl space-y-2 text-xs">
                              <div className="font-bold text-gray-300 mb-2">تحديد صلاحيات الأدمن:</div>
                              {[
                                { key: 'manage_packages', label: 'إدارة وتعديل الباقات (Manage Packages)' },
                                { key: 'manage_coupons', label: 'إدارة وتعديل الكوبونات (Manage Coupons)' },
                                { key: 'manage_companies', label: 'إدارة وتعديل الشركات والجهات الخارجية (Manage Companies)' },
                                { key: 'delete_clients', label: 'حذف العملاء (Delete Clients)' },
                                { key: 'edit_clients', label: 'تعديل بيانات العملاء (Edit Clients)' },
                                { key: 'view_billing', label: 'عرض الفواتير والمالية (View Billing)' },
                                { key: 'manage_ai', label: 'إدارة الذكاء الاصطناعي (AI Assistant Settings)' },
                              ].map(item => (
                                <label key={item.key} className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={!!permissions[item.key]}
                                    onChange={() => handlePermissionToggle(item.key)}
                                    className="accent-[#5C24EB] w-4 h-4 rounded cursor-pointer"
                                  />
                                  <span>{item.label}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Security Note */}
                    <div className="pt-6 border-t border-white/10 space-y-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Security Note</p>
                        <p className="text-[10px] text-gray-500 italic">Modifications are logged for auditing.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleForceResetPassword}
                        disabled={resetPasswordMutation.isPending}
                        aria-label="Force Password Reset"
                        className="w-full py-2.5 px-4 text-xs font-bold text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-md transition-colors flex items-center justify-center gap-2 shadow-inner cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">warning</span>
                        {resetPasswordMutation.isPending ? 'جاري إعادة التعيين...' : 'إعادة تعيين كلمة المرور (Force Password Reset)'}
                      </button>
                    </div>

                  </div>
                </section>

                {/* HQ Image Banner (Kept for design flair) */}
                <div className="relative rounded-xl overflow-hidden h-48 group shadow-2xl border-0">
                  <picture>
                    <source srcSet="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop&fm=avif" type="image/avif" />
                    <source srcSet="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop&fm=webp" type="image/webp" />
                    <img
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                      alt="Reflecto Partner Center Global Headquarters"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-6 pointer-events-none">
                    <div>
                      <p className="text-white font-bold text-sm">Reflecto Partner Center</p>
                      <p className="text-gray-300 text-xs mt-1">Global Client Management</p>
                    </div>
                  </div>
                </div>

              </div>
            </form>
          </>
        )}
      </main>

      {/* Floating Action Actions combined */}
      {!isFetching && (
        <div className="fixed bottom-0 right-0 left-0 md:left-[280px] p-6 lg:p-10 pointer-events-none z-50 flex flex-col items-end gap-6">
          <div className="flex bg-[#000000]/90 backdrop-blur-xl p-4 rounded-xl border-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)] items-center gap-6 pointer-events-auto mt-4">
            <button type="button" onClick={handleCancel} disabled={updateMutation.isPending} className="text-white text-sm font-semibold hover:text-[#8B5CF6] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 rounded px-4 py-2">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-[#5C24EB] text-white px-8 py-3 rounded-lg font-bold text-sm shadow-[0_8px_30px_rgba(92,36,235,0.3)] flex items-center gap-2 hover:shadow-[#5C24EB]/50 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Save Client Changes"
            >
              {updateMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
              ) : (
                <span className="material-symbols-outlined text-sm" aria-hidden="true">save</span>
              )}
              Save Changes
            </button>
          </div>
        </div>
      )}

    </div>
  );
});

export default EditClient;
