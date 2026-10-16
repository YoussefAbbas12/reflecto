import React, { useState } from 'react';
import { reviewsService } from '../services/api';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const RATING_LABELS = {
    1: 'سيء جداً 😞',
    2: 'غير مرضٍ 😐',
    3: 'جيد 👍',
    4: 'جيد جداً 🌟',
    5: 'ممتاز جداً 🚀✨',
};

const CRITERIA = [
    {
        key: 'quality',
        title: 'جودة تنفيذ الخدمة والنتيجة على السيارة',
        question: 'كيف تقيّم جودة تنفيذ الخدمة والنتيجة النهائية على سيارتك؟',
        icon: 'verified',
    },
    {
        key: 'staff',
        title: 'تعامل واحترافية الفريق',
        question: 'كيف تقيّم تعامل واحترافية فريق Reflecto أثناء زيارتك؟',
        icon: 'groups',
    },
    {
        key: 'timing',
        title: 'مدة التنفيذ والالتزام بالوقت',
        question: 'كيف تقيّم مدة تنفيذ الخدمة والالتزام بالوقت المحدد للتسليم؟',
        icon: 'schedule',
    },
    {
        key: 'system',
        title: 'سهولة النظام المتابعة الإلكترونية',
        question: 'كيف تقيّم سهولة استخدام نظام Reflecto ومتابعة تفاصيل خدمتك ؟',
        icon: 'devices',
    },
];

const ReviewModal = React.memo(({ isOpen, onClose, order, onSuccess }) => {
    useBodyScrollLock(isOpen);

    const [ratings, setRatings] = useState({
        quality: 1,
        staff: 1,
        timing: 1,
        system: 1,
    });

    const [hoverRatings, setHoverRatings] = useState({
        quality: 0,
        staff: 0,
        timing: 0,
        system: 0,
    });

    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (!isOpen || !order) return null;

    const handleRatingChange = (key, val) => {
        setRatings(prev => ({ ...prev, [key]: val }));
    };

    const handleHoverChange = (key, val) => {
        setHoverRatings(prev => ({ ...prev, [key]: val }));
    };

    const overallRating = Math.round(
        (ratings.quality + ratings.staff + ratings.timing + ratings.system) / 4
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const res = await reviewsService.submitReview({
                order_id: order.wo_id || order.id || order.uuid || order.work_order_number,
                appointment_id: order.appointment_id || order.id || order.uuid,
                branch_name: order.branch_name || 'فرع جدة',
                rating: overallRating,
                rating_quality: ratings.quality,
                rating_staff: ratings.staff,
                rating_timing: ratings.timing,
                rating_system: ratings.system,
                comment,
            });

            if (res.success) {
                setSuccessMsg(res.message || 'شكراً لك! تم تسليم تقييمك وحساب 10 نقاط ولاء جديدة.');
                setTimeout(() => {
                    if (onSuccess) onSuccess(res, order);
                    onClose();
                }, 600);
            } else {
                setErrorMsg(res.error?.message || 'حدث خطأ أثناء إرسال التقييم');
            }
        } catch (err) {
            setErrorMsg(err.message || 'عذراً، فشل إرسال التقييم');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 h-screen w-screen overflow-hidden overscroll-contain" dir="rtl">
            <div className="bg-[#0b0c10] border border-white/10 rounded-3xl p-5 sm:p-7 max-w-xl w-full space-y-5 shadow-2xl relative animate-fadeIn max-h-[calc(100vh-8rem)] flex flex-col overflow-x-hidden overflow-y-auto custom-scrollbar overscroll-contain">
                {/* Glow accent */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#FF5C35]/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold shadow-inner shrink-0">
                            <span className="material-symbols-outlined text-2xl">rate_review</span>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-white font-display">تقييم الخدمة المخصصة</h2>
                            <p className="text-xs text-gray-400 font-mono">
                                #{order.work_order_number || order.uuid?.slice(0, 8) || 'Order'} - {order.brand || order.vehicle_type || 'سيارة'} {order.model || ''}
                            </p>
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

                {/* Loyalty Reward Banner */}
                <div className="p-3.5 bg-gradient-to-r from-[#FF5C35]/15 via-amber-500/15 to-[#FF5C35]/15 border border-[#FF5C35]/30 rounded-2xl flex items-center gap-3 shadow-inner shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-[#FF5C35] text-white flex items-center justify-center shrink-0 shadow-lg animate-bounce">
                        <span className="material-symbols-outlined text-lg">card_giftcard</span>
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>احصل على 10 نقاط ولاء فورية!</span>
                            <span className="px-2 py-0.5 bg-[#FF5C35] text-white rounded-full text-[9px] font-bold">+10 Pts</span>
                        </div>
                        <p className="text-[11px] text-gray-300 mt-0.5">
                            قيّم بنود الخدمة الـ 4 لمساعدتنا في التطوير واكسب النقاط مباشرة.
                        </p>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {CRITERIA.map((crit, idx) => {
                        const currentVal = ratings[crit.key];
                        const activeVal = hoverRatings[crit.key] || currentVal;

                        return (
                            <div
                                key={crit.key}
                                className="p-3.5 sm:p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-2.5 hover:border-[#FF5C35]/30 transition-all"
                            >
                                <div className="flex items-start gap-2.5">
                                    <span className="material-symbols-outlined text-[#FF5C35] text-lg mt-0.5 shrink-0">{crit.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF5C35] block">البند {idx + 1}</span>
                                        <h3 className="text-xs font-bold text-white leading-relaxed">{crit.question}</h3>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-white/5 gap-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleRatingChange(crit.key, star)}
                                                onMouseEnter={() => handleHoverChange(crit.key, star)}
                                                onMouseLeave={() => handleHoverChange(crit.key, 0)}
                                                className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                                            >
                                                <span
                                                    className={`material-symbols-outlined text-2xl sm:text-3xl transition-all ${star <= activeVal
                                                        ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                                        : 'text-gray-600 hover:text-gray-400'
                                                        }`}
                                                    style={{
                                                        fontVariationSettings: star <= activeVal ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400"
                                                    }}
                                                >
                                                    star
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 whitespace-nowrap">
                                        {RATING_LABELS[activeVal]}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Comment / Note Box */}
                    <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-300 mb-1.5">
                            ملاحظة إضافية أو اقتراح (اختياري)
                        </label>
                        <textarea
                            rows={2}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="اكتب ملاحظاتك أو انطباعك عن الخدمة هنا..."
                            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-3 text-white text-xs placeholder-gray-500 outline-none focus:border-[#FF5C35] focus:ring-1 focus:ring-[#FF5C35] transition-all resize-none"
                        />
                    </div>

                    {/* Messages */}
                    {errorMsg && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
                            {errorMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/5"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-gradient-to-r from-[#FF5C35] via-amber-500 to-[#FF5C35] hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all shadow-[0_8px_25px_rgba(255,92,53,0.4)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>جارِ الإرسال...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-base">send</span>
                                    <span>إرسال التقييم الشامل</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default ReviewModal;
