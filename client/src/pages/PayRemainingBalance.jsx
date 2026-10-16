import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutService } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const PayRemainingBalance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const bookingData = location.state || {};

  const extractServicesList = (data) => {
    const list = [];
    const keysMap = {
      heat_insulation: 'عازل حراري',
      polishing: 'تلميع ساطع',
      nano_ceramic: 'نانو سيراميك',
      ppf: 'حماية PPF',
      removal_services: 'خدمات إزالة'
    };
    Object.entries(keysMap).forEach(([k, title]) => {
      const val = data[k];
      if (Array.isArray(val) && val.length > 0) list.push(title);
      else if (typeof val === 'string' && val.trim().length > 0 && val !== '[]' && val !== '""') list.push(title);
    });
    if (list.length > 0) return list.join(' • ');
    if (data.service && data.service !== 'Work Order Check List (خدمة عناية وحماية)' && data.service !== 'Paint Protection Film') return data.service;
    if (data.service_name && data.service_name !== 'Paint Protection Film') return data.service_name;
    return 'خدمات العناية والحماية بالسيارة';
  };

  // Extract order details passed from ClientDashboard
  const orderDetails = {
    serviceName: extractServicesList(bookingData),
    vehicle: bookingData.vehicle?.brand ? `${bookingData.vehicle.brand} ${bookingData.vehicle.model || ''}` : (bookingData.vehicle || bookingData.brand || 'سيارة العميل'),
    remainingAmount: parseFloat(bookingData.remaining_amount ?? bookingData.price ?? 0),
    totalAmount: parseFloat(bookingData.total_amount ?? bookingData.price ?? 0),
    paidAmount: parseFloat(bookingData.paid_amount ?? 0),
    workOrderId: bookingData.wo_uuid || bookingData.uuid || bookingData.id || null,
    workOrderNumber: bookingData.work_order_number || null,
    customerName: bookingData.customerName || bookingData.client_name || 'عميل ريفليكتو المميز',
    customerPhone: bookingData.customerPhone || bookingData.client_phone || ''
  };

  const [selectedPayment, setSelectedPayment] = useState('tabby'); // 'tabby', 'tamara', 'card'
  const [isProcessing, setIsProcessing] = useState(false);

  // If no remaining amount or order details found, redirect back
  useEffect(() => {
    if (!orderDetails.remainingAmount || orderDetails.remainingAmount <= 0) {
      toast.warning('لا يوجد مبلغ متبقي للسداد لهذا الطلب.');
      navigate('/clientDashboard');
    }
  }, [orderDetails.remainingAmount, navigate, toast]);

  const queryClient = useQueryClient();

  // Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: async (payload) => {
      if (selectedPayment === 'tabby') {
        return checkoutService.createTabby(payload);
      } else if (selectedPayment === 'tamara') {
        return checkoutService.createTamara(payload);
      } else {
        return checkoutService.createTest(payload);
      }
    },
    onSuccess: (res) => {
      setIsProcessing(false);
      const data = res?.data || res;
      const redirectUrl = data?.checkoutUrl || data?.checkout_url || data?.web_url || data?.redirect_url || res?.checkoutUrl || res?.redirect_url || res?.data?.url;
      if (redirectUrl) {
        sessionStorage.setItem('pending_payment', JSON.stringify({
          paymentId: data?.paymentId,
          work_order_id: orderDetails.workOrderId,
          work_order_number: orderDetails.workOrderNumber,
          amount: orderDetails.remainingAmount,
          payment_method: selectedPayment === 'tabby' ? 'تابي (Tabby)' : selectedPayment === 'tamara' ? 'تمارا (Tamara)' : 'مدى / بطاقة بنكية (Mada)',
          is_work_order_payment: true
        }));
        window.location.href = redirectUrl;
      } else {
        toast.success('تم سداد باقي مبلغ الخدمة بنجاح وتحديث بيانات الطلب!');
        queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        queryClient.invalidateQueries({ queryKey: ['adminOrderDetails'] });
        navigate('/clientsDashboard');
      }
    },
    onError: (err) => {
      setIsProcessing(false);
      const msg = err.response?.data?.error?.message || err.message || 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.';
      toast.error(msg);
    }
  });

  const handlePayRemaining = () => {
    setIsProcessing(true);

    const methodLabel = selectedPayment === 'tabby' ? 'تابي (Tabby)' : selectedPayment === 'tamara' ? 'تمارا (Tamara)' : 'مدى / بطاقة بنكية (Mada)';

    const payload = {
      amount: orderDetails.remainingAmount,
      total_amount: orderDetails.remainingAmount,
      currency: 'SAR',
      work_order_id: orderDetails.workOrderId,
      work_order_number: orderDetails.workOrderNumber,
      is_work_order_payment: true,
      payment_method: methodLabel,
      payment_method_type: selectedPayment,
      customer: {
        name: orderDetails.customerName,
        first_name: orderDetails.customerName.split(' ')[0] || 'Client',
        last_name: orderDetails.customerName.split(' ').slice(1).join(' ') || 'Reflecto',
        phone: orderDetails.customerPhone || '+966500000000',
        phone_number: orderDetails.customerPhone || '+966500000000',
        email: 'client@reflecto.com.sa'
      },
      items: [
        {
          name: `سداد المتبقي - ${orderDetails.serviceName}`,
          title: `سداد المتبقي - ${orderDetails.serviceName}`,
          quantity: 1,
          unit_price: orderDetails.remainingAmount
        }
      ]
    };

    checkoutMutation.mutate(payload);
  };

  const installmentAmount = (orderDetails.remainingAmount / 4).toFixed(2);

  return (
    <main className="min-h-screen bg-[#050507] text-white pt-24 pb-16 px-4 sm:px-6 font-body">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Back Link */}
        <button
          onClick={() => navigate('/clientsDashboard')}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
          <span>العودة للوحة التحكم (الداشبورد)</span>
        </button>

        {/* Title Header */}
        <div className="text-right border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5C35]/10 text-[#FF5C35] text-xs font-bold mb-3 border border-[#FF5C35]/20">
            <span className="material-symbols-outlined text-sm">payments</span>
            <span>صفحة سداد متبقي المبلغ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-wider">
            سداد باقي مبلغ الخدمة
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            بيانات الخدمة والسيارة ثابتة ومعتمدة من طلب الفحص والاستلام
          </p>
        </div>

        {/* 1. Fixed / Read-Only Order Summary Box */}
        <div className="bg-[#121216]/95 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5C35]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FF5C35]">directions_car</span>
              <span>تفاصيل الطلب والسيارة (بيانات ثابته)</span>
            </h2>
            {orderDetails.workOrderNumber && (
              <span className="px-3 py-1 rounded-xl bg-white/[0.05] text-gray-300 font-mono text-xs font-bold">
                {orderDetails.workOrderNumber}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[11px] text-gray-400 block font-bold mb-1">السيارة المركبة:</span>
              <div className="text-base font-black text-white font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#FF5C35]">minor_crash</span>
                <span>{orderDetails.vehicle}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[11px] text-gray-400 block font-bold mb-1">الخدمات:</span>
              <div className="text-base font-black text-[#FF5C35]">
                {orderDetails.serviceName}
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-bold">إجمالي سعر الخدمة بالكامل:</span>
              <span className="font-mono font-bold text-gray-200 text-sm">
                SAR {orderDetails.totalAmount > 0 ? orderDetails.totalAmount.toLocaleString() : (orderDetails.paidAmount + orderDetails.remainingAmount).toLocaleString()}
              </span>
            </div>

            {orderDetails.paidAmount > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-bold">المبلغ المدفوع سابقاً بالفرع:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  - SAR {orderDetails.paidAmount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs font-black text-white uppercase tracking-wider">المبلغ المتبقي المطلوب سداده الآن:</span>
              <span className="text-2xl font-black text-[#FF5C35] font-mono">
                SAR {orderDetails.remainingAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Select Payment Method */}
        <div className="bg-[#121216]/95 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-4">
            <span className="material-symbols-outlined text-[#FF5C35]">account_balance_wallet</span>
            <span>اختر طريقة سداد المبلغ المتبقي</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tabby */}
            <div
              onClick={() => setSelectedPayment('tabby')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedPayment === 'tabby'
                  ? 'bg-[#3EEDAC]/10 border-[#3EEDAC] shadow-[0_0_20px_rgba(62,237,172,0.2)]'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-sm text-[#3EEDAC]">tabby تابي</span>
                  <span className="text-[10px] bg-[#3EEDAC]/20 text-[#3EEDAC] font-bold px-2 py-0.5 rounded-full">4 دفعات</span>
                </div>
                <p className="text-[11px] text-gray-300 font-bold mb-2">
                  قسم المبلغ المتبقي على 4 دفعات بدون فوائد
                </p>
                <div className="text-xs font-mono font-bold text-white">
                  4 دفعات بقيمة <span className="text-[#3EEDAC]">{installmentAmount} SAR</span> / شهر
                </div>
              </div>
            </div>

            {/* Tamara */}
            <div
              onClick={() => setSelectedPayment('tamara')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedPayment === 'tamara'
                  ? 'bg-[#FFD900]/10 border-[#FFD900] shadow-[0_0_20px_rgba(255,217,0,0.2)]'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-sm text-[#FFD900]">tamara تمارا</span>
                  <span className="text-[10px] bg-[#FFD900]/20 text-[#FFD900] font-bold px-2 py-0.5 rounded-full">4 دفعات</span>
                </div>
                <p className="text-[11px] text-gray-300 font-bold mb-2">
                  قسّم باقي المبلغ على 4 دفعات بدون أي رسوم
                </p>
                <div className="text-xs font-mono font-bold text-white">
                  4 دفعات بقيمة <span className="text-[#FFD900]">{installmentAmount} SAR</span> / شهر
                </div>
              </div>
            </div>

            {/* Credit Card / Immediate Pay */}
            <div
              onClick={() => setSelectedPayment('card')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedPayment === 'card'
                  ? 'bg-[#FF5C35]/10 border-[#FF5C35] shadow-[0_0_20px_rgba(255,92,53,0.2)]'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-sm text-white">البطاقات البنكية</span>
                  <span className="text-[10px] bg-white/10 text-gray-300 font-bold px-2 py-0.5 rounded-full">مدى / فيزا</span>
                </div>
                <p className="text-[11px] text-gray-300 font-bold mb-2">
                  دفع المبلغ المتبقي كاملاً فوراً وبشكل مباشر
                </p>
                <div className="text-xs font-mono font-bold text-white">
                  سداد مباشر لمبلغ <span className="text-[#FF5C35]">{orderDetails.remainingAmount} SAR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Pay Button */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePayRemaining}
            className="w-full py-4 bg-gradient-to-r from-[#FF5C35] via-[#ff7c59] to-[#ff9e85] hover:brightness-110 text-white font-bold text-sm rounded-2xl shadow-[0_0_30px_rgba(255,92,53,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">verified</span>
                <span>دفع باقي المبلغ الآن (SAR {orderDetails.remainingAmount.toLocaleString()})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default PayRemainingBalance;
