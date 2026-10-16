import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { pricingService, servicesService, clientService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';

const AddPackage = React.memo(() => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form State 
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [price, setPrice] = useState('');
  const [warranty, setWarranty] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [packageType, setPackageType] = useState('general'); // 'general', 'service', or 'special'
  const [selectedServiceId, setSelectedServiceId] = useState('');

  // Client Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSearchingClients, setIsSearchingClients] = useState(false);

  // Dynamic features list
  const [featuresEn, setFeaturesEn] = useState(['']);
  const [featuresAr, setFeaturesAr] = useState(['']);

  // Fetch services for dropdown
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ['services'],
    queryFn: servicesService.getAll,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Safely extract services array from response
  const services = Array.isArray(servicesData) ? servicesData : (servicesData?.data || []);

  const handleSearchClients = async (q) => {
    setSearchQuery(q);
    if (!q || q.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    setIsSearchingClients(true);
    try {
      const res = await clientService.search(q);
      setSearchResults(res?.data || []);
    } catch (err) {
      console.error('Failed to search clients:', err);
    } finally {
      setIsSearchingClients(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data) => pricingService.create(data),
    onSuccess: () => {
      toast.success('Package published successfully!');
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      navigate('/admin/edit-package');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to publish package');
    }
  });

  const handlePublish = useCallback(() => {
    const finalNameEn = nameEn.trim() || nameAr.trim();
    const finalNameAr = nameAr.trim() || nameEn.trim();

    if (!finalNameEn || !price) {
      toast.warning('يرجى كتابة اسم الباقة والسعر.');
      return;
    }
    if (packageType === 'service' && !selectedServiceId) {
      toast.warning('Please select a service for the package.');
      return;
    }
    if (packageType === 'special' && !selectedClient) {
      toast.warning('Please select a client for the package.');
      return;
    }

    // Filter out empty features
    const cleanFeaturesEn = featuresEn.filter(f => f.trim() !== '');
    const cleanFeaturesAr = featuresAr.filter(f => f.trim() !== '');

    createMutation.mutate({
      name_en: finalNameEn,
      name_ar: finalNameAr,
      tagline_en: descriptionEn,
      tagline_ar: descriptionAr,
      price: parseFloat(price) || 0,
      warranty_years: parseInt(warranty) || 0,
      features_en: cleanFeaturesEn,
      features_ar: cleanFeaturesAr,
      service_id: packageType === 'service' ? selectedServiceId : null,
      client_id: packageType === 'special' && selectedClient ? selectedClient.id : null
    });
  }, [nameEn, nameAr, price, warranty, descriptionEn, descriptionAr, featuresEn, featuresAr, packageType, selectedServiceId, selectedClient, createMutation, toast]);

  // English Features helper functions
  const handleFeatureEnChange = (index, value) => {
    const updated = [...featuresEn];
    updated[index] = value;
    setFeaturesEn(updated);
  };

  const addFeatureEn = () => {
    setFeaturesEn([...featuresEn, '']);
  };

  const removeFeatureEn = (index) => {
    const updated = featuresEn.filter((_, i) => i !== index);
    setFeaturesEn(updated.length > 0 ? updated : ['']);
  };

  // Arabic Features helper functions
  const handleFeatureArChange = (index, value) => {
    const updated = [...featuresAr];
    updated[index] = value;
    setFeaturesAr(updated);
  };

  const addFeatureAr = () => {
    setFeaturesAr([...featuresAr, '']);
  };

  const removeFeatureAr = (index) => {
    const updated = featuresAr.filter((_, i) => i !== index);
    setFeaturesAr(updated.length > 0 ? updated : ['']);
  };

  return (
    <div className="flex bg-[#000000] min-h-[calc(100vh-5rem)] font-body text-[#e5e2e1] selection:bg-[#FF5C35]/30 relative mt-16 md:mt-0">
      <AdminSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 w-full max-w-7xl mx-auto" aria-labelledby="add-package-heading">
        <div className="max-w-6xl mx-auto pb-24 relative">
          
          {/* Breadcrumbs */}
          <nav className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4" aria-label="Breadcrumb">
            <Link to="/admin" className="hover:text-gray-300 cursor-pointer transition-colors focus:outline-none focus:underline">
              Packages
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-[#FF5C35]" aria-current="page">Add Package</span>
          </nav>
          
          <h1 id="add-package-heading" className="text-4xl font-display font-black tracking-tight text-white mb-8">
            Create New Package | إضافة باقة جديدة
          </h1>

          {/* Form Container */}
          <div className="space-y-8">
            {/* Package Details Section */}
            <section className="bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-2xl p-8 border-0" aria-labelledby="package-details-heading">
              <h2 id="package-details-heading" className="text-lg font-bold text-white mb-8 tracking-widest uppercase flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF5C35]/10 shadow-inner flex items-center justify-center text-[#FF5C35]" aria-hidden="true">
                  <span className="material-symbols-outlined text-sm">settings</span>
                </div>
                Package Details / تفاصيل الباقة
              </h2>

              {/* Package Type Selection */}
              <div className="mb-8 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Package Scope / نطاق الباقة
                </span>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="packageType" 
                      value="general" 
                      checked={packageType === 'general'} 
                      onChange={() => { setPackageType('general'); setSelectedClient(null); }}
                      className="text-[#FF5C35] focus:ring-[#FF5C35]"
                    />
                    <span className="text-sm font-bold text-white font-body">General Package (باقة عامة)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="packageType" 
                      value="service" 
                      checked={packageType === 'service'} 
                      onChange={() => { setPackageType('service'); setSelectedClient(null); }}
                      className="text-[#FF5C35] focus:ring-[#FF5C35]"
                    />
                    <span className="text-sm font-bold text-white font-body">Service Specific (سعر خدمة معينة)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="packageType" 
                      value="special" 
                      checked={packageType === 'special'} 
                      onChange={() => { setPackageType('special'); }}
                      className="text-[#FF5C35] focus:ring-[#FF5C35]"
                    />
                    <span className="text-sm font-bold text-white font-body">Special for Client (باقة مخصصة لعميل)</span>
                  </label>
                </div>
              </div>

              {/* Client Search Section */}
              {packageType === 'special' && (
                <div className="mb-8 space-y-4">
                  <label htmlFor="clientSearch" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Search Client (Phone or Name) / ابحث عن العميل (بالاسم أو الهاتف) *
                  </label>
                  
                  {!selectedClient ? (
                    <div className="relative">
                      <input
                        id="clientSearch"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchClients(e.target.value)}
                        placeholder="Search by phone number (e.g. 050...) or name"
                        className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-gray-600 focus:ring-2 focus:ring-[#FF5C35]/50 focus:outline-none transition-all"
                      />
                      {isSearchingClients && (
                        <div className="absolute right-4 top-3.5">
                          <div className="w-4 h-4 border-2 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      
                      {searchResults.length > 0 && (
                        <ul className="absolute z-50 w-full mt-2 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
                          {searchResults.map((cli) => (
                            <li key={cli.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedClient(cli);
                                  setSearchResults([]);
                                  setSearchQuery('');
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-[#FF5C35]/10 hover:text-white transition-all border-b border-white/5 flex flex-col gap-1 text-sm text-gray-300 font-bold"
                              >
                                <span className="text-white">{cli.full_name}</span>
                                <span className="text-xs text-gray-500 font-semibold">{cli.phone} {cli.vehicle ? `(${cli.vehicle})` : ''}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-[#FF5C35]/10 border border-[#FF5C35]/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#FF5C35]/20 flex items-center justify-center text-[#FF5C35]">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{selectedClient.full_name}</div>
                          <div className="text-xs text-gray-400 font-semibold">{selectedClient.phone} {selectedClient.vehicle ? `(${selectedClient.vehicle})` : ''}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedClient(null)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-all"
                      >
                        Change / تغيير
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Service Dropdown */}
              {packageType === 'service' && (
                <div className="mb-8 space-y-2">
                  <label htmlFor="serviceSelect" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Select Related Service / اختر الخدمة المرتبطة *
                  </label>
                  {servicesError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      Failed to load services. Please refresh the page.
                    </div>
                  )}
                  <select
                    id="serviceSelect"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    disabled={servicesLoading}
                    className="w-full bg-[#1c1b1b]/80 backdrop-blur-md shadow-inner border-0 rounded-xl py-3 px-4 text-sm font-bold text-[#e5e2e1] focus:ring-2 focus:ring-[#FF5C35]/50 focus:outline-none transition-all outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {servicesLoading ? '⏳ Loading services...' : services.length === 0 ? '❌ No services available' : '— Select Service —'}
                    </option>
                    {services.map((srv) => (
                      <option key={srv.id || srv.uuid} value={srv.id || srv.uuid}>
                        {srv.name_en || srv.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div className="space-y-2">
                  <label htmlFor="packageNameEn" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Package Name (English) *
                  </label>
                  <input
                    id="packageNameEn"
                    className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-gray-600 focus:ring-2 focus:ring-[#FF5C35]/50 focus:outline-none transition-all"
                    placeholder="e.g. Ultimate Protection"
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="packageNameAr" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                    * اسم الباقة (العربية)
                  </label>
                  <input
                    id="packageNameAr"
                    className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-gray-600 focus:ring-2 focus:ring-[#FF5C35]/50 focus:outline-none transition-all text-right"
                    placeholder="مثال: الباقة الماسية"
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="price" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Price (SAR) *
                  </label>
                  <input
                    id="price"
                    className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-gray-600 focus:ring-2 focus:ring-[#FF5C35]/50 focus:outline-none transition-all"
                    placeholder="e.g. 1200.00"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="warranty" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Warranty (Years) / الضمان (سنوات)
                  </label>
                  <input
                    id="warranty"
                    className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-gray-600 focus:ring-2 focus:ring-[#FF5C35]/50 focus:outline-none transition-all"
                    placeholder="e.g. 5"
                    type="number"
                    min="0"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Description Section */}
            <section className="bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-2xl p-8 border-0" aria-labelledby="description-heading">
              <h2 id="description-heading" className="text-lg font-bold text-white mb-8 tracking-widest uppercase flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF5C35]/10 shadow-inner flex items-center justify-center text-[#FF5C35]" aria-hidden="true">
                  <span className="material-symbols-outlined text-sm">description</span>
                </div>
                Subtitles & Marketing Copy / وصف وعنوان فرعي
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="descriptionEn" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Tagline / Subtitle (English)
                  </label>
                  <textarea
                    id="descriptionEn"
                    className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl py-4 px-4 text-sm font-bold tracking-wide text-white placeholder:text-gray-600 focus:ring-2 focus:ring-[#FF5C35]/50 focus:outline-none resize-none transition-all leading-relaxed"
                    placeholder="E.g. Essential protection for daily drivers..."
                    rows="3"
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="descriptionAr" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                    الوصف أو العنوان الفرعي (العربية)
                  </label>
                  <textarea
                    id="descriptionAr"
                    className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl py-4 px-4 text-sm font-bold tracking-wide text-white placeholder:text-gray-600 focus:ring-2 focus:ring-[#FF5C35]/50 focus:outline-none resize-none transition-all leading-relaxed text-right"
                    placeholder="مثال: حماية أساسية لسيارات الاستخدام اليومي..."
                    rows="3"
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Features (Points) Section */}
            <section className="bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-2xl p-8 border-0" aria-labelledby="features-heading">
              <h2 id="features-heading" className="text-lg font-bold text-white mb-8 tracking-widest uppercase flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF5C35]/10 shadow-inner flex items-center justify-center text-[#FF5C35]" aria-hidden="true">
                  <span className="material-symbols-outlined text-sm">checklist</span>
                </div>
                Package Features (Points) / خدمات ومميزات الباقة (نقاط تحت بعضها)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* English Features */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#FF5C35] uppercase tracking-wider mb-2">Features (English)</h3>
                  {featuresEn.map((feat, index) => (
                    <div key={`feat-en-${index}`} className="flex items-center gap-3">
                      <span className="text-[#FF5C35] font-bold">{index + 1}.</span>
                      <input
                        className="flex-1 bg-white/[0.05] shadow-inner border-0 rounded-lg py-2.5 px-4 text-sm font-bold text-white placeholder-gray-600 focus:ring-2 focus:ring-[#FF5C35]/50 focus:outline-none transition-all"
                        placeholder="e.g. 9H Surface Hardness"
                        value={feat}
                        onChange={(e) => handleFeatureEnChange(index, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeFeatureEn(index)}
                        className="text-gray-500 hover:text-red-500 transition-colors p-1"
                        aria-label="Remove point"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeatureEn}
                    className="text-[#FF5C35] bg-[#FF5C35]/10 shadow-inner rounded-xl px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#FF5C35]/20 transition-all flex items-center gap-2 mt-2"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Point (EN)
                  </button>
                </div>

                {/* Arabic Features */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#FF5C35] uppercase tracking-wider mb-2 text-right">المميزات (العربية)</h3>
                  {featuresAr.map((feat, index) => (
                    <div key={`feat-ar-${index}`} className="flex items-center gap-3 dir-rtl">
                      <span className="text-[#FF5C35] font-bold">{index + 1}.</span>
                      <input
                        className="flex-1 bg-white/[0.05] shadow-inner border-0 rounded-lg py-2.5 px-4 text-sm font-bold text-white placeholder-gray-600 focus:ring-2 focus:ring-[#FF5C35]/50 focus:outline-none transition-all text-right"
                        placeholder="مثال: صلابة سطح 9H"
                        value={feat}
                        onChange={(e) => handleFeatureArChange(index, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeFeatureAr(index)}
                        className="text-gray-500 hover:text-red-500 transition-colors p-1"
                        aria-label="إزالة نقطة"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeatureAr}
                    className="text-[#FF5C35] bg-[#FF5C35]/10 shadow-inner rounded-xl px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#FF5C35]/20 transition-all flex items-center gap-2 mt-2 ml-auto"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    إضافة نقطة (AR)
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <footer className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-10">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-full sm:w-auto px-10 py-3.5 bg-white/[0.05] shadow-inner rounded-xl text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/[0.1] transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handlePublish}
              disabled={createMutation.isPending}
              className="w-full sm:w-auto px-10 py-3.5 bg-[#FF5C35] rounded-xl text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-[0_8px_30px_rgba(255,92,53,0.3)] active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {createMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
              ) : (
                <span className="material-symbols-outlined text-sm">publish</span>
              )}
              Publish Package / نشر الباقة
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
});

export default AddPackage;
