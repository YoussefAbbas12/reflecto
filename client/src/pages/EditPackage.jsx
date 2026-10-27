import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingService, servicesService, clientService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAdminTheme } from '../contexts/AdminThemeContext';
import { useLanguage } from '../hooks/useLanguage';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';

const EditPackage = React.memo(() => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();
  const params = useParams();
  const { isLight } = useAdminTheme();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const searchParams = new URLSearchParams(location.search);
  const paramId = searchParams.get('id') || params.id;
  
  const [selectedPackageId, setSelectedPackageId] = useState(paramId || '');
  
  useEffect(() => {
    if (paramId) {
      setSelectedPackageId(paramId);
    }
  }, [paramId]);
  const [generalPackageId, setGeneralPackageId] = useState('');
  const [specialPackageId, setSpecialPackageId] = useState('');
  
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

  // Fetch all packages
  const { data: packagesData, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['pricing'],
    queryFn: pricingService.getAll,
  });

  // Fetch services for dropdown
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: servicesService.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const packages = packagesData?.data || packagesData || [];
  const services = servicesData?.data || [];

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

  // When a package is selected, populate the form with ALL fields
  useEffect(() => {
    if (selectedPackageId && packages.length > 0) {
      const pkg = packages.find(p => (p.id || p.uuid) === selectedPackageId);
      if (pkg) {
        setNameEn(pkg.name_en || pkg.name || '');
        setNameAr(pkg.name_ar || '');
        setPrice(pkg.price || '');
        setWarranty(pkg.warranty_years || '');
        setDescriptionEn(pkg.tagline_en || pkg.description || '');
        setDescriptionAr(pkg.tagline_ar || '');
        setSelectedServiceId(pkg.service_id || '');
        setSelectedClient(pkg.client_id ? { id: pkg.client_id, full_name: pkg.client_name, phone: pkg.client_phone } : null);
        setPackageType(pkg.client_id ? 'special' : (pkg.service_id ? 'service' : 'general'));
        
        setFeaturesEn(pkg.features_en && pkg.features_en.length > 0 ? pkg.features_en : ['']);
        setFeaturesAr(pkg.features_ar && pkg.features_ar.length > 0 ? pkg.features_ar : ['']);
      }
    }
  }, [selectedPackageId, packages]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => pricingService.update(selectedPackageId, data),
    onSuccess: () => {
      toast.success('Package updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update package');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => pricingService.remove(id),
    onSuccess: () => {
      toast.success('Package deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      setSelectedPackageId('');
      setGeneralPackageId('');
      setSpecialPackageId('');
      setNameEn('');
      setNameAr('');
      setPrice('');
      setWarranty('');
      setDescriptionEn('');
      setDescriptionAr('');
      setFeaturesEn(['']);
      setFeaturesAr(['']);
      setSelectedServiceId('');
      setSelectedClient(null);
      setPackageType('general');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete package');
    }
  });

  const handleDelete = useCallback(() => {
    if (!selectedPackageId) {
      toast.warning('Please select a package first.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      deleteMutation.mutate(selectedPackageId);
    }
  }, [selectedPackageId, deleteMutation, toast]);

  const handleSave = useCallback(() => {
    if (!selectedPackageId) {
      toast.warning('Please select a package first.');
      return;
    }

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

    const cleanFeaturesEn = featuresEn.filter(f => f.trim() !== '');
    const cleanFeaturesAr = featuresAr.filter(f => f.trim() !== '');

    updateMutation.mutate({
      name_en: finalNameEn,
      name_ar: finalNameAr,
      tagline_en: descriptionEn,
      tagline_ar: descriptionAr,
      price: parseFloat(price) || 0,
      warranty_years: parseInt(warranty) || 0,
      features_en: cleanFeaturesEn,
      features_ar: cleanFeaturesAr,
      service_id: packageType === 'service' ? selectedServiceId : null,
      client_id: packageType === 'special' && selectedClient ? selectedClient.id : null,
    });
  }, [selectedPackageId, nameEn, nameAr, price, warranty, descriptionEn, descriptionAr, featuresEn, featuresAr, packageType, selectedServiceId, selectedClient, toast, updateMutation]);

  const handleDiscard = useCallback(() => {
    if (selectedPackageId && packages.length > 0) {
      const pkg = packages.find(p => (p.id || p.uuid) === selectedPackageId);
      if (pkg) {
        setNameEn(pkg.name_en || pkg.name || '');
        setNameAr(pkg.name_ar || '');
        setPrice(pkg.price || '');
        setWarranty(pkg.warranty_years || '');
        setDescriptionEn(pkg.tagline_en || pkg.description || '');
        setDescriptionAr(pkg.tagline_ar || '');
        setSelectedServiceId(pkg.service_id || '');
        setSelectedClient(pkg.client_id ? { id: pkg.client_id, full_name: pkg.client_name, phone: pkg.client_phone } : null);
        setPackageType(pkg.client_id ? 'special' : (pkg.service_id ? 'service' : 'general'));
        
        setFeaturesEn(pkg.features_en && pkg.features_en.length > 0 ? pkg.features_en : ['']);
        setFeaturesAr(pkg.features_ar && pkg.features_ar.length > 0 ? pkg.features_ar : ['']);
      }
    }
  }, [selectedPackageId, packages]);

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
    <div className={`flex font-body relative mt-16 min-h-screen transition-colors duration-300 ${
      isLight ? 'bg-[#F8FAFC] text-gray-900' : 'bg-[#131313] text-[#e5e2e1]'
    }`}>
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <style dangerouslySetInnerHTML={{__html: `
          .ink-pool-gradient {
              background: linear-gradient(to bottom right, #000000, #131b2e);
          }
        `}} />

        <main className="flex-1 pb-20 overflow-y-auto" aria-labelledby="edit-package-heading">
          <div className="p-4 md:p-10 max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              <div>
                <h1 id="edit-package-heading" className={`text-4xl font-extrabold tracking-tight font-headline ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>
                  Edit Package / تعديل باقة
                </h1>
                <p className={`mt-2 text-sm ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>Select a package from one of the dropdowns to edit its details and features.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  type="button"
                  onClick={handleDelete}
                  disabled={!selectedPackageId || deleteMutation.isPending}
                  className={`px-6 py-2.5 rounded-xl transition-all font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 ${
                    isLight
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-red-500/10 text-red-300 hover:bg-red-500/20'
                  }`}
                >
                  {deleteMutation.isPending && <div className="inline-block w-4 h-4 border-2 border-red-300/50 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>}
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Delete Package
                </button>
                <button 
                  type="button"
                  onClick={handleDiscard}
                  disabled={!selectedPackageId}
                  className={`px-6 py-2.5 rounded-xl transition-all font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                    isLight
                      ? 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      : 'text-[#e5e2e1] shadow-inner hover:bg-white/[0.05]'
                  }`}
                >
                  Discard Changes
                </button>
                <button 
                  type="button"
                  onClick={handleSave}
                  disabled={!selectedPackageId || updateMutation.isPending}
                  className="px-8 py-2.5 rounded-xl bg-[#5C24EB] text-white font-semibold text-sm shadow-[0_8px_30px_rgba(92,36,235,0.3)] hover:brightness-110 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {updateMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>}
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Package / حفظ التعديلات
                </button>
              </div>
            </header>

            {/* Package Selector Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Dropdown 1: General/Service */}
              <section className={`rounded-xl p-6 shadow-2xl relative overflow-hidden transition-colors ${
                isLight ? 'bg-white border border-gray-200' : 'bg-[#0e0e0e]/80 backdrop-blur-xl'
              }`} aria-label="General/Service Packages">
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-[#8B5CF6]">
                  <span className="material-symbols-outlined text-sm">inventory_2</span>
                  General & Service Packages / الباقات العامة وباقات الخدمات
                </h2>
                <select
                  id="package-select-general"
                  value={generalPackageId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGeneralPackageId(val);
                    if (val) {
                      setSpecialPackageId('');
                      setSelectedPackageId(val);
                    } else if (!specialPackageId) {
                      setSelectedPackageId('');
                    }
                  }}
                  className={`w-full rounded-lg p-3 focus:ring-2 focus:ring-[#5C24EB]/50 transition-all font-medium outline-none cursor-pointer appearance-none text-sm border-0 ${
                    isLight ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'bg-[#1c1b1b]/80 backdrop-blur-md shadow-inner text-[#e5e2e1]'
                  }`}
                >
                  <option value="">
                    {isLoadingPackages ? 'Loading packages...' : '— Select a standard package —'}
                  </option>
                  {packages.filter(p => !p.client_id).map((pkg) => (
                    <option key={pkg.id || pkg.uuid} value={pkg.id || pkg.uuid}>
                      {pkg.name_en || pkg.name || 'Unnamed'} — {pkg.price || 0} SAR {pkg.service_id ? `(${services.find(s => (s.id || s.uuid) === pkg.service_id)?.name_en || 'Service'})` : '(General)'}
                    </option>
                  ))}
                </select>
              </section>

              {/* Dropdown 2: Special/Client-specific */}
              <section className={`rounded-xl p-6 shadow-2xl relative overflow-hidden transition-colors ${
                isLight ? 'bg-white border border-gray-200' : 'bg-[#0e0e0e]/80 backdrop-blur-xl'
              }`} aria-label="Client Special Packages">
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-[#8B5CF6]">
                  <span className="material-symbols-outlined text-sm">stars</span>
                  Client Special Packages / الباقات الخاصة للعملاء
                </h2>
                <select
                  id="package-select-special"
                  value={specialPackageId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSpecialPackageId(val);
                    if (val) {
                      setGeneralPackageId('');
                      setSelectedPackageId(val);
                    } else if (!generalPackageId) {
                      setSelectedPackageId('');
                    }
                  }}
                  className={`w-full rounded-lg p-3 focus:ring-2 focus:ring-[#5C24EB]/50 transition-all font-medium outline-none cursor-pointer appearance-none text-sm border-0 ${
                    isLight ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'bg-[#1c1b1b]/80 backdrop-blur-md shadow-inner text-[#e5e2e1]'
                  }`}
                >
                  <option value="">
                    {isLoadingPackages ? 'Loading packages...' : '— Select a special package —'}
                  </option>
                  {packages.filter(p => p.client_id).map((pkg) => (
                    <option key={pkg.id || pkg.uuid} value={pkg.id || pkg.uuid}>
                      {pkg.name_en || pkg.name || 'Unnamed'} — {pkg.price || 0} SAR (Client: {pkg.client_name || 'N/A'} - {pkg.client_phone || 'N/A'})
                    </option>
                  ))}
                </select>
              </section>
            </div>

            {/* Form Fields */}
            {selectedPackageId ? (
              <>
                {/* Package Type Selection */}
                <div className={`mb-6 p-4 rounded-xl border ${
                  isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0e0e0e]/80 backdrop-blur-xl border-white/5'
                }`}>
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Package Scope / نطاق الباقة
                  </span>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="packageType" 
                        value="general" 
                        checked={packageType === 'general'} 
                        onChange={() => { setPackageType('general'); setSelectedClient(null); setSelectedServiceId(''); }}
                        className="text-[#8B5CF6] focus:ring-[#5C24EB]"
                      />
                      <span className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>General Package (باقة عامة)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="packageType" 
                        value="service" 
                        checked={packageType === 'service'} 
                        onChange={() => {
                          setPackageType('service');
                          setSelectedClient(null);
                          if (services.length > 0 && !selectedServiceId) {
                            setSelectedServiceId(services[0].id || services[0].uuid);
                          }
                        }}
                        className="text-[#8B5CF6] focus:ring-[#5C24EB]"
                      />
                      <span className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>Service Specific (سعر خدمة معينة)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="packageType" 
                        value="special" 
                        checked={packageType === 'special'} 
                        onChange={() => { setPackageType('special'); setSelectedServiceId(''); }}
                        className="text-[#8B5CF6] focus:ring-[#5C24EB]"
                      />
                      <span className={`text-sm font-bold font-body ${isLight ? 'text-gray-800' : 'text-white'}`}>Special for Client (باقة مخصصة لعميل)</span>
                    </label>
                  </div>
                </div>

                {/* Conditional Client Search Section */}
                {packageType === 'special' && (
                  <div className={`mb-6 p-4 rounded-xl border space-y-4 ${
                    isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0e0e0e]/80 backdrop-blur-xl border-white/5'
                  }`}>
                    <label htmlFor="clientSearch" className={`block text-xs font-bold uppercase tracking-widest ${
                      isLight ? 'text-gray-600' : 'text-gray-400'
                    }`}>
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
                          className={`w-full rounded-md p-3 focus:ring-2 focus:ring-[#5C24EB]/50 focus:outline-none transition-all ${
                            isLight ? 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-[#353534]/50 border-0 shadow-inner text-[#e5e2e1]'
                          }`}
                        />
                        {isSearchingClients && (
                          <div className="absolute right-4 top-3">
                            <div className="w-4 h-4 border-2 border-[#5C24EB] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        
                        {searchResults.length > 0 && (
                          <ul className={`absolute z-50 w-full mt-2 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto border ${
                            isLight ? 'bg-white border-gray-200' : 'bg-[#0e0e0e] border-white/10'
                          }`}>
                            {searchResults.map((cli) => (
                              <li key={cli.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedClient(cli);
                                    setSearchResults([]);
                                    setSearchQuery('');
                                  }}
                                  className={`w-full text-left px-4 py-3 hover:bg-[#5C24EB]/10 transition-all border-b flex flex-col gap-1 text-sm font-bold ${
                                    isLight ? 'border-gray-100 text-gray-700' : 'border-white/5 text-gray-300 hover:text-white'
                                  }`}
                                >
                                  <span className={isLight ? 'text-gray-900' : 'text-white'}>{cli.full_name}</span>
                                  <span className="text-xs text-gray-500 font-semibold">{cli.phone} {cli.vehicle ? `(${cli.vehicle})` : ''}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-[#5C24EB]/10 border border-[#5C24EB]/30 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[#5C24EB]/20 flex items-center justify-center text-[#8B5CF6]">
                            <span className="material-symbols-outlined">person</span>
                          </div>
                          <div>
                            <div className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{selectedClient.full_name}</div>
                            <div className="text-xs text-gray-400 font-semibold">{selectedClient.phone} {selectedClient.vehicle ? `(${selectedClient.vehicle})` : ''}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedClient(null)}
                          className="px-3 py-1.5 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-all border border-red-200"
                        >
                          Change / تغيير
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditional Service Selection Dropdown */}
                {packageType === 'service' && !!selectedServiceId && (
                  <div className="mb-6">
                    <label htmlFor="service-select" className={`block text-xs font-bold uppercase tracking-widest mb-1 ${
                      isLight ? 'text-[#5C24EB]' : 'text-[#e3beb8]'
                    }`}>
                      Service *
                    </label>
                    <select
                      id="service-select"
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className={`w-full rounded-md p-3 focus:ring-2 focus:ring-[#5C24EB]/50 transition-all outline-none cursor-pointer ${
                        isLight ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-[#353534]/50 backdrop-blur-md border-0 text-[#e5e2e1]'
                      }`}
                      disabled={servicesLoading}
                    >
                      <option value="">Select a service</option>
                      {services?.map((srv) => (
                        <option key={srv.id || srv.uuid} value={srv.id || srv.uuid}>
                          {srv.name_en || srv.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              <div className="space-y-6">
                {/* Core Config */}
                <section className={`rounded-xl p-8 shadow-2xl relative overflow-hidden transition-colors ${
                  isLight ? 'bg-white border border-gray-200' : 'bg-[#0e0e0e]/80 backdrop-blur-xl'
                }`}>
                  <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
                    isLight ? 'text-gray-900' : 'text-white'
                  }`}>
                    <span className={`material-symbols-outlined ${
                      isLight ? 'text-[#5C24EB]' : 'text-[#ffb4a7]'
                    }`}>settings</span>
                    Core Configuration / البيانات الأساسية
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="nameEn" className={`text-xs font-bold uppercase tracking-widest px-1 ${
                        isLight ? 'text-gray-600' : 'text-[#e3beb8]'
                      }`}>Package Title (EN)</label>
                      <input 
                        id="nameEn"
                        className={`w-full rounded-md p-3 focus:ring-2 focus:ring-[#5C24EB]/50 transition-all font-medium outline-none ${
                          isLight ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-[#353534]/50 backdrop-blur-md border-0 shadow-inner text-[#e5e2e1]'
                        }`}
                        type="text" 
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 text-right dir-rtl">
                      <label htmlFor="nameAr" className={`text-xs font-bold uppercase tracking-widest px-1 block mb-2 ${
                        isLight ? 'text-gray-600' : 'text-[#e3beb8]'
                      }`}>* اسم الباقة (العربية)</label>
                      <input 
                        id="nameAr"
                        className={`w-full rounded-md p-3 focus:ring-2 focus:ring-[#5C24EB]/50 transition-all font-medium outline-none text-right ${
                          isLight ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-[#353534]/50 backdrop-blur-md border-0 shadow-inner text-[#e5e2e1]'
                        }`}
                        type="text" 
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-2">
                      <label htmlFor="price" className={`text-xs font-bold uppercase tracking-widest px-1 ${
                        isLight ? 'text-gray-600' : 'text-[#e3beb8]'
                      }`}>Price (SAR)</label>
                      <input 
                        id="price"
                        className={`w-full rounded-md p-3 focus:ring-2 focus:ring-[#5C24EB]/50 transition-all font-medium outline-none ${
                          isLight ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-[#353534]/50 backdrop-blur-md border-0 shadow-inner text-[#e5e2e1]'
                        }`}
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="warranty" className={`text-xs font-bold uppercase tracking-widest px-1 ${
                        isLight ? 'text-gray-600' : 'text-[#e3beb8]'
                      }`}>Warranty (Years) / الضمان</label>
                      <input 
                        id="warranty"
                        className={`w-full rounded-md p-3 focus:ring-2 focus:ring-[#5C24EB]/50 transition-all font-medium outline-none ${
                          isLight ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-[#353534]/50 backdrop-blur-md border-0 shadow-inner text-[#e5e2e1]'
                        }`}
                        type="number" 
                        value={warranty}
                        onChange={(e) => setWarranty(e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                {/* Taglines / Descriptions */}
                <section className={`rounded-xl p-8 shadow-2xl relative overflow-hidden transition-colors ${
                  isLight ? 'bg-white border border-gray-200' : 'bg-[#0e0e0e]/80 backdrop-blur-xl'
                }`}>
                  <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
                    isLight ? 'text-gray-900' : 'text-white'
                  }`}>
                    <span className={`material-symbols-outlined ${
                      isLight ? 'text-[#5C24EB]' : 'text-[#ffb4a7]'
                    }`}>description</span>
                    Subtitle & Description / الوصف
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="descEn" className={`text-xs font-bold uppercase tracking-widest px-1 ${
                        isLight ? 'text-gray-600' : 'text-[#e3beb8]'
                      }`}>Tagline (EN)</label>
                      <textarea 
                        id="descEn"
                        className={`w-full rounded-md p-3 focus:ring-2 focus:ring-[#5C24EB]/50 transition-all outline-none resize-y min-h-[100px] ${
                          isLight ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-[#353534]/50 backdrop-blur-md border-0 shadow-inner text-[#e5e2e1]'
                        }`}
                        rows="3"
                        value={descriptionEn}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 text-right dir-rtl">
                      <label htmlFor="descAr" className={`text-xs font-bold uppercase tracking-widest px-1 block mb-2 ${
                        isLight ? 'text-gray-600' : 'text-[#e3beb8]'
                      }`}>العنوان الفرعي أو الوصف (AR)</label>
                      <textarea 
                        id="descAr"
                        className={`w-full rounded-md p-3 focus:ring-2 focus:ring-[#5C24EB]/50 transition-all outline-none resize-y min-h-[100px] text-right ${
                          isLight ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-[#353534]/50 backdrop-blur-md border-0 shadow-inner text-[#e5e2e1]'
                        }`}
                        rows="3"
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                {/* Features (Points list) */}
                <section className={`rounded-xl p-8 shadow-2xl relative overflow-hidden transition-colors ${
                  isLight ? 'bg-white border border-gray-200' : 'bg-[#0e0e0e]/80 backdrop-blur-xl'
                }`}>
                  <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
                    isLight ? 'text-gray-900' : 'text-white'
                  }`}>
                    <span className={`material-symbols-outlined ${
                      isLight ? 'text-[#5C24EB]' : 'text-[#ffb4a7]'
                    }`}>checklist</span>
                    Features Checklist / خدمات ومميزات الباقة (نقاط تحت بعضها)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* EN features */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-[#8B5CF6] uppercase tracking-wider mb-2">Features (English)</h4>
                      {featuresEn.map((feat, index) => (
                        <div key={`feat-en-${index}`} className="flex items-center gap-3">
                          <span className="text-[#8B5CF6] font-bold">{index + 1}.</span>
                          <input
                            className={`flex-1 rounded-md p-3 focus:ring-2 focus:ring-[#5C24EB]/50 focus:outline-none transition-all ${
                              isLight ? 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-[#353534]/50 border-0 shadow-inner text-[#e5e2e1]'
                            }`}
                            placeholder="e.g. 9H Surface Hardness"
                            value={feat}
                            onChange={(e) => handleFeatureEnChange(index, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeFeatureEn(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFeatureEn}
                        className="text-[#8B5CF6] bg-[#5C24EB]/10 shadow-inner rounded-xl px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#5C24EB]/20 transition-all flex items-center gap-2 mt-2"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add Point (EN)
                      </button>
                    </div>

                    {/* AR features */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-[#8B5CF6] uppercase tracking-wider mb-2 text-right">المميزات (العربية)</h4>
                      {featuresAr.map((feat, index) => (
                        <div key={`feat-ar-${index}`} className="flex items-center gap-3 dir-rtl">
                          <span className="text-[#8B5CF6] font-bold">{index + 1}.</span>
                          <input
                            className={`flex-1 rounded-md p-3 focus:ring-2 focus:ring-[#5C24EB]/50 focus:outline-none transition-all text-right ${
                              isLight ? 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-[#353534]/50 border-0 shadow-inner text-[#e5e2e1]'
                            }`}
                            placeholder="مثال: صلابة سطح 9H"
                            value={feat}
                            onChange={(e) => handleFeatureArChange(index, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeFeatureAr(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFeatureAr}
                        className="text-[#8B5CF6] bg-[#5C24EB]/10 shadow-inner rounded-xl px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#5C24EB]/20 transition-all flex items-center gap-2 mt-2 ml-auto"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        إضافة نقطة (AR)
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </> ) : (
              <section className="bg-[#0e0e0e]/80 backdrop-blur-xl rounded-xl p-16 text-center shadow-2xl">
                <svg aria-hidden="true" className="w-16 h-16 mx-auto mb-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <h2 className="text-xl font-bold text-gray-400 mb-2">Select a Package</h2>
                <p className="text-gray-600 text-sm">Choose a package from one of the dropdowns above to view and edit its details.</p>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
});

export default EditPackage;
