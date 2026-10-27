import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import { useAdminTheme } from '../contexts/AdminThemeContext';

const AdminContactRequests = React.memo(() => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { hasPermission } = useAuth();
    const { language } = useLanguage();
    const isArabic = language === 'ar';
    const { isLight } = useAdminTheme();
    const canView = hasPermission('view_contact_requests');

    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    useBodyScrollLock(Boolean(selectedRequest));

    if (!canView) {
        return (
            <div className={`flex min-h-screen font-body relative pt-16 md:pt-0 ${isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#000000] text-[#e5e2e1] admin-dark-theme'}`} dir={isArabic ? 'rtl' : 'ltr'}>
                <AdminSidebar />
                <main className="flex-1 flex items-center justify-center p-6 text-center">
                    <div className={`max-w-md rounded-3xl p-8 space-y-4 shadow-2xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/10'}`}>
                        <span className="material-symbols-outlined text-5xl text-red-500 block">lock_person</span>
                        <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {isArabic ? 'غير مصرح بالوصول' : 'Access Denied'}
                        </h2>
                        <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            {isArabic 
                                ? 'لا تملك صلاحية عرض طلبات التواصل. تواصل مع السوبر أدمن للحصول على صلاحية (view_contact_requests).'
                                : 'You do not have permission to view contact requests. Contact an administrator.'}
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    // Fetch contact requests from backend
    const { data: response, isLoading, refetch } = useQuery({
        queryKey: ['contactRequests', activeTab],
        queryFn: async () => {
            const params = activeTab !== 'all' ? { status: activeTab } : {};
            const res = await contactService.getAll(params);
            return res.data || res;
        },
    });

    const contactList = useMemo(() => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (Array.isArray(response.data)) return response.data;
        return [];
    }, [response]);

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => contactService.updateStatus(id, status),
        onSuccess: () => {
            toast.success(isArabic ? 'تم تحديث حالة طلب التواصل بنجاح' : 'Contact request status updated successfully');
            queryClient.invalidateQueries(['contactRequests']);
        },
        onError: (err) => {
            toast.error(err.message || (isArabic ? 'فشل تحديث الحالة' : 'Failed to update status'));
        },
    });

    // Filter list by search term
    const filteredRequests = useMemo(() => {
        return contactList.filter((item) => {
            const name = (item.full_name || '').toLowerCase();
            const phone = (item.phone || '').toLowerCase();
            const email = (item.email || '').toLowerCase();
            const brand = (item.car_brand || '').toLowerCase();
            const model = (item.car_model || '').toLowerCase();
            const service = (item.service_type || '').toLowerCase();
            const search = searchTerm.toLowerCase().trim();

            return (
                !search ||
                name.includes(search) ||
                phone.includes(search) ||
                email.includes(search) ||
                brand.includes(search) ||
                model.includes(search) ||
                service.includes(search)
            );
        });
    }, [contactList, searchTerm]);

    // Counts
    const stats = useMemo(() => {
        return {
            total: contactList.length,
            new: contactList.filter((r) => r.status === 'new').length,
            contacted: contactList.filter((r) => r.status === 'contacted').length,
            converted: contactList.filter((r) => r.status === 'converted').length,
        };
    }, [contactList]);

    const handleStatusChange = (id, newStatus) => {
        updateStatusMutation.mutate({ id, status: newStatus });
    };

    const getCleanPhone = (phone) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        if (digits.startsWith('966')) return digits;
        if (digits.startsWith('0')) return `966${digits.slice(1)}`;
        return `966${digits}`;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'new':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        {isArabic ? 'جديد' : 'New'}
                    </span>
                );
            case 'contacted':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {isArabic ? 'تم التواصل' : 'Contacted'}
                    </span>
                );
            case 'converted':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {isArabic ? 'تم تحويله لموعد' : 'Converted'}
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {isArabic ? 'ملغي' : 'Cancelled'}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-500 border border-gray-500/20">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className={`flex h-screen font-body overflow-hidden transition-colors duration-300 ${isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#050507] text-white admin-dark-theme'}`} dir={isArabic ? 'rtl' : 'ltr'}>
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col h-full overflow-y-auto transition-colors duration-300 ${isLight ? 'bg-[#F8FAFC]' : 'bg-gradient-to-b from-[#0a0a0f] to-[#050507]'}`}>
                {/* Top Bar */}
                <div className={`p-6 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl sticky top-0 z-20 ${isLight ? 'bg-white/90 border-gray-200' : 'bg-[#0a0a0f]/80 border-white/[0.08]'}`}>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5C24EB] to-[#7C3AED] flex items-center justify-center shadow-[0_0_20px_rgba(92, 36, 235, 0.4)] text-white">
                                <span className="material-symbols-outlined text-xl">contact_mail</span>
                            </div>
                            <div>
                                <h1 className={`text-xl font-display font-black uppercase tracking-wider ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                    {isArabic ? 'رسائل وتواصل العملاء' : 'Customer Inquiries & Messages'}
                                </h1>
                                <p className={`text-xs mt-0.5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {isArabic ? 'إدارة وقراءة استفسارات نموذج "تواصل معنا" من موقع ريفليكتو' : 'Manage and respond to Contact Us form inquiries'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => refetch()}
                            className={`p-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/[0.05] hover:bg-white/10 text-gray-300 hover:text-white'}`}
                            title={isArabic ? 'تحديث البيانات' : 'Refresh'}
                        >
                            <span className="material-symbols-outlined text-base">refresh</span>
                            <span>{isArabic ? 'تحديث' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>

                <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className={`p-5 rounded-2xl border shadow-inner flex items-center justify-between ${isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-white/[0.03] border-white/10 text-white'}`}>
                            <div>
                                <div className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {isArabic ? 'إجمالي الرسائل' : 'Total Messages'}
                                </div>
                                <div className={`text-2xl font-black font-mono mt-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>{stats.total}</div>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-gray-100 text-gray-700' : 'bg-white/10 text-white'}`}>
                                <span className="material-symbols-outlined text-xl">mark_email_unread</span>
                            </div>
                        </div>

                        <div className={`p-5 rounded-2xl border shadow-inner flex items-center justify-between ${isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'}`}>
                            <div>
                                <div className="text-xs text-amber-600 font-bold uppercase tracking-wider">
                                    {isArabic ? 'طلبات جديدة' : 'New Inquiries'}
                                </div>
                                <div className="text-2xl font-black text-amber-600 font-mono mt-1">{stats.new}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">fiber_new</span>
                            </div>
                        </div>

                        <div className={`p-5 rounded-2xl border shadow-inner flex items-center justify-between ${isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'}`}>
                            <div>
                                <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                                    {isArabic ? 'تم التواصل معهم' : 'Contacted'}
                                </div>
                                <div className="text-2xl font-black text-blue-600 font-mono mt-1">{stats.contacted}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">support_agent</span>
                            </div>
                        </div>

                        <div className={`p-5 rounded-2xl border shadow-inner flex items-center justify-between ${isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                            <div>
                                <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
                                    {isArabic ? 'تم تحويله لموعد' : 'Converted to Booking'}
                                </div>
                                <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{stats.converted}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">event_available</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls: Search & Tabs */}
                    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/[0.02] border-white/10'}`}>
                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
                            {[
                                { id: 'all', labelEn: 'All Messages', labelAr: 'جميع الرسائل' },
                                { id: 'new', labelEn: 'New', labelAr: 'جديد' },
                                { id: 'contacted', labelEn: 'Contacted', labelAr: 'تم التواصل' },
                                { id: 'converted', labelEn: 'Converted', labelAr: 'تم تحويله لموعد' },
                                { id: 'cancelled', labelEn: 'Cancelled', labelAr: 'ملغي' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === tab.id
                                        ? 'bg-[#5C24EB] text-white shadow-[0_0_15px_rgba(92, 36, 235, 0.4)]'
                                        : isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                                        }`}
                                >
                                    {isArabic ? tab.labelAr : tab.labelEn}
                                </button>
                            ))}
                        </div>

                        {/* Search Box */}
                        <div className="relative w-full sm:w-72">
                            <span className={`material-symbols-outlined absolute ${isArabic ? 'right-3' : 'left-3'} top-2.5 text-gray-400 text-base pointer-events-none`}>
                                search
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={isArabic ? 'بحث باسم العميل، الهاتف...' : 'Search by client, phone...'}
                                className={`w-full rounded-xl py-2 text-xs focus:outline-none focus:border-[#5C24EB] transition-colors border ${isArabic ? 'pr-9 pl-4' : 'pl-9 pr-4'} ${
                                    isLight
                                        ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                        : 'bg-black/50 border-white/10 text-white placeholder-gray-500'
                                }`}
                            />
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className={`rounded-2xl overflow-hidden border transition-all ${
                        isLight
                            ? 'bg-white border-gray-200 shadow-sm'
                            : 'bg-white/[0.02] border-white/10 shadow-2xl'
                    }`}>
                        {isLoading ? (
                            <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 border-2 border-[#5C24EB] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-xs font-bold">{isArabic ? 'جاري تحميل رسائل التواصل...' : 'Loading inquiries...'}</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                                <span className="material-symbols-outlined text-4xl text-gray-400">inbox</span>
                                <p className={`text-sm font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {isArabic ? 'لا توجد طلبات تواصل مطابقة حالياً' : 'No contact requests found.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className={`w-full text-xs ${isArabic ? 'text-right' : 'text-left'}`}>
                                    <thead>
                                        <tr className={`border-b font-bold uppercase tracking-wider ${
                                            isLight
                                                ? 'border-gray-200 bg-gray-50 text-gray-600'
                                                : 'border-white/10 bg-white/[0.03] text-gray-400'
                                        }`}>
                                            <th className="py-4 px-4 text-center">#</th>
                                            <th className="py-4 px-4">{isArabic ? 'اسم العميل ورقم الهاتف' : 'Client & Phone'}</th>
                                            <th className="py-4 px-4">{isArabic ? 'تفاصيل السيارة' : 'Vehicle Details'}</th>
                                            <th className="py-4 px-4">{isArabic ? 'الخدمة المطلوبة' : 'Requested Service'}</th>
                                            <th className="py-4 px-4">{isArabic ? 'الموعد المفضل' : 'Preferred Date'}</th>
                                            <th className="py-4 px-4 text-center">{isArabic ? 'الحالة' : 'Status'}</th>
                                            <th className="py-4 px-4 text-center">{isArabic ? 'إجراءات التواصل' : 'Actions'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isLight ? 'divide-gray-100' : 'divide-white/[0.05]'}`}>
                                        {filteredRequests.map((req, idx) => {
                                            const cleanPhone = getCleanPhone(req.phone);
                                            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                                isArabic 
                                                    ? `مرحباً ${req.full_name || 'العميل العزيز'}، تواصلنا معك من مراكز ريفليكتو للعناية وحماية السيارات بخصوص استفسارك.`
                                                    : `Hello ${req.full_name || 'Valued Client'}, we are contacting you from Reflecto regarding your inquiry.`
                                            )}`;

                                            return (
                                                <tr key={req.uuid || idx} className={`transition-colors ${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.02]'}`}>
                                                    <td className="py-4 px-4 text-center text-gray-500 font-mono">{idx + 1}</td>

                                                    {/* Customer Info */}
                                                    <td className="py-4 px-4">
                                                        <div className={`font-bold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>{req.full_name || (isArabic ? 'بدون اسم' : 'Unnamed')}</div>
                                                        <div className={`flex items-center gap-2 mt-1 font-mono ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                                            <span className="material-symbols-outlined text-xs text-[#8B5CF6]">phone</span>
                                                            <span dir="ltr">{req.phone}</span>
                                                        </div>
                                                        {req.email && (
                                                            <div className="text-[11px] font-mono mt-0.5 truncate max-w-[180px] text-gray-400">
                                                                {req.email}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Vehicle Details */}
                                                    <td className="py-4 px-4">
                                                        {req.car_brand || req.car_model ? (
                                                            <div>
                                                                <div className={`font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                                                                    {req.car_brand} {req.car_model}
                                                                </div>
                                                                {req.car_year && (
                                                                    <div className={`text-[11px] font-mono ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                                                        {isArabic ? `موديل ${req.car_year}` : `Model ${req.car_year}`}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className={isLight ? 'text-gray-400' : 'text-gray-600'}>
                                                                {isArabic ? 'غير محدد' : 'Not specified'}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Service Details */}
                                                    <td className="py-4 px-4">
                                                        <div className="font-bold text-[#8B5CF6]">
                                                            {req.service_type || (isArabic ? 'طلب استفسار عام' : 'General Inquiry')}
                                                        </div>
                                                        {req.service_package && (
                                                            <div className={`text-[11px] mt-0.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                                                {isArabic ? `باقة: ${req.service_package}` : `Package: ${req.service_package}`}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Preferred Date */}
                                                    <td className={`py-4 px-4 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                                                        {req.preferred_date ? (
                                                            <div className="font-mono">
                                                                <div>{new Date(req.preferred_date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</div>
                                                                {req.preferred_time && (
                                                                    <div className="text-[11px] text-gray-400">{req.preferred_time}</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className={isLight ? 'text-gray-400' : 'text-gray-600'}>
                                                                {isArabic ? 'في أقرب وقت' : 'ASAP'}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Status Badge & Select */}
                                                    <td className="py-4 px-4 text-center">
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            {getStatusBadge(req.status)}
                                                            <select
                                                                value={req.status}
                                                                onChange={(e) => handleStatusChange(req.uuid, e.target.value)}
                                                                className={`rounded-lg px-2 py-1 text-[11px] border focus:outline-none focus:border-[#5C24EB] cursor-pointer ${
                                                                    isLight 
                                                                        ? 'bg-white border-gray-300 text-gray-800' 
                                                                        : 'bg-black/60 border-white/10 text-gray-300'
                                                                }`}
                                                            >
                                                                <option value="new" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>{isArabic ? 'جديد' : 'New'}</option>
                                                                <option value="contacted" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>{isArabic ? 'تم التواصل' : 'Contacted'}</option>
                                                                <option value="converted" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>{isArabic ? 'تحويل لموعد' : 'Converted'}</option>
                                                                <option value="cancelled" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>{isArabic ? 'إلغاء' : 'Cancelled'}</option>
                                                            </select>
                                                        </div>
                                                    </td>

                                                    {/* Contact Actions */}
                                                    <td className="py-4 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {/* WhatsApp Direct */}
                                                            <a
                                                                href={whatsappUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center ${
                                                                    isLight
                                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white'
                                                                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white'
                                                                }`}
                                                                title={isArabic ? 'تواصل عبر الواتساب' : 'WhatsApp'}
                                                            >
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M12.031 2c-5.456 0-9.902 4.446-9.902 9.902 0 1.745.457 3.447 1.328 4.954L2 22l5.253-1.378c1.45.79 3.09 1.208 4.778 1.208 5.456 0 9.902-4.446 9.902-9.902 0-5.456-4.446-9.902-9.902-9.902zm5.82 14.161c-.244.686-1.42 1.31-1.96 1.371-.49.055-1.127.086-1.821-.137-.428-.137-.985-.32-1.705-.632-3.003-1.302-4.966-4.33-5.116-4.53-.15-.2-1.22-1.626-1.22-3.1 0-1.474.773-2.2 1.047-2.5.274-.3.6-.375.8-.375.2 0 .4 0 .574.01.184.009.431-.07.674.513.244.584.832 2.032.905 2.18.073.15.122.324.024.522-.097.199-.147.323-.294.498-.147.174-.309.39-.441.524-.147.15-.301.313-.13.606.171.293.762 1.258 1.636 2.037 1.124 1.002 2.072 1.313 2.365 1.46.293.147.465.122.637-.074.171-.196.733-.855.93-1.148.196-.293.391-.244.66-.147.269.098 1.711.807 2.004.954.293.147.489.22.562.343.073.123.073.71-.171 1.396z" />
                                                                </svg>
                                                            </a>

                                                            {/* Direct Phone Call */}
                                                            <a
                                                                href={`tel:${req.phone}`}
                                                                className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center ${
                                                                    isLight
                                                                        ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white'
                                                                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white'
                                                                }`}
                                                                title={isArabic ? 'اتصال هاتفي مباشر' : 'Call'}
                                                            >
                                                                <span className="material-symbols-outlined text-base">call</span>
                                                            </a>

                                                            {/* View Details */}
                                                            <button
                                                                onClick={() => setSelectedRequest(req)}
                                                                className={`p-2.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center ${
                                                                    isLight
                                                                        ? 'bg-purple-50 text-[#5C24EB] border border-purple-200 hover:bg-[#5C24EB] hover:text-white'
                                                                        : 'bg-white/[0.06] text-purple-300 border border-white/10 hover:bg-[#5C24EB] hover:text-white'
                                                                }`}
                                                                title={isArabic ? 'عرض تفاصيل الطلب' : 'View Details'}
                                                            >
                                                                <span className="material-symbols-outlined text-base">visibility</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 h-screen w-screen overflow-hidden overscroll-contain" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className={`border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar overscroll-contain ${
                        isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#121216] border-white/10 text-white'
                    }`}>
                        <div className={`flex items-center justify-between border-b pb-4 mb-4 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#5C24EB]/20 text-[#8B5CF6] flex items-center justify-center">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>{selectedRequest.full_name}</h3>
                                    <div className={`text-xs font-mono ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{selectedRequest.phone}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                                    isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className={`p-4 rounded-2xl border grid grid-cols-2 gap-3 ${
                                isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.03] border-white/10'
                            }`}>
                                <div>
                                    <span className={`block mb-1 font-bold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {isArabic ? 'البريد الإلكتروني:' : 'Email:'}
                                    </span>
                                    <span className={`font-mono ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>{selectedRequest.email || (isArabic ? 'غير مسجل' : 'N/A')}</span>
                                </div>
                                <div>
                                    <span className={`block mb-1 font-bold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {isArabic ? 'تاريخ الإرسال:' : 'Submitted on:'}
                                    </span>
                                    <span className={`font-mono ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
                                        {new Date(selectedRequest.created_at).toLocaleString(isArabic ? 'ar-EG' : 'en-US')}
                                    </span>
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border grid grid-cols-2 gap-3 ${
                                isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.03] border-white/10'
                            }`}>
                                <div>
                                    <span className={`block mb-1 font-bold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {isArabic ? 'ماركة السيارة:' : 'Vehicle Brand:'}
                                    </span>
                                    <span className={`font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{selectedRequest.car_brand || (isArabic ? 'غير محدد' : 'N/A')}</span>
                                </div>
                                <div>
                                    <span className={`block mb-1 font-bold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {isArabic ? 'الموديل والسنة:' : 'Model & Year:'}
                                    </span>
                                    <span className={isLight ? 'text-gray-800' : 'text-gray-200'}>{selectedRequest.car_model} ({selectedRequest.car_year || 'N/A'})</span>
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border space-y-2 ${
                                isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.03] border-white/10'
                            }`}>
                                <div>
                                    <span className={`block mb-1 font-bold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {isArabic ? 'الخدمة المطلوبة:' : 'Requested Service:'}
                                    </span>
                                    <span className="text-[#8B5CF6] font-bold text-sm">{selectedRequest.service_type || (isArabic ? 'طلب عام' : 'General')}</span>
                                </div>
                                {selectedRequest.service_package && (
                                    <div>
                                        <span className={`block mb-1 font-bold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {isArabic ? 'الباقة الاختيارية:' : 'Package:'}
                                        </span>
                                        <span className={isLight ? 'text-gray-800' : 'text-gray-200'}>{selectedRequest.service_package}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`mt-6 pt-4 border-t flex items-center justify-end gap-3 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                            <button
                                type="button"
                                onClick={() => setSelectedRequest(null)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                    isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                            >
                                {isArabic ? 'إغلاق' : 'Close'}
                            </button>
                            <a
                                href={`https://wa.me/${getCleanPhone(selectedRequest.phone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            >
                                <span className="material-symbols-outlined text-sm">chat</span>
                                <span>{isArabic ? 'تواصل عبر الواتساب' : 'WhatsApp'}</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default AdminContactRequests;
