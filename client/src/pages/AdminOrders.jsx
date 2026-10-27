import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { useAdminTheme } from '../contexts/AdminThemeContext';

const AdminOrders = React.memo(() => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { isLight } = useAdminTheme();
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
      toast.success(isArabic ? 'تم حذف طلب الفحص والتسليم بنجاح' : 'Work order deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onError: (err) => {
      toast.error(err.message || (isArabic ? 'فشل حذف الطلب' : 'Failed to delete order'));
    }
  });

  const handleDelete = useCallback((id, orderNum) => {
    const confirmMsg = isArabic 
      ? `هل أنت تأكد من حذف طلب الفحص والتسليم رقم ${orderNum}؟` 
      : `Are you sure you want to delete work order #${orderNum}?`;
    if (window.confirm(confirmMsg)) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation, isArabic]);

  const orders = ordersData?.data || [];
  const meta = ordersData?.meta || { total: 0, grand_total: 0, total_pages: 1 };

  const BRANCHES = [
    { id: 'all', name: isArabic ? 'جميع الفروع (All Branches)' : 'All Branches' },
    { id: 'جدة - شارع صاري', name: isArabic ? 'جدة - شارع صاري' : 'Jeddah - Sari St.' },
    { id: 'جدة - الصفا', name: isArabic ? 'جدة - الصفا' : 'Jeddah - Al-Safa' },
    { id: 'جدة - البوادي', name: isArabic ? 'جدة - البوادي' : 'Jeddah - Al-Bawadi' },
    { id: 'فرع الرياض - الفيصلية 1', name: isArabic ? 'فرع الرياض - الفيصلية 1' : 'Riyadh - Al Faisaliah 1' },
    { id: 'فرع الرياض - الفيصلية 2', name: isArabic ? 'فرع الرياض - الفيصلية 2' : 'Riyadh - Al Faisaliah 2' },
    { id: 'فرع مكة المكرمة', name: isArabic ? 'فرع مكة المكرمة' : 'Makkah Branch' },
    { id: 'فرع الطائف', name: isArabic ? 'فرع الطائف' : 'Taif Branch' },
    { id: 'فرع الدمام', name: isArabic ? 'فرع الدمام' : 'Dammam Branch' },
    { id: 'فرع المدينة المنورة', name: isArabic ? 'فرع المدينة المنورة' : 'Madinah Branch' }
  ];

  const canView = hasPermission('view_checklists');
  const canViewDetails = hasPermission('view_order_details');
  const canCreate = hasPermission('create_checklist');
  const canEdit = hasPermission('edit_checklist');
  const canDelete = hasPermission('delete_checklist');

  if (!canView) {
    return (
      <div className={`flex min-h-screen font-body relative pt-24 md:pt-8 ${isLight ? 'bg-[#F8FAFC] text-gray-900' : 'bg-[#000000] text-[#e5e2e1]'}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <AdminSidebar />
        <main className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
          <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {isArabic ? 'عفواً، لا تملك صلاحية عرض أوامر العمل والـ Check list' : 'Access Denied: View Checklists'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isArabic ? 'تواصل مع السوبر أدمن للحصول على صلاحية (view_checklists)' : 'Contact system administrator for (view_checklists) permission.'}
          </p>
          <button onClick={() => navigate('/admin')} className="px-6 py-2 bg-[#5C24EB] hover:bg-[#6E3BF5] text-white rounded-xl font-bold text-xs cursor-pointer shadow-md">
            {isArabic ? 'العودة للرئيسية' : 'Back to Dashboard'}
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen font-body relative pt-24 md:pt-8 selection:bg-[#5C24EB]/30 transition-colors duration-300 ${
      isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#090A0F] text-[#e5e2e1] admin-dark-theme'
    }`} dir={isArabic ? 'rtl' : 'ltr'}>
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-12 pt-8 space-y-8" aria-labelledby="orders-heading">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs font-bold uppercase tracking-wider">
              <span>{isArabic ? 'لوحة تحكم ريفليكتو' : 'Reflecto Admin'}</span>
              <span className="material-symbols-outlined text-xs">{isArabic ? 'chevron_left' : 'chevron_right'}</span>
              <span className="text-[#8B5CF6]">{isArabic ? 'قائمة الفحص والطلبات' : 'Check List & Orders'}</span>
            </div>
            <h1 id="orders-heading" className={`text-2xl md:text-3xl font-display font-black tracking-tight flex items-center gap-3 ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              <span className="material-symbols-outlined text-2xl md:text-3xl text-[#8B5CF6] bg-[#5C24EB]/15 p-2 rounded-2xl border border-[#5C24EB]/30 shadow-inner" aria-hidden="true">fact_check</span>
              <span>{isArabic ? 'طلبات الفحص والتسليم (Orders)' : 'Work Orders & Checklists'}</span>
            </h1>
            <p className={`text-sm mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              {isArabic ? 'إدارة نموذج استلام وفحص السيارات (Work Order / Check List)' : 'Manage vehicle intake, inspection and delivery checklists'}
            </p>
          </div>

          <Link
            to={canCreate ? "/admin/add-order" : "#"}
            onClick={(e) => {
              if (!canCreate) {
                e.preventDefault();
                alert(isArabic ? 'عفواً، لا تملك صلاحية إضافة أمر عمل جديد (create_checklist)' : 'You do not have permission to create work orders (create_checklist)');
              }
            }}
            className={`px-6 py-3.5 bg-[#5C24EB] hover:bg-[#6E3BF5] text-white font-bold text-sm rounded-xl shadow-[0_8px_25px_rgba(92,36,235,0.35)] transition-all flex items-center gap-2 w-fit active:scale-95 cursor-pointer ${!canCreate ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            {isArabic ? 'إضافة طلب جديد (New Check List)' : 'Create New Work Order'}
          </Link>
        </header>

        {/* Counter Summary Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Orders Stats">
          <div className={`p-5 rounded-2xl shadow-xl flex items-center justify-between border transition-colors ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/[0.02] border-white/5 backdrop-blur-xl'
          }`}>
            <div>
              <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                {isArabic ? 'إجمالي الطلبات العامة' : 'Total General Orders'}
              </div>
              <div className={`text-2xl font-black ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {meta.grand_total || meta.total || 0}
              </div>
            </div>
            <span className="material-symbols-outlined text-3xl text-[#8B5CF6] bg-[#5C24EB]/15 p-2.5 rounded-xl">format_list_bulleted</span>
          </div>

          <div className={`p-5 rounded-2xl shadow-xl flex items-center justify-between border transition-colors ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/[0.02] border-white/5 backdrop-blur-xl'
          }`}>
            <div>
              <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                {branchFilter === 'all' 
                  ? (isArabic ? 'طلبات التصفية الحالية' : 'Current Filter Orders') 
                  : (isArabic ? `طلبات ${branchFilter}` : `${branchFilter} Orders`)}
              </div>
              <div className="text-2xl font-black text-emerald-500">{meta.total || 0}</div>
            </div>
            <span className="material-symbols-outlined text-3xl text-emerald-500 bg-emerald-500/10 p-2.5 rounded-xl">store</span>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className={`rounded-2xl p-6 shadow-xl border flex flex-col lg:flex-row gap-4 justify-between items-center transition-colors ${
          isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/[0.02] border-white/5 backdrop-blur-xl shadow-2xl'
        }`}>
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-1">
            <div className="relative w-full md:w-72">
              <span className={`material-symbols-outlined absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`}>search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'ابحث برقم الطلب، اسم العميل...' : 'Search by order #, client name...'}
                className={`w-full rounded-xl ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 text-sm outline-none focus:border-[#5C24EB] focus:ring-1 focus:ring-[#5C24EB]/50 transition-all border ${
                  isLight 
                    ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400' 
                    : 'bg-white/[0.05] border-white/10 text-white placeholder:text-gray-500'
                }`}
              />
            </div>

            {/* Branch Filter Dropdown */}
            <div className="relative w-full md:w-64">
              <select
                value={branchFilter}
                onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                className={`w-full rounded-xl px-4 py-3 appearance-none focus:border-[#5C24EB] focus:ring-1 focus:ring-[#5C24EB]/50 outline-none cursor-pointer text-xs font-bold border ${
                  isLight
                    ? 'bg-gray-50 border-gray-200 text-gray-900'
                    : 'bg-white/[0.05] border-white/10 text-white'
                }`}
              >
                {BRANCHES.map(b => (
                  <option key={b.id} value={b.id} className={isLight ? 'bg-white text-gray-900' : 'bg-[#121212] text-white'}>
                    {b.name}
                  </option>
                ))}
              </select>
              <span className={`material-symbols-outlined absolute ${isArabic ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-sm pointer-events-none text-gray-400`}>
                expand_more
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
            {[
              { id: 'all', label: isArabic ? 'الكل (All)' : 'All' },
              { id: 'pending', label: isArabic ? 'قيد الانتظار' : 'Pending' },
              { id: 'in_progress', label: isArabic ? 'قيد التنفيذ' : 'In Progress' },
              { id: 'completed', label: isArabic ? 'جاهز للتسليم' : 'Ready' },
              { id: 'delivered', label: isArabic ? 'تم التسليم' : 'Delivered' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setStatusFilter(tab.id); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#5C24EB] text-white shadow-lg shadow-[#5C24EB]/30'
                    : isLight
                    ? 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Orders Table */}
        <section className={`rounded-2xl p-6 shadow-xl border overflow-hidden transition-colors ${
          isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/[0.02] border-white/5 backdrop-blur-xl shadow-2xl'
        }`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#5C24EB] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-gray-400 mb-4 block">receipt_long</span>
              <p className={`font-bold text-lg mb-2 ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>
                {isArabic ? 'لا توجد طلبات فحص وتسليم حالياً' : 'No work orders found'}
              </p>
              <p className={`text-xs mb-6 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                {isArabic ? 'اضغط على زر "إضافة طلب جديد" للبدء بإنشاء نموذج فحص واستلام سيارة' : 'Click "Create New Work Order" to start a new checklist and inspection.'}
              </p>
              <Link to="/admin/add-order" className="px-6 py-2.5 bg-[#5C24EB] hover:bg-[#6E3BF5] text-white font-bold text-xs rounded-xl shadow-md inline-block">
                {isArabic ? 'إضافة أول طلب' : 'Add First Order'}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full ${isArabic ? 'text-right' : 'text-left'} border-collapse`}>
                <thead>
                  <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'border-gray-200 text-gray-600 bg-gray-50' : 'border-white/10 text-gray-400'
                  }`}>
                    <th className="py-3 px-4">{isArabic ? 'رقم الطلب' : 'Order #'}</th>
                    <th className="py-3 px-4">{isArabic ? 'العميل' : 'Customer'}</th>
                    <th className="py-3 px-4">{isArabic ? 'السيارة' : 'Vehicle'}</th>
                    <th className="py-3 px-4">{isArabic ? 'التاريخ' : 'Date'}</th>
                    <th className="py-3 px-4">{isArabic ? 'المبلغ الإجمالي' : 'Total Amount'}</th>
                    <th className="py-3 px-4 text-center">{isArabic ? 'الحالة' : 'Status'}</th>
                    <th className="py-3 px-4 text-center">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm ${
                  isLight ? 'divide-gray-100 text-gray-700' : 'divide-white/5 text-gray-300'
                }`}>
                  {orders.map(order => (
                    <tr key={order.uuid} className={`transition-colors group ${
                      isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.02]'
                    }`}>
                      <td className="py-4 px-4 font-mono font-bold text-[#8B5CF6]">
                        {order.work_order_number}
                      </td>
                      <td className={`py-4 px-4 font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        <div>{order.client_name}</div>
                        <div className={`text-xs font-mono ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{order.client_phone}</div>
                      </td>
                      <td className={`py-4 px-4 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                        <div className="font-bold">{order.vehicle_type} {order.vehicle_model}</div>
                        <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                          {isArabic ? 'لوحة:' : 'Plate:'} {order.vehicle_plate || 'N/A'} | {isArabic ? 'لون:' : 'Color:'} {order.vehicle_color || 'N/A'}
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-xs font-mono ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                        {order.order_date ? new Date(order.order_date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US') : 'N/A'}
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-500 font-mono">
                        SAR {Number(order.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'completed' || order.status === 'delivered'
                            ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20'
                            : order.status === 'in_progress'
                            ? 'bg-amber-500/15 text-amber-600 border border-amber-500/20'
                            : isLight
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-white/10 text-gray-300'
                        }`}>
                          {order.status === 'delivered' 
                            ? (isArabic ? 'تم التسليم' : 'Delivered') 
                            : order.status === 'completed' 
                            ? (isArabic ? 'جاهز' : 'Ready') 
                            : order.status === 'in_progress' 
                            ? (isArabic ? 'قيد التنفيذ' : 'In Progress') 
                            : (isArabic ? 'انتظار' : 'Pending')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={canViewDetails ? `/admin/orders/${order.uuid}` : '#'}
                            onClick={(e) => {
                              if (!canViewDetails) {
                                e.preventDefault();
                                alert(isArabic ? 'عفواً، لا تملك صلاحية رؤية تفاصيل الطلب (view_order_details)' : 'You do not have permission to view order details');
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors shadow-inner ${
                              isLight 
                                ? 'bg-gray-100 hover:bg-[#5C24EB] hover:text-white text-gray-600' 
                                : 'bg-white/[0.05] hover:bg-[#5C24EB] hover:text-white text-gray-300'
                            } ${!canViewDetails ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                            title={isArabic ? 'عرض / طباعة Check List' : 'View / Print Checklist'}
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </Link>
                          <Link
                            to={canEdit ? `/admin/edit-order/${order.uuid}` : '#'}
                            onClick={(e) => {
                              if (!canEdit) {
                                e.preventDefault();
                                alert(isArabic ? 'عفواً، لا تملك صلاحية تعديل أمر العمل (edit_checklist)' : 'You do not have permission to edit this work order');
                              }
                            }}
                            className={`p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white transition-colors shadow-inner ${!canEdit ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                            title={isArabic ? 'تعديل الطلب' : 'Edit Order'}
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              if (!canDelete) {
                                e.preventDefault();
                                alert(isArabic ? 'عفواً، لا تملك صلاحية حذف أمر العمل (delete_checklist)' : 'You do not have permission to delete this work order');
                                return;
                              }
                              handleDelete(order.uuid, order.work_order_number);
                            }}
                            className={`p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors shadow-inner cursor-pointer ${!canDelete ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
                            title={isArabic ? 'حذف' : 'Delete'}
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
