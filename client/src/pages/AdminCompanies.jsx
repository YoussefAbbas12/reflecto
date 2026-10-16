import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService, clientService, pricingService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import FadeIn from '../components/components/FadeIn';
import { getCompanyLogoUrl } from '../utils/imageUrl';
import { useAuth } from '../contexts/AuthContext';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const AdminCompanies = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { hasPermission } = useAuth();
    const canView = hasPermission('view_companies');
    const canManage = hasPermission('manage_companies');

    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);

    // Clients view modal state
    const [viewClientsCompany, setViewClientsCompany] = useState(null);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Add Corporate Client Modal State
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    useBodyScrollLock(isModalOpen || Boolean(viewClientsCompany) || isAddClientModalOpen);
    const [newClientData, setNewClientData] = useState({
        full_name: '',
        phone: '',
        email: '',
        car_brand: '',
        car_model: '',
        branch_name: 'جدة - الصفا'
    });

    // Add Corporate Client Mutation
    const addCorporateClientMutation = useMutation({
        mutationFn: (payload) => clientService.create(payload),
        onSuccess: (res) => {
            toast.success('تمت إضافة العميل وتعيينه لهذه الشركة بنجاح!');
            setIsAddClientModalOpen(false);
            setNewClientData({ full_name: '', phone: '', email: '', car_brand: '', car_model: '', branch_name: 'جدة - الصفا' });
            if (viewClientsCompany) {
                handleViewClients(viewClientsCompany);
            }
            queryClient.invalidateQueries({ queryKey: ['adminCompanies'] });
            queryClient.invalidateQueries({ queryKey: ['adminClients'] });
        },
        onError: (err) => {
            toast.error(err.message || 'فشل إضافة العميل');
        }
    });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        discount_percent: 0,
        custom_message: '',
        notes: '',
        logo_base64: '',
        logo_preview: '',
        package_prices: {}
    });

    // Fetch Companies List
    const { data, isLoading } = useQuery({
        queryKey: ['adminCompanies'],
        queryFn: () => companyService.getAll()
    });

    // Fetch Pricing Tiers List for Package Pricing
    const { data: pricingData } = useQuery({
        queryKey: ['adminPricingTiers'],
        queryFn: () => pricingService.getAll()
    });
    const packagesList = pricingData?.data || [];

    const companies = data?.data || [];

    const filteredCompanies = companies.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Create / Update Mutation
    const saveMutation = useMutation({
        mutationFn: (payload) => {
            if (editingCompany) {
                return companyService.update(editingCompany.id || editingCompany.uuid, payload);
            }
            return companyService.create(payload);
        },
        onSuccess: (res) => {
            toast.success(res.message || (editingCompany ? 'تم تحديث بيانات الشركة بنجاح' : 'تم إضافة الشركة بنجاح'));
            queryClient.invalidateQueries({ queryKey: ['adminCompanies'] });
            queryClient.invalidateQueries({ queryKey: ['pricing'] });
            queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
            handleCloseModal();
        },
        onError: (err) => {
            toast.error(err.message || 'حدث خطأ أثناء حفظ الشركة');
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => companyService.remove(id),
        onSuccess: () => {
            toast.success('تم حذف الشركة وإلغاء ارتباط العملاء بها');
            queryClient.invalidateQueries({ queryKey: ['adminCompanies'] });
        },
        onError: (err) => {
            toast.error(err.message || 'فشل حذف الشركة');
        }
    });

    const handleOpenModal = (company = null) => {
        if (!canManage) {
            toast.warning('عفواً، لا تملك صلاحية إضافة وتعديل الشركات (manage_companies)');
            return;
        }
        if (company) {
            setEditingCompany(company);
            setFormData({
                name: company.name || '',
                discount_percent: company.discount_percent || 0,
                custom_message: company.custom_message || '',
                notes: company.notes || '',
                logo_base64: '',
                logo_preview: company.logo_url || '',
                package_prices: company.package_prices || {}
            });
        } else {
            setEditingCompany(null);
            setFormData({
                name: '',
                discount_percent: 0,
                custom_message: '',
                notes: '',
                logo_base64: '',
                logo_preview: '',
                package_prices: {}
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCompany(null);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.warning('يرجى اختيار صورة صحيحة');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                logo_base64: reader.result,
                logo_preview: reader.result
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canManage) {
            toast.error('عفواً، لا تملك صلاحية تعديل أو إضافة الشركات');
            return;
        }
        if (!formData.name.trim()) {
            toast.warning('يرجى إدخال اسم الشركة أو الجهة');
            return;
        }
        saveMutation.mutate({
            name: formData.name,
            discount_percent: parseFloat(formData.discount_percent || 0),
            custom_message: formData.custom_message,
            notes: formData.notes,
            logo_base64: formData.logo_base64 || undefined,
            logo_url: formData.logo_preview || undefined,
            package_prices: formData.package_prices
        });
    };

    const handleDelete = (company) => {
        if (!canManage) {
            toast.warning('عفواً، لا تملك صلاحية حذف الشركات (manage_companies)');
            return;
        }
        if (window.confirm(`هل أنت تأكد من حذف شركة (${company.name})؟ سيتم إلغاء تحديد الشركة للعملاء التابعين لها.`)) {
            deleteMutation.mutate(company.id || company.uuid);
        }
    };

    const handleViewClients = async (company) => {
        setViewClientsCompany(company);
        setIsLoadingDetails(true);
        try {
            const res = await companyService.getById(company.id || company.uuid);
            setCompanyDetails(res.data);
        } catch (err) {
            toast.error('فشل جلب تفاصيل العملاء التابعين للشركة');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    if (!canView) {
        return (
            <div className="flex min-h-screen bg-[#050505] text-white">
                <AdminSidebar />
                <main className="flex-1 flex items-center justify-center p-6 text-center">
                    <div className="max-w-md bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl">
                        <span className="material-symbols-outlined text-5xl text-red-500 block">lock_person</span>
                        <h2 className="text-xl font-bold text-white">غير مصرح بالوصول</h2>
                        <p className="text-xs text-gray-400">لا تملك صلاحية عرض صفحة الشركات. تواصل مع السوبر أدمن للحصول على صلاحية (view_companies).</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto p-6 lg:p-10 max-w-7xl mx-auto space-y-8 w-full">

                {/* Header */}
                <FadeIn>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#FF5C35] uppercase tracking-wider">
                                <span className="material-symbols-outlined text-sm">domain</span>
                                إدارة الشركات والشركاء (Corporate Management)
                            </div>
                            <h1 className="text-3xl font-extrabold font-display">الشركات والجهات التابعة</h1>
                            <p className="text-xs text-gray-400 font-bold max-w-lg">
                                إضافة الشركات، رفع الشعارات وتحديد نسبة الخصم المخصصة والرسائل للعملاء التابعين.
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                if (!canManage) {
                                    toast.warning('عفواً، لا تملك صلاحية إضافة وتعديل الشركات (manage_companies)');
                                    return;
                                }
                                handleOpenModal();
                            }}
                            className={`px-6 py-3.5 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white font-bold text-xs rounded-2xl shadow-[0_8px_25px_rgba(255,92,53,0.35)] transition-all flex items-center gap-2 cursor-pointer ${!canManage ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                        >
                            <span className="material-symbols-outlined text-sm">add_business</span>
                            إضافة شركة جديدة
                        </button>
                    </div>
                </FadeIn>

                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="البحث باسم الشركة أو الملاحظات..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pr-11 pl-4 py-3 text-xs font-bold text-white placeholder-gray-500 outline-none focus:border-[#FF5C35]"
                        />
                    </div>
                    <span className="text-xs text-gray-400 font-bold">إجمالي الشركات: {companies.length}</span>
                </div>

                {/* Companies Grid */}
                {isLoading ? (
                    <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
                        <div className="w-8 h-8 border-3 border-[#FF5C35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-xs text-gray-400 font-bold">جاري تحميل قائمة الشركات...</p>
                    </div>
                ) : filteredCompanies.length === 0 ? (
                    <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl space-y-3">
                        <span className="material-symbols-outlined text-4xl text-gray-600">domain_disabled</span>
                        <p className="text-sm text-gray-400 font-bold">لا توجد شركات مسجلة حالياً.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompanies.map((comp) => (
                            <div
                                key={comp.id}
                                className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-5 hover:border-white/20 transition-all flex flex-col justify-between relative overflow-hidden"
                            >
                                <div className="space-y-4">
                                    {/* Company Header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                {comp.logo_url ? (
                                                    <img
                                                        src={getCompanyLogoUrl(comp.logo_url)}
                                                        alt={comp.name}
                                                        className="w-full h-full object-contain p-1"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                            if (e.target.parentElement) {
                                                                e.target.parentElement.innerHTML = '<span class="material-symbols-outlined text-2xl text-gray-500">domain</span>';
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="material-symbols-outlined text-2xl text-gray-500">domain</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{comp.name}</h3>
                                                <span className="text-[11px] font-bold text-[#FF5C35] bg-[#FF5C35]/10 px-2.5 py-0.5 rounded-md inline-block mt-1">
                                                    خصم {comp.discount_percent}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info stats */}
                                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/5 text-xs font-bold">
                                        <div className="bg-white/[0.02] p-3 rounded-xl">
                                            <span className="text-gray-500 block text-[10px] mb-1">العملاء التابعين</span>
                                            <span className="text-white text-sm font-mono">{comp.client_count || 0} عميل</span>
                                        </div>
                                        <div className="bg-white/[0.02] p-3 rounded-xl">
                                            <span className="text-gray-500 block text-[10px] mb-1">تاريخ الإضافة</span>
                                            <span className="text-gray-300 font-mono text-[11px]">{comp.created_at?.slice(0, 10) || '—'}</span>
                                        </div>
                                    </div>

                                    {/* Notes / Message */}
                                    {comp.custom_message && (
                                        <div className="text-xs bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-200">
                                            <span className="font-bold text-amber-400 block mb-0.5">رسالة ترحيبية:</span>
                                            <p className="text-[11px] leading-relaxed">{comp.custom_message}</p>
                                        </div>
                                    )}

                                    {comp.notes && (
                                        <div className="text-xs text-gray-400 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                            <span className="font-bold text-gray-300 block mb-0.5">ملاحظات:</span>
                                            <p className="text-[11px] leading-relaxed">{comp.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                                    <button
                                        onClick={() => handleViewClients(comp)}
                                        className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-sm">groups</span>
                                        العملاء ({comp.client_count || 0})
                                    </button>

                                    {canManage && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(comp)}
                                                className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer"
                                                title="تعديل البيانات"
                                            >
                                                <span className="material-symbols-outlined text-base">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(comp)}
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all cursor-pointer"
                                                title="حذف الشركة"
                                            >
                                                <span className="material-symbols-outlined text-base">delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </main>

            {/* Add / Edit Company Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 px-4 pb-4 sm:pt-20 sm:px-6 sm:pb-6 overflow-y-auto">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl max-w-2xl w-full flex flex-col max-h-[calc(100vh-5rem)] relative shadow-2xl overflow-hidden my-auto">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 shrink-0 bg-[#0f0f0f] z-10">
                            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#FF5C35]">business</span>
                                {editingCompany ? 'تعديل بيانات الشركة' : 'إضافة شركة / جهة جديدة'}
                            </h2>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>

                        {/* Modal Form Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs font-bold custom-scrollbar">
                            {/* Company Name */}
                            <div>
                                <label className="block text-gray-400 mb-1.5">اسم الشركة / الجهة <span className="text-[#FF5C35]">*</span></label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="مثال: شركة أرامكو السعودية"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF5C35] transition-all"
                                    required
                                />
                            </div>

                            {/* Discount Percent */}
                            <div>
                                <label className="block text-gray-400 mb-1.5">نسبة الخصم المخصصة للعملاء (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={formData.discount_percent}
                                    onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: e.target.value }))}
                                    placeholder="مثال: 15"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF5C35] transition-all font-mono"
                                />
                            </div>

                            {/* Logo Upload */}
                            <div>
                                <label className="block text-gray-400 mb-1.5">شعار الشركة (Company Logo)</label>
                                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white/[0.02] border border-dashed border-white/20 rounded-2xl">
                                    {formData.logo_preview ? (
                                        <div className="relative w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group">
                                            <img
                                                src={getCompanyLogoUrl(formData.logo_preview)}
                                                alt="Logo preview"
                                                className="w-full h-full object-contain p-1.5"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    if (e.target.parentElement) {
                                                        e.target.parentElement.classList.add('bg-amber-500/10');
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, logo_base64: '', logo_preview: '' }))}
                                                className="absolute inset-0 bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer text-xs font-bold gap-1"
                                                title="إزالة الشعار"
                                            >
                                                <span className="material-symbols-outlined text-base">delete</span>
                                                حذف
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-500 shrink-0">
                                            <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                                        </div>
                                    )}
                                    <div className="space-y-2 text-center sm:text-right flex-1">
                                        <label className="px-4 py-2.5 bg-[#FF5C35]/20 hover:bg-[#FF5C35]/30 text-[#FF5C35] border border-[#FF5C35]/30 rounded-xl cursor-pointer inline-flex items-center gap-2 transition-all text-xs font-bold">
                                            <span className="material-symbols-outlined text-sm">upload_file</span>
                                            {formData.logo_preview ? 'تغيير الصورة' : 'رفع صورة جديدة'}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                        <p className="text-[10px] text-gray-400 font-normal">
                                            الصورة تحفظ محلياً ويتم عرضها لجميع المستخدمين في الفواتير واللوحة.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Message */}
                            <div>
                                <label className="block text-gray-400 mb-1.5">رسالة ترحيبية أو وصف مخصص (تظهر بالفاتورة / المطبوعات)</label>
                                <textarea
                                    rows="2"
                                    value={formData.custom_message}
                                    onChange={(e) => setFormData(prev => ({ ...prev, custom_message: e.target.value }))}
                                    placeholder="مثال: خصم خاص لموظفي ومنسوبي الشركة..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF5C35] transition-all"
                                ></textarea>
                            </div>

                            {/* Package Prices Section */}
                            <div className="space-y-3 pt-3 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#FF5C35]">sell</span>
                                    <label className="block text-white font-bold text-xs">أسعار الباقات المخصصة لهذه الشركة (Package Prices)</label>
                                </div>
                                <p className="text-[11px] text-gray-400 font-normal">
                                    أدخل السعر الجديد المخصص لهذه الشركة أمام كل باقة. يتم تطبيق هذه الأسعار تلقائياً للعملاء التابعين للشركة.
                                </p>
                                {packagesList.length === 0 ? (
                                    <p className="text-gray-500 text-[11px] italic">جاري تحميل قائمة الباقات...</p>
                                ) : (
                                    <div className="space-y-2">
                                        {packagesList.map((pkg) => {
                                            const tierKey = pkg.int_id || pkg.id;
                                            const basePrice = pkg.original_price || pkg.price;
                                            const serviceTitle = pkg.service_name_ar || pkg.service_name_en;
                                            const fullName = serviceTitle ? `${serviceTitle} - ${pkg.name_ar || pkg.name_en}` : (pkg.name_ar || pkg.name_en);
                                            return (
                                                <div key={tierKey} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl gap-3 text-xs hover:border-[#FF5C35]/30 transition-all">
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-white font-bold block truncate">{fullName}</span>
                                                        <span className="text-gray-400 text-[10px]">السعر الأساسي: <span className="font-mono text-gray-300">{basePrice} SAR</span></span>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-gray-300 text-[11px]">السعر المخصص:</span>
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            placeholder={basePrice}
                                                            value={formData.package_prices?.[tierKey] ?? ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    package_prices: {
                                                                        ...(prev.package_prices || {}),
                                                                        [tierKey]: val
                                                                    }
                                                                }));
                                                            }}
                                                            className="w-28 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono text-center outline-none focus:border-[#FF5C35]"
                                                        />
                                                        <span className="text-gray-400 text-[10px]">SAR</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-gray-400 mb-1.5">ملاحظات إدارية داخلية</label>
                                <textarea
                                    rows="2"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="ملاحظات تظهر فقط للمدراء..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF5C35] transition-all"
                                ></textarea>
                            </div>

                            {/* Hidden submit trigger */}
                            <button type="submit" className="hidden" />
                        </form>

                        {/* Modal Footer (Fixed Sticky) */}
                        <div className="px-6 py-4 border-t border-white/10 bg-[#0b0b0b] shrink-0 flex items-center justify-end gap-3 z-10">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all font-bold cursor-pointer"
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saveMutation.isPending}
                                className="px-6 py-2.5 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white rounded-xl shadow-[0_8px_20px_rgba(255,92,53,0.3)] transition-all font-bold cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                {saveMutation.isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>جاري الحفظ...</span>
                                    </>
                                ) : (
                                    editingCompany ? 'تحديث البيانات' : 'إضافة الشركة'
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* View Company Clients Modal */}
            {viewClientsCompany && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl max-w-2xl w-full flex flex-col max-h-[90vh] relative shadow-2xl overflow-hidden">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 px-6 py-4 gap-4 bg-[#0f0f0f] shrink-0 z-10">
                            <div className="flex items-center gap-3">
                                {viewClientsCompany.logo_url && (
                                    <img src={getCompanyLogoUrl(viewClientsCompany.logo_url)} alt="" className="w-10 h-10 object-contain bg-white/5 p-1 rounded-lg border border-white/10" />
                                )}
                                <div>
                                    <h2 className="text-lg font-bold text-white">العملاء التابعين لشركة ({viewClientsCompany.name})</h2>
                                    <span className="text-xs text-gray-400 font-bold">نسبة الخصم: {viewClientsCompany.discount_percent}%</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddClientModalOpen(true)}
                                    className="px-4 py-2 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                                >
                                    <span className="material-symbols-outlined text-sm">person_add</span>
                                    إضافة عميل للشركة
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setViewClientsCompany(null);
                                        setIsAddClientModalOpen(false);
                                    }}
                                    className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl transition-all"
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            {isLoadingDetails ? (
                                <div className="p-8 text-center">
                                    <div className="w-6 h-6 border-2 border-[#FF5C35] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-xs text-gray-400">جاري تحميل أسماء العملاء...</p>
                                </div>
                            ) : !companyDetails?.clients || companyDetails.clients.length === 0 ? (
                                <div className="p-8 text-center space-y-3">
                                    <span className="material-symbols-outlined text-3xl text-gray-600">group_off</span>
                                    <p className="text-xs text-gray-400 font-bold">لا يوجد عملاء مرتبطين بهذه الشركة حالياً.</p>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddClientModalOpen(true)}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">person_add</span>
                                        إضافة أول عميل لهذه الشركة
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {companyDetails.clients.map((client) => (
                                        <div key={client.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between text-xs font-bold">
                                            <div className="space-y-1">
                                                <h4 className="text-white text-sm">{client.full_name || 'بدون اسم'}</h4>
                                                <p className="text-gray-400 font-mono text-[11px]">{client.phone}</p>
                                            </div>
                                            {client.email && <span className="text-gray-400 font-mono text-[11px]">{client.email}</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-white/10 bg-[#0b0b0b] shrink-0 flex justify-end">
                            <button
                                onClick={() => {
                                    setViewClientsCompany(null);
                                    setIsAddClientModalOpen(false);
                                }}
                                className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl"
                            >
                                إغلاق
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Add Client Directly to Company Modal */}
            {isAddClientModalOpen && viewClientsCompany && (
                <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    <div className="bg-[#121212] border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#FF5C35]">person_add</span>
                                إضافة عميل جديد لشركة ({viewClientsCompany.name})
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsAddClientModalOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-white bg-white/5 rounded-xl"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!newClientData.full_name || !newClientData.phone) {
                                    toast.warning('يرجى إدخال اسم العميل ورقم الجوال');
                                    return;
                                }
                                addCorporateClientMutation.mutate({
                                    full_name: newClientData.full_name,
                                    phone: newClientData.phone,
                                    email: newClientData.email || undefined,
                                    vehicle_type: newClientData.car_brand || undefined,
                                    vehicle_model: newClientData.car_model || undefined,
                                    branch_name: newClientData.branch_name,
                                    company_id: viewClientsCompany.id,
                                    is_corporate: 1,
                                    role: 'client'
                                });
                            }}
                            className="space-y-4 text-xs font-bold"
                        >
                            <div>
                                <label className="block text-gray-400 mb-1">اسم العميل بالكامل *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="مثال: عبد الله بن سلمان"
                                    value={newClientData.full_name}
                                    onChange={(e) => setNewClientData(prev => ({ ...prev, full_name: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#FF5C35]"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-1">رقم الجوال *</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="05xxxxxxxx"
                                    value={newClientData.phone}
                                    onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#FF5C35] font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-1">البريد الإلكتروني (اختياري)</label>
                                <input
                                    type="email"
                                    placeholder="client@example.com"
                                    value={newClientData.email}
                                    onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#FF5C35]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-400 mb-1">ماركة السيارة</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: لكسز"
                                        value={newClientData.car_brand}
                                        onChange={(e) => setNewClientData(prev => ({ ...prev, car_brand: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF5C35]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-1">موديل السيارة</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: LX600"
                                        value={newClientData.car_model}
                                        onChange={(e) => setNewClientData(prev => ({ ...prev, car_model: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF5C35]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-1">الفرع</label>
                                <select
                                    value={newClientData.branch_name}
                                    onChange={(e) => setNewClientData(prev => ({ ...prev, branch_name: e.target.value }))}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#FF5C35] cursor-pointer"
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

                            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddClientModalOpen(false)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={addCorporateClientMutation.isPending}
                                    className="px-5 py-2 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
                                >
                                    {addCorporateClientMutation.isPending && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    حفظ إضافة العميل
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminCompanies;
