import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkoutService } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

// Extracted helpers to avoid recreation on every render
const getStatusClasses = (status) => {
  const baseClasses = 'px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider'; // Removed explicit border
  const s = (status || '').toLowerCase();
  
  if (s === 'paid' || s === 'completed') return `${baseClasses} bg-green-500/10 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.1)]`;
  if (s === 'overdue' || s === 'failed' || s === 'cancelled') return `${baseClasses} bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]`;
  if (s === 'pending') return `${baseClasses} bg-[#E64833]/10 text-[#E64833] shadow-[0_0_10px_rgba(230,72,51,0.1)]`;
  
  return `${baseClasses} bg-gray-500/10 text-gray-500 shadow-[0_0_10px_rgba(107,114,128,0.1)]`;
};

const getTrendIcon = (type) => {
  switch(type) {
    case 'positive': return 'trending_up';
    case 'warning': return 'warning';
    default: return 'schedule';
  }
};

const getTrendColor = (type) => {
  switch(type) {
    case 'positive': return 'text-green-500';
    case 'warning': return 'text-[#E64833]';
    default: return 'text-white/60';
  }
};

const DUMMY_ORDERS = [
  { id: 'KG-8821', client_name: 'Ahmed Al-Sayed', service: 'Tabby Payment', created_at: '2023-10-24T10:00:00Z', amount: 4500, status: 'paid' },
  { id: 'KG-8819', client_name: 'Mark Bennington', service: 'Tamara Installments', created_at: '2023-10-23T14:30:00Z', amount: 12200, status: 'pending' },
  { id: 'KG-8812', client_name: 'Fahad Khan', service: 'Tabby Payment', created_at: '2023-10-18T09:15:00Z', amount: 2100, status: 'overdue' },
];

const OrdersBilling = React.memo(() => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('Last 30 Days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: checkoutData, isLoading } = useQuery({
    queryKey: ['adminCheckouts'],
    queryFn: checkoutService.getAll,
  });

  const rawOrders = checkoutData?.data || [];
  
  // Memoize filtering and calculations
  const { filteredOrders, stats, ordersToDisplay } = useMemo(() => {
    const now = new Date();
    const filtered = rawOrders.filter(order => {
      // 1. Status Filter
      if (statusFilter !== 'All' && statusFilter !== 'Status: All') {
        const s = (order.status || '').toLowerCase();
        if (s !== statusFilter.toLowerCase()) return false;
      }

      const orderDate = new Date(order.created_at || order.createdAt || Date.now());

      // 2. Custom Date Range
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }

      // 3. Preset Time Filter (if no custom start/end date specified)
      if (!startDate && !endDate) {
        if (timeFilter === 'Last 30 Days' || timeFilter === 'Time: Last 30 Days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (orderDate < thirtyDaysAgo) return false;
        } else if (timeFilter === 'Last 3 Months') {
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          if (orderDate < ninetyDaysAgo) return false;
        } else if (timeFilter === 'This Year') {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          if (orderDate < startOfYear) return false;
        }
      }

      return true;
    });

    const totalRevenue = filtered.reduce((sum, order) => {
      return (order.status === 'paid' || order.status === 'completed') ? sum + (order.amount || 0) : sum;
    }, 0);
    
    const outstanding = filtered.reduce((sum, order) => {
      return (order.status === 'pending' || order.status === 'overdue') ? sum + (order.amount || 0) : sum;
    }, 0);

    const calculatedStats = [
      {
        title: 'إجمالي الإيرادات',
        value: totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        currency: 'SAR',
        trend: '+12.5%',
        trendType: 'positive',
        icon: 'payments',
      },
      {
        title: 'المبالغ المتبقية',
        value: outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        currency: 'SAR',
        trend: `${filtered.filter(o => o.status === 'overdue').length} فواتير متأخرة`,
        trendType: 'warning',
        icon: 'pending_actions',
      },
      {
        title: 'إجمالي الطلبات',
        value: filtered.length.toLocaleString(),
        currency: 'طلب',
        trend: 'الفترة المحددة',
        trendType: 'neutral',
        icon: 'shopping_cart',
      }
    ];

    const toDisplay = rawOrders.length > 0 ? filtered : DUMMY_ORDERS;

    return { filteredOrders: filtered, stats: calculatedStats, ordersToDisplay: toDisplay };
  }, [rawOrders, statusFilter, timeFilter, startDate, endDate]);

  return (
    // Kept specific hex colors but adjusted components for Executive Atelier
    <div className="flex bg-[#0a0a0a] min-h-screen text-white overflow-hidden pt-20">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-8" aria-labelledby="orders-heading">
        <div className="pl-12 lg:pl-0">
          {/* Page Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 id="orders-heading" className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                الطلبات والمبيعات (Orders &amp; Billing)
                {isLoading && (
                  <div className="w-5 h-5 border-2 border-[#E64833]/30 border-t-[#E64833] rounded-full animate-spin" role="status" aria-live="polite">
                    <span className="sr-only">جاري تحميل البيانات...</span>
                  </div>
                )}
              </h1>
              <p className="text-[#9CA3AF] mt-1">متابعة العمليات المالية والدفعات الإلكترونية وأوامر العمل</p>
            </div>
            <div className="flex space-x-3">
              {/* Removed borders, added glassmorphism */}
              <button type="button" aria-label="Export Orders" className="bg-[#1A1A1A]/80 backdrop-blur-md shadow-lg text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#262626] transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">file_download</span>
                تصدير التقرير
              </button>
            </div>
          </header>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" aria-label="Billing Statistics">
            {stats.map((stat, index) => (
              // Applied No-Line rule: replaced border with shadow and backdrop-blur
              <article key={index} className="bg-[#1A1A1A]/60 backdrop-blur-xl shadow-2xl rounded-xl p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(230,72,51,0.15)] transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                  <span className="material-symbols-outlined text-6xl text-[#E64833]" aria-hidden="true">{stat.icon}</span>
                </div>
                <h2 className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest">{stat.title}</h2>
                <div className="flex items-baseline mt-2 space-x-2">
                  <span className="text-3xl font-black text-white">{stat.value}</span>
                  <span className="text-[#E64833] text-sm font-bold">{stat.currency}</span>
                </div>
                <div className={`mt-4 flex items-center text-xs ${getTrendColor(stat.trendType)} font-medium`}>
                  <span className="material-symbols-outlined text-sm mr-1" aria-hidden="true">{getTrendIcon(stat.trendType)}</span>
                  <span>{stat.trend}</span>
                </div>
              </article>
            ))}
          </section>

          {/* Orders Table Container */}
          {/* Applied No-Line rule */}
          <section className="bg-[#1A1A1A]/60 backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden mb-8" aria-label="Orders List">
            {/* Table Controls */}
            <header className="p-4 bg-[#1A1A1A]/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <select
                    aria-label="Filter by Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#0D0D0D]/80 backdrop-blur-md shadow-inner text-white text-xs rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-[#E64833]/50 appearance-none outline-none cursor-pointer"
                  >
                    <option>Status: All</option>
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Overdue</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none text-gray-400" aria-hidden="true">
                    expand_more
                  </span>
                </div>
                <div className="relative">
                  <select
                    aria-label="Filter by Time"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="bg-[#0D0D0D]/80 backdrop-blur-md shadow-inner text-white text-xs rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-[#E64833]/50 appearance-none outline-none cursor-pointer"
                  >
                    <option>Time: Last 30 Days</option>
                    <option>Last 3 Months</option>
                    <option>This Year</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none text-gray-400" aria-hidden="true">
                    expand_more
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#0D0D0D]/80 backdrop-blur-md shadow-inner rounded-lg px-3 py-1 text-xs">
                  <span className="text-gray-400 text-[10px] font-bold uppercase">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-white text-xs focus:outline-none"
                  />
                  <span className="text-gray-400 text-[10px] font-bold uppercase">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-white text-xs focus:outline-none"
                  />
                  {(startDate || endDate) && (
                    <button
                      type="button"
                      onClick={() => { setStartDate(''); setEndDate(''); }}
                      className="text-[#E64833] hover:text-white text-xs font-bold ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center text-xs text-[#9CA3AF]">
                <span>Showing {ordersToDisplay.length} orders</span>
              </div>
            </header>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#0D0D0D]/80 backdrop-blur-md">
                    <th scope="col" className="px-6 py-4 text-[#E64833] text-[10px] font-black uppercase tracking-widest">Order ID</th>
                    <th scope="col" className="px-6 py-4 text-[#E64833] text-[10px] font-black uppercase tracking-widest">Client Name</th>
                    <th scope="col" className="px-6 py-4 text-[#E64833] text-[10px] font-black uppercase tracking-widest">Method/Details</th>
                    <th scope="col" className="px-6 py-4 text-[#E64833] text-[10px] font-black uppercase tracking-widest">Date</th>
                    <th scope="col" className="px-6 py-4 text-[#E64833] text-[10px] font-black uppercase tracking-widest text-right">Amount</th>
                    <th scope="col" className="px-6 py-4 text-[#E64833] text-[10px] font-black uppercase tracking-widest">Status</th>
                    <th scope="col" className="px-6 py-4 text-[#E64833] text-[10px] font-black uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                {/* No border-b anymore, using transparent separation / shadows */}
                <tbody className="divide-y divide-[#333333]/30">
                  {ordersToDisplay.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500 italic">No orders found matching your criteria.</td>
                    </tr>
                  )}
                  
                  {ordersToDisplay.map((order, index) => {
                    const clientName = order.client_name || 'Unknown Client';
                    const initials = clientName.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase();
                    const date = new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    
                    return (
                      <tr 
                        key={order.id || index} 
                        className={`${index % 2 === 0 ? 'bg-transparent' : 'bg-black/20'} hover:bg-white/[0.05] transition-colors group`}
                      >
                        <td className="px-6 py-4 font-mono text-sm text-white font-medium">
                          #{order.id ? order.id.substring(0, 8) : 'UNK'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-black/40 shadow-inner flex items-center justify-center text-[#E64833] font-bold text-xs shrink-0" aria-hidden="true">
                              {initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white text-sm font-semibold truncate">{clientName}</span>
                              <span className="text-[10px] text-gray-500">{order.client_phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[#9CA3AF] text-sm uppercase font-bold tracking-widest">
                            {order.payment_method || order.service || 'Checkout'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#9CA3AF] text-sm">
                          <time dateTime={order.created_at}>{date}</time>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-white font-bold text-sm">{(order.amount || 0).toLocaleString()}</span>
                          <span className="text-[#9CA3AF] text-[10px] ml-1">{order.currency || 'SAR'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={getStatusClasses(order.status)}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button type="button" aria-label={`More actions for order ${order.id}`} className="text-[#9CA3AF] hover:text-white transition-colors p-1 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#E64833]/50">
                            <span className="material-symbols-outlined text-lg" aria-hidden="true">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
});

export default OrdersBilling;