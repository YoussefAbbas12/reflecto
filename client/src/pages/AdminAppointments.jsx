import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService, servicesService, pricingService, clientService } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { useAdminTheme } from '../contexts/AdminThemeContext';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const STATUS_OPTIONS = [
    { value: 'all', labelEn: 'All Status', labelAr: 'جميع الحالات' },
    { value: 'pending', labelEn: 'Awaiting Evaluation', labelAr: 'بانتظار الفحص والتقييم' },
    { value: 'confirmed', labelEn: 'Confirmed', labelAr: 'تم تأكيد الموعد' },
    { value: 'in_progress', labelEn: 'In Progress', labelAr: 'قيد التنفيذ في الورشة' },
    { value: 'completed', labelEn: 'Completed', labelAr: 'مكتمل' },
    { value: 'cancelled', labelEn: 'Cancelled', labelAr: 'ملغي' },
];

const getStatusClasses = (status, isLight) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return isLight ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (s === 'cancelled' || s === 'failed') return isLight ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-red-500/20 text-red-400 border border-red-500/30';
    if (s === 'in_progress') return isLight ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    if (s === 'confirmed') return isLight ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-green-500/20 text-green-400 border border-green-500/30';
    if (s === 'pending') return isLight ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-[#5C24EB]/20 text-[#8B5CF6] border border-[#5C24EB]/30';
    return isLight ? 'bg-gray-100 text-gray-700 border border-gray-300' : 'bg-white/[0.05] text-gray-400 border border-white/10';
};

const getStatusLabel = (status, isArabic) => {
    const found = STATUS_OPTIONS.find(o => o.value === status);
    if (found) return isArabic ? found.labelAr : found.labelEn;
    return status ? status.replace('_', ' ') : '-';
};

// ─── Status Modal ─────────────────────────────────────────────────────────────
const StatusModal = React.memo(({ isOpen, onClose, appointment, technicians = [], onSave }) => {
    useBodyScrollLock(isOpen);
    const { language } = useLanguage();
    const isArabic = language === 'ar';
    const { isLight } = useAdminTheme();

    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [estimatedDelivery, setEstimatedDelivery] = useState('');
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('pending');

    const [technicianId, setTechnicianId] = useState('');
    const [technicianCommission, setTechnicianCommission] = useState('');

    useEffect(() => {
        if (appointment) {
            setPreferredDate(appointment.preferred_date || '');
            setPreferredTime(appointment.preferred_time || '');
            setEstimatedDelivery(
                appointment.estimated_delivery
                    ? new Date(appointment.estimated_delivery).toISOString().split('T')[0]
                    : ''
            );
            setProgress(appointment.progress || 0);
            setStatus(appointment.status || 'pending');
            setTechnicianId(appointment.technician?.id || '');
            setTechnicianCommission(
                appointment.technician_commission !== undefined && appointment.technician_commission !== null
                    ? String(appointment.technician_commission)
                    : ''
            );
        }
    }, [appointment]);

    if (!isOpen || !appointment) return null;

    const handleSave = (overrideStatus, overrideProgress) => {
        const finalStatus = overrideStatus || status;
        const finalProgress = overrideProgress !== undefined ? overrideProgress : (parseInt(progress) || 0);

        onSave({
            id: appointment.id,
            preferred_date: preferredDate,
            preferred_time: preferredTime || null,
            estimated_delivery: estimatedDelivery || null,
            progress: finalProgress,
            status: finalStatus,
            technician_id: technicianId || null,
            technician_commission: technicianCommission !== '' ? parseFloat(technicianCommission) : 0,
            warranty_years: appointment.warranty_years || 0,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pt-20 sm:pt-24 bg-black/80 backdrop-blur-md h-screen w-screen overflow-hidden overscroll-contain" aria-modal="true" role="dialog" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className={`${isLight ? 'bg-white border-gray-200 text-gray-900 shadow-2xl' : 'bg-[#0b0c12] border-white/10 text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)]'} border rounded-3xl p-5 sm:p-7 w-full max-w-2xl max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar overscroll-contain space-y-5 relative`}>
                
                {/* Accent glow */}
                <div className="absolute top-0 right-1/4 w-48 h-32 bg-[#5C24EB]/15 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className={`flex items-start justify-between border-b pb-4 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#5C24EB]/15 text-[#8B5CF6] border border-[#5C24EB]/30 uppercase tracking-widest flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">tune</span>
                                {isArabic ? 'تعديل الخدمة والموعد' : 'Edit Service & Schedule'}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${getStatusClasses(status, isLight)}`}>
                                {getStatusLabel(status, isArabic)}
                            </span>
                        </div>
                        <h3 className={`text-lg font-black font-display ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {appointment.client?.full_name || (isArabic ? 'عميل بدون اسم' : 'Unnamed Client')}
                        </h3>
                        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                            {appointment.vehicle ? `${appointment.vehicle.brand} ${appointment.vehicle.model}` : '-'} • {appointment.service}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                </div>

                {/* Form Controls */}
                <div className="space-y-4">
                    {/* Section 1: Status & Progress */}
                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.02] border-white/5'} space-y-3`}>
                        <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border-b pb-2 ${isLight ? 'text-gray-600 border-gray-200' : 'text-gray-400 border-white/5'}`}>
                            <span className="material-symbols-outlined text-sm text-[#8B5CF6]">sync</span>
                            {isArabic ? 'الحالة ومؤشر التقدم' : 'Status & Progress'}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-[11px] font-bold mb-1.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {isArabic ? 'حالة الطلب الحالية' : 'Current Order Status'}
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all cursor-pointer ${isLight ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/[0.05] border-white/10 text-white'}`}
                                >
                                    <option value="pending" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>{isArabic ? 'انتظار الفحص والتقييم' : 'Awaiting Evaluation'}</option>
                                    <option value="confirmed" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>{isArabic ? 'تم تأكيد الموعد' : 'Confirmed'}</option>
                                    <option value="in_progress" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>{isArabic ? 'قيد التنفيذ في الورشة' : 'In Progress'}</option>
                                    <option value="completed" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>{isArabic ? 'مكتمل وتم إنجاز الخدمة' : 'Completed'}</option>
                                    <option value="cancelled" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>{isArabic ? 'ملغي' : 'Cancelled'}</option>
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className={`text-[11px] font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {isArabic ? 'نسبة الإنجاز' : 'Completion Rate'}
                                    </label>
                                    <span className="text-xs font-black font-mono text-[#8B5CF6]">{progress}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={(e) => setProgress(e.target.value)}
                                    className="w-full accent-[#5C24EB] cursor-pointer mb-2"
                                />
                                <div className="flex items-center justify-between gap-1">
                                    {[0, 25, 50, 75, 100].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setProgress(val)}
                                            className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                                                Number(progress) === val
                                                    ? 'bg-[#5C24EB] text-white font-bold'
                                                    : isLight ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {val}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Technician Selection & Commission */}
                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.02] border-white/5'} space-y-3`}>
                        <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border-b pb-2 ${isLight ? 'text-gray-600 border-gray-200' : 'text-gray-400 border-white/5'}`}>
                            <span className="material-symbols-outlined text-sm text-emerald-500">engineering</span>
                            {isArabic ? 'الفني المختص والعمولة المكتسبة' : 'Assigned Technician & Commission'}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-[11px] font-bold mb-1.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {isArabic ? 'تعيين الفني المسؤول' : 'Assigned Technician'}
                                </label>
                                <select
                                    value={technicianId}
                                    onChange={(e) => setTechnicianId(e.target.value)}
                                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all cursor-pointer ${isLight ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/[0.05] border-white/10 text-white'}`}
                                >
                                    <option value="" className={isLight ? 'bg-white text-gray-500' : 'bg-[#0b0c12] text-gray-500'}>
                                        {isArabic ? '-- بدون فني محدد --' : '-- No Technician Assigned --'}
                                    </option>
                                    {technicians.map((t) => (
                                        <option key={t.id || t.uuid} value={t.id || t.uuid} className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>
                                            {t.full_name} ({t.branch_name || (isArabic ? 'فرع جدة' : 'Jeddah Branch')})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={`block text-[11px] font-bold mb-1.5 flex items-center justify-between ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs text-emerald-500">payments</span>
                                        {isArabic ? 'عمولة الفني المستحقة' : 'Technician Commission'}
                                    </span>
                                    <span className="text-[10px] text-emerald-600 font-normal">
                                        {isArabic ? 'تضاف لرصيد الفني مباشرة' : 'Credited directly'}
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="0.00"
                                        value={technicianCommission}
                                        onChange={(e) => setTechnicianCommission(e.target.value)}
                                        className={`w-full border rounded-xl px-3.5 py-2.5 font-black text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono ${isLight ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800' : 'bg-emerald-500/[0.06] border-emerald-500/30 text-emerald-400'}`}
                                    />
                                    <span className={`absolute ${isArabic ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600/70 pointer-events-none`}>
                                        {isArabic ? 'ر.س' : 'SAR'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Scheduling Dates */}
                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.02] border-white/5'} space-y-3`}>
                        <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border-b pb-2 ${isLight ? 'text-gray-600 border-gray-200' : 'text-gray-400 border-white/5'}`}>
                            <span className="material-symbols-outlined text-sm text-amber-500">calendar_month</span>
                            {isArabic ? 'المواعيد وجدول التسليم' : 'Schedule & Delivery'}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className={`block text-[10px] font-bold mb-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {isArabic ? 'تاريخ الاستلام' : 'Drop-off Date'}
                                </label>
                                <input
                                    type="date"
                                    value={preferredDate}
                                    onChange={(e) => setPreferredDate(e.target.value)}
                                    className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all ${isLight ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/[0.05] border-white/10 text-white'}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-[10px] font-bold mb-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {isArabic ? 'وقت الاستلام' : 'Drop-off Time'}
                                </label>
                                <input
                                    type="time"
                                    value={preferredTime}
                                    onChange={(e) => setPreferredTime(e.target.value)}
                                    className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all ${isLight ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/[0.05] border-white/10 text-white'}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-[10px] font-bold mb-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {isArabic ? 'التسليم المتوقع' : 'Estimated Delivery'}
                                </label>
                                <input
                                    type="date"
                                    value={estimatedDelivery}
                                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                                    className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-all ${isLight ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/[0.05] border-white/10 text-white'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Warranty Info */}
                    <div className={`rounded-2xl border p-4 ${isLight ? 'border-emerald-200 bg-emerald-50/60' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-xl text-emerald-600">verified</span>
                            <div>
                                <p className="text-xs font-bold text-emerald-600">
                                    {isArabic ? 'الضمان يتفعل تلقائياً عند اكتمال الخدمة ✓' : 'Warranty is auto-activated on completion ✓'}
                                </p>
                                <p className={`text-[10px] mt-0.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {isArabic 
                                        ? 'عند تغيير الحالة إلى (مكتمل) ستُصدر شهادة الضمان تلقائياً وتظهر في حساب العميل.'
                                        : 'When changed to Completed, a digital warranty certificate will be generated.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className={`flex items-center gap-3 pt-3 border-t ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`py-3 px-5 rounded-xl font-bold text-xs transition-all cursor-pointer ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/[0.05] hover:bg-white/10 text-gray-300 hover:text-white'}`}
                    >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSave()}
                        className="flex-1 py-3 bg-gradient-to-r from-[#5C24EB] to-[#7C3AED] hover:brightness-110 text-white rounded-xl font-bold text-xs shadow-[0_8px_25px_rgba(92, 36, 235, 0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                        <span>{isArabic ? 'حفظ التعديلات وتأكيد الموعد' : 'Save Changes & Confirm'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
});

const AdminAppointments = React.memo(() => {
    const queryClient = useQueryClient();
    const { hasPermission } = useAuth();
    const { language } = useLanguage();
    const isArabic = language === 'ar';
    const { isLight } = useAdminTheme();

    const [selectedStatus, setSelectedStatus] = useState('all');
    const [activeModal, setActiveModal] = useState(null);

    const canView = hasPermission('view_appointments');
    const canEdit = hasPermission('edit_appointment');
    const canDelete = hasPermission('delete_appointment');

    const { data: appointmentsData, isLoading } = useQuery({
        queryKey: ['adminAppointments', selectedStatus],
        queryFn: () => appointmentService.getAll(selectedStatus === 'all' ? null : selectedStatus),
    });
    const appointments = appointmentsData?.data || [];

    const { data: techniciansData } = useQuery({
        queryKey: ['adminTechniciansList'],
        queryFn: () => clientService.getTechnicians(),
        staleTime: 5 * 60 * 1000,
    });
    const technicians = useMemo(() => techniciansData?.data || [], [techniciansData]);

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }) => appointmentService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAppointments'] });
            queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
            setActiveModal(null);
        },
        onError: (err) => {
            alert(err.message || 'Failed to update appointment');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => appointmentService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAppointments'] });
            queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
        },
        onError: (err) => {
            alert(err.message || 'Failed to delete appointment');
        }
    });

    const handleStartTask = useCallback((appt) => {
        if (!canEdit) {
            alert(isArabic ? 'عفواً، لا تملك صلاحية تعديل المواعيد (edit_appointment)' : 'Unauthorized to edit appointment');
            return;
        }
        updateMutation.mutate({
            id: appt.id,
            status: 'in_progress',
            progress: appt.progress && appt.progress > 0 ? appt.progress : 20,
            estimated_delivery: appt.estimated_delivery || new Date().toISOString().split('T')[0]
        });
    }, [canEdit, updateMutation, isArabic]);

    const handleUpdateAppointment = useCallback((data) => {
        updateMutation.mutate(data);
    }, [updateMutation]);

    const handleDeleteAppointment = useCallback((id) => {
        if (confirm(isArabic ? 'هل أنت متأكد من رغبتك في حذف هذا الحجز نهائياً؟' : 'Are you sure you want to permanently delete this appointment?')) {
            deleteMutation.mutate(id);
        }
    }, [deleteMutation, isArabic]);

    if (!canView) {
        return (
            <div className={`flex min-h-screen overflow-hidden pt-20 font-body ${isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#090A0F] text-white admin-dark-theme'}`} dir={isArabic ? 'rtl' : 'ltr'}>
                <AdminSidebar />
                <main className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
                    <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
                    <h1 className="text-2xl font-bold">{isArabic ? 'عفواً، لا تملك صلاحية عرض المواعيد' : 'Access Denied'}</h1>
                    <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        {isArabic ? 'تواصل مع السوبر أدمن للحصول على صلاحية (view_appointments)' : 'Contact administrator for permission'}
                    </p>
                </main>
            </div>
        );
    }

    return (
        <div className={`flex min-h-screen overflow-hidden pt-20 font-body selection:bg-[#5C24EB]/30 ${isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#090A0F] text-white admin-dark-theme'}`} dir={isArabic ? 'rtl' : 'ltr'}>
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6" aria-labelledby="appointments-heading">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pl-12 lg:pl-0 mt-4 lg:mt-0 shrink-0">
                    <div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                            {isArabic ? 'لوحة التحكم / المواعيد والحجوزات' : 'Dashboard / Appointments'}
                        </div>
                        <h1 id="appointments-heading" className={`text-2xl md:text-3xl font-display font-black tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {isArabic ? 'إدارة المواعيد والحجوزات' : 'Appointments & Bookings'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <label htmlFor="status-filter" className={`font-bold text-xs uppercase tracking-widest ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            {isArabic ? 'تصفية الحالة:' : 'Filter:'}
                        </label>
                        <select
                            id="status-filter"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className={`text-xs font-bold rounded-xl px-4 py-2.5 border outline-none cursor-pointer transition-all ${isLight ? 'bg-white border-gray-300 text-gray-800 shadow-sm focus:border-[#5C24EB]' : 'bg-white/[0.05] border-white/10 text-white focus:ring-2 focus:ring-[#5C24EB]/50'}`}
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value} className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>
                                    {isArabic ? opt.labelAr : opt.labelEn}
                                </option>
                            ))}
                        </select>
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex justify-center py-20" aria-live="polite">
                        <div className="w-12 h-12 border-4 border-[#5C24EB] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-20 opacity-70">
                        <Icon name="event_busy" className="text-6xl mb-4 text-gray-400 mx-auto" />
                        <p className={`text-lg font-bold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                            {isArabic ? 'لا توجد مواعيد مطابقة لهذا الفلتر' : 'No appointments found for this filter.'}
                        </p>
                    </div>
                ) : (
                    <section className={`rounded-2xl p-6 border shadow-sm ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/5 backdrop-blur-xl'}`} aria-label="Appointments List">
                        <div className="w-full overflow-x-auto custom-scrollbar">
                            <table className={`w-full border-collapse min-w-[1000px] ${isArabic ? 'text-right' : 'text-left'}`}>
                                <thead>
                                    <tr className={`text-[10px] font-bold tracking-[0.15em] uppercase border-b ${isLight ? 'text-gray-500 border-gray-200' : 'text-gray-400 border-white/[0.05]'}`}>
                                        <th className="pb-4 font-bold" scope="col">{isArabic ? 'العميل' : 'Client'}</th>
                                        <th className="pb-4 font-bold" scope="col">{isArabic ? 'المركبة' : 'Vehicle'}</th>
                                        <th className="pb-4 font-bold" scope="col">{isArabic ? 'الخدمة / الفني' : 'Service & Tech'}</th>
                                        <th className="pb-4 font-bold" scope="col">{isArabic ? 'موعد الاستلام' : 'Preferred Date'}</th>
                                        <th className="pb-4 font-bold" scope="col">{isArabic ? 'السعر' : 'Price'}</th>
                                        <th className="pb-4 font-bold" scope="col">{isArabic ? 'الحالة' : 'Status'}</th>
                                        <th className="pb-4 font-bold" scope="col">{isArabic ? 'نسبة الإنجاز' : 'Progress'}</th>
                                        <th className="pb-4 font-bold" scope="col">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isLight ? 'divide-gray-100' : 'divide-white/[0.03]'}`}>
                                    {appointments.map((appt) => (
                                        <tr key={appt.id} className={`transition-colors ${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.02]'}`}>
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#5C24EB]/10 flex items-center justify-center text-xs font-bold text-[#8B5CF6] shadow-inner shrink-0" aria-hidden="true">
                                                        {appt.client?.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className={`font-bold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>{appt.client?.full_name || '-'}</div>
                                                        <div className="text-[11px] font-mono text-gray-500 font-semibold">{appt.client?.phone || '-'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`py-4 font-medium ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
                                                {appt.vehicle ? `${appt.vehicle.brand} ${appt.vehicle.model}` : '-'}
                                            </td>
                                            <td className="py-4">
                                                <div className={`font-bold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>{appt.service}</div>
                                                {appt.technician?.full_name && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="material-symbols-outlined text-[11px] text-cyan-600">engineering</span>
                                                        <span className="text-[11px] font-bold text-cyan-600">{appt.technician.full_name}</span>
                                                    </div>
                                                )}
                                                {appt.technician_commission > 0 && (
                                                    <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${isLight ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'}`}>
                                                        <span className="material-symbols-outlined text-[10px]">payments</span>
                                                        {isArabic ? 'عمولة:' : 'Comm:'} {Number(appt.technician_commission).toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`py-4 font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                                                <div>{appt.preferred_date || '-'}</div>
                                                {appt.preferred_time && <span className="block text-[10px] text-gray-400">{appt.preferred_time}</span>}
                                            </td>
                                            <td className="py-4">
                                                <span className={`font-black font-mono ${isLight ? 'text-gray-900' : 'text-white'}`}>{(appt.price || 0).toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase ml-1 mr-1">{appt.currency || (isArabic ? 'ر.س' : 'SAR')}</span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block ${getStatusClasses(appt.status, isLight)}`}>
                                                    {getStatusLabel(appt.status, isArabic)}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <div className={`w-24 h-2 rounded-full overflow-hidden ${isLight ? 'bg-gray-200' : 'bg-white/[0.08]'}`}>
                                                    <div className="h-full bg-gradient-to-r from-[#5C24EB] to-[#7C3AED] rounded-full" style={{ width: `${appt.progress || 0}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-500 mt-1 block font-mono">{appt.progress || 0}%</span>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    {appt.status !== 'in_progress' && appt.status !== 'completed' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStartTask(appt)}
                                                            className={`px-3 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white rounded-lg font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${!canEdit ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                                                            title={isArabic ? 'بدء تنفيذ المهمة وتحويلها إلى قيد العمل' : 'Start task'}
                                                        >
                                                            <span className="material-symbols-outlined text-sm">play_arrow</span>
                                                            <span>{isArabic ? 'بدء المهمة' : 'Start'}</span>
                                                        </button>
                                                    ) : appt.status === 'in_progress' ? (
                                                        <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-500 rounded-lg text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                                            {isArabic ? 'قيد العمل' : 'Working'}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 rounded-lg text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                                                            <span className="material-symbols-outlined text-xs">check_circle</span>
                                                            {isArabic ? 'مكتمل' : 'Completed'}
                                                        </span>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            if (!canEdit) {
                                                                alert(isArabic ? 'عفواً، لا تملك صلاحية تعديل المواعيد (edit_appointment)' : 'Unauthorized');
                                                                return;
                                                            }
                                                            setActiveModal(appt);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${isLight ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'} ${!canEdit ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                                                    >
                                                        {isArabic ? 'تعديل' : 'Edit'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (!canDelete) {
                                                                alert(isArabic ? 'عفواً، لا تملك صلاحية حذف المواعيد (delete_appointment)' : 'Unauthorized');
                                                                return;
                                                            }
                                                            handleDeleteAppointment(appt.id);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${isLight ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'} ${!canDelete ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                                                    >
                                                        {isArabic ? 'حذف' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>

            <StatusModal
                isOpen={!!activeModal}
                onClose={() => setActiveModal(null)}
                appointment={activeModal}
                technicians={technicians}
                onSave={handleUpdateAppointment}
            />
        </div>
    );
});

export default AdminAppointments;