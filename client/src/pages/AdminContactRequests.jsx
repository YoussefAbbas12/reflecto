import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const AdminContactRequests = React.memo(() => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { hasPermission } = useAuth();
    const canView = hasPermission('view_contact_requests');

    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    useBodyScrollLock(Boolean(selectedRequest));

    if (!canView) {
        return (
            <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0">
                <AdminSidebar />
                <main className="flex-1 flex items-center justify-center p-6 text-center" dir="rtl">
                    <div className="max-w-md bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl">
                        <span className="material-symbols-outlined text-5xl text-red-500 block">lock_person</span>
                        <h2 className="text-xl font-bold text-white">غير مصرح بالوصول</h2>
                        <p className="text-xs text-gray-400">لا تملك صلاحية عرض طلبات التواصل. تواصل مع السوبر أدمن للحصول على صلاحية (view_contact_requests).</p>
                    </div>
                </main>
            </div>
        );
    }

    // Fetch contact requests from backend
    const { data: response, isLoading, isError, refetch } = useQuery({
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
            toast.success('تم تحديث حالة طلب التواصل بنجاح');
            queryClient.invalidateQueries(['contactRequests']);
        },
        onError: (err) => {
            toast.error(err.message || 'فشل تحديث الحالة');
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        جديد
                    </span>
                );
            case 'contacted':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        تم التواصل
                    </span>
                );
            case 'converted':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        تم تحويله لموعد
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        ملغي
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="flex h-screen bg-[#050507] text-white font-body overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gradient-to-b from-[#0a0a0f] to-[#050507]">
                {/* Top Bar */}
                <div className="p-6 border-b border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-20">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF5C35] to-[#ff8060] flex items-center justify-center shadow-[0_0_20px_rgba(255,92,53,0.4)]">
                                <span className="material-symbols-outlined text-white text-xl">contact_mail</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-display font-black text-white uppercase tracking-wider">
                                    رسائل وتواصل العملاء
                                </h1>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    إدارة وقراءة استفسارات نموذج "تواصل معنا" من موقع ريفليكتو
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => refetch()}
                            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold"
                            title="تحديث البيانات"
                        >
                            <span className="material-symbols-outlined text-base">refresh</span>
                            <span>تحديث</span>
                        </button>
                    </div>
                </div>

                <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">إجمالي الرسائل</div>
                                <div className="text-2xl font-black text-white font-mono mt-1">{stats.total}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">mark_email_unread</span>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-inner flex items-center justify-between">
                            <div>
                                <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">طلبات جديدة</div>
                                <div className="text-2xl font-black text-amber-400 font-mono mt-1">{stats.new}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">fiber_new</span>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-inner flex items-center justify-between">
                            <div>
                                <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">تم التواصل معهم</div>
                                <div className="text-2xl font-black text-blue-400 font-mono mt-1">{stats.contacted}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">support_agent</span>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner flex items-center justify-between">
                            <div>
                                <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">تم تحويله لموعد</div>
                                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{stats.converted}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">event_available</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls: Search & Tabs */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
                            {[
                                { id: 'all', label: 'جميع الرسائل' },
                                { id: 'new', label: 'جديد' },
                                { id: 'contacted', label: 'تم التواصل' },
                                { id: 'converted', label: 'تم تحويله لموعد' },
                                { id: 'cancelled', label: 'ملغي' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === tab.id
                                        ? 'bg-[#FF5C35] text-white shadow-[0_0_15px_rgba(255,92,53,0.4)]'
                                        : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Box */}
                        <div className="relative w-full sm:w-72">
                            <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-400 text-base pointer-events-none">
                                search
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="بحث باسم العميل، الهاتف..."
                                className="w-full bg-black/50 border border-white/10 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5C35] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        {isLoading ? (
                            <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 border-2 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-xs font-bold">جاري تحميل رسائل التواصل...</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                                <span className="material-symbols-outlined text-4xl text-gray-600">inbox</span>
                                <p className="text-sm font-bold text-gray-400">لا توجد طلبات تواصل مطابقة حالياً</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/[0.03] text-gray-400 font-bold uppercase tracking-wider">
                                            <th className="py-4 px-4 text-center">#</th>
                                            <th className="py-4 px-4">اسم العميل ورقم الهاتف</th>
                                            <th className="py-4 px-4">تفاصيل السيارة</th>
                                            <th className="py-4 px-4">الخدمة المطلوبة</th>
                                            <th className="py-4 px-4">الموعد المفضل</th>
                                            <th className="py-4 px-4 text-center">الحالة</th>
                                            <th className="py-4 px-4 text-center">إجراءات التواصل</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.05]">
                                        {filteredRequests.map((req, idx) => {
                                            const cleanPhone = getCleanPhone(req.phone);
                                            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                                `مرحباً ${req.full_name || 'العميل العزيز'}، تواصلنا معك من مراكز ريفليكتو للعناية وحماية السيارات بخصوص استفسارك.`
                                            )}`;

                                            return (
                                                <tr key={req.uuid || idx} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-4 px-4 text-center text-gray-500 font-mono">{idx + 1}</td>

                                                    {/* Customer Info */}
                                                    <td className="py-4 px-4">
                                                        <div className="font-bold text-white text-sm">{req.full_name || 'بدون اسم'}</div>
                                                        <div className="flex items-center gap-2 mt-1 text-gray-400 font-mono">
                                                            <span className="material-symbols-outlined text-xs text-[#FF5C35]">phone</span>
                                                            <span dir="ltr">{req.phone}</span>
                                                        </div>
                                                        {req.email && (
                                                            <div className="text-[11px] text-gray-500 font-mono mt-0.5 truncate max-w-[180px]">
                                                                {req.email}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Vehicle Details */}
                                                    <td className="py-4 px-4">
                                                        {req.car_brand || req.car_model ? (
                                                            <div>
                                                                <div className="font-bold text-gray-200">
                                                                    {req.car_brand} {req.car_model}
                                                                </div>
                                                                {req.car_year && (
                                                                    <div className="text-[11px] text-gray-500 font-mono">موديل {req.car_year}</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-600">غير محدد</span>
                                                        )}
                                                    </td>

                                                    {/* Service Details */}
                                                    <td className="py-4 px-4">
                                                        <div className="font-bold text-[#FF5C35]">
                                                            {req.service_type || 'طلب استفسار عام'}
                                                        </div>
                                                        {req.service_package && (
                                                            <div className="text-[11px] text-gray-400 mt-0.5">
                                                                باقة: {req.service_package}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Preferred Date */}
                                                    <td className="py-4 px-4 text-gray-300">
                                                        {req.preferred_date ? (
                                                            <div className="font-mono">
                                                                <div>{new Date(req.preferred_date).toLocaleDateString('ar-EG')}</div>
                                                                {req.preferred_time && (
                                                                    <div className="text-[11px] text-gray-500">{req.preferred_time}</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-600">في أقرب وقت</span>
                                                        )}
                                                    </td>

                                                    {/* Status Badge & Select */}
                                                    <td className="py-4 px-4 text-center">
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            {getStatusBadge(req.status)}
                                                            <select
                                                                value={req.status}
                                                                onChange={(e) => handleStatusChange(req.uuid, e.target.value)}
                                                                className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-gray-300 focus:outline-none focus:border-[#FF5C35] cursor-pointer"
                                                            >
                                                                <option value="new">جديد</option>
                                                                <option value="contacted">تم التواصل</option>
                                                                <option value="converted">تحويل لموعد</option>
                                                                <option value="cancelled">إلغاء</option>
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
                                                                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-all shadow-inner"
                                                                title="تواصل عبر الواتساب"
                                                            >
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M12.031 2c-5.456 0-9.902 4.446-9.902 9.902 0 1.745.457 3.447 1.328 4.954L2 22l5.253-1.378c1.45.79 3.09 1.208 4.778 1.208 5.456 0 9.902-4.446 9.902-9.902 0-5.456-4.446-9.902-9.902-9.902zm5.82 14.161c-.244.686-1.42 1.31-1.96 1.371-.49.055-1.127.086-1.821-.137-.428-.137-.985-.32-1.705-.632-3.003-1.302-4.966-4.33-5.116-4.53-.15-.2-1.22-1.626-1.22-3.1 0-1.474.773-2.2 1.047-2.5.274-.3.6-.375.8-.375.2 0 .4 0 .574.01.184.009.431-.07.674.513.244.584.832 2.032.905 2.18.073.15.122.324.024.522-.097.199-.147.323-.294.498-.147.174-.309.39-.441.524-.147.15-.301.313-.13.606.171.293.762 1.258 1.636 2.037 1.124 1.002 2.072 1.313 2.365 1.46.293.147.465.122.637-.074.171-.196.733-.855.93-1.148.196-.293.391-.244.66-.147.269.098 1.711.807 2.004.954.293.147.489.22.562.343.073.123.073.71-.171 1.396z" />
                                                                </svg>
                                                            </a>

                                                            {/* Direct Phone Call */}
                                                            <a
                                                                href={`tel:${req.phone}`}
                                                                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white transition-all shadow-inner"
                                                                title="اتصال هاتفي مباشر"
                                                            >
                                                                <span className="material-symbols-outlined text-base">call</span>
                                                            </a>

                                                            {/* View Details */}
                                                            <button
                                                                onClick={() => setSelectedRequest(req)}
                                                                className="p-2 rounded-xl bg-white/[0.05] hover:bg-[#FF5C35] text-gray-300 hover:text-white transition-colors shadow-inner cursor-pointer"
                                                                title="عرض تفاصيل الطلب"
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
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 h-screen w-screen overflow-hidden overscroll-contain">
                    <div className="bg-[#121216] border border-white/10 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar overscroll-contain">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#FF5C35]/20 text-[#FF5C35] flex items-center justify-center">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{selectedRequest.full_name}</h3>
                                    <div className="text-xs text-gray-400 font-mono">{selectedRequest.phone}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-gray-400 block mb-1 font-bold">البريد الإلكتروني:</span>
                                    <span className="font-mono text-gray-200">{selectedRequest.email || 'غير مسجل'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block mb-1 font-bold">تاريخ الإرسال:</span>
                                    <span className="font-mono text-gray-200">
                                        {new Date(selectedRequest.created_at).toLocaleString('ar-EG')}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-gray-400 block mb-1 font-bold">ماركة السيارة:</span>
                                    <span className="text-gray-200 font-bold">{selectedRequest.car_brand || 'غير محدد'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block mb-1 font-bold">الموديل والسنة:</span>
                                    <span className="text-gray-200">{selectedRequest.car_model} ({selectedRequest.car_year || 'N/A'})</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                                <div>
                                    <span className="text-gray-400 block mb-1 font-bold">الخدمة المطلوبة:</span>
                                    <span className="text-[#FF5C35] font-bold text-sm">{selectedRequest.service_type || 'طلب عام'}</span>
                                </div>
                                {selectedRequest.service_package && (
                                    <div>
                                        <span className="text-gray-400 block mb-1 font-bold">الباقة الاختيارية:</span>
                                        <span className="text-gray-200">{selectedRequest.service_package}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedRequest(null)}
                                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                                إغلاق
                            </button>
                            <a
                                href={`https://wa.me/${getCleanPhone(selectedRequest.phone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            >
                                <span className="material-symbols-outlined text-sm">chat</span>
                                <span>تواصل عبر الواتساب</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default AdminContactRequests;
