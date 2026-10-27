import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import { useLanguage } from '../hooks/useLanguage';
import { useAdminTheme } from '../contexts/AdminThemeContext';

const AdminCoupons = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { isLight } = useAdminTheme();
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'fixed'
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('100');

  const { data: couponsData = [], isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: async () => {
      const res = await couponService.getAll();
      return res?.data || res || [];
    },
  });

  const coupons = Array.isArray(couponsData) ? couponsData : couponsData?.data || [];

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'REFLECTO-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const createMutation = useMutation({
    mutationFn: (data) => couponService.create(data),
    onSuccess: () => {
      toast.success(isArabic ? 'تم إنشاء الكوبون بنجاح' : 'Coupon created successfully');
      setCode('');
      setDiscountValue('');
      setMaxUses('100');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    },
    onError: (err) => toast.error(err.message || (isArabic ? 'حدث خطأ أثناء إنشاء الكوبون' : 'Failed to create coupon')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => couponService.remove(id),
    onSuccess: () => {
      toast.success(isArabic ? 'تم حذف الكوبون نهائياً' : 'Coupon deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    },
    onError: (err) => toast.error(err.message || (isArabic ? 'فشل حذف الكوبون' : 'Failed to delete coupon')),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      toast.error(isArabic ? 'يرجى إدخال كود الكوبون وقيمة الخصم' : 'Please provide coupon code and discount value');
      return;
    }
    createMutation.mutate({
      code: code.toUpperCase().trim(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      max_uses: parseInt(maxUses) || 100,
    });
  };

  const handleDelete = (id, couponCode) => {
    if (window.confirm(isArabic ? `هل أنت متأكد من حذف الكوبون "${couponCode}" نهائياً؟` : `Are you sure you want to delete "${couponCode}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className={`flex min-h-screen font-body transition-colors duration-300 ${isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#090A0F] text-white admin-dark-theme'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto">
        <h1 className={`text-2xl md:text-3xl font-black mb-6 flex items-center gap-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
          <span className="material-symbols-outlined text-[#8B5CF6]">local_offer</span>
          {isArabic ? 'إدارة الكوبونات والخصومات' : 'Coupons & Discounts Management'}
        </h1>

        {/* Create Coupon Form */}
        <div className={`rounded-2xl p-6 mb-8 border transition-all ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121216] border-white/10 shadow-xl'}`}>
          <h2 className="text-lg font-bold mb-4 text-[#8B5CF6]">
            {isArabic ? 'إضافة كوبون خصم جديد' : 'Create New Coupon'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-xs font-bold ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                    {isArabic ? 'كود الكوبون' : 'Coupon Code'}
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-[11px] text-[#8B5CF6] hover:underline font-bold cursor-pointer"
                  >
                    {isArabic ? 'توليد عشوائي 🎲' : 'Random 🎲'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder={isArabic ? 'مثال: REFLECTO20' : 'e.g. REFLECTO20'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 font-mono text-sm outline-none transition-colors border ${
                    isLight 
                      ? 'bg-white border-gray-300 text-gray-900 focus:border-[#5C24EB]' 
                      : 'bg-white/[0.05] border-white/10 text-white focus:border-[#5C24EB]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                  {isArabic ? 'نوع الخصم' : 'Discount Type'}
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors border cursor-pointer ${
                    isLight 
                      ? 'bg-white border-gray-300 text-gray-900 focus:border-[#5C24EB]' 
                      : 'bg-white/[0.05] border-white/10 text-white focus:border-[#5C24EB]'
                  }`}
                >
                  <option value="percentage" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>{isArabic ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                  <option value="fixed" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0b0c12] text-white'}>{isArabic ? 'مبلغ ثابت (SAR)' : 'Fixed Amount (SAR)'}</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                  {isArabic ? 'قيمة الخصم' : 'Discount Value'}
                </label>
                <input
                  type="number"
                  placeholder={discountType === 'percentage' ? (isArabic ? 'مثال: 15' : 'e.g. 15') : (isArabic ? 'مثال: 100' : 'e.g. 100')}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors border ${
                    isLight 
                      ? 'bg-white border-gray-300 text-gray-900 focus:border-[#5C24EB]' 
                      : 'bg-white/[0.05] border-white/10 text-white focus:border-[#5C24EB]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                  {isArabic ? 'أقصى عدد استخدامات' : 'Max Usages'}
                </label>
                <input
                  type="number"
                  placeholder={isArabic ? 'مثال: 100' : 'e.g. 100'}
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors border ${
                    isLight 
                      ? 'bg-white border-gray-300 text-gray-900 focus:border-[#5C24EB]' 
                      : 'bg-white/[0.05] border-white/10 text-white focus:border-[#5C24EB]'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="bg-[#5C24EB] hover:brightness-110 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(92, 36, 235, 0.3)] disabled:opacity-50 cursor-pointer"
              >
                {createMutation.isLoading ? (isArabic ? 'جاري الإضافة...' : 'Adding...') : (isArabic ? 'إنشاء الكوبون' : 'Create Coupon')}
              </button>
            </div>
          </form>
        </div>

        {/* Coupons List */}
        <div className={`rounded-2xl p-6 border transition-all ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121216] border-white/10 shadow-xl'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {isArabic ? 'قائمة الكوبونات المتاحة' : 'Available Coupons'}
          </h2>
          {isLoading ? (
            <div className="text-gray-400 py-8 text-center">{isArabic ? 'جاري تحميل الكوبونات...' : 'Loading coupons...'}</div>
          ) : coupons.length === 0 ? (
            <div className="text-gray-500 py-8 text-center">{isArabic ? 'لا توجد كوبونات مضافة حالياً.' : 'No coupons added yet.'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${isArabic ? 'text-right' : 'text-left'}`}>
                <thead>
                  <tr className={`border-b ${isLight ? 'border-gray-200 text-gray-500' : 'border-white/10 text-gray-400'}`}>
                    <th className="py-3 px-4">{isArabic ? 'الكود' : 'Code'}</th>
                    <th className="py-3 px-4">{isArabic ? 'نوع الخصم' : 'Type'}</th>
                    <th className="py-3 px-4">{isArabic ? 'قيمة الخصم' : 'Value'}</th>
                    <th className="py-3 px-4">{isArabic ? 'استخدامات' : 'Usage'}</th>
                    <th className="py-3 px-4">{isArabic ? 'الحالة' : 'Status'}</th>
                    <th className="py-3 px-4 text-center">{isArabic ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-gray-100' : 'divide-white/5'}`}>
                  {coupons.map((c) => (
                    <tr key={c.id} className={`transition-colors ${isLight ? 'hover:bg-gray-50 text-gray-800' : 'hover:bg-white/[0.02] text-gray-300'}`}>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#8B5CF6]">{c.code}</td>
                      <td className="py-3.5 px-4">
                        {c.discount_type === 'percentage' 
                          ? (isArabic ? 'نسبة مئوية' : 'Percentage') 
                          : (isArabic ? 'مبلغ ثابت' : 'Fixed')}
                      </td>
                      <td className={`py-3.5 px-4 font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        {c.discount_value} {c.discount_type === 'percentage' ? '%' : (isArabic ? 'ر.س' : 'SAR')}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {c.used_count || c.current_uses || 0} / {c.max_uses ? c.max_uses : '∞'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            c.is_active !== false
                              ? isLight ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isLight ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {c.is_active !== false ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center justify-center gap-1 mx-auto cursor-pointer ${
                            isLight
                              ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                              : 'border-red-500/30 text-red-400 hover:bg-red-500/20'
                          }`}
                          title={isArabic ? 'حذف الكوبون نهائياً' : 'Delete'}
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          {isArabic ? 'حذف' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCoupons;
