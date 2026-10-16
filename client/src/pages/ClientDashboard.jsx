import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { meService, reviewsService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Icon from '../components/Icon.jsx';
import { getCompanyLogoUrl } from '../utils/imageUrl';
import WarrantyCertificateModal from '../components/WarrantyCertificateModal.jsx';
import ReviewModal from '../components/ReviewModal.jsx';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const WarrantyModal = React.memo(({ isOpen, onClose, data }) => {
    return <WarrantyCertificateModal isOpen={isOpen} onClose={onClose} data={data} />;
});

const GiftPointsModal = React.memo(({ isOpen, onClose, onConfirm, isLoading, isRTL, t }) => {
    useBodyScrollLock(isOpen);
    const [phone, setPhone] = useState('+966');
    const [points, setPoints] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 bg-black/80 backdrop-blur-md h-screen w-screen overflow-hidden overscroll-contain" aria-modal="true" role="dialog" aria-labelledby="gift-points-title" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar overscroll-contain">
                <h3 id="gift-points-title" className="text-xl font-bold mb-4 text-white font-display">{t('gift_modal_title')}</h3>

                <div className="space-y-4 mb-6">
                    <div>
                        <label htmlFor="friendPhone" className="block text-xs font-bold text-gray-400 mb-2 tracking-wider">{t('friend_phone')}</label>
                        <input
                            id="friendPhone"
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+966501234567"
                            className="w-full bg-white/[0.05] shadow-inner border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all font-mono"
                            aria-required="true"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label htmlFor="giftPointsAmount" className="block text-xs font-bold text-gray-400 mb-2 tracking-wider">{t('points_to_gift')}</label>
                        <input
                            id="giftPointsAmount"
                            type="number"
                            value={points}
                            onChange={e => setPoints(e.target.value)}
                            placeholder="50"
                            className="w-full bg-white/[0.05] shadow-inner border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all"
                            aria-required="true"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-white/[0.05] text-white rounded-xl font-bold hover:bg-white/[0.1] transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(phone, parseInt(points, 10))}
                        disabled={isLoading || !phone || !points || isNaN(points)}
                        className="flex-1 py-3 bg-[#FF5C35] text-white rounded-xl font-bold hover:brightness-110 shadow-[0_8px_30px_rgba(255,92,53,0.2)] transition-all disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
                    >
                        {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>}
                        {t('send_gift')}
                    </button>
                </div>
            </div>
        </div>
    );
});

const ChangePasswordModal = React.memo(({ isOpen, onClose, isRTL, t }) => {
    useBodyScrollLock(isOpen);
    const { toast } = useToast();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.warning(t('all_fields_required'));
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.warning(t('password_mismatch'));
            return;
        }
        if (newPassword.length < 4) {
            toast.warning(t('password_too_short'));
            return;
        }

        setIsLoading(true);
        try {
            await meService.changePassword(oldPassword, newPassword);
            toast.success(t('password_changed'));
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (err) {
            const msg = err.response?.data?.error?.message || err.message || (isRTL ? 'كلمة المرور الحالية غير صحيحة' : 'Current password incorrect');
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 bg-black/80 backdrop-blur-md h-screen w-screen overflow-hidden overscroll-contain" aria-modal="true" role="dialog" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar overscroll-contain">
                <h3 className="text-xl font-bold text-white font-display">{t('change_password')}</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">{t('old_password')}</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF5C35]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">{t('new_password')}</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF5C35]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">{t('confirm_password')}</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF5C35]"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white font-bold text-xs rounded-xl transition-all shadow-lg cursor-pointer flex justify-center items-center gap-2"
                        >
                            {isLoading ? t('saving') : t('confirm_change')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

const ServiceDetailsModal = React.memo(({ isOpen, onClose, appointment, isRTL }) => {
    useBodyScrollLock(isOpen);
    if (!isOpen || !appointment) return null;

    const calculateDuration = (start, end) => {
        if (!start) return null;
        const startTime = new Date(start).getTime();
        const endTime = end ? new Date(end).getTime() : Date.now();
        const diffMs = endTime - startTime;
        if (diffMs <= 0) return null;
        const mins = Math.floor(diffMs / (1000 * 60));
        const hrs = Math.floor(mins / 60);
        const remMins = mins % 60;
        if (hrs > 0) return `${hrs} ساعة و ${remMins} دقيقة`;
        return `${mins} دقيقة`;
    };

    const duration = calculateDuration(appointment.started_at, appointment.completed_at);
    const progressObj = appointment.service_progress || {};

    const servicesList = [
        { key: 'heat_insulation', title: 'عازل حراري', items: appointment.heat_insulation },
        { key: 'polishing', title: 'تلميع ساطع', items: appointment.polishing },
        { key: 'nano_ceramic', title: 'نانو سيراميك', items: appointment.nano_ceramic },
        { key: 'ppf', title: 'حماية PPF', items: appointment.ppf },
        { key: 'removal_services', title: 'إزالة', items: appointment.removal_services },
    ].filter(s => Array.isArray(s.items) && s.items.length > 0);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 h-screen w-screen overflow-hidden overscroll-contain" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar overscroll-contain">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FF5C35]/10 text-[#FF5C35] flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-xl">info</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-white">تفاصيل الخدمة والفحص</h2>
                            <p className="text-xs text-gray-400 font-mono">Order ID: #{appointment.work_order_number || appointment.uuid?.slice(0, 8)}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Technician & Responsibilities info */}
                <div className="p-4 bg-[#FF5C35]/10 border border-[#FF5C35]/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#FF5C35] text-2xl">engineering</span>
                        <div>
                            <span className="text-[11px] text-gray-400 font-bold block">الفني المسؤول عن الخدمة:</span>
                            <span className="text-sm font-black text-white">{appointment.technician_name || 'جارِ تعيين الفني المختص'}</span>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-[#FF5C35] text-white rounded-full text-[10px] font-bold">Reflecto Tech</span>
                </div>

                {/* Vehicle & Order Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-xs">
                    <div>
                        <span className="text-gray-500 block">السيارة:</span>
                        <span className="font-bold text-white">{appointment.brand} {appointment.model} {appointment.year}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">اللون / اللوحة:</span>
                        <span className="font-bold text-white">{appointment.vehicle_color || '—'} / {appointment.vehicle_plate || '—'}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">رقم الهيكل:</span>
                        <span className="font-bold text-gray-300 font-mono text-[10px] truncate block">{appointment.chassis_number || '—'}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">المبلغ الإجمالي:</span>
                        <span className="font-bold text-amber-400 font-mono">{appointment.total_amount || appointment.price} SAR</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">المدفوع / المتبقي:</span>
                        <span className="font-bold text-emerald-400 font-mono">{appointment.paid_amount || 0} / {appointment.remaining_amount || 0} SAR</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">طريقة الدفع:</span>
                        <span className="font-bold text-white">{appointment.payment_method || 'مدى / نقداً'}</span>
                    </div>
                </div>

                {/* Timeline & Duration */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 text-xs">
                    <h3 className="font-bold text-white text-xs flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-[#FF5C35] text-sm">schedule</span>
                        التوقيت والزمن المستغرق:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <span className="text-gray-500 block">وقت البدء:</span>
                            <span className="font-bold text-white font-mono">
                                {appointment.started_at ? new Date(appointment.started_at).toLocaleString('ar-SA') : 'لم يبدأ بعد'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">وقت الانتهاء:</span>
                            <span className="font-bold text-white font-mono">
                                {appointment.completed_at ? new Date(appointment.completed_at).toLocaleString('ar-SA') : 'قيد العمل'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">المدة المستغرقة:</span>
                            <span className="font-bold text-[#FF5C35] font-mono">
                                {duration || 'جارِ التنفيذ...'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Interactive Services Checklist Status */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#FF5C35] text-sm">task_alt</span>
                        حالة مراحل الخدمات (Checklist Progress):
                    </h3>

                    <div className="space-y-2">
                        {servicesList.length > 0 ? servicesList.map((sec) => {
                            const itemProgress = progressObj[sec.key] || {};
                            const isCompleted = Boolean(itemProgress.completed);
                            return (
                                <div
                                    key={sec.key}
                                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/[0.02] border-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isCompleted ? 'bg-emerald-500 text-black font-bold' : 'bg-white/10 text-gray-500'
                                            }`}>
                                            {isCompleted ? '✓' : '•'}
                                        </span>
                                        <div>
                                            <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>{sec.title}</span>
                                            <span className="text-gray-400 text-[11px] block mt-0.5">{sec.items.join(' ، ')}</span>
                                        </div>
                                    </div>

                                    {itemProgress.completed_at && (
                                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">
                                            اكتمال: {new Date(itemProgress.completed_at).toLocaleString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            );
                        }) : (
                            <p className="text-xs text-gray-500">لا توجد تفاصيل خدمات مسجلة في قائمة التشيك لست لهذا الطلب.</p>
                        )}
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
                    >
                        إغلاق النافذة
                    </button>
                </div>
            </div>
        </div>
    );
});

const DashboardView = React.memo(() => {
    const { logout, user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(['dashboard', 'common']);
    const isRTL = i18n.language === 'ar';

    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isWarrantyCertOpen, setIsWarrantyCertOpen] = useState(false);
    const [isServiceDetailsOpen, setIsServiceDetailsOpen] = useState(false);
    const [certWarrantyData, setCertWarrantyData] = useState(null);
    const [currentWarrantyIdx, setCurrentWarrantyIdx] = useState(0);
    const [currentApptIdx, setCurrentApptIdx] = useState(0);
    const [reviewModalOrder, setReviewModalOrder] = useState(null);

    const [locallyReviewedIds, setLocallyReviewedIds] = useState(() => new Set());

    // Fetch client's submitted reviews
    const { data: myReviewsData } = useQuery({
        queryKey: ['myReviews'],
        queryFn: () => reviewsService.getMyReviews(),
    });

    const reviewedOrderIds = useMemo(() => {
        const list = myReviewsData?.reviews || [];
        const set = new Set(locallyReviewedIds);
        list.forEach(r => {
            if (r.order_id) set.add(String(r.order_id));
            if (r.appointment_id) set.add(String(r.appointment_id));
            if (r.appt_uuid) set.add(String(r.appt_uuid));
            if (r.wo_uuid) set.add(String(r.wo_uuid));
            if (r.work_order_number) set.add(String(r.work_order_number));
        });
        return set;
    }, [myReviewsData, locallyReviewedIds]);

    const handleReviewSuccess = useCallback((res, submittedOrder) => {
        if (submittedOrder) {
            setLocallyReviewedIds(prev => {
                const next = new Set(prev);
                if (submittedOrder.id) next.add(String(submittedOrder.id));
                if (submittedOrder.uuid) next.add(String(submittedOrder.uuid));
                if (submittedOrder.wo_id) next.add(String(submittedOrder.wo_id));
                if (submittedOrder.wo_uuid) next.add(String(submittedOrder.wo_uuid));
                if (submittedOrder.work_order_number) next.add(String(submittedOrder.work_order_number));
                return next;
            });
        }
        queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
        queryClient.invalidateQueries({ queryKey: ['myReviews'] });
    }, [queryClient]);

    // Fetch client profile data
    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['clientProfile'],
        queryFn: () => meService.getProfile(),
        refetchInterval: 30000,
        staleTime: 15000,
        retry: 1,
    });

    // Fetch client's payment history
    const { data: paymentsData, isLoading: isPaymentsLoading } = useQuery({
        queryKey: ['clientPayments'],
        queryFn: () => meService.getPayments(),
    });
    const payments = paymentsData?.data || [];

    // Mutations
    const redeemMutation = useMutation({
        mutationFn: (points) => meService.redeemPoints(points),
        onSuccess: (res) => {
            const code = res.coupon_code || res.data?.coupon_code || 'REFLECTO';
            toast.success(isRTL ? `تم استرداد النقاط بنجاح! كود الكوبون: ${code}` : `Points redeemed successfully! Coupon: ${code}`);
            queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
        },
        onError: (err) => {
            toast.error(err.message || (isRTL ? 'فشل استرداد النقاط' : 'Failed to redeem points.'));
        }
    });

    const giftMutation = useMutation({
        mutationFn: ({ phone, points }) => meService.transferPoints(phone, points),
        onSuccess: (res) => {
            const recipientName = res.recipient_name || res.to_user?.full_name || (isRTL ? 'العميل' : 'Client');
            toast.success(isRTL ? `تم تحويل النقاط بنجاح إلى ${recipientName}` : `Points transferred successfully to ${recipientName}`);
            setIsGiftModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
        },
        onError: (err) => {
            const msg = err.response?.data?.error?.message || err.message || (isRTL ? 'الرقم غير موجود أو رصيد النقاط غير كافٍ' : 'Phone not found or insufficient balance');
            toast.error(msg);
        }
    });

    const handleRedeem = useCallback(() => {
        const totalPts = profile?.loyalty?.total_points || 0;
        if (totalPts < 50) {
            toast.warning(isRTL ? "أقل عدد نقاط لاسترداد المكافأة هو 50 نقطة." : "Minimum points to redeem is 50 pts.");
            return;
        }

        const valStr = window.prompt(isRTL ? `أدخل عدد النقاط المراد استردادها (الرصيد المتاح: ${totalPts} نقطة - الحد الأدنى: 50):` : `Enter points to redeem (Available: ${totalPts} pts - Min: 50):`, totalPts.toString());
        if (!valStr) return;
        const pts = parseInt(valStr, 10);
        if (isNaN(pts) || pts < 50) {
            toast.warning(isRTL ? "عفواً، يجب إدخال 50 نقطة على الأقل للاسترداد." : "Please enter at least 50 points to redeem.");
            return;
        }
        if (pts > totalPts) {
            toast.warning(isRTL ? "عفواً، رصيد النقاط لديك غير كافٍ لهذه العملية." : "Insufficient points balance.");
            return;
        }
        redeemMutation.mutate(pts);
    }, [profile, redeemMutation, toast, isRTL]);

    const handleGift = useCallback((phone, points) => {
        if (points > (profile?.loyalty?.total_points || 0)) {
            toast.error(isRTL ? "عفواً، رصيد النقاط لا يكفي لهذه العملية." : "You don't have that many points.");
            return;
        }
        giftMutation.mutate({ phone, points });
    }, [profile, giftMutation, toast, isRTL]);

    const rawAppointments = profile?.active_appointments || (profile?.current_appointment ? [profile.current_appointment] : []);

    const activeAppointments = useMemo(() => {
        if (!rawAppointments.length) return [];
        return [...rawAppointments].sort((a, b) => {
            const isDoneA = a.status === 'completed' || a.status === 'ready' || a.status === 'delivered';
            const isDoneB = b.status === 'completed' || b.status === 'ready' || b.status === 'delivered';
            if (isDoneA !== isDoneB) return isDoneA ? 1 : -1;
            return new Date(b.preferred_date || 0) - new Date(a.preferred_date || 0);
        });
    }, [rawAppointments]);

    const activeWarranties = profile?.active_warranties || profile?.warranties || [];

    const effectiveWarranties = useMemo(() => {
        return activeWarranties.filter(w => Number(w.is_active) === 1);
    }, [activeWarranties]);

    const isStaffUser = Boolean(
        user && (user.role === 'admin' || user.role === 'super_admin' || Boolean(user.is_super_admin) || Boolean(user.role_id) || (user.role && user.role !== 'client' && user.role !== 'technician'))
    );

    if (isStaffUser) {
        return <Navigate to="/admin" replace />;
    }

    if (isProfileLoading) {
        return (
            <div className="py-12 px-6 bg-[#000000] min-h-[80vh] flex justify-center items-center" aria-live="polite">
                <div className="w-12 h-12 border-4 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
                <span className="sr-only">Loading dashboard details...</span>
            </div>
        );
    }

    // Safe destructuring with fallbacks
    const name = profile?.full_name || user?.full_name || (isRTL ? 'العميل المميز' : 'Valued Client');
    const loyalty = profile?.loyalty || { total_points: 0, can_redeem: false };
    const stats = profile?.stats || { total_spent: 0, currency: isRTL ? 'ريال' : 'SAR' };
    const specialPackages = profile?.special_packages || [];

    const appointment = activeAppointments[currentApptIdx] || activeAppointments[0] || profile?.current_appointment;

    return (
        <main className="pt-24 pb-32 sm:py-12 px-4 sm:px-6 bg-[#000000] min-h-screen font-body text-white selection:bg-[#FF5C35]/30" aria-labelledby="dashboard-heading" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3.5 sm:gap-4 min-w-0">
                        {(profile?.company?.logo_url || profile?.avatar_url) && (
                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.05] shadow-inner border border-white/10 flex items-center justify-center overflow-hidden shrink-0 backdrop-blur-md">
                                <img
                                    src={getCompanyLogoUrl(profile.company?.logo_url || profile.avatar_url)}
                                    alt="Company logo"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    loading="lazy"
                                />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h1 id="dashboard-heading" className="text-2xl sm:text-4xl md:text-5xl font-display font-bold mb-1 sm:mb-2 tracking-tight truncate">
                                {t('welcome_back')} <span className="text-[#FF5C35]">{name.split(' ')[0]}</span>
                            </h1>
                            <p className="text-gray-500 text-xs sm:text-sm">{t('member_since')} {new Date().getFullYear()}</p>
                            {profile?.company?.custom_message && (
                                <div className="mt-2.5 max-w-xl border border-[#FF5C35]/30 bg-[#FF5C35]/10 backdrop-blur-md rounded-xl p-2.5 text-xs text-amber-200 shadow-inner flex items-center gap-2.5">
                                    <span className="material-symbols-outlined text-[#FF5C35] text-base shrink-0 animate-pulse">campaign</span>
                                    <span className="font-semibold leading-snug break-words">
                                        {profile.company.custom_message}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsChangePasswordOpen(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/[0.1] transition-all shadow-inner cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-sm">lock_reset</span>
                            <span>{t('change_password')}</span>
                        </button>
                        <button
                            onClick={() => logout()}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 bg-white/[0.05] rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all shadow-inner cursor-pointer"
                            aria-label={t('logout')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={isRTL ? 'rotate-180' : ''}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                            {t('logout')}
                        </button>
                    </div>
                </header>

                {/* Top Grid Row: Vehicle Service Status (Left 8 cols) + Loyalty Points (Right 4 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-stretch">
                    {/* 1. Vehicle Service Status Card (Left 8 Cols) */}
                    <section className="lg:col-span-8 bg-[#050505] backdrop-blur-xl shadow-2xl border border-white/10 rounded-2xl p-4 sm:p-8 relative overflow-hidden flex flex-col justify-between" aria-label={t('current_appointment')}>
                        {appointment ? (
                            <>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 relative z-10 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center justify-center text-xl text-[#FF5C35] shadow-inner" aria-hidden="true">
                                            <span className="material-symbols-outlined text-2xl">directions_car</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white tracking-tight">
                                                {[appointment.brand, appointment.model, appointment.year].filter(Boolean).join(' ') || appointment.vehicle || (isRTL ? 'سيارة العميل' : 'Client Vehicle')}
                                            </h2>
                                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{appointment.service || t('premium_service')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-wrap">
                                        {activeAppointments.length > 1 && (
                                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentApptIdx((prev) => (prev - 1 + activeAppointments.length) % activeAppointments.length)}
                                                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#FF5C35] hover:text-white transition-all flex items-center justify-center cursor-pointer"
                                                    title={isRTL ? "السيارة / الخدمة السابقة" : "Previous Service"}
                                                >
                                                    <span className="material-symbols-outlined text-sm">{isRTL ? 'arrow_forward' : 'arrow_back'}</span>
                                                </button>
                                                <span className="text-[#FF5C35] font-mono text-xs">
                                                    {currentApptIdx + 1} / {activeAppointments.length}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentApptIdx((prev) => (prev + 1) % activeAppointments.length)}
                                                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#FF5C35] hover:text-white transition-all flex items-center justify-center cursor-pointer"
                                                    title={isRTL ? "السيارة / الخدمة التالية" : "Next Service"}
                                                >
                                                    <span className="material-symbols-outlined text-sm">{isRTL ? 'arrow_back' : 'arrow_forward'}</span>
                                                </button>
                                            </div>
                                        )}

                                        <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-widest border ${appointment.status === 'completed' || appointment.status === 'delivered'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                            : appointment.status === 'ready'
                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                                : appointment.status === 'in_progress'
                                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                    : appointment.status === 'confirmed'
                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                                        : 'bg-red-950/40 text-[#FF5C35] border-red-500/30'
                                            }`}>
                                            {appointment.status === 'completed' || appointment.status === 'delivered'
                                                ? t('completed')
                                                : appointment.status === 'ready'
                                                    ? (isRTL ? 'جاهز للتسليم 🚗' : 'Ready for Pickup 🚗')
                                                    : appointment.status === 'in_progress'
                                                        ? t('in_progress')
                                                        : appointment.status === 'confirmed'
                                                            ? t('confirmed')
                                                            : t('awaiting_evaluation')}
                                        </span>
                                    </div>
                                </div>

                                {/* Inner Box Message / Progress Bar */}
                                {appointment.status === 'in_progress' ? (
                                    <div className="my-6 p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-2xl border border-[#FF5C35]/20 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C35] animate-ping"></span>
                                                <span className="text-xs font-bold text-gray-200">{t('vehicle_in_progress_desc')}</span>
                                                {appointment.technician_name && (
                                                    <span className="text-[11px] font-bold text-[#FF5C35] bg-[#FF5C35]/10 px-2 py-0.5 rounded-md">
                                                        الفني: {appointment.technician_name}
                                                    </span>
                                                )}
                                                {appointment.estimated_delivery && (
                                                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-xs">event_available</span>
                                                        موعد التسليم المتوقع: {new Date(appointment.estimated_delivery).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm font-black font-mono text-[#FF5C35]">
                                                {appointment.progress || 0}%
                                            </span>
                                        </div>

                                        {/* Progress Track */}
                                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 relative">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#FF5C35] via-amber-500 to-[#FF5C35] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(255,92,53,0.6)]"
                                                style={{ width: `${Math.max(0, Math.min(100, appointment.progress || 0))}%` }}
                                            ></div>
                                        </div>

                                        {/* Checkpoint Dots & Interactive Timestamps */}
                                        <div className="pt-2 border-t border-white/5 space-y-3">
                                            <div className="flex items-center justify-between text-[11px] font-bold text-gray-300">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[#FF5C35] text-sm">checklist</span>
                                                    مراحل الإنجاز والمخطط (Service Checkpoints)
                                                </span>
                                            </div>

                                            {(() => {
                                                const allCheckpoints = [
                                                    { key: 'heat_insulation', title: 'عازل حراري' },
                                                    { key: 'polishing', title: 'تلميع ساطع' },
                                                    { key: 'nano_ceramic', title: 'نانو سيراميك' },
                                                    { key: 'ppf', title: 'حماية PPF' },
                                                    { key: 'removal_services', title: 'إزالة' },
                                                ];

                                                let progressObj = appointment.service_progress || {};
                                                if (typeof progressObj === 'string') {
                                                    try {
                                                        progressObj = JSON.parse(progressObj);
                                                        if (typeof progressObj === 'string') progressObj = JSON.parse(progressObj);
                                                    } catch { progressObj = {}; }
                                                }

                                                // Filter to show ONLY services that were requested or have progress for this car
                                                const requestedCheckpoints = allCheckpoints.filter(chk => {
                                                    const raw = appointment[chk.key];
                                                    let hasItems = false;
                                                    if (Array.isArray(raw)) hasItems = raw.length > 0;
                                                    else if (typeof raw === 'string' && raw.trim().length > 0 && raw !== '[]' && raw !== '""') {
                                                        try { const parsed = JSON.parse(raw); hasItems = Array.isArray(parsed) ? parsed.length > 0 : true; } catch { hasItems = true; }
                                                    }
                                                    const hasProgress = progressObj && typeof progressObj === 'object' &&
                                                        progressObj[chk.key] && typeof progressObj[chk.key] === 'object' &&
                                                        Object.keys(progressObj[chk.key]).length > 0;
                                                    return hasItems || hasProgress;
                                                });

                                                const displayList = requestedCheckpoints;

                                                if (displayList.length === 0) return null;

                                                const serviceTechs = appointment.service_technicians || {};

                                                return (
                                                    <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(5, Math.max(2, displayList.length))} gap-2`}>
                                                        {displayList.map((chk) => {
                                                            const item = (progressObj && typeof progressObj === 'object') ? (progressObj[chk.key] || {}) : {};
                                                            const isDone = Boolean(item.completed) || appointment.status === 'completed' || appointment.status === 'ready' || appointment.status === 'delivered';
                                                            const timeStr = item.completed_at ? new Date(item.completed_at).toLocaleString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : null;
                                                            const serviceTech = serviceTechs[chk.key] || appointment.technician_name || null;

                                                            return (
                                                                <div
                                                                    key={chk.key}
                                                                    className={`p-2.5 rounded-xl border text-center transition-all ${isDone
                                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                                                                        : 'bg-white/[0.02] border-white/5 text-gray-500'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                                                        <span className="material-symbols-outlined text-xs">
                                                                            {isDone ? 'check_circle' : 'hourglass_empty'}
                                                                        </span>
                                                                        <span className="font-bold text-xs text-white">{chk.title}</span>
                                                                    </div>
                                                                    {serviceTech && (
                                                                        <div className="text-[9px] text-[#FF5C35] font-semibold truncate mb-0.5">
                                                                            الفني: {serviceTech}
                                                                        </div>
                                                                    )}
                                                                    <div className="text-[9px] font-mono">
                                                                        {isDone ? (timeStr ? `تم في ${timeStr}` : 'مكتمل ✓') : 'قيد الانتظار'}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ) : appointment.status === 'completed' || appointment.status === 'ready' || appointment.status === 'delivered' ? (
                                    (() => {
                                        const isReviewed = Boolean(
                                            (appointment.id && reviewedOrderIds.has(String(appointment.id))) ||
                                            (appointment.appt_id && reviewedOrderIds.has(String(appointment.appt_id))) ||
                                            (appointment.wo_id && reviewedOrderIds.has(String(appointment.wo_id))) ||
                                            (appointment.uuid && reviewedOrderIds.has(String(appointment.uuid))) ||
                                            (appointment.wo_uuid && reviewedOrderIds.has(String(appointment.wo_uuid))) ||
                                            (appointment.work_order_number && reviewedOrderIds.has(String(appointment.work_order_number)))
                                        );
                                        return (
                                            <div className="my-6 p-6 bg-gradient-to-r from-emerald-950/40 via-black to-emerald-950/40 border border-emerald-500/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right shadow-xl">
                                                <div className="flex flex-col md:flex-row items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                                                        <span className="material-symbols-outlined text-2xl">verified</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-emerald-400 mb-0.5 font-display">
                                                            {t('completed_title')}
                                                        </h3>
                                                        <p className="text-xs text-emerald-300/80 font-medium">
                                                            {t('completed_desc')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Rate Service Button - disappears completely if already reviewed */}
                                                {!isReviewed && (
                                                    <div className="w-full md:w-auto shrink-0 flex flex-col items-center md:items-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => setReviewModalOrder(appointment)}
                                                            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-[#FF5C35] to-amber-500 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-[0_6px_22px_rgba(255,92,53,0.45)] transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 border border-white/20 group"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">star</span>
                                                                <span className="text-sm tracking-wide">تقييم الخدمة</span>
                                                            </div>
                                                            <span className="text-[10px] text-amber-100 font-medium opacity-90">
                                                                🎁 اكسب 10 نقاط ولاء فورية عند التقييم
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()
                                ) : appointment.status === 'confirmed' ? (
                                    <div className="my-6 p-6 bg-purple-950/20 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-right">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                                            <span className="material-symbols-outlined text-2xl">event_available</span>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-purple-300 mb-0.5 font-display">
                                                {t('confirmed_title')}
                                            </h3>
                                            <p className="text-xs text-purple-200/80 font-medium">
                                                {appointment.preferred_date
                                                    ? (isRTL
                                                        ? `يرجى الحضور لتسليم السيارة يوم ${new Date(appointment.preferred_date).toLocaleDateString('ar-SA')}`
                                                        : `Please arrive to drop off your vehicle on ${new Date(appointment.preferred_date).toLocaleDateString('en-US')}`)
                                                    : t('confirmed_desc')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="my-6 p-6 bg-white/[0.01] rounded-2xl border border-white/5 text-center flex items-center justify-center min-h-[100px]">
                                        <p className="text-gray-300 text-xs md:text-sm font-medium leading-relaxed max-w-lg">
                                            {t('under_review')}
                                        </p>
                                    </div>
                                )}

                                {/* Bottom Bar: Remaining Balance & Actions */}
                                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <span className="text-xs text-gray-400 font-semibold block mb-1">{t('remaining_balance')}:</span>
                                        <span className={`text-lg font-bold font-mono ${Number(appointment.remaining_amount || 0) > 0 ? 'text-[#FF5C35]' : 'text-emerald-400'}`}>
                                            {Number(appointment.remaining_amount || 0).toLocaleString(isRTL ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2 })} {t('sar')}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                                        {Number(appointment.remaining_amount || 0) > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => navigate('/pay-balance', { state: appointment })}
                                                className="flex-1 sm:flex-none px-6 py-3 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_8px_30px_rgba(255,92,53,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-base">credit_card</span>
                                                {t('pay_remaining_balance')} ({Number(appointment.remaining_amount || 0).toLocaleString(isRTL ? 'ar-SA' : 'en-US')} {t('sar')})
                                            </button>
                                        ) : (
                                            <span className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-sm">verified</span>
                                                <span>{t('paid_in_full')}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-12 text-center text-gray-400">
                                <p className="text-sm">{t('no_active_appointments')}</p>
                            </div>
                        )}
                    </section>

                    {/* 2. Loyalty Points Card (Right 4 Cols) */}
                    <section className="lg:col-span-4 bg-[#050505] backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden" aria-label={t('loyalty_points')}>
                        <div>
                            <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center justify-center text-[#FF5C35] text-xl shadow-inner">
                                    <span className="material-symbols-outlined text-2xl">card_giftcard</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold font-display text-white tracking-wide">{t('loyalty_points')}</h2>
                                </div>
                            </div>

                            <div className="text-center my-6">
                                <div className="text-6xl font-black font-display text-[#FF5C35] tracking-tight mb-2">
                                    {loyalty.total_points || 0}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                    {t('available_points')}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={handleRedeem}
                                className="w-full py-3.5 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_8px_30px_rgba(255,92,53,0.3)] transition-all flex items-center justify-center cursor-pointer active:scale-95"
                            >
                                {t('redeem_points')}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsGiftModalOpen(true)}
                                className="w-full py-3.5 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                <span className="material-symbols-outlined text-base">upload</span>
                                {t('gift_points')}
                            </button>
                        </div>
                    </section>
                </div>

                {effectiveWarranties.length > 0 && (
                    <section className="mb-8" aria-label={t('active_warranty')}>
                        {(() => {
                            const w = effectiveWarranties[currentWarrantyIdx] || effectiveWarranties[0];
                            const vehicleName = w.vehicle_name || w.vehicle || appointment?.vehicle || '';
                            const rawServiceName = w.service_name || w.service || appointment?.service || '';
                            const serviceName = (rawServiceName && rawServiceName !== 'خدمة مغطاة بالضمان')
                                ? rawServiceName
                                : (appointment?.service && appointment.service !== 'Work Order Check List (خدمة عناية وحماية)' ? appointment.service : t('premium_service'));

                            const startDate = w.start_date ? new Date(w.start_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : (w.preferred_date ? new Date(w.preferred_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US'));

                            const coveragePeriod = (w.coverage_years && parseInt(w.coverage_years) > 0)
                                ? (isRTL
                                    ? (parseInt(w.coverage_years) === 1 ? 'سنة واحدة ضمان' : parseInt(w.coverage_years) === 2 ? 'سنتان ضمان' : `${w.coverage_years} سنوات ضمان`)
                                    : `${w.coverage_years} Year${parseInt(w.coverage_years) > 1 ? 's' : ''} Warranty`)
                                : (w.coverage_months && parseInt(w.coverage_months) > 0)
                                    ? (isRTL
                                        ? (parseInt(w.coverage_months) === 1 ? 'شهر واحد ضمان' : parseInt(w.coverage_months) === 2 ? 'شهرين ضمان' : `${w.coverage_months} شهر ضمان`)
                                        : `${w.coverage_months} Month${parseInt(w.coverage_months) > 1 ? 's' : ''} Warranty`)
                                    : t('status_active');

                            const getRemainingFormatted = () => {
                                if (!w.expiry_date && !w.start_date) return t('unspecified');
                                let endDt = w.expiry_date ? new Date(w.expiry_date) : new Date(w.start_date);
                                if (!w.expiry_date) {
                                    if (w.coverage_years && parseInt(w.coverage_years) > 0) {
                                        endDt.setFullYear(endDt.getFullYear() + parseInt(w.coverage_years));
                                    } else if (w.coverage_months && parseInt(w.coverage_months) > 0) {
                                        endDt.setMonth(endDt.getMonth() + parseInt(w.coverage_months));
                                    }
                                }
                                const now = new Date();
                                if (endDt <= now) return t('expired');

                                let years = endDt.getFullYear() - now.getFullYear();
                                let months = endDt.getMonth() - now.getMonth();
                                let days = endDt.getDate() - now.getDate();
                                let hours = endDt.getHours() - now.getHours();

                                if (hours < 0) {
                                    hours += 24;
                                    days -= 1;
                                }
                                if (days < 0) {
                                    const prevMonthLastDay = new Date(endDt.getFullYear(), endDt.getMonth(), 0).getDate();
                                    days += prevMonthLastDay;
                                    months -= 1;
                                }
                                if (months < 0) {
                                    months += 12;
                                    years -= 1;
                                }

                                if (isRTL) {
                                    const parts = [];
                                    if (years > 0) parts.push(`${years} ${years === 1 ? 'سنة' : years === 2 ? 'سنتان' : years <= 10 ? 'سنوات' : 'سنة'}`);
                                    if (months > 0) parts.push(`${months} ${months === 1 ? 'شهر' : months === 2 ? 'شهراً' : months <= 10 ? 'أشهر' : 'شهر'}`);
                                    if (days > 0) parts.push(`${days} ${days === 1 ? 'يوم' : days === 2 ? 'يومان' : days <= 10 ? 'أيام' : 'يوم'}`);
                                    if (hours > 0 || parts.length === 0) parts.push(`${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتان' : hours <= 10 ? 'ساعات' : 'ساعة'}`);
                                    return parts.join(' و ');
                                } else {
                                    const parts = [];
                                    if (years > 0) parts.push(`${years} ${years === 1 ? 'Yr' : 'Yrs'}`);
                                    if (months > 0) parts.push(`${months} ${months === 1 ? 'Mo' : 'Mos'}`);
                                    if (days > 0) parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);
                                    if (hours > 0 || parts.length === 0) parts.push(`${hours} ${hours === 1 ? 'Hr' : 'Hrs'}`);
                                    return parts.join(', ');
                                }
                            };

                            return (
                                <div className="bg-[#050505] border border-white/10 rounded-2xl p-5 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                                    {/* Header with Navigation Arrows if multiple warranties */}
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-12 h-12 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center justify-center text-[#FF5C35] text-2xl shadow-inner shrink-0">
                                                <span className="material-symbols-outlined text-2xl">shield</span>
                                            </div>
                                            <div>
                                                <h2 className="text-lg sm:text-xl font-bold font-display text-white tracking-wide">
                                                    {t('active_warranty')}
                                                </h2>
                                                <p className="text-xs text-gray-400">{t('warranty_subtitle')}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCertWarrantyData({
                                                        ...w,
                                                        client_name: profile?.full_name,
                                                        client_phone: profile?.phone,
                                                        client_email: profile?.email,
                                                        brand: w.brand || vehicleName,
                                                        service: serviceName,
                                                        start_date: w.start_date,
                                                        expiry_date: w.expiry_date,
                                                        warranty_years: w.coverage_years || 10,
                                                        product_name: w.product_name,
                                                        product_model: w.product_model,
                                                        coverage_area: w.coverage_area,
                                                        service_details: w.service_details,
                                                    });
                                                    setIsWarrantyCertOpen(true);
                                                }}
                                                className="w-full sm:w-auto px-4 py-2.5 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-sm">print</span>
                                                <span>طباعة / تحميل شهادة الضمان (PDF)</span>
                                            </button>

                                            {effectiveWarranties.length > 1 && (
                                                <div className="flex items-center justify-between sm:justify-start gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold w-full sm:w-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentWarrantyIdx((prev) => (prev - 1 + effectiveWarranties.length) % effectiveWarranties.length)}
                                                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#FF5C35] hover:text-white transition-all flex items-center justify-center cursor-pointer"
                                                        title={isRTL ? "الضمان السابق" : "Previous Warranty"}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">{isRTL ? 'chevron_right' : 'chevron_left'}</span>
                                                    </button>
                                                    <span className="text-[#FF5C35] font-mono text-xs">
                                                        {currentWarrantyIdx + 1} / {effectiveWarranties.length}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentWarrantyIdx((prev) => (prev + 1) % effectiveWarranties.length)}
                                                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#FF5C35] hover:text-white transition-all flex items-center justify-center cursor-pointer"
                                                        title={isRTL ? "الضمان التالي" : "Next Warranty"}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">{isRTL ? 'chevron_left' : 'chevron_right'}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details List */}
                                    <div className="space-y-4 text-xs font-semibold">
                                        <div className="flex justify-between items-center py-2 border-b border-white/5 gap-2">
                                            <span className="text-[#FF5C35] font-bold text-sm font-display flex items-center gap-2 truncate max-w-[65%] sm:max-w-none">
                                                <span className="material-symbols-outlined text-[#FF5C35] text-base shrink-0">directions_car</span>
                                                <span className="truncate">{vehicleName}</span>
                                            </span>
                                            <span className="text-gray-400 uppercase tracking-wider text-[11px] shrink-0">{t('vehicle_label')}</span>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-white/5 gap-2">
                                            <span className="text-white font-bold text-xs sm:text-sm truncate max-w-[65%] sm:max-w-none">{serviceName}</span>
                                            <span className="text-gray-400 uppercase tracking-wider text-[11px] shrink-0">{t('service_label')}</span>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-white/5 gap-2">
                                            <span className="text-gray-300 font-mono text-xs">{startDate}</span>
                                            <span className="text-gray-400 uppercase tracking-wider text-[11px] shrink-0">{t('start_date')}</span>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-white/5 gap-2">
                                            <span className="text-white font-bold font-mono text-xs">{coveragePeriod}</span>
                                            <span className="text-gray-400 uppercase tracking-wider text-[11px] shrink-0">{t('coverage_period')}</span>
                                        </div>

                                        <div className="flex justify-between items-center py-2 gap-2">
                                            <span className="text-[#FF5C35] font-bold font-mono text-xs sm:text-sm">{getRemainingFormatted()}</span>
                                            <span className="text-gray-400 uppercase tracking-wider text-[11px] shrink-0">{t('time_remaining')}</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <span className="px-4 py-1.5 bg-[#FF5C35] text-white text-xs font-bold rounded-xl shadow-[0_4px_15px_rgba(255,92,53,0.3)]">
                                            {effectiveWarranties.length} {t('covered_services_count')}
                                        </span>

                                        <div className="flex items-center gap-2 text-xs text-gray-300 font-bold">
                                            <span>{t('active_warranties_count')}</span>
                                            <span className="w-5 h-5 rounded-full bg-[#FF5C35]/20 text-[#FF5C35] flex items-center justify-center text-xs">✓</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </section>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Payment History */}
                    <section className="bg-white/[0.02] backdrop-blur-xl shadow-2xl border-0 rounded-2xl p-8" aria-label={t('payment_history')}>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-[#FF5C35]/10 shadow-inner rounded-xl flex items-center justify-center text-xl text-[#FF5C35]" aria-hidden="true">
                                <Icon name="payments" />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-tight">{t('payment_history')}</h2>
                        </div>

                        {isPaymentsLoading ? (
                            <div className="flex justify-center py-10" aria-live="polite">
                                <div className="w-8 h-8 border-4 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
                                <span className="sr-only">Loading payments...</span>
                            </div>
                        ) : payments.length > 0 ? (
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {payments.map((payment, i) => (
                                    <article key={payment.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/[0.02] shadow-inner rounded-xl hover:bg-white/[0.05] transition-all gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shadow-inner ${payment.status === 'paid' || payment.status === 'completed'
                                                ? 'bg-emerald-500/20 text-emerald-500'
                                                : payment.status === 'failed' ? 'bg-red-500/20 text-red-500'
                                                    : 'bg-[#FF5C35]/20 text-[#FF5C35]'
                                                }`} aria-hidden="true">
                                                {payment.payment_method === 'tabby' ? 'TB' : payment.payment_method === 'tamara' ? 'TM' : '$'}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-white capitalize">{payment.payment_method || (isRTL ? 'عملية دفع' : 'Payment')}</h3>
                                                <p className="text-xs text-gray-400 font-medium mt-1">
                                                    {payment.created_at ? new Date(payment.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={isRTL ? 'text-right sm:text-left' : 'text-left sm:text-right'}>
                                            <div className="text-base font-bold text-white">{(payment.amount || 0).toLocaleString()} <span className="text-[10px] text-gray-500">{t('sar')}</span></div>
                                            <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${payment.status === 'paid' || payment.status === 'completed' ? 'text-emerald-500'
                                                : payment.status === 'failed' ? 'text-red-500'
                                                    : 'text-[#FF5C35]'
                                                }`}>{payment.status === 'paid' || payment.status === 'completed' ? (isRTL ? 'مكتمل / مدفوع' : 'Paid') : (payment.status || 'pending')}</div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 opacity-60">
                                <div aria-hidden="true" className="text-3xl mb-2 text-gray-500"><Icon name="info" /></div>
                                <p className="text-sm font-bold text-gray-400">{t('no_payments')}</p>
                            </div>
                        )}
                    </section>

                    {/* Service History */}
                    <section className="bg-white/[0.02] backdrop-blur-xl shadow-2xl border-0 rounded-2xl p-8 flex flex-col" aria-label={t('recent_services')}>
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#FF5C35]/10 shadow-inner rounded-xl flex items-center justify-center text-xl text-[#FF5C35]" aria-hidden="true">
                                    <Icon name="history" />
                                </div>
                                <h2 className="text-xl font-bold uppercase tracking-tight">{t('recent_services')}</h2>
                            </div>
                        </div>

                        <div className="space-y-4 flex-grow max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {(profile?.service_history || []).slice(0, 3).map((item) => (
                                <article key={item.id} className="p-5 bg-white/[0.02] shadow-inner rounded-xl hover:bg-white/[0.05] transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-sm text-gray-200">{item.service}</h3>
                                        <span className="text-[#FF5C35] text-xs font-bold px-3 py-1 bg-[#FF5C35]/10 rounded-full shadow-inner">+{item.points_earned || 0} {t('pts')}</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-400 mb-4">{item.vehicle}</p>
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-500 border-t border-white/5 pt-3">
                                        <span>{item.date}</span>
                                        <span className="text-white">{item.price?.toLocaleString()} {t('sar')}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Bottom Stats */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-6" aria-label="Account Statistics">
                    {[
                        { label: t('total_services'), value: (profile?.stats?.total_services || 0).toString(), icon: 'emoji_events' },
                        { label: t('total_payments'), value: payments.length.toString(), icon: 'payments' },
                        { label: t('total_points'), value: loyalty.total_points.toLocaleString(), icon: 'redeem' },
                        { label: t('total_spent'), value: `${stats.total_spent.toLocaleString()} ${t('sar')}`, icon: 'trending_up' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/[0.02] backdrop-blur-xl shadow-2xl p-8 rounded-2xl text-center flex flex-col items-center group hover:bg-white/[0.05] transition-all">
                            <div className="text-3xl mb-6 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all text-[#FF5C35]" aria-hidden="true">
                                <Icon name={stat.icon} />
                            </div>
                            <div className="text-2xl md:text-3xl font-display font-bold mb-2 text-gray-200">{stat.value}</div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </section>
            </div>

            <GiftPointsModal
                isOpen={isGiftModalOpen}
                onClose={() => setIsGiftModalOpen(false)}
                onConfirm={handleGift}
                isLoading={giftMutation.isPending}
                isRTL={isRTL}
                t={t}
            />
            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
                isRTL={isRTL}
                t={t}
            />
            <WarrantyCertificateModal
                isOpen={isWarrantyCertOpen}
                onClose={() => setIsWarrantyCertOpen(false)}
                data={certWarrantyData}
            />
            <ServiceDetailsModal
                isOpen={isServiceDetailsOpen}
                onClose={() => setIsServiceDetailsOpen(false)}
                appointment={appointment}
                isRTL={isRTL}
            />
            <ReviewModal
                isOpen={Boolean(reviewModalOrder)}
                onClose={() => setReviewModalOrder(null)}
                order={reviewModalOrder}
                onSuccess={handleReviewSuccess}
            />
        </main>
    );
});

export default DashboardView;
