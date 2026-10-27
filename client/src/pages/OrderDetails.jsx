import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import WarrantyCertificateModal from '../components/WarrantyCertificateModal';
import CarInspectionDiagram from '../components/CarInspectionDiagram';

const PartialPaymentsSection = ({ order, orderId }) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('تابي (Tabby)');

    const payMutation = useMutation({
        mutationFn: (data) => ordersService.addPartialPayment(orderId, data),
        onSuccess: (res) => {
            toast.success(res.message || 'تم تسجيل الدفعة بنجاح');
            setAmount('');
            queryClient.invalidateQueries({ queryKey: ['adminOrderDetails', orderId] });
        },
        onError: (err) => {
            toast.error(err.message || 'فشل تسجيل الدفعة');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            toast.warning('يرجى كتابة مبلغ دفعة صحيح');
            return;
        }
        payMutation.mutate({ amount: val, payment_method: method });
    };

    // Populate history from partial_payments or synthesize initial paid_amount if present
    let history = Array.isArray(order.partial_payments) ? order.partial_payments : [];
    if (history.length === 0 && order.paid_amount > 0) {
        history = [{
            amount: parseFloat(order.paid_amount),
            payment_method: order.payment_method || 'دفعة سابقة (Mada)',
            paid_at: order.order_date || new Date().toISOString()
        }];
    }

    return (
        <div className="space-y-3 pt-2">
            {/* Payment History List */}
            {history.length > 0 && (
                <div className="border border-emerald-500/30 rounded-xl p-3.5 bg-emerald-500/5 text-xs space-y-2">
                    <h5 className="font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-sm">history</span>
                        <span>تفاصيل وسجل العمليات المالية المسجلة لهذا الطلب:</span>
                    </h5>
                    <div className="space-y-2">
                        {history.map((item, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 bg-white rounded-lg border border-emerald-200 gap-2 font-semibold shadow-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-emerald-800 font-black">تم دفع {Number(item.amount).toLocaleString('ar-EG')} SAR</span>
                                    <span className="text-gray-700 font-bold">بواسطة ({item.payment_method})</span>
                                </div>
                                <div className="text-[11px] text-gray-500 font-mono flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs text-gray-400">schedule</span>
                                    <span>{item.paid_at ? new Date(item.paid_at).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Partial Payment Form or Fully Paid Badge */}
            {order.remaining_amount > 0 ? (
                <form onSubmit={handleSubmit} className="print:hidden bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        <span>تسجيل سداد رصيد متبقي (Record Payment)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">المبلغ المدفوع (SAR)</label>
                            <input
                                type="number"
                                step="0.01"
                                max={order.remaining_amount}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={`المتبقي: ${order.remaining_amount}`}
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-black outline-none focus:border-[#5C24EB]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">وسيلة الدفع</label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-black outline-none cursor-pointer"
                            >
                                <option value="تابي (Tabby)">تابي (Tabby)</option>
                                <option value="تمارا (Tamara)">تمارا (Tamara)</option>
                                <option value="مدى (Mada)">مدى (Mada)</option>
                                <option value="فيزا / ماستركارد (Visa/Mastercard)">فيزا / ماستركارد (Visa/Mastercard)</option>
                                <option value="نقداً (Cash)">نقداً (Cash)</option>
                                <option value="تحويل بنكي (Bank Transfer)">تحويل بنكي (Bank Transfer)</option>
                                <option value="أخرى (Other)">أخرى (Other)</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={payMutation.isPending}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow transition-all cursor-pointer disabled:opacity-50"
                            >
                                {payMutation.isPending ? 'جاري التسجيل...' : 'تأكيد التسجيل'}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>✓ تم دفع كامل المبلغ المطلوب لهذا الطلب بالكامل ({Number(order.total_amount || order.paid_amount || 0).toLocaleString('ar-EG')} SAR)</span>
                </div>
            )}
        </div>
    );
};

const OrderDetails = React.memo(() => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isWarrantyCertOpen, setIsWarrantyCertOpen] = useState(false);

    const { data: orderData, isLoading } = useQuery({
        queryKey: ['adminOrderDetails', id],
        queryFn: () => ordersService.getById(id),
        enabled: !!id,
    });

    const activateWarrantyMutation = useMutation({
        mutationFn: () => ordersService.activateWarranties(id),
        onSuccess: () => {
            toast.success('تم تفعيل الضمانات بنجاح! ✅');
            queryClient.invalidateQueries({ queryKey: ['adminOrderDetails', id] });
        },
        onError: (err) => {
            toast.error(err.message || 'فشل تفعيل الضمانات');
        }
    });

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const order = orderData?.data || {};

    const hasServiceItems = (val) => {
        if (!val) return false;
        if (Array.isArray(val)) {
            return val.filter(x => x !== null && x !== undefined && x !== '' && x !== 'null' && x !== '[]').length > 0;
        }
        if (typeof val === 'string') {
            const trimmed = val.trim();
            if (!trimmed || trimmed === '[]' || trimmed === '""' || trimmed === 'null' || trimmed === '{}') return false;
            try {
                const parsed = JSON.parse(trimmed);
                return hasServiceItems(parsed);
            } catch {
                return trimmed.length > 0;
            }
        }
        if (typeof val === 'object') {
            return Object.values(val).some(v => hasServiceItems(v));
        }
        return false;
    };

    const [isEditingDeliveryDate, setIsEditingDeliveryDate] = useState(false);
    const [tempDeliveryDate, setTempDeliveryDate] = useState('');

    const updateDeliveryDateMutation = useMutation({
        mutationFn: (newDate) => ordersService.update(id, { delivery_date: newDate }),
        onSuccess: () => {
            toast.success('تم تحديث موعد الانتهاء/التسليم بنجاح! 📅');
            setIsEditingDeliveryDate(false);
            queryClient.invalidateQueries({ queryKey: ['adminOrderDetails', id] });
        },
        onError: (err) => {
            toast.error(err.message || 'فشل تحديث موعد الانتهاء');
        }
    });

    const formatHeatInsulation = (list, details) => {
        if (!list || !list.length) return 'غير محدد';
        // Parse details: could be JSON object string or legacy plain string
        let detailsObj = {};
        if (details) {
            if (typeof details === 'object' && !Array.isArray(details)) {
                detailsObj = details;
            } else {
                try { detailsObj = JSON.parse(details); } catch { /* legacy string */ }
            }
        }
        const hasStructuredDetails = Object.keys(detailsObj).length > 0;
        if (hasStructuredDetails) {
            return list.map(item => {
                const grade = detailsObj[item];
                return grade ? `${item} (${grade})` : item;
            }).join(' - ');
        }
        // Fallback for legacy plain string
        return details ? `${list.join(' - ')} (${details})` : list.join(' - ');
    };

    const formatPPF = (ppfList, partialDetails) => {
        if (!ppfList || !ppfList.length) return 'غير محدد';
        return ppfList.map(item => {
            if (item === 'جزئي' && partialDetails) {
                return `جزئي (${partialDetails})`;
            }
            return item;
        }).join(' - ');
    };

    const formatDateGregorian = (dateStr) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-24 md:pt-8 selection:bg-[#5C24EB]/30">
            <style>{`
                @media print {
                    nav, header, aside, .print\\:hidden, button, footer, [role="dialog"] {
                        display: none !important;
                    }
                    body, html {
                        background: #ffffff !important;
                        color: #000000 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    #root, main {
                        background: #ffffff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        display: block !important;
                        overflow: visible !important;
                    }
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    div {
                        box-shadow: none !important;
                    }
                    .printable-document {
                        box-shadow: none !important;
                        border: none !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 8mm 6mm !important;
                        background: white !important;
                        color: black !important;
                        font-size: 10.5pt !important;
                        line-height: 1.5 !important;
                    }
                    .printable-document .space-y-4 > * + * {
                        margin-top: 8px !important;
                    }
                    .printable-document .space-y-2 > * + * {
                        margin-top: 5px !important;
                    }
                    .printable-document section,
                    .printable-document .border {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    .printable-document .p-3 {
                        padding: 6px 8px !important;
                    }
                    .printable-document .p-4,
                    .printable-document .p-6,
                    .printable-document .p-8 {
                        padding: 8px 10px !important;
                    }
                    .printable-document table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    .printable-document td,
                    .printable-document th {
                        padding: 6px 10px !important;
                        line-height: 1.5 !important;
                        vertical-align: middle !important;
                        font-size: 10pt !important;
                    }
                    .printable-document .grid {
                        gap: 6px !important;
                    }
                    .printable-document .rounded-xl,
                    .printable-document .rounded-2xl {
                        border-radius: 6px !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 10mm 8mm;
                    }
                }
            `}</style>
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto p-6 lg:p-12 pt-8 space-y-8" aria-labelledby="order-details-heading">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-2 text-xs font-bold uppercase tracking-wider">
                            <button type="button" onClick={() => navigate('/admin/orders')} className="hover:text-white transition-colors">Orders</button>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                            <span className="text-[#8B5CF6]">Order Details</span>
                        </div>
                        <h1 id="order-details-heading" className="text-2xl md:text-3xl font-display font-black text-white tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-2xl md:text-3xl text-[#8B5CF6] bg-[#5C24EB]/10 p-2 rounded-2xl border border-[#5C24EB]/20 shadow-inner" aria-hidden="true">receipt_long</span>
                            <span>نموذج الفحص والاستلام (Work Order)</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">عرض وطباعة النموذج الرسمي لطلب الخدمة والفحص</p>
                    </div>


                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-6 py-3.5 bg-[#5C24EB] hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">print</span>
                            طباعة Check List
                        </button>
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#5C24EB] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    /* Printable Document Layout */
                    <div className="printable-document bg-white text-black p-6 md:p-8 rounded-2xl shadow-2xl space-y-4 print:p-0 print:shadow-none print:bg-white print:text-black">
                        {/* Document Header */}
                        <div className="flex justify-between items-start border-b-2 border-black pb-4">
                            <div className="flex items-center gap-4">
                                <img src="/assets/photo/logo-dark.png" alt="Reflecto Logo" className="h-14 w-auto object-contain" />
                            </div>

                            <div className="text-right">
                                <h3 className="text-xl font-black text-black">Check List</h3>
                                <p className="text-xs font-bold font-mono text-[#8B5CF6]">WORK ORDER: {order.work_order_number}</p>
                                <p className="text-[11px] font-bold text-gray-600 mt-0.5">Date: {formatDateGregorian(order.order_date)}</p>
                            </div>
                        </div>

                        {/* Customer Info & Branch & Delivery Date */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-300 font-bold text-xs">
                            <div><span className="text-gray-600">اسم العميل:</span> {order.client_name}</div>
                            <div><span className="text-gray-600">جوال العميل:</span> {order.client_phone}</div>
                            <div><span className="text-gray-600">الفرع:</span> {order.branch_name || 'فرع جدة'}</div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-600">موعد الانتهاء/التسليم:</span>
                                {isEditingDeliveryDate ? (
                                    <div className="flex items-center gap-1 print:hidden">
                                        <input
                                            type="datetime-local"
                                            value={tempDeliveryDate}
                                            onChange={(e) => setTempDeliveryDate(e.target.value)}
                                            className="p-1 border border-gray-400 rounded text-[11px] bg-white text-black"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => updateDeliveryDateMutation.mutate(tempDeliveryDate)}
                                            disabled={updateDeliveryDateMutation.isPending || !tempDeliveryDate}
                                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                                        >
                                            حفظ
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingDeliveryDate(false)}
                                            className="px-1.5 py-1 bg-gray-300 text-gray-800 rounded text-[10px] font-bold hover:bg-gray-400 cursor-pointer"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-[#8B5CF6] flex items-center gap-1 font-black">
                                        {order.delivery_date ? new Date(order.delivery_date).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : 'غير محدد'}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTempDeliveryDate(order.delivery_date ? new Date(order.delivery_date).toISOString().slice(0, 16) : '');
                                                setIsEditingDeliveryDate(true);
                                            }}
                                            className="print:hidden text-gray-500 hover:text-[#8B5CF6] transition-colors cursor-pointer"
                                            title="تعديل موعد الانتهاء"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit_calendar</span>
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Services Options Table */}
                        <div className="border border-gray-300 rounded-xl overflow-hidden text-[11px]">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="bg-gray-200 text-black border-b border-gray-300 text-xs font-black">
                                        <th className="p-2 border-l border-gray-300 w-1/4">الخدمة المطلوبة</th>
                                        <th className="p-2 border-l border-gray-300 w-1/4">الفني المسؤول</th>
                                        <th className="p-2 w-1/2">تفاصيل الفحص والاختيارات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-300">
                                    {hasServiceItems(order.heat_insulation) && (
                                        <tr>
                                            <td className="p-2 font-bold bg-gray-50 border-l border-gray-300">عازل حراري</td>
                                            <td className="p-2 font-bold text-[#8B5CF6] border-l border-gray-300">{order.service_technicians?.['heat_insulation'] || order.technician_name || 'غير محدد'}</td>
                                            <td className="p-2">{formatHeatInsulation(order.heat_insulation, order.heat_insulation_details)}</td>
                                        </tr>
                                    )}
                                    {hasServiceItems(order.polishing) && (
                                        <tr>
                                            <td className="p-2 font-bold bg-gray-50 border-l border-gray-300">تلميع</td>
                                            <td className="p-2 font-bold text-[#8B5CF6] border-l border-gray-300">{order.service_technicians?.['polishing'] || order.technician_name || 'غير محدد'}</td>
                                            <td className="p-2">{Array.isArray(order.polishing) ? order.polishing.filter(Boolean).join(' - ') : order.polishing}</td>
                                        </tr>
                                    )}
                                    {hasServiceItems(order.nano_ceramic) && (
                                        <tr>
                                            <td className="p-2 font-bold bg-gray-50 border-l border-gray-300">نانو سيراميك</td>
                                            <td className="p-2 font-bold text-[#8B5CF6] border-l border-gray-300">{order.service_technicians?.['nano_ceramic'] || order.technician_name || 'غير محدد'}</td>
                                            <td className="p-2">{Array.isArray(order.nano_ceramic) ? order.nano_ceramic.filter(Boolean).join(' - ') : order.nano_ceramic}</td>
                                        </tr>
                                    )}
                                    {hasServiceItems(order.ppf) && (
                                        <tr>
                                            <td className="p-2 font-bold bg-gray-50 border-l border-gray-300">PPF</td>
                                            <td className="p-2 font-bold text-[#8B5CF6] border-l border-gray-300">{order.service_technicians?.['ppf'] || order.technician_name || 'غير محدد'}</td>
                                            <td className="p-2">{formatPPF(order.ppf, order.ppf_partial_details)}</td>
                                        </tr>
                                    )}
                                    {hasServiceItems(order.removal_services) && (
                                        <tr>
                                            <td className="p-2 font-bold bg-gray-50 border-l border-gray-300">إزالة</td>
                                            <td className="p-2 font-bold text-[#8B5CF6] border-l border-gray-300">{order.service_technicians?.['removal_services'] || order.technician_name || 'غير محدد'}</td>
                                            <td className="p-2">{Array.isArray(order.removal_services) ? order.removal_services.filter(Boolean).join(' - ') : order.removal_services}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Vehicle Details & Inspection Points */}
                        <div className="border border-gray-300 rounded-xl p-3 space-y-2">
                            <h4 className="font-black text-sm border-b border-gray-300 pb-1">2. VEHICLE (بيانات المركبة والفحص)</h4>
                            <div className="grid grid-cols-4 gap-2 text-[11px] font-bold">
                                <div><span className="text-gray-600">المركبة:</span> {order.vehicle_type}</div>
                                <div><span className="text-gray-600">الموديل:</span> {order.vehicle_model}</div>
                                <div><span className="text-gray-600">السنة:</span> {order.vehicle_year}</div>
                                <div><span className="text-gray-600">اللون:</span> {order.vehicle_color}</div>
                                <div><span className="text-gray-600">اللوحة:</span> {order.vehicle_plate}</div>
                                <div><span className="text-gray-600">الهيكل:</span> {order.chassis_number}</div>
                                <div><span className="text-gray-600">الكيلومتر:</span> {order.mileage_km}</div>
                                <div><span className="text-gray-600">نوع العميل:</span> {order.client_type}</div>
                            </div>

                            {/* Car Visual Inspection Points Diagram Display */}
                            <div className="pt-2 border-t border-gray-200 print:hidden">
                                <CarInspectionDiagram
                                    value={order.inspection_checklist || {}}
                                    readOnly={true}
                                />
                            </div>

                            {order.inspection_notes && (
                                <div className="pt-1 border-t border-gray-200 text-[10px]">
                                    <span className="font-bold text-gray-600">ملاحظات الفحص والخدوش:</span> {order.inspection_notes}
                                </div>
                            )}
                        </div>

                        {/* Financial Breakdown */}
                        <div className="space-y-2">
                            {(order.discount_percent > 0 || order.discount_amount > 0 || (order.original_price && order.original_price > order.price)) && (
                                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs font-bold space-y-1.5 print:bg-gray-50 print:border-gray-400">
                                    <div className="flex items-center justify-between border-b border-amber-200 pb-1 text-[#8B5CF6]">
                                        <span className="flex items-center gap-1 font-black">
                                            <span className="material-symbols-outlined text-base">verified_user</span>
                                            خصم اتفاقية شركة / جهة معتمدة ({order.company_name || order.client_type || 'خصم خاص'})
                                        </span>
                                        <span className="bg-[#5C24EB] text-white px-2.5 py-0.5 rounded-full text-[11px] font-mono">
                                            خصم {order.discount_percent || Math.round((((order.original_price || (order.price + (order.discount_amount || 0))) - order.price) / (order.original_price || (order.price + (order.discount_amount || 0)))) * 100)}%
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                                        <div><span className="text-gray-600">السعر الأصلي:</span> <span className="line-through text-gray-500 font-mono">SAR {(order.original_price || (order.price + (order.discount_amount || 0)))?.toFixed(2)}</span></div>
                                        <div><span className="text-gray-600">نسبة الخصم:</span> <span className="text-emerald-700 font-black font-mono">{order.discount_percent || Math.round((((order.original_price || (order.price + (order.discount_amount || 0))) - order.price) / (order.original_price || (order.price + (order.discount_amount || 0)))) * 100)}%</span></div>
                                        <div><span className="text-gray-600">مبلغ الخصم:</span> <span className="text-emerald-700 font-black font-mono">- SAR {(order.discount_amount || ((order.original_price || order.price) - order.price))?.toFixed(2)}</span></div>
                                        <div><span className="text-gray-600">السعر بعد الخصم:</span> <span className="text-black font-black font-mono">SAR {order.price?.toFixed(2)}</span></div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-6 gap-2 bg-gray-100 p-3 rounded-xl border border-gray-300 text-center font-bold text-xs">
                                <div><div className="text-gray-500 mb-0.5">وسيلة الدفع</div>{order.payment_method}</div>
                                <div><div className="text-gray-500 mb-0.5">القيمة (صافي)</div>SAR {order.price?.toFixed(2)}</div>
                                <div><div className="text-gray-500 mb-0.5">الضريبة 15%</div>SAR {order.vat_amount?.toFixed(2)}</div>
                                <div><div className="text-gray-500 mb-0.5">الإجمالي</div><span className="text-red-600 font-black">SAR {order.total_amount?.toFixed(2)}</span></div>
                                <div><div className="text-gray-500 mb-0.5">المدفوع</div>SAR {order.paid_amount?.toFixed(2)}</div>
                                <div><div className="text-gray-500 mb-0.5">المتبقي</div><span className={order.remaining_amount > 0 ? 'text-amber-600 font-black' : 'text-emerald-600 font-black'}>SAR {order.remaining_amount?.toFixed(2)}</span></div>
                            </div>

                            {/* Partial Payments Section for Admin Interaction & Detailed Payments History */}
                            <PartialPaymentsSection order={order} orderId={id} />
                        </div>

                        {/* Technician & Progress Timestamps Box */}
                        {order.technician_name || order.service_progress || order.service_technicians ? (() => {
                            const serviceTechs = (typeof order.service_technicians === 'object' && order.service_technicians) ? order.service_technicians : {};
                            const derivedTechName = order.technician_name ||
                                (Object.values(serviceTechs).filter(Boolean)[0] || null);
                            return (
                                <div className="border border-[#5C24EB]/30 rounded-xl p-3 bg-[#5C24EB]/5 space-y-2 text-xs">
                                    <div className="flex items-center justify-between font-bold text-gray-800">
                                        <span className="flex items-center gap-1.5 text-[#8B5CF6]">
                                            <span className="material-symbols-outlined text-base">engineering</span>
                                            {derivedTechName ? `الفني المسؤول` : 'الفنيون المسؤولون: (موزعون على الخدمات)'}
                                        </span>
                                        {order.started_at && (
                                            <span className="text-[11px] font-mono text-gray-600">
                                                بدء العمل: {new Date(order.started_at).toLocaleString('ar-EG')}
                                            </span>
                                        )}
                                    </div>
                                    {order.service_progress && (
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                                            {[
                                                { key: 'heat_insulation', title: 'عازل حراري' },
                                                { key: 'polishing', title: 'تلميع ساطع' },
                                                { key: 'nano_ceramic', title: 'نانو سيراميك' },
                                                { key: 'ppf', title: 'حماية PPF' },
                                                { key: 'removal_services', title: 'إزالة' },
                                            ].filter(chk => hasServiceItems(order[chk.key]) || Boolean(order.service_progress?.[chk.key]?.completed)).map((chk) => {
                                                const item = order.service_progress[chk.key] || {};
                                                const isDone = Boolean(item.completed);
                                                const timeStr = item.completed_at ? new Date(item.completed_at).toLocaleString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : null;
                                                const serviceTech = order.service_technicians?.[chk.key] || order.technician_name || null;
                                                return (
                                                    <div key={chk.key} className={`p-2 rounded-lg border text-center font-bold text-[10px] ${isDone ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                                                        <div>{chk.title}</div>
                                                        {serviceTech && <div className="text-[9px] text-[#8B5CF6] font-normal truncate mt-0.5">الفني: {serviceTech}</div>}
                                                        <div className="text-[9px] font-mono mt-0.5">{isDone ? (timeStr ? `تم ${timeStr}` : 'مكتمل ✓') : 'قيد الانتظار'}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })() : null}

                        {/* Signatures Footer */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-gray-300 text-center text-xs font-bold">
                            <div>
                                <p className="text-gray-600 mb-4">مسؤول الاستقبال</p>
                                <div className="border-b border-gray-400 pb-1">{order.reception_name || '----------------'}</div>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-4">المحاسب</p>
                                <div className="border-b border-gray-400 pb-1">{order.accountant_name || '----------------'}</div>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-4">مدير المبيعات</p>
                                <div className="border-b border-gray-400 pb-1">{order.sales_manager_name || '----------------'}</div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <WarrantyCertificateModal
                isOpen={isWarrantyCertOpen}
                onClose={() => setIsWarrantyCertOpen(false)}
                data={{
                    ...order,
                    brand: order.vehicle_type,
                    model: order.vehicle_model,
                    year: order.vehicle_year,
                    color: order.vehicle_color,
                    chassis_number: order.chassis_number,
                    vehicle_plate: order.vehicle_plate,
                    service: order.service || (order.polishing?.length ? 'تلميع (Polishing)' : (order.heat_insulation?.length ? 'عازل حراري (Heat Insulation)' : (order.nano_ceramic?.length ? 'نانو سيراميك (Nano Ceramic)' : (order.ppf?.length ? 'حماية PPF' : 'خدمة ريفليكتو')))),
                    product_name: order.product_name,
                    product_model: order.product_model,
                    coverage_area: order.coverage_area,
                    service_details: order.service_details,
                    warranty_years: order.warranty_years || 10,
                }}
            />
        </div>
    );
});

export default OrderDetails;
