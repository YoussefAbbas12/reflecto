import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersService, clientService, companyService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { getCompanyLogoUrl } from '../utils/imageUrl';

const EditOrder = React.memo(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const canEdit = hasPermission('edit_checklist');

  const [clientCompany, setClientCompany] = useState(null);

  const [formData, setFormData] = useState({
    work_order_number: '',
    client_name: '',
    client_phone: '',
    branch_name: 'جدة - الصفا',
    order_date: new Date().toISOString().slice(0, 10),
    client_type: 'عميل مباشر',
    
    // Services
    heat_insulation: [],
    heat_insulation_details: {},
    polishing: [],
    nano_ceramic: [],
    ppf: [],
    ppf_partial_details: '',
    removal_services: [],

    // Financials
    price: 0,
    original_price: null,
    discount_percent: 0,
    discount_amount: 0,
    company_name: '',
    paid_amount: 0,
    total_amount: 0,
    payment_method: 'مدى (Mada)',

    // Vehicle
    vehicle_type: '',
    vehicle_model: '',
    vehicle_year: new Date().getFullYear().toString(),
    vehicle_color: '',
    vehicle_plate: '',
    chassis_number: '',
    mileage_km: '',
    inspection_notes: '',
    inspection_checklist: {
      driver_side: false,
      passenger_side: false,
      front_bumper: false,
      back_bumper: false,
      interior_check: false,
      inside_check: false,
      outside_check: false,
    },

    // Signatures & Warranty
    reception_name: '',
    accountant_name: '',
    sales_manager_name: '',
    delivery_date: '',
    technician_id: '',
    technician_name: '',
    service_warranties: {},
    service_technicians: {},
    has_warranty: false,
    warranty_years: 10,
    status: 'pending'
  });

  // Fetch Order Data
  const { data: orderData, isLoading: isOrderLoading } = useQuery({
    queryKey: ['adminOrderEdit', id],
    queryFn: () => ordersService.getById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (orderData?.data) {
      const order = orderData.data;
      setFormData({
        work_order_number: order.work_order_number || '',
        client_name: order.client_name || '',
        client_phone: order.client_phone || '',
        branch_name: order.branch_name || 'جدة - الصفا',
        order_date: order.order_date ? new Date(order.order_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        client_type: order.client_type || 'عميل مباشر',
        
        heat_insulation: Array.isArray(order.heat_insulation) ? order.heat_insulation : [],
        heat_insulation_details: (() => {
          const raw = order.heat_insulation_details;
          if (!raw) return {};
          if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
          try { return JSON.parse(raw); } catch { return {}; }
        })(),
        polishing: Array.isArray(order.polishing) ? order.polishing : [],
        nano_ceramic: Array.isArray(order.nano_ceramic) ? order.nano_ceramic : [],
        ppf: Array.isArray(order.ppf) ? order.ppf : [],
        ppf_partial_details: order.ppf_partial_details || '',
        removal_services: Array.isArray(order.removal_services) ? order.removal_services : [],

        price: order.price || 0,
        original_price: order.original_price != null ? order.original_price : null,
        discount_percent: order.discount_percent || 0,
        discount_amount: order.discount_amount || 0,
        company_name: order.company_name || '',
        paid_amount: order.paid_amount || 0,
        total_amount: order.total_amount || 0,
        payment_method: order.payment_method || 'مدى (Mada)',

        vehicle_type: order.vehicle_type || '',
        vehicle_model: order.vehicle_model || '',
        vehicle_year: order.vehicle_year || new Date().getFullYear().toString(),
        vehicle_color: order.vehicle_color || '',
        vehicle_plate: order.vehicle_plate || '',
        chassis_number: order.chassis_number || '',
        mileage_km: order.mileage_km || '',
        inspection_notes: order.inspection_notes || '',
        inspection_checklist: typeof order.inspection_checklist === 'object' ? order.inspection_checklist : {
          driver_side: false,
          passenger_side: false,
          front_bumper: false,
          back_bumper: false,
          interior_check: false,
          inside_check: false,
          outside_check: false,
        },

        reception_name: order.reception_name || '',
        accountant_name: order.accountant_name || '',
        sales_manager_name: order.sales_manager_name || '',
        delivery_date: order.delivery_date ? new Date(order.delivery_date).toISOString().slice(0, 16) : '',
        technician_id: order.technician_id || '',
        technician_name: order.technician_name || '',
        service_warranties: (() => {
          const raw = order.service_warranties;
          if (!raw) return {};
          if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
          try { return JSON.parse(raw); } catch { return {}; }
        })(),
        service_technicians: (() => {
          const raw = order.service_technicians;
          if (!raw) return {};
          if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
          try { return JSON.parse(raw); } catch { return {}; }
        })(),
        service_details: (() => {
          const raw = order.service_details;
          if (!raw) return {};
          if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
          try { return JSON.parse(raw); } catch { return {}; }
        })(),
        has_warranty: Boolean(order.has_warranty),
        warranty_years: order.warranty_years || 10,
        status: order.status || 'pending'
      });
    }
  }, [orderData]);

  // Fetch clients for dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['adminClientsList'],
    queryFn: () => clientService.getAll(1, 'client'),
  });
  const clientsList = useMemo(() => clientsData?.data || clientsData?.clients || [], [clientsData]);

  // Fetch technicians list
  const { data: techniciansData } = useQuery({
    queryKey: ['adminTechniciansList'],
    queryFn: () => clientService.getTechnicians(),
  });
  const techniciansList = useMemo(() => Array.isArray(techniciansData) ? techniciansData : (techniciansData?.data || []), [techniciansData]);

  const handleSelectClient = useCallback((clientName) => {
    const selected = clientsList.find(c => (c.full_name || c.name) === clientName);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        client_name: selected.full_name || selected.name || clientName,
        client_phone: selected.phone || prev.client_phone
      }));
    } else {
      setFormData(prev => ({ ...prev, client_name: clientName }));
    }
  }, [clientsList]);

  // Two-way financial calculations
  const price = parseFloat(formData.price) || 0;
  const total_amount = parseFloat(formData.total_amount) || (price * 1.15);
  const vat_amount = Math.max(0, total_amount - price);
  const paid_amount = parseFloat(formData.paid_amount) || 0;
  const remaining_amount = Math.max(0, total_amount - paid_amount);

  const handlePriceChange = useCallback((val) => {
    const p = parseFloat(val);
    if (!isNaN(p)) {
      setFormData(prev => ({
        ...prev,
        price: val,
        total_amount: (p * 1.15).toFixed(2)
      }));
    } else {
      setFormData(prev => ({ ...prev, price: val, total_amount: '' }));
    }
  }, []);

  const handleTotalChange = useCallback((val) => {
    const t = parseFloat(val);
    if (!isNaN(t)) {
      setFormData(prev => ({
        ...prev,
        total_amount: val,
        price: (t / 1.15).toFixed(2)
      }));
    } else {
      setFormData(prev => ({ ...prev, total_amount: val, price: '' }));
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleCheckboxToggle = useCallback((category, item) => {
    setFormData(prev => {
      const current = prev[category] || [];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      // If unchecking a heat_insulation option, remove its detail entry
      if (category === 'heat_insulation' && current.includes(item)) {
        const newDetails = { ...prev.heat_insulation_details };
        delete newDetails[item];
        return { ...prev, [category]: updated, heat_insulation_details: newDetails };
      }
      return { ...prev, [category]: updated };
    });
  }, []);

  const handleHeatInsulationDetail = useCallback((option, grade) => {
    setFormData(prev => ({
      ...prev,
      heat_insulation_details: { ...prev.heat_insulation_details, [option]: grade }
    }));
  }, []);

  const handleServiceWarrantyChange = useCallback((serviceKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      service_warranties: {
        ...prev.service_warranties,
        [serviceKey]: {
          ...(prev.service_warranties[serviceKey] || { duration: '', unit: 'years' }),
          [field]: value
        }
      }
    }));
  }, []);

  const handleServiceTechnicianChange = useCallback((serviceKey, value) => {
    setFormData(prev => ({
      ...prev,
      service_technicians: { ...prev.service_technicians, [serviceKey]: value }
    }));
  }, []);

  const handleServiceDetailChange = useCallback((serviceKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      service_details: {
        ...(prev.service_details || {}),
        [serviceKey]: {
          ...((prev.service_details || {})[serviceKey] || {}),
          [field]: value
        }
      }
    }));
  }, []);

  const handleChecklistToggle = useCallback((key) => {
    setFormData(prev => ({
      ...prev,
      inspection_checklist: {
        ...prev.inspection_checklist,
        [key]: !prev.inspection_checklist[key]
      }
    }));
  }, []);

  const updateMutation = useMutation({
    mutationFn: (data) => ordersService.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث طلب الفحص والتسليم بنجاح');
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminOrderEdit', id] });
      queryClient.invalidateQueries({ queryKey: ['adminOrderDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['technicianActiveOrders'] });
      queryClient.invalidateQueries({ queryKey: ['technicianHistoryOrders'] });
      navigate('/admin/orders');
    },
    onError: (err) => {
      toast.error(err.message || 'فشل تحديث الطلب');
    }
  });

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!formData.client_name || !formData.client_phone) {
      toast.warning('اسم العميل ورقم الجوال مطلوبان');
      return;
    }

    const payload = {
      ...formData,
      price,
      vat_amount,
      total_amount,
      paid_amount,
      remaining_amount,
      // Serialize heat_insulation_details object to JSON string for backend
      heat_insulation_details: typeof formData.heat_insulation_details === 'object'
        ? JSON.stringify(formData.heat_insulation_details)
        : formData.heat_insulation_details,
      service_warranties: JSON.stringify(formData.service_warranties || {}),
      service_technicians: JSON.stringify(formData.service_technicians || {}),
      service_details: JSON.stringify(formData.service_details || {}),
      product_name: formData.product_name || (Object.values(formData.service_details || {})[0]?.product || ''),
      product_model: formData.product_model || (Object.values(formData.service_details || {})[0]?.product_model || ''),
      coverage_area: formData.coverage_area || (Object.values(formData.service_details || {})[0]?.coverage_area || '')
    };

    updateMutation.mutate(payload);
  }, [formData, price, vat_amount, total_amount, paid_amount, remaining_amount, updateMutation, toast]);

  const inputStyle = "w-full bg-white/[0.05] border-0 shadow-inner rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all placeholder:text-gray-500";
  const labelStyle = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2";

  if (!canEdit) {
    return (
      <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-24 md:pt-8">
        <AdminSidebar />
        <main className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
          <h1 className="text-2xl font-bold text-white">عفواً، لا تملك صلاحية تعديل أوامر العمل</h1>
          <p className="text-gray-400 text-sm">تواصل مع السوبر أدمن للحصول على صلاحية (edit_checklist)</p>
          <button onClick={() => navigate('/admin/orders')} className="px-6 py-2 bg-[#FF5C35] text-white rounded-xl font-bold text-xs cursor-pointer">
            العودة لأوامر العمل
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-24 md:pt-8 selection:bg-[#FF5C35]/30">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-12 pt-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-2 text-xs font-bold uppercase tracking-wider">
              <button type="button" onClick={() => navigate('/admin/orders')} className="hover:text-white transition-colors">Orders</button>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-[#FF5C35]">Edit Order</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl md:text-4xl text-[#FF5C35] bg-[#FF5C35]/10 p-2 rounded-2xl border border-[#FF5C35]/20 shadow-inner">edit_note</span>
              <span>تعديل طلب الفحص والاستلام ({formData.work_order_number || 'Edit Order'})</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">تعديل بيانات النموذج الرسمي لطلب الخدمة والفحص المالي والمركبة</p>
          </div>
        </header>

        {isOrderLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#FF5C35] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Work Order & Client Info */}
            <fieldset className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 shadow-2xl border-0">
              <legend className="text-lg font-bold font-headline text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#FF5C35] bg-[#FF5C35]/10 p-2 rounded-xl">badge</span>
                1. بيانات أمر العمل والعميل (Work Order & Client)
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelStyle}>رقم أمر العمل (Work Order #)</label>
                  <input
                    type="text"
                    name="work_order_number"
                    value={formData.work_order_number}
                    onChange={handleInputChange}
                    className={`${inputStyle} font-mono font-bold text-[#FF5C35]`}
                    readOnly
                  />
                </div>

                <div>
                  <label className={labelStyle}>اسم العميل (Client Name)</label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    list="clients-list-edit"
                    placeholder="اكتب اسم العميل أو اختر من القائمة..."
                    className={inputStyle}
                    required
                  />
                  <datalist id="clients-list-edit">
                    {clientsList.map((c, idx) => (
                      <option key={c.id || idx} value={c.full_name || c.name}>
                        {c.phone ? `${c.full_name || c.name} (${c.phone})` : (c.full_name || c.name)}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className={labelStyle}>رقم جوال العميل (Client Phone)</label>
                  <input
                    type="text"
                    name="client_phone"
                    value={formData.client_phone}
                    onChange={handleInputChange}
                    placeholder="+966 5x xxx xxxx"
                    className={`${inputStyle} font-mono`}
                    required
                  />
                </div>

                <div>
                  <label className={labelStyle}>تاريخ الطلب (Date)</label>
                  <input
                    type="date"
                    name="order_date"
                    value={formData.order_date}
                    onChange={handleInputChange}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>نوع العميل (Client Type)</label>
                  <select
                    name="client_type"
                    value={formData.client_type}
                    onChange={handleInputChange}
                    className={`${inputStyle} cursor-pointer`}
                  >
                    <option value="عميل مباشر" className="bg-[#121212] text-white">عميل مباشر</option>
                    <option value="معرض سيارات" className="bg-[#121212] text-white">معرض سيارات</option>
                    <option value="شركة / جهة" className="bg-[#121212] text-white">شركة / جهة</option>
                    <option value="VIP" className="bg-[#121212] text-white">VIP</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>الفرع (Branch)</label>
                  <select
                    name="branch_name"
                    value={formData.branch_name}
                    onChange={handleInputChange}
                    className={`${inputStyle} cursor-pointer`}
                  >
                    <option value="جدة - شارع صاري" className="bg-[#121212] text-white">جدة - شارع صاري</option>
                    <option value="جدة - الصفا" className="bg-[#121212] text-white">جدة - الصفا</option>
                    <option value="جدة - البوادي" className="bg-[#121212] text-white">جدة - البوادي</option>
                    <option value="فرع الرياض - الفيصلية 1" className="bg-[#121212] text-white">فرع الرياض - الفيصلية 1</option>
                    <option value="فرع الرياض - الفيصلية 2" className="bg-[#121212] text-white">فرع الرياض - الفيصلية 2</option>
                    <option value="فرع مكة المكرمة" className="bg-[#121212] text-white">فرع مكة المكرمة</option>
                    <option value="فرع الطائف" className="bg-[#121212] text-white">فرع الطائف</option>
                    <option value="فرع الدمام" className="bg-[#121212] text-white">فرع الدمام</option>
                    <option value="فرع المدينة المنورة" className="bg-[#121212] text-white">فرع المدينة المنورة</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Section 2: Services Check List */}
            <fieldset className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 shadow-2xl border-0">
              <legend className="text-lg font-bold font-headline text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#FF5C35] bg-[#FF5C35]/10 p-2 rounded-xl">checklist</span>
                خدمات الفحص المطلوبة (Check List Options)
              </legend>

              <div className="space-y-8">
              {/* Heat Insulation */}
              <div>
                <h4 className="text-sm font-bold text-[#FF5C35] uppercase tracking-wider mb-3">عازل حراري (Heat Insulation)</h4>
                <div className="flex flex-wrap gap-3 mb-3">
                  {['امامي', 'سائق وركاب', 'خلف السائق', 'مثلث', 'خلفي شنطه', 'بنوراما', 'سيكورتي'].map(opt => (
                    <label key={opt} className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      formData.heat_insulation.includes(opt)
                        ? 'bg-[#FF5C35] border-[#FF5C35] text-white shadow-lg'
                        : 'bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.08]'
                    }`}>
                      <input type="checkbox" className="hidden" checked={formData.heat_insulation.includes(opt)} onChange={() => handleCheckboxToggle('heat_insulation', opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                {formData.heat_insulation.length > 0 && (
                  <div className="p-4 bg-white/[0.03] border border-[#FF5C35]/30 rounded-xl space-y-3 mb-3">
                    <p className="text-xs font-bold text-[#FF5C35] uppercase tracking-wider mb-1">درجة العزل الحراري لكل خيار</p>
                    {formData.heat_insulation.map(opt => (
                      <div key={opt} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white min-w-[90px]">{opt}</span>
                        <select
                          value={formData.heat_insulation_details?.[opt] || ''}
                          onChange={(e) => handleHeatInsulationDetail(opt, e.target.value)}
                          className="flex-1 bg-[#1a1a1a] border border-white/15 text-white text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-[#FF5C35] transition-colors"
                        >
                          <option value="" className="bg-[#121212]">-- اختر الدرجة --</option>
                          {['00', '01', '02', '03', '04', '05'].map(grade => (
                            <option key={grade} value={grade} className="bg-[#121212]">{grade}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Warranty & Technician & Product details for Heat Insulation */}
              {formData.heat_insulation.length > 0 && (
                <div className="space-y-3 mt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
                      <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">ضمان العازل:</span>
                      <input
                        type="number" min="0" placeholder="مدة الضمان"
                        value={formData.service_warranties.heat_insulation?.duration || ''}
                        onChange={(e) => handleServiceWarrantyChange('heat_insulation', 'duration', e.target.value)}
                        className="w-20 bg-white/[0.08] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold text-center outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <select
                        value={formData.service_warranties.heat_insulation?.unit || 'years'}
                        onChange={(e) => handleServiceWarrantyChange('heat_insulation', 'unit', e.target.value)}
                        className="bg-white/[0.08] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="years" className="bg-[#121212]">سنوات</option>
                        <option value="months" className="bg-[#121212]">أشهر</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#FF5C35]/10 border border-[#FF5C35]/30 rounded-xl">
                      <span className="material-symbols-outlined text-[#FF5C35] text-sm">engineering</span>
                      <span className="text-xs font-bold text-[#FF5C35] whitespace-nowrap">فني العازل الحراري:</span>
                      <select
                        value={formData.service_technicians['heat_insulation'] || ''}
                        onChange={e => handleServiceTechnicianChange('heat_insulation', e.target.value)}
                        className="flex-1 bg-[#1a1a1a] border border-white/15 text-white text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-[#FF5C35]"
                      >
                        <option value="">اختر الفني...</option>
                        {techniciansList.map(tech => <option key={tech.id} value={tech.id}>{tech.full_name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                    <div>
                      <label className="block text-[11px] font-bold text-blue-400 mb-1">المنتج المستخدم / Product</label>
                      <input
                        type="text"
                        placeholder="مثال: Apeax Heat Insulation"
                        value={formData.service_details?.heat_insulation?.product || ''}
                        onChange={(e) => handleServiceDetailChange('heat_insulation', 'product', e.target.value)}
                        className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-bold outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-purple-400 mb-1">الفئة / Product Model</label>
                      <input
                        type="text"
                        placeholder="مثال: Nano Ceramic Tint"
                        value={formData.service_details?.heat_insulation?.product_model || ''}
                        onChange={(e) => handleServiceDetailChange('heat_insulation', 'product_model', e.target.value)}
                        className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-bold outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-400 mb-1">المساحة المشمولة / Coverage</label>
                      <input
                        type="text"
                        placeholder="مثال: كامل زجاج السيارة"
                        value={formData.service_details?.heat_insulation?.coverage_area || ''}
                        onChange={(e) => handleServiceDetailChange('heat_insulation', 'coverage_area', e.target.value)}
                        className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-bold outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Polishing */}
              <div>
                <h4 className="text-sm font-bold text-[#FF5C35] uppercase tracking-wider mb-3">تلميع (Polishing)</h4>
                <div className="flex flex-wrap gap-3">
                  {['خارجي', 'داخلي', 'مقاعد', 'مائي'].map(opt => (
                    <label key={opt} className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      formData.polishing.includes(opt)
                        ? 'bg-[#FF5C35] border-[#FF5C35] text-white shadow-lg'
                        : 'bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.08]'
                    }`}>
                      <input type="checkbox" className="hidden" checked={formData.polishing.includes(opt)} onChange={() => handleCheckboxToggle('polishing', opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              {/* Warranty & Technician & Product details for Polishing */}
              {formData.polishing.length > 0 && (
                <div className="space-y-3 mt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
                      <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">ضمان التلميع:</span>
                      <input
                        type="number" min="0" placeholder="مدة الضمان"
                        value={formData.service_warranties.polishing?.duration || ''}
                        onChange={(e) => handleServiceWarrantyChange('polishing', 'duration', e.target.value)}
                        className="w-20 bg-white/[0.08] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold text-center outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <select
                        value={formData.service_warranties.polishing?.unit || 'years'}
                        onChange={(e) => handleServiceWarrantyChange('polishing', 'unit', e.target.value)}
                        className="bg-white/[0.08] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="years" className="bg-[#121212]">سنوات</option>
                        <option value="months" className="bg-[#121212]">أشهر</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#FF5C35]/10 border border-[#FF5C35]/30 rounded-xl">
                      <span className="material-symbols-outlined text-[#FF5C35] text-sm">engineering</span>
                      <span className="text-xs font-bold text-[#FF5C35] whitespace-nowrap">فني التلميع:</span>
                      <select
                        value={formData.service_technicians['polishing'] || ''}
                        onChange={e => handleServiceTechnicianChange('polishing', e.target.value)}
                        className="flex-1 bg-[#1a1a1a] border border-white/15 text-white text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-[#FF5C35]"
                      >
                        <option value="">اختر الفني...</option>
                        {techniciansList.map(tech => <option key={tech.id} value={tech.id}>{tech.full_name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                    <div>
                      <label className="block text-[11px] font-bold text-blue-400 mb-1">المنتج المستخدم / Product</label>
                      <input
                        type="text"
                        placeholder="مثال: Reflecto Polish"
                        value={formData.service_details?.polishing?.product || ''}
                        onChange={(e) => handleServiceDetailChange('polishing', 'product', e.target.value)}
                        className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-bold outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-purple-400 mb-1">الفئة / Product Model</label>
                      <input
                        type="text"
                        placeholder="مثال: Multi-Stage Polish"
                        value={formData.service_details?.polishing?.product_model || ''}
                        onChange={(e) => handleServiceDetailChange('polishing', 'product_model', e.target.value)}
                        className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-bold outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-400 mb-1">المساحة المشمولة / Coverage</label>
                      <input
                        type="text"
                        placeholder="مثال: هيكل السيارة الخارجي"
                        value={formData.service_details?.polishing?.coverage_area || ''}
                        onChange={(e) => handleServiceDetailChange('polishing', 'coverage_area', e.target.value)}
                        className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-bold outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Nano Ceramic */}
              <div>
                <h4 className="text-sm font-bold text-[#FF5C35] uppercase tracking-wider mb-3">نانو سيراميك (Nano Ceramic)</h4>
                <div className="flex flex-wrap gap-3">
                  {['داخلي', 'طبلون + أبواب', 'جنوط', 'خارجي (طبقة واحدة)', 'خارجي (طبقتين)', 'خارجي (3 طبقات)'].map(opt => (
                    <label key={opt} className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      formData.nano_ceramic.includes(opt)
                        ? 'bg-[#FF5C35] border-[#FF5C35] text-white shadow-lg'
                        : 'bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.08]'
                    }`}>
                      <input type="checkbox" className="hidden" checked={formData.nano_ceramic.includes(opt)} onChange={() => handleCheckboxToggle('nano_ceramic', opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              {/* Warranty & Technician & Product details for Nano Ceramic */}
              {formData.nano_ceramic.length > 0 && (
                <div className="space-y-3 mt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
                      <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">ضمان النانو:</span>
                      <input
                        type="number" min="0" placeholder="مدة الضمان"
                        value={formData.service_warranties.nano_ceramic?.duration || ''}
                        onChange={(e) => handleServiceWarrantyChange('nano_ceramic', 'duration', e.target.value)}
                        className="w-20 bg-white/[0.08] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold text-center outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <select
                        value={formData.service_warranties.nano_ceramic?.unit || 'years'}
                        onChange={(e) => handleServiceWarrantyChange('nano_ceramic', 'unit', e.target.value)}
                        className="bg-white/[0.08] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="years" className="bg-[#121212]">سنوات</option>
                        <option value="months" className="bg-[#121212]">أشهر</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#FF5C35]/10 border border-[#FF5C35]/30 rounded-xl">
                      <span className="material-symbols-outlined text-[#FF5C35] text-sm">engineering</span>
                      <span className="text-xs font-bold text-[#FF5C35] whitespace-nowrap">فني النانو سيراميك:</span>
                      <select
                        value={formData.service_technicians['nano_ceramic'] || ''}
                        onChange={e => handleServiceTechnicianChange('nano_ceramic', e.target.value)}
                        className="flex-1 bg-[#1a1a1a] border border-white/15 text-white text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-[#FF5C35]"
                      >
                        <option value="">اختر الفني...</option>
                        {techniciansList.map(tech => <option key={tech.id} value={tech.id}>{tech.full_name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                    <div>
                      <label className="block text-[11px] font-bold text-blue-400 mb-1">المنتج المستخدم / Product</label>
                      <input
                        type="text"
                        placeholder="مثال: Apeax Nano Ceramic"
                        value={formData.service_details?.nano_ceramic?.product || ''}
                        onChange={(e) => handleServiceDetailChange('nano_ceramic', 'product', e.target.value)}
                        className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-bold outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-purple-400 mb-1">الفئة / Product Model</label>
                      <input
                        type="text"
                        placeholder="مثال: 9H Hardness Pro"
                        value={formData.service_details?.nano_ceramic?.product_model || ''}
                        onChange={(e) => handleServiceDetailChange('nano_ceramic', 'product_model', e.target.value)}
                        className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-bold outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-400 mb-1">المساحة المشمولة / Coverage</label>
                      <input
                        type="text"
                        placeholder="مثال: الهيكل والجنوط والزجاج"
                        value={formData.service_details?.nano_ceramic?.coverage_area || ''}
                        onChange={(e) => handleServiceDetailChange('nano_ceramic', 'coverage_area', e.target.value)}
                        className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-bold outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PPF */}
              <div>
                <h4 className="text-sm font-bold text-[#FF5C35] uppercase tracking-wider mb-3">حماية PPF</h4>
                <div className="flex flex-wrap gap-3 mb-3">
                  {['شمعات', 'أطراف الأبواب + تحت المقابض', 'مرايا', 'جزئي', 'كامل'].map(opt => (
                    <label key={opt} className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      formData.ppf.includes(opt)
                        ? 'bg-[#FF5C35] border-[#FF5C35] text-white shadow-lg'
                        : 'bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.08]'
                    }`}>
                      <input type="checkbox" className="hidden" checked={formData.ppf.includes(opt)} onChange={() => handleCheckboxToggle('ppf', opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                {formData.ppf.includes('جزئي') && (
                  <div className="p-4 bg-white/[0.03] border border-[#FF5C35]/30 rounded-xl">
                    <label className={labelStyle}>تفاصيل الجزئي (Partial PPF Coverage Details)</label>
                    <input
                      type="text"
                      name="ppf_partial_details"
                      value={formData.ppf_partial_details}
                      onChange={handleInputChange}
                      placeholder="اكتب تفاصيل الجزئي هنا (مثلاً: كبوت + تندة)..."
                      className={inputStyle}
                    />
                  </div>
                )}
              {/* Warranty & Technician & Product details for PPF */}
              {formData.ppf.length > 0 && (
                <div className="space-y-3 mt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
                      <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">ضمان PPF:</span>
                      <input
                        type="number" min="0" placeholder="مدة الضمان"
                        value={formData.service_warranties.ppf?.duration || ''}
                        onChange={(e) => handleServiceWarrantyChange('ppf', 'duration', e.target.value)}
                        className="w-20 bg-white/[0.08] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold text-center outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <select
                        value={formData.service_warranties.ppf?.unit || 'years'}
                        onChange={(e) => handleServiceWarrantyChange('ppf', 'unit', e.target.value)}
                        className="bg-white/[0.08] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="years" className="bg-[#121212]">سنوات</option>
                        <option value="months" className="bg-[#121212]">أشهر</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#FF5C35]/10 border border-[#FF5C35]/30 rounded-xl">
                      <span className="material-symbols-outlined text-[#FF5C35] text-sm">engineering</span>
                      <span className="text-xs font-bold text-[#FF5C35] whitespace-nowrap">فني حماية PPF:</span>
                      <select
                        value={formData.service_technicians['ppf'] || ''}
                        onChange={e => handleServiceTechnicianChange('ppf', e.target.value)}
                        className="flex-1 bg-[#1a1a1a] border border-white/15 text-white text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-[#FF5C35]"
                      >
                        <option value="">اختر الفني...</option>
                        {techniciansList.map(tech => <option key={tech.id} value={tech.id}>{tech.full_name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                    <div>
                      <label className="block text-[11px] font-bold text-blue-400 mb-1">المنتج المستخدم / Product</label>
                      <input
                        type="text"
                        placeholder="مثال: Apeax PPF Film"
                        value={formData.service_details?.ppf?.product || ''}
                        onChange={(e) => handleServiceDetailChange('ppf', 'product', e.target.value)}
                        className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-bold outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-purple-400 mb-1">الفئة / Product Model</label>
                      <input
                        type="text"
                        placeholder="مثال: Ultra Self-Healing"
                        value={formData.service_details?.ppf?.product_model || ''}
                        onChange={(e) => handleServiceDetailChange('ppf', 'product_model', e.target.value)}
                        className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-bold outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-400 mb-1">المساحة المشمولة / Coverage</label>
                      <input
                        type="text"
                        placeholder="مثال: الواجهة الكبيرة بالكامل"
                        value={formData.service_details?.ppf?.coverage_area || ''}
                        onChange={(e) => handleServiceDetailChange('ppf', 'coverage_area', e.target.value)}
                        className="w-full bg-white/[0.08] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-bold outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}
              </div>

              {/* Removal */}
              <div>
                <h4 className="text-sm font-bold text-[#FF5C35] uppercase tracking-wider mb-3">إزالة (Removal Services)</h4>
                <div className="flex flex-wrap gap-3 mb-3">
                  {['عازل كامل', 'عازل جزئي', 'سيكورتي زجاج', 'ستيكرات', 'كامل PPF', 'جزئي PPF'].map(opt => (
                    <label key={opt} className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      formData.removal_services.includes(opt)
                        ? 'bg-[#FF5C35] border-[#FF5C35] text-white shadow-lg'
                        : 'bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.08]'
                    }`}>
                      <input type="checkbox" className="hidden" checked={formData.removal_services.includes(opt)} onChange={() => handleCheckboxToggle('removal_services', opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                {formData.removal_services.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-[#FF5C35]/10 border border-[#FF5C35]/30 rounded-xl">
                    <span className="material-symbols-outlined text-[#FF5C35] text-sm">engineering</span>
                    <span className="text-xs font-bold text-[#FF5C35] whitespace-nowrap">فني خدمات الإزالة:</span>
                    <select
                      value={formData.service_technicians['removal_services'] || ''}
                      onChange={e => handleServiceTechnicianChange('removal_services', e.target.value)}
                      className="flex-1 bg-[#1a1a1a] border border-white/15 text-white text-xs font-bold rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-[#FF5C35]"
                    >
                      <option value="">اختر الفني...</option>
                      {techniciansList.map(tech => <option key={tech.id} value={tech.id}>{tech.full_name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              </div>
            </fieldset>

            {/* Section 3: Financial Details */}
            <fieldset className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 shadow-2xl border-0">
              <legend className="text-lg font-bold font-headline text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#FF5C35] bg-[#FF5C35]/10 p-2 rounded-xl">payments</span>
                3. التكلفة والحسابات (Financial Breakdown)
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white/[0.03] p-6 rounded-2xl border border-white/10">
                {clientCompany && (
                  <div className="md:col-span-6 bg-[#FF5C35]/10 border border-[#FF5C35]/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/20 shrink-0">
                        {clientCompany.logo_url ? (
                          <img src={getCompanyLogoUrl(clientCompany.logo_url)} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <span className="material-symbols-outlined text-[#FF5C35]">domain</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <span>العميل تابع لجهة / شركة: {clientCompany.name}</span>
                          <span className="bg-[#FF5C35] text-white px-2 py-0.5 rounded text-[10px]">خصم {clientCompany.discount_percent}%</span>
                        </h4>
                        {clientCompany.custom_message && (
                          <p className="text-[11px] text-amber-200 mt-0.5">{clientCompany.custom_message}</p>
                        )}
                      </div>
                    </div>
                    {clientCompany.discount_percent > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const origPrice = formData.original_price || formData.price;
                          if (origPrice > 0) {
                            const discPercent = parseFloat(clientCompany.discount_percent || 0);
                            const discAmount = parseFloat(((origPrice * discPercent) / 100).toFixed(2));
                            const discountedPrice = parseFloat((origPrice - discAmount).toFixed(2));

                            setFormData(prev => ({
                              ...prev,
                              original_price: origPrice,
                              discount_percent: discPercent,
                              discount_amount: discAmount,
                              company_name: clientCompany.name
                            }));

                            handlePriceChange(discountedPrice);
                            toast.success(`تم تطبيق خصم شركة ${clientCompany.name} (${discPercent}%) بنجاح!`);
                          } else {
                            toast.warning('يرجى كتابة السعر الأصلي أولاً لتطبيق نسبة الخصم');
                          }
                        }}
                        className="px-4 py-2 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
                      >
                        تطبيق خصم الشركة ({clientCompany.discount_percent}%)
                      </button>
                    )}
                  </div>
                )}
                <div>
                  <label className={labelStyle}>طريقة / وسيلة الدفع *</label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    className={`${inputStyle} cursor-pointer font-bold`}
                  >
                    <option value="مدى (Mada)" className="bg-[#121212] text-white">مدى (Mada)</option>
                    <option value="فيزا / ماستركارد (Visa/Mastercard)" className="bg-[#121212] text-white">فيزا / ماستركارد (Visa/Mastercard)</option>
                    <option value="نقداً (Cash)" className="bg-[#121212] text-white">نقداً (Cash)</option>
                    <option value="تابي (Tabby)" className="bg-[#121212] text-white">تابي (Tabby)</option>
                    <option value="تمارا (Tamara)" className="bg-[#121212] text-white">تمارا (Tamara)</option>
                    <option value="تحويل بنكي (Bank Transfer)" className="bg-[#121212] text-white">تحويل بنكي (Bank Transfer)</option>
                    <option value="أخرى (Other)" className="bg-[#121212] text-white">أخرى (Other)</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>القيمة قبل الضريبة (SAR)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className={`${inputStyle} font-mono font-bold`}
                  />
                </div>

                <div>
                  <label className={labelStyle}>الضريبة (15%)</label>
                  <input
                    type="text"
                    value={`SAR ${vat_amount.toFixed(2)}`}
                    className={`${inputStyle} font-mono text-gray-400`}
                    readOnly
                  />
                </div>

                <div>
                  <label className={labelStyle}>الإجمالي الشامل للضريبة</label>
                  <input
                    type="number"
                    step="0.01"
                    name="total_amount"
                    value={formData.total_amount}
                    onChange={(e) => handleTotalChange(e.target.value)}
                    className={`${inputStyle} font-mono font-bold text-red-400`}
                  />
                </div>

                <div>
                  <label className={labelStyle}>المدفوع (Paid)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="paid_amount"
                    value={formData.paid_amount}
                    onChange={handleInputChange}
                    className={`${inputStyle} font-mono font-bold text-emerald-400`}
                  />
                </div>

                <div>
                  <label className={labelStyle}>المتبقي (Remaining)</label>
                  <input
                    type="text"
                    value={`SAR ${remaining_amount.toFixed(2)}`}
                    className={`${inputStyle} font-mono font-bold text-amber-400`}
                    readOnly
                  />
                </div>
              </div>
            </fieldset>

            {/* Section 4: Vehicle Details */}
            <fieldset className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 shadow-2xl border-0">
              <legend className="text-lg font-bold font-headline text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#FF5C35] bg-[#FF5C35]/10 p-2 rounded-xl">directions_car</span>
                4. بيانات المركبة والفحص الفني (Vehicle Details)
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className={labelStyle}>نوع / الماركة (Vehicle Brand) *</label>
                  <input type="text" name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} placeholder="Porsche / Mercedes..." className={inputStyle} required />
                </div>
                <div>
                  <label className={labelStyle}>الموديل (Model) *</label>
                  <input type="text" name="vehicle_model" value={formData.vehicle_model} onChange={handleInputChange} placeholder="911 GT3 RS / S-Class..." className={inputStyle} required />
                </div>
                <div>
                  <label className={labelStyle}>سنة الصنع (Year) *</label>
                  <input type="text" name="vehicle_year" value={formData.vehicle_year} onChange={handleInputChange} placeholder="2024" className={inputStyle} required />
                </div>
                <div>
                  <label className={labelStyle}>اللون (Color) *</label>
                  <input type="text" name="vehicle_color" value={formData.vehicle_color} onChange={handleInputChange} placeholder="أسود / أسمنتي..." className={inputStyle} required />
                </div>
                <div>
                  <label className={labelStyle}>رقم اللوحة (Plate Number) *</label>
                  <input type="text" name="vehicle_plate" value={formData.vehicle_plate} onChange={handleInputChange} placeholder="أ ب ج 1234" className={inputStyle} required />
                </div>
                <div>
                  <label className={labelStyle}>رقم الهيكل (Chassis VIN) (اختياري)</label>
                  <input type="text" name="chassis_number" value={formData.chassis_number} onChange={handleInputChange} placeholder="WP0ZZZ..." className={`${inputStyle} font-mono`} />
                </div>
                <div>
                  <label className={labelStyle}>قراءة الكيلومتر (Mileage KM) (اختياري)</label>
                  <input type="text" name="mileage_km" value={formData.mileage_km} onChange={handleInputChange} placeholder="15,000 KM" className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>حالة الطلب (Status)</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className={`${inputStyle} cursor-pointer`}>
                    <option value="pending" className="bg-[#121212] text-white">قيد الانتظار (Pending)</option>
                    <option value="in_progress" className="bg-[#121212] text-white">قيد التنفيذ (In Progress)</option>
                    <option value="completed" className="bg-[#121212] text-white">جاهز للتسليم (Completed)</option>
                    <option value="delivered" className="bg-[#121212] text-white">تم التسليم (Delivered)</option>
                  </select>
                </div>
              </div>

              {/* Inspection Checks - Interactive Car Diagram */}
              <div className="my-6">
              </div>

              <div>
                <label className={labelStyle}>ملاحظات الفحص والملاحظات العامة (Inspection Notes)</label>
                <textarea
                  name="inspection_notes"
                  rows={3}
                  value={formData.inspection_notes}
                  onChange={handleInputChange}
                  placeholder="سجل ملاحظات الصدمات أو الخدوش السابقة..."
                  className={inputStyle}
                ></textarea>
              </div>
            </fieldset>

            {/* Section 5: Signatures & Warranty */}
            <fieldset className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 shadow-2xl border-0">
              <legend className="text-lg font-bold font-headline text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#FF5C35] bg-[#FF5C35]/10 p-2 rounded-xl">verified</span>
                5. التوقيعات والضمان (Signatures & Warranty)
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className={labelStyle}>مسؤول الاستقبال</label>
                  <input type="text" name="reception_name" value={formData.reception_name} onChange={handleInputChange} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>المحاسب</label>
                  <input type="text" name="accountant_name" value={formData.accountant_name} onChange={handleInputChange} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>مدير المبيعات</label>
                  <input type="text" name="sales_manager_name" value={formData.sales_manager_name} onChange={handleInputChange} className={inputStyle} />
                </div>
              </div>

              <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_warranty"
                    checked={formData.has_warranty}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-[#FF5C35] rounded"
                  />
                  <span className="text-sm font-bold text-white">إضافة ضمان رقمي للخدمة (Issue Warranty Certificate)</span>
                </label>

                {formData.has_warranty && (
                  <div className="flex items-center gap-3">
                    <label className={`${labelStyle} mb-0 whitespace-nowrap`}>عدد سنوات الضمان:</label>
                    <input
                      type="number"
                      name="warranty_years"
                      value={formData.warranty_years}
                      onChange={handleInputChange}
                      className={`${inputStyle} w-24 text-center font-mono`}
                    />
                  </div>
                )}
              </div>
            </fieldset>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/orders')}
                className="px-8 py-4 bg-white/[0.05] hover:bg-white/10 text-white font-bold text-sm rounded-2xl transition-all cursor-pointer"
              >
                إلغاء (Cancel)
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-10 py-4 bg-gradient-to-r from-[#FF5C35] to-[#ff8060] hover:brightness-110 text-white font-bold text-sm rounded-2xl shadow-xl transition-all flex items-center gap-3 cursor-pointer disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-lg">save</span>
                )}
                <span>حفظ التعديلات (Save Changes)</span>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
});

export default EditOrder;
