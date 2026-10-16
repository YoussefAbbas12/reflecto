import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService, servicesService, pricingService, clientService } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../contexts/AuthContext';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Awaiting Evaluation' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const getStatusClasses = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return 'bg-emerald-500/20 text-emerald-500';
    if (s === 'cancelled' || s === 'failed') return 'bg-red-500/20 text-red-500';
    if (s === 'in_progress') return 'bg-blue-500/20 text-blue-500';
    if (s === 'confirmed') return 'bg-green-500/20 text-green-500';
    if (s === 'pending') return 'bg-[#FF5C35]/20 text-[#FF5C35]';
    return 'bg-white/[0.05] text-gray-400';
};

// ─── Status Modal ─────────────────────────────────────────────────────────────
const StatusModal = React.memo(({ isOpen, onClose, appointment, technicians = [], onSave, onActivateWarranties }) => {
    useBodyScrollLock(isOpen);
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

    const handleQuickStart = () => {
        handleSave('in_progress', progress > 0 ? progress : 20);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pt-20 sm:pt-24 bg-black/85 backdrop-blur-md h-screen w-screen overflow-hidden overscroll-contain" aria-modal="true" role="dialog" dir="rtl">
            <div className="bg-[#0b0c12] border border-white/10 rounded-3xl p-5 sm:p-7 w-full max-w-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar overscroll-contain space-y-5 text-right relative">
                
                {/* Accent glow */}
                <div className="absolute top-0 right-1/4 w-48 h-32 bg-[#FF5C35]/15 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5C35]/15 text-[#FF5C35] border border-[#FF5C35]/30 uppercase tracking-widest flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">tune</span>
                                تعديل الخدمة والموعد
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${getStatusClasses(status)}`}>
                                {status === 'in_progress' ? 'قيد التنفيذ' : status === 'completed' ? 'مكتمل' : status}
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-white font-display">
                            {appointment.service || 'خدمة العناية بالسيارات'}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Vehicle & Client Quick Info Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FF5C35]/10 border border-[#FF5C35]/20 flex items-center justify-center text-[#FF5C35]">
                            <span className="material-symbols-outlined text-lg">person</span>
                        </div>
                        <div>
                            <p className="font-bold text-white">{appointment.client?.full_name || 'عميل ريفليكتو'}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{appointment.client?.phone || '—'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <span className="material-symbols-outlined text-lg">directions_car</span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-300">
                                {appointment.vehicle?.brand} {appointment.vehicle?.model} {appointment.vehicle?.year || ''}
                            </p>
                            <span className="text-[10px] font-mono text-amber-400/90 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                                {appointment.vehicle_plate || '—'}
                            </span>
                        </div>
                    </div>

                    <div className="text-left shrink-0">
                        <span className="text-base font-black text-white font-mono">{(appointment.price || 0).toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-gray-500 mr-1 uppercase">{appointment.currency || 'SAR'}</span>
                    </div>
                </div>

                {/* Quick Start Task Banner (If Not in_progress) */}
                {status !== 'in_progress' && status !== 'completed' && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-base">play_arrow</span>
                            </span>
                            <div>
                                <p className="text-xs font-bold text-blue-300">بدء تنفيذ هذه الخدمة الآن</p>
                                <p className="text-[10px] text-gray-400">تحويل الحالة فوراً إلى (قيد التنفيذ) لتظهر في حساب العميل مباشرة</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleQuickStart}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 text-white rounded-xl font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer active:scale-95"
                        >
                            🚀 بدء المهمة فوراً
                        </button>
                    </div>
                )}

                {/* Main Settings Grid */}
                <div className="space-y-4">

                    {/* Section 1: Status & Progress */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <span className="material-symbols-outlined text-sm text-[#FF5C35]">pace</span>
                            حالة الموعد ونسبة التقدم
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1.5">حالة الخدمة (Status)</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all cursor-pointer"
                                >
                                    <option value="pending" className="bg-[#0b0c12]">انتظار الفحص والتقييم (Awaiting Evaluation)</option>
                                    <option value="confirmed" className="bg-[#0b0c12]">تم تأكيد الموعد (Confirmed)</option>
                                    <option value="in_progress" className="bg-[#0b0c12]">قيد التنفيذ في الورشة (In Progress)</option>
                                    <option value="completed" className="bg-[#0b0c12]">مكتمل وتم إنجاز الخدمة (Completed)</option>
                                    <option value="cancelled" className="bg-[#0b0c12]">ملغي (Cancelled)</option>
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[11px] font-bold text-gray-400">نسبة الإنجاز</label>
                                    <span className="text-xs font-black font-mono text-[#FF5C35]">{progress}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={(e) => setProgress(e.target.value)}
                                    className="w-full accent-[#FF5C35] cursor-pointer mb-2"
                                />
                                <div className="flex items-center justify-between gap-1">
                                    {[0, 25, 50, 75, 100].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setProgress(val)}
                                            className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                                                Number(progress) === val
                                                    ? 'bg-[#FF5C35] text-white font-bold'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
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
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <span className="material-symbols-outlined text-sm text-emerald-400">engineering</span>
                            الفني المختص والعمولة المكتسبة
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1.5">تعيين الفني المسؤول</label>
                                <select
                                    value={technicianId}
                                    onChange={(e) => setTechnicianId(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all cursor-pointer"
                                >
                                    <option value="" className="bg-[#0b0c12] text-gray-500">-- بدون فني محدد --</option>
                                    {technicians.map((t) => (
                                        <option key={t.id || t.uuid} value={t.id || t.uuid} className="bg-[#0b0c12] text-white">
                                            {t.full_name} ({t.branch_name || 'فرع جدة'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1.5 flex items-center justify-between">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs text-emerald-400">payments</span>
                                        عمولة الفني المستحقة
                                    </span>
                                    <span className="text-[10px] text-emerald-400 font-normal">تضاف لرصيد الفني مباشرة</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="0.00"
                                        value={technicianCommission}
                                        onChange={(e) => setTechnicianCommission(e.target.value)}
                                        className="w-full bg-emerald-500/[0.06] border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-emerald-400 font-black text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400/70 pointer-events-none">
                                        ر.س
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Scheduling Dates */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <span className="material-symbols-outlined text-sm text-amber-400">calendar_month</span>
                            المواعيد وجدول التسليم
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">تاريخ الاستلام</label>
                                <input
                                    type="date"
                                    value={preferredDate}
                                    onChange={(e) => setPreferredDate(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">وقت الاستلام</label>
                                <input
                                    type="time"
                                    value={preferredTime}
                                    onChange={(e) => setPreferredTime(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">التسليم المتوقع</label>
                                <input
                                    type="date"
                                    value={estimatedDelivery}
                                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Warranty Info (Auto-activated on completion) */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-xl text-emerald-400">verified</span>
                            <div>
                                <p className="text-xs font-bold text-emerald-400">الضمان يتفعل تلقائياً عند اكتمال الخدمة ✓</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">عند تغيير الحالة إلى (مكتمل) ستُصدر شهادة الضمان تلقائياً وتظهر في حساب العميل.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-3 px-5 bg-white/[0.05] hover:bg-white/10 text-gray-300 hover:text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
                    >
                        إلغاء
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSave()}
                        className="flex-1 py-3 bg-gradient-to-r from-[#FF5C35] to-[#ff7a59] hover:brightness-110 text-white rounded-xl font-bold text-xs shadow-[0_8px_25px_rgba(255,92,53,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                        <span>حفظ التعديلات وتأكيد الموعد</span>
                    </button>
                </div>
            </div>
        </div>
    );
});




const AdminAppointments = React.memo(() => {
    const queryClient = useQueryClient();
    const { hasPermission } = useAuth();
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [activeModal, setActiveModal] = useState(null);

    const canView = hasPermission('view_appointments');
    const canEdit = hasPermission('edit_appointment');
    const canDelete = hasPermission('delete_appointment');

    const { data: appointmentsData, isLoading, refetch } = useQuery({
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

    const cancelMutation = useMutation({
        mutationFn: (id) => appointmentService.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAppointments'] });
            queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
        },
        onError: (err) => {
            alert(err.message || 'Failed to cancel appointment');
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
            alert('عفواً، لا تملك صلاحية تعديل المواعيد (edit_appointment)');
            return;
        }
        updateMutation.mutate({
            id: appt.id,
            status: 'in_progress',
            progress: appt.progress && appt.progress > 0 ? appt.progress : 20,
            estimated_delivery: appt.estimated_delivery || new Date().toISOString().split('T')[0]
        });
    }, [canEdit, updateMutation]);

    const handleConfirmAppointment = useCallback((appt) => {
        const today = new Date().toISOString().split('T')[0];
        updateMutation.mutate({
            id: appt.id,
            status: 'confirmed',
            progress: 0,
            estimated_delivery: today
        });
    }, [updateMutation]);

    const handleUpdateAppointment = useCallback((data) => {
        updateMutation.mutate(data);
    }, [updateMutation]);

    const handleCancelAppointment = useCallback((id) => {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            cancelMutation.mutate(id);
        }
    }, [cancelMutation]);

    const handleDeleteAppointment = useCallback((id) => {
        if (confirm('Are you sure you want to delete this appointment completely? This action cannot be undone.')) {
            deleteMutation.mutate(id);
        }
    }, [deleteMutation]);

    if (!canView) {
        return (
            <div className="flex bg-[#000000] min-h-screen text-white overflow-hidden pt-20 font-body">
                <AdminSidebar />
                <main className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
                    <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
                    <h1 className="text-2xl font-bold text-white">عفواً، لا تملك صلاحية عرض المواعيد</h1>
                    <p className="text-gray-400 text-sm">تواصل مع السوبر أدمن للحصول على صلاحية (view_appointments)</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex bg-[#000000] min-h-screen text-white overflow-hidden pt-20 font-body selection:bg-[#FF5C35]/30">
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-6" aria-labelledby="appointments-heading">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pl-12 lg:pl-0 mt-4 lg:mt-0 shrink-0">
                    <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Dashboard / Appointments</div>
                        <h1 id="appointments-heading" className="text-3xl font-display font-black tracking-tight">Appointments</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <label htmlFor="status-filter" className="text-gray-400 font-bold text-xs uppercase tracking-widest">Filter:</label>
                        <select
                            id="status-filter"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="bg-white/[0.05] text-white text-xs font-bold uppercase tracking-widest border-0 shadow-inner rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FF5C35]/50 outline-none cursor-pointer"
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex justify-center py-20" aria-live="polite">
                        <div className="w-12 h-12 border-4 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-20 opacity-60">
                        <Icon name="event_busy" className="text-6xl mb-4 text-gray-500" />
                        <p className="text-lg font-bold text-gray-400">No appointments found for this filter.</p>
                    </div>
                ) : (
                    <section className="bg-white/[0.02] backdrop-blur-xl shadow-2xl border-0 rounded-2xl p-8" aria-label="Appointments List">
                        <div className="w-full overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase border-b border-white/[0.05]">
                                        <th className="pb-4 font-bold" scope="col">Client</th>
                                        <th className="pb-4 font-bold" scope="col">Vehicle</th>
                                        <th className="pb-4 font-bold" scope="col">Service</th>
                                        <th className="pb-4 font-bold" scope="col">Preferred Date</th>
                                        <th className="pb-4 font-bold" scope="col">Price</th>
                                        <th className="pb-4 font-bold" scope="col">Status</th>
                                        <th className="pb-4 font-bold" scope="col">Progress</th>
                                        <th className="pb-4 font-bold" scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                    {appointments.map((appt, idx) => (
                                        <tr key={appt.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#FF5C35]/10 flex items-center justify-center text-xs font-bold text-[#FF5C35] shadow-inner" aria-hidden="true">
                                                        {appt.client?.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-white">{appt.client?.full_name}</div>
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase">{appt.client?.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-white font-medium">{appt.vehicle ? `${appt.vehicle.brand} ${appt.vehicle.model}` : '-'}</td>
                                            <td className="py-4">
                                                <div className="text-white font-medium text-sm">{appt.service}</div>
                                                {appt.technician?.full_name && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="material-symbols-outlined text-[10px] text-cyan-400">engineering</span>
                                                        <span className="text-[10px] font-bold text-cyan-400">{appt.technician.full_name}</span>
                                                    </div>
                                                )}
                                                {appt.technician_commission > 0 && (
                                                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                                        <span className="material-symbols-outlined text-[10px]">payments</span>
                                                        عمولة: {Number(appt.technician_commission).toLocaleString()} ر.س
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 text-gray-300 font-medium">
                                                {appt.preferred_date || '-'}
                                                {appt.preferred_time && <span className="block text-[10px] text-gray-500">{appt.preferred_time}</span>}
                                            </td>
                                            <td className="py-4">
                                                <span className="font-bold text-white">{(appt.price || 0).toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase ml-1">{appt.currency || 'SAR'}</span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block ${getStatusClasses(appt.status)}`}>
                                                    {appt.status === 'pending' ? 'Awaiting Evaluation' : appt.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <div className="w-24 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-[#FF5C35] to-[#ff8060] rounded-full" style={{ width: `${appt.progress || 0}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-500 mt-1 block">{appt.progress || 0}%</span>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    {/* Quick Start Task Button (Always at the very beginning) */}
                                                    {appt.status !== 'in_progress' && appt.status !== 'completed' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStartTask(appt)}
                                                            className={`px-3 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white rounded-lg font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${!canEdit ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                                                            title="بدء تنفيذ المهمة وتحويلها إلى قيد العمل"
                                                        >
                                                            <span className="material-symbols-outlined text-sm animate-pulse">play_arrow</span>
                                                            <span>بدء المهمة</span>
                                                        </button>
                                                    ) : appt.status === 'in_progress' ? (
                                                        <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                                            قيد العمل
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                                                            <span className="material-symbols-outlined text-xs">check_circle</span>
                                                            مكتمل
                                                        </span>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            if (!canEdit) {
                                                                alert('عفواً، لا تملك صلاحية تعديل المواعيد (edit_appointment)');
                                                                return;
                                                            }
                                                            setActiveModal(appt);
                                                        }}
                                                        className={`px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg font-bold text-xs uppercase hover:bg-blue-500/30 transition-all cursor-pointer ${!canEdit ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                                                    >
                                                        تعديل
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (!canDelete) {
                                                                alert('عفواً، لا تملك صلاحية حذف المواعيد (delete_appointment)');
                                                                return;
                                                            }
                                                            handleDeleteAppointment(appt.id);
                                                        }}
                                                        className={`px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg font-bold text-xs uppercase hover:bg-red-500/30 transition-all cursor-pointer ${!canDelete ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                                                    >
                                                        حذف
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