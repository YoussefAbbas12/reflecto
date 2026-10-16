import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';

import { useAuth } from '../contexts/AuthContext';

const AdminOrders = React.memo(() => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [branchFilter, setBranchFilter] = useState('all');

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['adminOrders', page, statusFilter, searchQuery, branchFilter],
    queryFn: () => ordersService.getAll(page, statusFilter, searchQuery, branchFilter),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ordersService.remove(id),
    onSuccess: () => {
      toast.success('تم حذف طلب الفحص والتسليم بنجاح');
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onError: (err) => {
      toast.error(err.message || 'فشل حذف الطلب');
    }
  });

  const handleDelete = useCallback((id, orderNum) => {
    if (window.confirm(`هل أنت تأكد من حذف طلب الفحص والتسليم رقم ${orderNum}؟`)) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const orders = ordersData?.data || [];
  const meta = ordersData?.meta || { total: 0, grand_total: 0, total_pages: 1 };

  const BRANCHES = [
    { id: 'all', name: 'جميع الفروع (All Branches)' },
    { id: 'جدة - شارع صاري', name: 'جدة - شارع صاري' },
    { id: 'جدة - الصفا', name: 'جدة - الصفا' },
    { id: 'جدة - البوادي', name: 'جدة - البوادي' },
    { id: 'فرع الرياض - الفيصلية 1', name: 'فرع الرياض - الفيصلية 1' },
    { id: 'فرع الرياض - الفيصلية 2', name: 'فرع الرياض - الفيصلية 2' },
    { id: 'فرع مكة المكرمة', name: 'فرع مكة المكرمة' },
    { id: 'فرع الطائف', name: 'فرع الطائف' },
    { id: 'فرع الدمام', name: 'فرع الدمام' },
    { id: 'فرع المدينة المنورة', name: 'فرع المدينة المنورة' }
  ];

  const canView = hasPermission('view_checklists');
  const canViewDetails = hasPermission('view_order_details');
  const canCreate = hasPermission('create_checklist');
  const canEdit = hasPermission('edit_checklist');
  const canDelete = hasPermission('delete_checklist');

  if (!canView) {
    return (
      <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-24 md:pt-8">
        <AdminSidebar />
        <main className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
          <h1 className="text-2xl font-bold text-white">عفواً، لا تملك صلاحية عرض أوامر العمل والـ Check list</h1>
          <p className="text-gray-400 text-sm">تواصل مع السوبر أدمن للحصول على صلاحية (view_checklists)</p>
          <button onClick={() => navigate('/admin')} className="px-6 py-2 bg-[#FF5C35] text-white rounded-xl font-bold text-xs cursor-pointer">
            العودة للرئيسية
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-24 md:pt-8 selection:bg-[#FF5C35]/30">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-12 pt-8 space-y-8" aria-labelledby="orders-heading">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-2 text-xs font-bold uppercase tracking-wider">
              <span>Reflecto Admin</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-[#FF5C35]">Check List & Orders</span>
            </div>
            <h1 id="orders-heading" className="text-3xl md:text-5xl font-display font-black text-white tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl md:text-4xl text-[#FF5C35] bg-[#FF5C35]/10 p-2 rounded-2xl border border-[#FF5C35]/20 shadow-inner" aria-hidden="true">fact_check</span>
              <span>طلبات الفحص والتسليم (Orders)</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">إدارة نموذج استلام وفحص السيارات (Work Order / Check List)</p>
          </div>

          <Link
            to={canCreate ? "/admin/add-order" : "#"}
            onClick={(e) => {
              if (!canCreate) {
                e.preventDefault();
                alert('عفواً، لا تملك صلاحية إضافة أمر عمل جديد (create_checklist)');
              }
            }}
            className={`px-6 py-3.5 bg-[#FF5C35] hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-[0_8px_30px_rgba(255,92,53,0.3)] transition-all flex items-center gap-2 w-fit active:scale-95 cursor-pointer ${!canCreate ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            إضافة طلب جديد (New Check List)
          </Link>
        </header>

        {/* Counter Summary Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Orders Stats">
          <div className="bg-white/[0.02] backdrop-blur-xl p-5 rounded-2xl shadow-xl flex items-center justify-between border-0">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">إجمالي الطلبات العامة</div>
              <div className="text-2xl font-black text-white">{meta.grand_total || meta.total || 0}</div>
            </div>
            <span className="material-symbols-outlined text-3xl text-[#FF5C35] bg-[#FF5C35]/10 p-2.5 rounded-xl">format_list_bulleted</span>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-xl p-5 rounded-2xl shadow-xl flex items-center justify-between border-0">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {branchFilter === 'all' ? 'طلبات التصفية الحالية' : `طلبات ${branchFilter}`}
              </div>
              <div className="text-2xl font-black text-emerald-400">{meta.total || 0}</div>
            </div>
            <span className="material-symbols-outlined text-3xl text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl">store</span>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-0 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-1">
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم الطلب، اسم العميل..."
                className="w-full bg-white/[0.05] border-0 shadow-inner rounded-xl pl-12 pr-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all placeholder:text-gray-500"
              />
            </div>

            {/* Branch Filter Dropdown */}
            <div className="relative w-full md:w-64">
              <select
                value={branchFilter}
                onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                className="w-full bg-white/[0.05] shadow-inner text-white text-xs font-bold rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-[#FF5C35]/50 outline-none cursor-pointer"
              >
                {BRANCHES.map(b => (
                  <option key={b.id} value={b.id} className="bg-[#121212] text-white">
                    {b.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-gray-400">
                expand_more
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
            {[
              { id: 'all', label: 'الكل (All)' },
              { id: 'pending', label: 'قيد الانتظار' },
              { id: 'in_progress', label: 'قيد التنفيذ' },
              { id: 'completed', label: 'جاهز للتسليم' },
              { id: 'delivered', label: 'تم التسليم' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setStatusFilter(tab.id); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#FF5C35] text-white shadow-lg'
                    : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Orders Table */}
        <section className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-0 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#FF5C35] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">receipt_long</span>
              <p className="text-gray-400 font-bold text-lg mb-2">لا توجد طلبات فحص وتسليم حالياً</p>
              <p className="text-gray-600 text-xs mb-6">اضغط على زر "إضافة طلب جديد" للبدء بإنشاء نموذج فحص واستلام سيارة</p>
              <Link to="/admin/add-order" className="px-6 py-2.5 bg-[#FF5C35] text-white font-bold text-xs rounded-xl shadow-md">
                إضافة أول طلب
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-4 px-4 text-right">رقم الطلب</th>
                    <th className="pb-4 px-4 text-right">العميل</th>
                    <th className="pb-4 px-4 text-right">السيارة</th>
                    <th className="pb-4 px-4 text-right">التاريخ</th>
                    <th className="pb-4 px-4 text-right">المبلغ الإجمالي</th>
                    <th className="pb-4 px-4 text-center">الحالة</th>
                    <th className="pb-4 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {orders.map(order => (
                    <tr key={order.uuid} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-4 font-mono font-bold text-[#FF5C35]">
                        {order.work_order_number}
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        <div>{order.client_name}</div>
                        <div className="text-xs text-gray-400 font-mono">{order.client_phone}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        <div className="font-bold">{order.vehicle_type} {order.vehicle_model}</div>
                        <div className="text-xs text-gray-500">لوحة: {order.vehicle_plate || 'N/A'} | لون: {order.vehicle_color || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs font-mono">
                        {order.order_date ? new Date(order.order_date).toLocaleDateString('ar-EG') : 'N/A'}
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-400">
                        SAR {order.total_amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'completed' || order.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : order.status === 'in_progress'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-white/10 text-gray-300'
                        }`}>
                          {order.status === 'delivered' ? 'تم التسليم' : order.status === 'completed' ? 'جاهز' : order.status === 'in_progress' ? 'قيد التنفيذ' : 'انتظار'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={canViewDetails ? `/admin/orders/${order.uuid}` : '#'}
                            onClick={(e) => {
                              if (!canViewDetails) {
                                e.preventDefault();
                                alert('عفواً، لا تملك صلاحية رؤية تفاصيل الطلب (view_order_details)');
                              }
                            }}
                            className={`p-2 rounded-lg bg-white/[0.05] hover:bg-[#FF5C35] hover:text-white text-gray-300 transition-colors shadow-inner ${!canViewDetails ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                            title="عرض / طباعة Check List"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </Link>
                          <Link
                            to={canEdit ? `/admin/edit-order/${order.uuid}` : '#'}
                            onClick={(e) => {
                              if (!canEdit) {
                                e.preventDefault();
                                alert('عفواً، لا تملك صلاحية تعديل أمر العمل (edit_checklist)');
                              }
                            }}
                            className={`p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white transition-colors shadow-inner ${!canEdit ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                            title="تعديل الطلب"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              if (!canDelete) {
                                e.preventDefault();
                                alert('عفواً، لا تملك صلاحية حذف أمر العمل (delete_checklist)');
                                return;
                              }
                              handleDelete(order.uuid, order.work_order_number);
                            }}
                            className={`p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors shadow-inner cursor-pointer ${!canDelete ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                            title="حذف"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
});

export default AdminOrders;
