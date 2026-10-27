import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService, companyService, authService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const AddClient = React.memo(() => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const queryClient = useQueryClient();

    const canCreate = hasPermission('create_client');

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        emailAddress: '',
        vehicleBrand: '',
        vehicleModel: '',
        city: '',
        neighborhood: '',
        notes: '',
        role: 'client',
        branch_name: 'جدة - الصفا',
        company_id: '',
        vehicles: [{ brand: '', model: '', year: new Date().getFullYear(), color: '', plate_number: '', mileage: '', chassis_number: '' }]
    });

    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    useBodyScrollLock(isOtpModalOpen);

    // Fetch available companies
    const { data: companiesData } = useQuery({
        queryKey: ['adminCompaniesList'],
        queryFn: () => companyService.getAll(),
    });
    const companiesList = companiesData?.data || [];

    const createMutation = useMutation({
        mutationFn: (data) => clientService.create(data),
        onSuccess: () => {
            toast.success('تم إنشاء العميل بنجاح');
            queryClient.invalidateQueries({ queryKey: ['adminClients'] });
            queryClient.invalidateQueries({ queryKey: ['adminClientsList'] });
            queryClient.refetchQueries({ queryKey: ['adminClients'] });
            queryClient.refetchQueries({ queryKey: ['adminClientsList'] });
            navigate('/clientsDashboard');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to create client');
        }
    });

    const formatFullPhone = useCallback((phone) => {
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('966')) return `+${cleaned}`;
        if (cleaned.startsWith('05')) return `+966${cleaned.slice(1)}`;
        if (cleaned.startsWith('5')) return `+966${cleaned}`;
        return `+966${cleaned}`;
    }, []);

    const handleSendClientOtp = useCallback(async () => {
        if (!formData.phoneNumber.trim()) {
            toast.warning('يرجى إدخال رقم الجوال أولاً');
            return;
        }

        const fullPhone = formatFullPhone(formData.phoneNumber);
        setIsSendingOtp(true);
        try {
            await authService.sendOTP(fullPhone);
            toast.success('تم إرسال كود التحقق (OTP) إلى جوال العميل');
            setIsOtpModalOpen(true);
        } catch (err) {
            toast.error(err.message || 'فشل إرسال كود التحقق');
        } finally {
            setIsSendingOtp(false);
        }
    }, [formData.phoneNumber, formatFullPhone, toast]);

    const handleVerifyClientOtp = useCallback(async () => {
        if (!otpCode.trim() || otpCode.trim().length !== 6) {
            toast.warning('يرجى إدخال كود التحقق المكون من 6 أرقام');
            return;
        }

        const fullPhone = formatFullPhone(formData.phoneNumber);
        setIsVerifyingOtp(true);
        try {
            await authService.verifyOTP(fullPhone, otpCode.trim(), false);
            toast.success('تم التحقق من رقم الجوال بنجاح!');
            setIsPhoneVerified(true);
            setIsOtpModalOpen(false);
            setOtpCode('');
        } catch (err) {
            toast.error(err.message || 'كود التحقق غير صحيح');
        } finally {
            setIsVerifyingOtp(false);
        }
    }, [formData.phoneNumber, otpCode, formatFullPhone, toast]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'phoneNumber') {
            setIsPhoneVerified(false);
        }
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.phoneNumber) {
            toast.warning('اسم العميل ورقم الجوال مطلوبان.');
            return;
        }
        if (!isPhoneVerified) {
            toast.warning('يرجى التحقق من رقم الجوال أولاً بالضغط على زر "تحقق من الرقم" وتأكيد رمز OTP.');
            return;
        }

        const payload = {
            full_name: formData.fullName,
            phone: formData.phoneNumber,
            email: formData.emailAddress || undefined,
            vehicles: formData.vehicles.filter(vehicle => vehicle.brand || vehicle.model || vehicle.plate_number),
            city: formData.city || undefined,
            address: formData.neighborhood || undefined,
            notes: formData.notes || undefined,
            role: formData.role,
            branch_name: formData.branch_name,
            company_id: formData.company_id ? parseInt(formData.company_id) : null,
            is_corporate: formData.company_id ? 1 : 0
        };

        createMutation.mutate(payload);
    }, [formData, isPhoneVerified, createMutation, toast]);

    const handleVehicleChange = useCallback((index, field, value) => {
        setFormData(prev => ({
            ...prev,
            vehicles: prev.vehicles.map((vehicle, vehicleIndex) => (
                vehicleIndex === index ? { ...vehicle, [field]: value } : vehicle
            ))
        }));
    }, []);

    const addVehicle = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            vehicles: [...prev.vehicles, { brand: '', model: '', year: new Date().getFullYear(), color: '', plate_number: '', mileage: '', chassis_number: '' }]
        }));
    }, []);

    const handleCancel = useCallback(() => {
        navigate('/clientsDashboard');
    }, [navigate]);

    if (!canCreate) {
        return (
            <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0">
                <AdminSidebar />
                <main className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
                    <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
                    <h1 className="text-2xl font-bold text-white">عفواً، لا تملك صلاحية إضافة عميل جديد</h1>
                    <p className="text-gray-400 text-sm">تواصل مع السوبر أدمن للحصول على صلاحية (create_client)</p>
                    <button onClick={() => navigate('/admin/clients')} className="px-6 py-2 bg-[#5C24EB] text-white rounded-xl font-bold text-xs cursor-pointer">
                        العودة لإدارة العملاء
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0 selection:bg-[#5C24EB]/30">

            <AdminSidebar />

            <main className="flex-1 flex flex-col h-full overflow-y-auto relative" aria-labelledby="add-client-heading">
                <div className="p-8 pb-32 max-w-5xl mx-auto w-full">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-6" aria-label="Breadcrumb">
                        <button type="button" onClick={handleCancel} className="hover:text-gray-300 transition-colors focus:outline-none focus:underline">Clients</button>
                        <span className="material-symbols-outlined text-[10px]" aria-hidden="true">chevron_right</span>
                        <span className="text-[#8B5CF6]" aria-current="page">Add New Client</span>
                    </nav>

                    <h1 id="add-client-heading" className="text-4xl font-display font-black tracking-tight mb-10 text-white drop-shadow-lg">
                        Register New Client
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Client Information Section */}
                        <section className="bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-2xl p-8 border-0 relative overflow-hidden" aria-labelledby="client-info-heading">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5C24EB] to-transparent opacity-50 pointer-events-none" aria-hidden="true"></div>
                            <h2 id="client-info-heading" className="text-lg mb-8 font-bold flex items-center gap-3 tracking-widest uppercase text-white">
                                <div className="w-8 h-8 rounded-lg bg-[#5C24EB]/10 shadow-inner flex items-center justify-center text-[#8B5CF6]" aria-hidden="true">
                                    <span className="material-symbols-outlined text-sm">person</span>
                                </div>
                                Client Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="fullName" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name *</label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        aria-required="true"
                                        disabled={createMutation.isPending}
                                        className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all placeholder-gray-600"
                                        placeholder="e.g. Mark Thompson"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="phoneNumber" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            Phone Number * {isPhoneVerified && <span className="text-emerald-400 font-bold ms-2">✓ Verified</span>}
                                        </label>
                                    </div>
                                    <div className="flex gap-2 items-center" dir="ltr">
                                        <div className="flex-1 flex items-center bg-white/[0.05] shadow-inner border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5C24EB]/50 transition-all" dir="ltr">
                                            <span className="px-3.5 py-3 bg-white/[0.08] text-gray-300 font-mono text-sm font-bold border-r border-white/10 select-none flex items-center gap-1.5 shrink-0">
                                                <span className="text-base">🇸🇦</span> +966
                                            </span>
                                            <input
                                                id="phoneNumber"
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                required
                                                aria-required="true"
                                                disabled={createMutation.isPending || isPhoneVerified}
                                                className="w-full bg-transparent px-4 py-3 text-sm font-bold text-white outline-none font-mono placeholder-gray-600"
                                                placeholder="50 123 4567"
                                            />
                                        </div>

                                        {!isPhoneVerified ? (
                                            <button
                                                type="button"
                                                onClick={handleSendClientOtp}
                                                disabled={isSendingOtp || !formData.phoneNumber}
                                                className="px-4 py-3 bg-[#5C24EB]/20 hover:bg-[#5C24EB] text-[#8B5CF6] hover:text-white border border-[#5C24EB]/40 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                                            >
                                                {isSendingOtp && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                                تحقق من الرقم
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setIsPhoneVerified(false)}
                                                className="px-3 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 hover:bg-emerald-500/30 transition-all cursor-pointer"
                                                title="تعديل الرقم"
                                            >
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                مُحقق
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="emailAddress" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                                    <input
                                        id="emailAddress"
                                        type="email"
                                        name="emailAddress"
                                        value={formData.emailAddress}
                                        onChange={handleInputChange}
                                        disabled={createMutation.isPending}
                                        className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all placeholder-gray-600"
                                        placeholder="e.g. mark.t@email.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="role" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Role</label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        disabled={createMutation.isPending}
                                        className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="client" className="bg-black text-white">Client (عميل)</option>
                                        <option value="technician" className="bg-black text-white">Technical (فني / تيكنيكال)</option>
                                        <option value="admin" className="bg-black text-white">Admin (مدير)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="branch_name" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">الفرع (Branch)</label>
                                    <select
                                        id="branch_name"
                                        name="branch_name"
                                        value={formData.branch_name}
                                        onChange={handleInputChange}
                                        disabled={createMutation.isPending}
                                        className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all cursor-pointer appearance-none"
                                    >
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
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="company_id" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">الجهة / الشركة التابع لها (Company / Corporate)</label>
                                    <select
                                        id="company_id"
                                        name="company_id"
                                        value={formData.company_id}
                                        onChange={handleInputChange}
                                        disabled={createMutation.isPending}
                                        className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="" className="bg-black text-white">عميل فردي (بدون شركة)</option>
                                        {companiesList.map(comp => (
                                            <option key={comp.id} value={comp.id} className="bg-black text-white">
                                                {comp.name} (خصم {comp.discount_percent}%)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Vehicle Details */}
                        <section className="bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-2xl p-8 border-0" aria-labelledby="vehicle-details-heading">
                            <h2 id="vehicle-details-heading" className="text-lg mb-8 font-bold flex items-center gap-3 tracking-widest uppercase text-white">
                                <div className="w-8 h-8 rounded-lg bg-[#5C24EB]/10 shadow-inner flex items-center justify-center text-[#8B5CF6]" aria-hidden="true">
                                    <span className="material-symbols-outlined text-sm">directions_car</span>
                                </div>
                                بيانات السيارة (Vehicle Details)
                            </h2>
                            <div className="space-y-6">
                                {formData.vehicles.map((vehicle, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                                        <div className="md:col-span-3 flex items-center justify-between text-xs font-black text-[#8B5CF6] uppercase tracking-widest border-b border-white/10 pb-3 mb-2">
                                            <span>السيارة {index + 1}</span>
                                            {formData.vehicles.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, vehicles: prev.vehicles.filter((_, i) => i !== index) }))}
                                                    className="text-red-400 hover:text-red-300 text-[11px] font-bold"
                                                >
                                                    حذف السيارة
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor={`vehicleBrand-${index}`} className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">اسم / ماركة السيارة *</label>
                                            <input id={`vehicleBrand-${index}`} type="text" value={vehicle.brand} onChange={e => handleVehicleChange(index, 'brand', e.target.value)} disabled={createMutation.isPending} className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all placeholder-gray-600" placeholder="مثال: مرسيدس / Porsche" />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor={`vehicleModel-${index}`} className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">الموديل / الفئة *</label>
                                            <input id={`vehicleModel-${index}`} type="text" value={vehicle.model} onChange={e => handleVehicleChange(index, 'model', e.target.value)} disabled={createMutation.isPending} className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all placeholder-gray-600" placeholder="مثال: S-Class / 911 GT3" />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor={`vehicleYear-${index}`} className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">سنة الصنع</label>
                                            <input id={`vehicleYear-${index}`} type="number" value={vehicle.year || ''} onChange={e => handleVehicleChange(index, 'year', e.target.value)} disabled={createMutation.isPending} className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all placeholder-gray-600" placeholder="مثال: 2024" />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor={`vehicleColor-${index}`} className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">لون السيارة</label>
                                            <input id={`vehicleColor-${index}`} type="text" value={vehicle.color || ''} onChange={e => handleVehicleChange(index, 'color', e.target.value)} disabled={createMutation.isPending} className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all placeholder-gray-600" placeholder="مثال: أسود / اسود ميتاليك" />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor={`vehiclePlate-${index}`} className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">رقم اللوحة</label>
                                            <input id={`vehiclePlate-${index}`} type="text" value={vehicle.plate_number || ''} onChange={e => handleVehicleChange(index, 'plate_number', e.target.value)} disabled={createMutation.isPending} className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all placeholder-gray-600" placeholder="أ ب ج 1234" dir="ltr" />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor={`vehicleMileage-${index}`} className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">عدد الكيلوميترات (KM)</label>
                                            <input id={`vehicleMileage-${index}`} type="number" value={vehicle.mileage || ''} onChange={e => handleVehicleChange(index, 'mileage', e.target.value)} disabled={createMutation.isPending} className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all placeholder-gray-600" placeholder="مثال: 45000" />
                                        </div>

                                        <div className="md:col-span-3 space-y-2">
                                            <label htmlFor={`chassisNumber-${index}`} className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">رقم الهيكل / VIN (اختياري)</label>
                                            <input id={`chassisNumber-${index}`} type="text" value={vehicle.chassis_number || ''} onChange={e => handleVehicleChange(index, 'chassis_number', e.target.value)} disabled={createMutation.isPending} className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all placeholder-gray-600 font-mono" placeholder="مثال: WBA33AH040FP12345 (اختياري)" dir="ltr" />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addVehicle} disabled={createMutation.isPending} className="w-full py-3.5 rounded-xl border border-dashed border-[#5C24EB]/50 text-[#8B5CF6] font-bold text-xs hover:bg-[#5C24EB]/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    + إضافة سيارة أخرى للعميل
                                </button>
                            </div>
                        </section>

                        {/* Address Details Section */}
                        <section className="bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-2xl p-8 border-0" aria-labelledby="location-details-heading">
                            <h2 id="location-details-heading" className="text-lg mb-8 font-bold flex items-center gap-3 tracking-widest uppercase text-white">
                                <div className="w-8 h-8 rounded-lg bg-[#5C24EB]/10 shadow-inner flex items-center justify-center text-[#8B5CF6]" aria-hidden="true">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                </div>
                                Location Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="city" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">City</label>
                                    <input
                                        id="city"
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        disabled={createMutation.isPending}
                                        className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all placeholder-gray-600"
                                        placeholder="e.g. Riyadh"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="neighborhood" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Address / Neighborhood</label>
                                    <input
                                        id="neighborhood"
                                        type="text"
                                        name="neighborhood"
                                        value={formData.neighborhood}
                                        onChange={handleInputChange}
                                        disabled={createMutation.isPending}
                                        className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all placeholder-gray-600"
                                        placeholder="e.g. Al Olaya"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Notes Section */}
                        <section className="bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-2xl p-8 border-0" aria-labelledby="notes-heading">
                            <h2 id="notes-heading" className="text-lg mb-8 font-bold flex items-center gap-3 tracking-widest uppercase text-white">
                                <div className="w-8 h-8 rounded-lg bg-[#5C24EB]/10 shadow-inner flex items-center justify-center text-[#8B5CF6]" aria-hidden="true">
                                    <span className="material-symbols-outlined text-sm">note</span>
                                </div>
                                Internal Notes
                            </h2>
                            <div className="space-y-2">
                                <label htmlFor="notes" className="sr-only">Notes</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    disabled={createMutation.isPending}
                                    className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl px-4 py-4 text-sm font-bold tracking-wide text-white focus:outline-none resize-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all placeholder-gray-600 leading-relaxed"
                                    placeholder="Enter specific client preferences or detailing instructions..."
                                    rows="4"
                                />
                            </div>
                        </section>

                        {/* Action Buttons */}
                        <footer className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={createMutation.isPending}
                                className="w-full sm:w-auto px-10 py-3.5 bg-white/[0.05] shadow-inner rounded-xl text-white font-bold text-[10px] uppercase tracking-widest border-0 hover:bg-white/[0.1] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createMutation.isPending || !isPhoneVerified}
                                title={!isPhoneVerified ? 'يجب التحقق من رقم الجوال أولاً قبل الحفظ' : ''}
                                className="w-full sm:w-auto flex-1 md:flex-none bg-[#5C24EB] hover:brightness-110 text-white font-bold py-3.5 px-10 rounded-xl transition-all shadow-[0_8px_30px_rgba(92,36,235,0.3)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-white/50"
                            >
                                {createMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>}
                                {!isPhoneVerified ? '🔒 يجب التحقق من الرقم أولاً' : 'Save Client'}
                            </button>
                        </footer>
                    </form>
                </div>

                {/* OTP Verification Modal */}
                {isOtpModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 bg-black/80 backdrop-blur-md h-screen w-screen overflow-hidden overscroll-contain">
                        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full text-center shadow-2xl relative shrink-0 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar overscroll-contain">
                            <button
                                type="button"
                                onClick={() => setIsOtpModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold cursor-pointer p-1 rounded-full hover:bg-white/10 transition-all"
                            >
                                ✕
                            </button>

                            <div className="w-12 h-12 bg-[#5C24EB]/10 border border-[#5C24EB]/30 rounded-2xl flex items-center justify-center text-[#8B5CF6] mx-auto mb-3">
                                <span className="material-symbols-outlined text-xl">lock</span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1">
                                إدخال رمز التحقق (OTP)
                            </h3>
                            <p className="text-gray-400 text-xs mb-4 dir-ltr">
                                تم إرسال رمز التحقق إلى الرقم <span className="font-mono text-white font-bold">{formData.phoneNumber}</span>
                            </p>

                            <input
                                type="text"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="••••••"
                                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-center text-2xl sm:text-3xl font-bold font-mono text-white tracking-[0.3em] focus:ring-2 focus:ring-[#5C24EB]/50 outline-none mb-4"
                                dir="ltr"
                                autoFocus
                            />

                            <div className="space-y-2.5">
                                <button
                                    type="button"
                                    onClick={handleVerifyClientOtp}
                                    disabled={isVerifyingOtp || otpCode.length !== 6}
                                    className="w-full py-3 bg-[#5C24EB] hover:brightness-110 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#5C24EB]/20 text-sm"
                                >
                                    {isVerifyingOtp && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    تأكيد رمز التحقق
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSendClientOtp}
                                    disabled={isSendingOtp}
                                    className="w-full py-2 bg-transparent text-gray-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                                >
                                    إعادة إرسال الرمز
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
});

export default AddClient;