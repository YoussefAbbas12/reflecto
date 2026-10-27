import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesService, pricingService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';

const EditService = React.memo(() => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedServiceId, setSelectedServiceId] = useState('');
  
  // Form State
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [price, setPrice] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Pricing tier editing
  const [editingTierId, setEditingTierId] = useState(null);
  const [tierForm, setTierForm] = useState({
    name_en: '', name_ar: '', tagline_en: '', tagline_ar: '',
    price: '', warranty_years: '', features_en: [''], features_ar: [''],
  });
  const [showAddTier, setShowAddTier] = useState(false);

  // Fetch all services
  const { data: servicesData, isLoading: isLoadingServices } = useQuery({
    queryKey: ['allServicesAdmin'],
    queryFn: () => servicesService.getAll(true),
  });

  // Fetch all pricing tiers
  const { data: pricingData, isLoading: isLoadingPricing } = useQuery({
    queryKey: ['pricing'],
    queryFn: pricingService.getAll,
  });

  const services = servicesData?.data || servicesData || [];
  const allTiers = pricingData?.data || pricingData || [];
  
  // Filter tiers for the selected service
  const serviceTiers = allTiers.filter(t => t.service_id === selectedServiceId);

  // When a service is selected, populate the form
  useEffect(() => {
    if (selectedServiceId && services.length > 0) {
      const srv = services.find(s => (s.id || s.uuid) === selectedServiceId);
      if (srv) {
        setNameEn(srv.name_en || '');
        setNameAr(srv.name_ar || '');
        setPrice(srv.price || '');
        setDescriptionEn(srv.description_en || '');
        setDescriptionAr(srv.description_ar || '');
        setIsActive(srv.is_active === 1 || srv.is_active === true);
      }
    }
    // Reset tier editing state
    setEditingTierId(null);
    setShowAddTier(false);
  }, [selectedServiceId, services]);

  // Update service mutation
  const updateMutation = useMutation({
    mutationFn: (data) => servicesService.update(selectedServiceId, data),
    onSuccess: () => {
      toast.success('Service updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['allServicesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update service');
    }
  });

  // Delete service mutation
  const deleteMutation = useMutation({
    mutationFn: () => servicesService.remove(selectedServiceId),
    onSuccess: () => {
      toast.success('Service deleted successfully!');
      setSelectedServiceId('');
      queryClient.invalidateQueries({ queryKey: ['allServicesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete service');
    }
  });

  // Pricing tier mutations
  const createTierMutation = useMutation({
    mutationFn: (data) => pricingService.create(data),
    onSuccess: () => {
      toast.success('Pricing tier added!');
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      setShowAddTier(false);
      resetTierForm();
    },
    onError: (err) => toast.error(err.message || 'Failed to add pricing tier'),
  });

  const updateTierMutation = useMutation({
    mutationFn: ({ id, data }) => pricingService.update(id, data),
    onSuccess: () => {
      toast.success('Pricing tier updated!');
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      setEditingTierId(null);
      resetTierForm();
    },
    onError: (err) => toast.error(err.message || 'Failed to update pricing tier'),
  });

  const deleteTierMutation = useMutation({
    mutationFn: (id) => pricingService.remove(id),
    onSuccess: () => {
      toast.success('Pricing tier deleted!');
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to delete pricing tier'),
  });

  const resetTierForm = () => {
    setTierForm({
      name_en: '', name_ar: '', tagline_en: '', tagline_ar: '',
      price: '', warranty_years: '', features_en: [''], features_ar: [''],
    });
  };

  const startEditTier = (tier) => {
    setEditingTierId(tier.id);
    setShowAddTier(false);
    setTierForm({
      name_en: tier.name_en || '',
      name_ar: tier.name_ar || '',
      tagline_en: tier.tagline_en || '',
      tagline_ar: tier.tagline_ar || '',
      price: tier.price || '',
      warranty_years: tier.warranty_years || '',
      features_en: tier.features_en && tier.features_en.length > 0 ? tier.features_en : [''],
      features_ar: tier.features_ar && tier.features_ar.length > 0 ? tier.features_ar : [''],
    });
  };

  const handleSaveTier = () => {
    if (!tierForm.name_en.trim() || !tierForm.name_ar.trim() || !tierForm.price) {
      toast.warning('Name (EN), Name (AR) and Price are required.');
      return;
    }
    const cleanFeaturesEn = tierForm.features_en.filter(f => f.trim() !== '');
    const cleanFeaturesAr = tierForm.features_ar.filter(f => f.trim() !== '');

    const payload = {
      name_en: tierForm.name_en,
      name_ar: tierForm.name_ar,
      tagline_en: tierForm.tagline_en,
      tagline_ar: tierForm.tagline_ar,
      price: parseFloat(tierForm.price) || 0,
      warranty_years: parseInt(tierForm.warranty_years) || 0,
      features_en: cleanFeaturesEn,
      features_ar: cleanFeaturesAr,
      service_id: selectedServiceId,
    };

    if (editingTierId) {
      updateTierMutation.mutate({ id: editingTierId, data: payload });
    } else {
      createTierMutation.mutate(payload);
    }
  };

  const handleDeleteTier = (tierId) => {
    if (window.confirm('Are you sure you want to delete this pricing tier?')) {
      deleteTierMutation.mutate(tierId);
    }
  };

  // Feature helpers
  const updateFeature = (lang, index, value) => {
    const key = `features_${lang}`;
    const updated = [...tierForm[key]];
    updated[index] = value;
    setTierForm({ ...tierForm, [key]: updated });
  };
  const addFeature = (lang) => {
    const key = `features_${lang}`;
    setTierForm({ ...tierForm, [key]: [...tierForm[key], ''] });
  };
  const removeFeature = (lang, index) => {
    const key = `features_${lang}`;
    const updated = tierForm[key].filter((_, i) => i !== index);
    setTierForm({ ...tierForm, [key]: updated.length > 0 ? updated : [''] });
  };

  const handleSave = useCallback(() => {
    if (!selectedServiceId) {
      toast.warning('Please select a service first.');
      return;
    }
    if (!nameEn.trim() || !nameAr.trim()) {
      toast.warning('English Name and Arabic Name are required.');
      return;
    }

    updateMutation.mutate({
      name_en: nameEn,
      name_ar: nameAr,
      description_en: descriptionEn,
      description_ar: descriptionAr,
      price: parseFloat(price) || 0,
      is_active: isActive ? 1 : 0
    });
  }, [selectedServiceId, nameEn, nameAr, price, descriptionEn, descriptionAr, isActive, toast, updateMutation]);

  const handleDiscard = useCallback(() => {
    if (selectedServiceId && services.length > 0) {
      const srv = services.find(s => (s.id || s.uuid) === selectedServiceId);
      if (srv) {
        setNameEn(srv.name_en || '');
        setNameAr(srv.name_ar || '');
        setPrice(srv.price || '');
        setDescriptionEn(srv.description_en || '');
        setDescriptionAr(srv.description_ar || '');
        setIsActive(srv.is_active === 1 || srv.is_active === true);
      }
    }
  }, [selectedServiceId, services]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to permanently delete this service?')) {
      deleteMutation.mutate();
    }
  }, [deleteMutation]);

  // Tier form component
  const renderTierForm = (isNew = false) => (
    <div className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-xl p-6 border border-[#5C24EB]/20 space-y-5 animate-in">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-base font-bold text-[#8B5CF6] flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">edit</span>
          {isNew ? 'Add New Pricing Tier' : 'Edit Pricing Tier'}
        </h4>
        <button
          type="button"
          onClick={() => { isNew ? setShowAddTier(false) : setEditingTierId(null); resetTierForm(); }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name (EN) *</label>
          <input
            className="w-full bg-white/[0.05] shadow-inner border-0 rounded-lg py-2.5 px-3 text-sm text-[#e5e2e1] focus:ring-2 focus:ring-[#5C24EB]/50 outline-none transition-all"
            placeholder="e.g. Basic Protection"
            value={tierForm.name_en}
            onChange={(e) => setTierForm({ ...tierForm, name_en: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right block">* الاسم (العربية)</label>
          <input
            className="w-full bg-white/[0.05] shadow-inner border-0 rounded-lg py-2.5 px-3 text-sm text-[#e5e2e1] focus:ring-2 focus:ring-[#5C24EB]/50 outline-none transition-all text-right"
            placeholder="مثال: الحماية الأساسية"
            value={tierForm.name_ar}
            onChange={(e) => setTierForm({ ...tierForm, name_ar: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Price (SAR) *</label>
          <input
            className="w-full bg-white/[0.05] shadow-inner border-0 rounded-lg py-2.5 px-3 text-sm text-[#e5e2e1] focus:ring-2 focus:ring-[#5C24EB]/50 outline-none transition-all"
            placeholder="e.g. 1200"
            type="number" min="0" step="0.01"
            value={tierForm.price}
            onChange={(e) => setTierForm({ ...tierForm, price: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Warranty (Years)</label>
          <input
            className="w-full bg-white/[0.05] shadow-inner border-0 rounded-lg py-2.5 px-3 text-sm text-[#e5e2e1] focus:ring-2 focus:ring-[#5C24EB]/50 outline-none transition-all"
            placeholder="e.g. 5"
            type="number" min="0"
            value={tierForm.warranty_years}
            onChange={(e) => setTierForm({ ...tierForm, warranty_years: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tagline (EN)</label>
          <input
            className="w-full bg-white/[0.05] shadow-inner border-0 rounded-lg py-2.5 px-3 text-sm text-[#e5e2e1] focus:ring-2 focus:ring-[#5C24EB]/50 outline-none transition-all"
            placeholder="e.g. Essential protection for daily drivers"
            value={tierForm.tagline_en}
            onChange={(e) => setTierForm({ ...tierForm, tagline_en: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right block">العنوان الفرعي (العربية)</label>
          <input
            className="w-full bg-white/[0.05] shadow-inner border-0 rounded-lg py-2.5 px-3 text-sm text-[#e5e2e1] focus:ring-2 focus:ring-[#5C24EB]/50 outline-none transition-all text-right"
            placeholder="مثال: حماية أساسية لسيارات الاستخدام اليومي"
            value={tierForm.tagline_ar}
            onChange={(e) => setTierForm({ ...tierForm, tagline_ar: e.target.value })}
          />
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-widest">Features (EN)</label>
          {tierForm.features_en.map((feat, i) => (
            <div key={`en-${i}`} className="flex items-center gap-2">
              <span className="text-[#8B5CF6] text-xs font-bold w-5">{i+1}.</span>
              <input
                className="flex-1 bg-white/[0.03] shadow-inner border-0 rounded-lg py-2 px-3 text-sm text-[#e5e2e1] focus:ring-2 focus:ring-[#5C24EB]/50 outline-none"
                placeholder="e.g. 9H Surface Hardness"
                value={feat}
                onChange={(e) => updateFeature('en', i, e.target.value)}
              />
              <button type="button" onClick={() => removeFeature('en', i)} className="text-gray-500 hover:text-red-400 transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addFeature('en')} className="text-[#8B5CF6] text-[10px] font-bold uppercase tracking-widest hover:text-[#ff7e5f] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">add</span> Add Point
          </button>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-widest text-right block">المميزات (العربية)</label>
          {tierForm.features_ar.map((feat, i) => (
            <div key={`ar-${i}`} className="flex items-center gap-2">
              <button type="button" onClick={() => removeFeature('ar', i)} className="text-gray-500 hover:text-red-400 transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              <input
                className="flex-1 bg-white/[0.03] shadow-inner border-0 rounded-lg py-2 px-3 text-sm text-[#e5e2e1] focus:ring-2 focus:ring-[#5C24EB]/50 outline-none text-right"
                placeholder="مثال: صلابة سطح 9H"
                value={feat}
                onChange={(e) => updateFeature('ar', i, e.target.value)}
              />
              <span className="text-[#8B5CF6] text-xs font-bold w-5 text-right">{i+1}.</span>
            </div>
          ))}
          <button type="button" onClick={() => addFeature('ar')} className="text-[#8B5CF6] text-[10px] font-bold uppercase tracking-widest hover:text-[#ff7e5f] transition-colors flex items-center gap-1 ml-auto">
            <span className="material-symbols-outlined text-sm">add</span> إضافة نقطة
          </button>
        </div>
      </div>

      {/* Save / Cancel */}
      <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
        <button
          type="button"
          onClick={() => { isNew ? setShowAddTier(false) : setEditingTierId(null); resetTierForm(); }}
          className="px-5 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveTier}
          disabled={createTierMutation.isPending || updateTierMutation.isPending}
          className="px-6 py-2 rounded-lg bg-[#5C24EB] text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(92,36,235,0.3)] disabled:opacity-50 flex items-center gap-2"
        >
          {(createTierMutation.isPending || updateTierMutation.isPending) && (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          <span className="material-symbols-outlined text-sm">save</span>
          {isNew ? 'Add Tier' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#131313] text-[#e5e2e1] font-body relative mt-16">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <style dangerouslySetInnerHTML={{__html: `
          .ink-pool-gradient {
              background: linear-gradient(to bottom right, #000000, #131b2e);
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-in { animation: slideDown 0.2s ease-out; }
        `}} />

        <main className="flex-1 pb-20 overflow-y-auto" aria-labelledby="edit-service-heading">
          <div className="p-4 md:p-10 max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              <div>
                <h1 id="edit-service-heading" className="text-4xl font-extrabold text-white tracking-tight font-headline">
                  Edit Service / تعديل خدمة
                </h1>
                <p className="text-gray-500 mt-2 text-sm">Select a service from the dropdown to edit its details and manage pricing tiers.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={handleDiscard}
                  disabled={!selectedServiceId}
                  className="px-6 py-2.5 rounded-xl text-[#e5e2e1] shadow-inner hover:bg-white/[0.05] transition-all font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Discard Changes
                </button>
                <button 
                  type="button"
                  onClick={handleSave}
                  disabled={!selectedServiceId || updateMutation.isPending}
                  className="px-8 py-2.5 rounded-xl ink-pool-gradient text-white font-semibold text-sm shadow-[0_8px_30px_rgba(255,180,167,0.15)] hover:brightness-110 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {updateMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>}
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Service / حفظ التعديلات
                </button>
              </div>
            </header>

            {/* Service Selector Dropdown */}
            <div className="mb-8">
              <section className="bg-[#0e0e0e]/80 backdrop-blur-xl rounded-xl p-6 shadow-2xl relative overflow-hidden" aria-label="Service Selection">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8B5CF6]">construction</span>
                  Select Service to Edit / اختر الخدمة لتعديلها
                </h2>
                <select
                  id="service-select"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full bg-[#1c1b1b]/80 backdrop-blur-md shadow-inner rounded-lg p-3 text-[#e5e2e1] focus:ring-2 focus:ring-[#5C24EB]/50 transition-all font-medium outline-none cursor-pointer appearance-none text-sm border-0"
                >
                  <option value="">
                    {isLoadingServices ? 'Loading services...' : '— Select a service —'}
                  </option>
                  {services.map((srv) => (
                    <option key={srv.id || srv.uuid} value={srv.id || srv.uuid}>
                      {srv.name_en || 'Unnamed'} — {srv.price || 0} SAR {!srv.is_active && '(Inactive)'}
                    </option>
                  ))}
                </select>
              </section>
            </div>

            {/* Form Fields */}
            {selectedServiceId ? (
              <div className="space-y-6">
                <div className="grid grid-cols-12 gap-6 items-start">
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Core Details */}
                    <section className="bg-[#0e0e0e]/80 backdrop-blur-xl rounded-xl p-8 shadow-2xl relative overflow-hidden">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ffb4a7]">settings</span>
                        Core Details / البيانات الأساسية
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="nameEn" className="text-xs font-bold uppercase tracking-widest text-[#e3beb8] px-1">Service Title (EN)</label>
                          <input 
                            id="nameEn"
                            className="w-full bg-[#353534]/50 backdrop-blur-md border-0 shadow-inner rounded-md p-3 text-[#e5e2e1] focus:ring-2 focus:ring-[#e4e2e1]/50 transition-all font-medium outline-none" 
                            type="text" 
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 text-right dir-rtl">
                          <label htmlFor="nameAr" className="text-xs font-bold uppercase tracking-widest text-[#e3beb8] px-1 block mb-2">* اسم الخدمة (العربية)</label>
                          <input 
                            id="nameAr"
                            className="w-full bg-[#353534]/50 backdrop-blur-md border-0 shadow-inner rounded-md p-3 text-[#e5e2e1] focus:ring-2 focus:ring-[#e4e2e1]/50 transition-all font-medium outline-none text-right" 
                            type="text" 
                            value={nameAr}
                            onChange={(e) => setNameAr(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 mt-6">
                        <div className="space-y-2">
                          <label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-[#e3beb8] px-1">Base Price (SAR)</label>
                          <input 
                            id="price"
                            className="w-full bg-[#353534]/50 backdrop-blur-md border-0 shadow-inner rounded-md p-3 text-[#e5e2e1] focus:ring-2 focus:ring-[#e4e2e1]/50 transition-all font-medium outline-none" 
                            type="number" 
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Description */}
                    <section className="bg-[#0e0e0e]/80 backdrop-blur-xl rounded-xl p-8 shadow-2xl relative overflow-hidden">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ffb4a7]">description</span>
                        Description / الوصف
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="descEn" className="text-xs font-bold uppercase tracking-widest text-[#e3beb8] px-1">Description (EN)</label>
                          <textarea 
                            id="descEn"
                            className="w-full bg-[#353534]/50 backdrop-blur-md border-0 shadow-inner rounded-md p-3 text-[#e5e2e1] focus:ring-2 focus:ring-[#e4e2e1]/50 transition-all outline-none resize-y min-h-[100px]" 
                            rows="3"
                            value={descriptionEn}
                            onChange={(e) => setDescriptionEn(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 text-right dir-rtl">
                          <label htmlFor="descAr" className="text-xs font-bold uppercase tracking-widest text-[#e3beb8] px-1 block mb-2">الوصف (AR)</label>
                          <textarea 
                            id="descAr"
                            className="w-full bg-[#353534]/50 backdrop-blur-md border-0 shadow-inner rounded-md p-3 text-[#e5e2e1] focus:ring-2 focus:ring-[#e4e2e1]/50 transition-all outline-none resize-y min-h-[100px] text-right" 
                            rows="3"
                            value={descriptionAr}
                            onChange={(e) => setDescriptionAr(e.target.value)}
                          />
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Status & Options */}
                    <section className="bg-[#0e0e0e]/80 backdrop-blur-xl rounded-xl p-8 shadow-2xl relative overflow-hidden">
                      <h3 className="text-lg font-bold mb-4 font-headline">Status</h3>
                      <label className="flex items-center justify-between p-3 bg-[#1c1b1b]/80 backdrop-blur-md rounded-lg shadow-inner cursor-pointer hover:bg-[#201f1f] transition-colors">
                        <span className="font-semibold text-sm select-none">Active / نشطة</span>
                        <input 
                          checked={isActive} 
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="w-5 h-5 rounded-md text-[#8B5CF6] bg-[#353534] border-transparent focus:ring-offset-0 focus:ring-0 cursor-pointer" 
                          type="checkbox" 
                        />
                      </label>
                    </section>

                    {/* Danger Zone */}
                    <section className="bg-[#93000a]/10 backdrop-blur-xl rounded-xl p-6 shadow-2xl relative overflow-hidden">
                      <h3 className="text-sm font-bold text-[#ffdad6] mb-3 uppercase tracking-widest font-label">Danger Zone</h3>
                      <button 
                        type="button" 
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="w-full text-left px-4 py-2 text-sm font-semibold text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">delete_forever</span>
                        Delete Permanently
                      </button>
                    </section>
                  </div>
                </div>

                {/* ──── Pricing Tiers Section ──── */}
                <section className="bg-[#0e0e0e]/80 backdrop-blur-xl rounded-xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#8B5CF6]">payments</span>
                      Pricing Tiers / الأسعار والباقات
                    </h3>
                    {!showAddTier && (
                      <button
                        type="button"
                        onClick={() => { setShowAddTier(true); setEditingTierId(null); resetTierForm(); }}
                        className="px-4 py-2 rounded-lg bg-[#5C24EB]/10 text-[#8B5CF6] font-bold text-xs uppercase tracking-widest hover:bg-[#5C24EB]/20 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add Tier / إضافة سعر
                      </button>
                    )}
                  </div>

                  {/* Existing tiers list */}
                  {isLoadingPricing ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-6 h-6 border-2 border-gray-600 border-t-[#5C24EB] rounded-full animate-spin mx-auto mb-3"></div>
                      Loading pricing tiers...
                    </div>
                  ) : serviceTiers.length === 0 && !showAddTier ? (
                    <div className="text-center py-10 text-gray-500">
                      <span className="material-symbols-outlined text-4xl mb-3 block text-gray-600">price_check</span>
                      <p className="text-sm">No pricing tiers for this service yet.</p>
                      <p className="text-xs mt-1 text-gray-600">Click "Add Tier" to create one.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {serviceTiers.map((tier) => (
                        <React.Fragment key={tier.id}>
                          {editingTierId === tier.id ? (
                            renderTierForm(false)
                          ) : (
                            <div className="bg-[#1c1b1b]/60 backdrop-blur-md rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-[#1c1b1b]/80 transition-colors border border-transparent hover:border-white/5">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="text-base font-bold text-white truncate">{tier.name_en}</h4>
                                  <span className="text-xs text-gray-500 font-medium">({tier.name_ar})</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-[#8B5CF6] font-bold text-lg">{tier.price} SAR</span>
                                  {tier.warranty_years > 0 && (
                                    <span className="text-gray-400 flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">verified</span>
                                      {tier.warranty_years} yr warranty
                                    </span>
                                  )}
                                  {tier.features_en && tier.features_en.length > 0 && (
                                    <span className="text-gray-500 text-xs">{tier.features_en.length} features</span>
                                  )}
                                </div>
                                {tier.tagline_en && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">{tier.tagline_en}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => startEditTier(tier)}
                                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                  title="Edit"
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTier(tier.id)}
                                  disabled={deleteTierMutation.isPending}
                                  className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-gray-400 hover:text-red-400"
                                  title="Delete"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Add new tier form */}
                  {showAddTier && (
                    <div className="mt-4">
                      {renderTierForm(true)}
                    </div>
                  )}
                </section>
              </div>
            ) : (
              <section className="bg-[#0e0e0e]/80 backdrop-blur-xl rounded-xl p-16 text-center shadow-2xl">
                <svg aria-hidden="true" className="w-16 h-16 mx-auto mb-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <h2 className="text-xl font-bold text-gray-400 mb-2">Select a Service</h2>
                <p className="text-gray-600 text-sm">Choose a service from the dropdown above to view and edit its details.</p>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
});

export default EditService;
