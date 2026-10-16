import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';

const AdminCoupons = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
      toast.success('تم إنشاء الكوبون بنجاح');
      setCode('');
      setDiscountValue('');
      setMaxUses('100');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ أثناء إنشاء الكوبون'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => couponService.remove(id),
    onSuccess: () => {
      toast.success('تم حذف الكوبون نهائياً');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    },
    onError: (err) => toast.error(err.message || 'فشل حذف الكوبون'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      toast.error('يرجى كود الكوبون وقيمة الخصم');
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
    if (window.confirm(`هل أنت تأكد من حذف الكوبون "${couponCode}" نهائياً؟`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white font-body">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#FF5C35]">local_offer</span>
          إدارة الكوبونات والخصومات (Coupons Management)
        </h1>

        {/* Create Coupon Form */}
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 mb-8 shadow-xl">
          <h2 className="text-lg font-bold mb-4 text-[#FF5C35]">إضافة كوبون خصم جديد</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-400">كود الكوبون</label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-[11px] text-[#FF5C35] hover:underline font-bold"
                  >
                    توليد عشوائي 🎲
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="مثال: REFLECTO20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none focus:border-[#FF5C35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-gray-400">نوع الخصم</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FF5C35]"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (SAR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-gray-400">قيمة الخصم</label>
                <input
                  type="number"
                  placeholder={discountType === 'percentage' ? 'مثال: 15' : 'مثال: 100'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FF5C35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-gray-400">أقصى عدد استخدامات</label>
                <input
                  type="number"
                  placeholder="مثال: 100"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FF5C35]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="bg-[#FF5C35] hover:brightness-110 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(255,92,53,0.3)] disabled:opacity-50"
              >
                {createMutation.isLoading ? 'جاري الإضافة...' : 'إنشاء الكوبون'}
              </button>
            </div>
          </form>
        </div>

        {/* Coupons List */}
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold mb-4">قائمة الكوبونات المتاحة</h2>
          {isLoading ? (
            <div className="text-gray-400 py-8 text-center">جاري تحميل الكوبونات...</div>
          ) : coupons.length === 0 ? (
            <div className="text-gray-500 py-8 text-center">لا توجد كوبونات مضافة حالياً.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-3 px-4">الكود</th>
                    <th className="py-3 px-4">نوع الخصم</th>
                    <th className="py-3 px-4">قيمة الخصم</th>
                    <th className="py-3 px-4">استخدامات</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#FF5C35]">{c.code}</td>
                      <td className="py-3.5 px-4 text-gray-300">
                        {c.discount_type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {c.discount_value} {c.discount_type === 'percentage' ? '%' : 'SAR'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">
                        {c.used_count || c.current_uses || 0} / {c.max_uses ? c.max_uses : '∞'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            c.is_active !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {c.is_active !== false ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1 mx-auto"
                          title="حذف الكوبون نهائياً"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          حذف
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
