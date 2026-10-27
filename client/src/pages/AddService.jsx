import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';

const AddService = React.memo(() => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form State
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [price, setPrice] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');

  const createMutation = useMutation({
    mutationFn: (data) => servicesService.create(data),
    onSuccess: () => {
      toast.success('Service published successfully!');
      queryClient.invalidateQueries({ queryKey: ['allServices'] });
      queryClient.invalidateQueries({ queryKey: ['allServicesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['adminOverview'] });
      navigate('/admin/edit-service');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to publish service');
    }
  });

  const handlePublish = useCallback(() => {
    if (!nameEn.trim() || !nameAr.trim() || !price) {
      toast.warning('English Name, Arabic Name and Price are required.');
      return;
    }

    createMutation.mutate({
      name_en: nameEn,
      name_ar: nameAr,
      description_en: descriptionEn,
      description_ar: descriptionAr,
      price: parseFloat(price) || 0,
    });
  }, [nameEn, nameAr, price, descriptionEn, descriptionAr, createMutation, toast]);

  return (
    <div className="flex bg-[#000000] min-h-[calc(100vh-5rem)] font-body text-[#e5e2e1] selection:bg-[#5C24EB]/30 relative mt-16 md:mt-0">
      <AdminSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 w-full max-w-7xl mx-auto" aria-labelledby="add-service-heading">
        <div className="max-w-6xl mx-auto pb-24 relative">
          
          {/* Breadcrumbs */}
          <nav className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4" aria-label="Breadcrumb">
            <Link to="/admin" className="hover:text-gray-300 cursor-pointer transition-colors focus:outline-none focus:underline">
              Services
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-[#8B5CF6]" aria-current="page">Add Service</span>
          </nav>
          
          <h1 id="add-service-heading" className="text-4xl font-display font-black tracking-tight text-white mb-8">
            Create New Service | إضافة خدمة جديدة
          </h1>

          {/* Form Container */}
          <div className="space-y-8">
            {/* Service Details Section */}
            <section className="bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-2xl p-8 border-0" aria-labelledby="service-details-heading">
              <h2 id="service-details-heading" className="text-lg font-bold text-white mb-8 tracking-widest uppercase flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#5C24EB]/10 shadow-inner flex items-center justify-center text-[#8B5CF6]" aria-hidden="true">
                  <span className="material-symbols-outlined text-sm">settings</span>
                </div>
                Service Details / تفاصيل الخدمة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div className="space-y-2">
                  <label htmlFor="serviceNameEn" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Service Name (English) *
                  </label>
                  <input
                    id="serviceNameEn"
                    className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-gray-600 focus:ring-2 focus:ring-[#5C24EB]/50 focus:outline-none transition-all"
                    placeholder="e.g. Premium Detailing"
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="serviceNameAr" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                    * اسم الخدمة (العربية)
                  </label>
                  <input
                    id="serviceNameAr"
                    className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-gray-600 focus:ring-2 focus:ring-[#5C24EB]/50 focus:outline-none transition-all text-right"
                    placeholder="مثال: تلميع ساطع"
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <label htmlFor="price" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Price (SAR) *
                  </label>
                  <input
                    id="price"
                    className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl py-3 px-4 text-sm font-bold text-white placeholder-gray-600 focus:ring-2 focus:ring-[#5C24EB]/50 focus:outline-none transition-all"
                    placeholder="e.g. 450.00"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Description Section */}
            <section className="bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-2xl p-8 border-0" aria-labelledby="description-heading">
              <h2 id="description-heading" className="text-lg font-bold text-white mb-8 tracking-widest uppercase flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#5C24EB]/10 shadow-inner flex items-center justify-center text-[#8B5CF6]" aria-hidden="true">
                  <span className="material-symbols-outlined text-sm">description</span>
                </div>
                Service Description / وصف الخدمة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="descriptionEn" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Description (English)
                  </label>
                  <textarea
                    id="descriptionEn"
                    className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl py-4 px-4 text-sm font-bold tracking-wide text-white placeholder:text-gray-600 focus:ring-2 focus:ring-[#5C24EB]/50 focus:outline-none resize-none transition-all leading-relaxed"
                    placeholder="E.g. Full interior polishing and sanitation..."
                    rows="4"
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="descriptionAr" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                    وصف الخدمة (العربية)
                  </label>
                  <textarea
                    id="descriptionAr"
                    className="w-full bg-white/[0.05] shadow-inner border-0 rounded-xl py-4 px-4 text-sm font-bold tracking-wide text-white placeholder:text-gray-600 focus:ring-2 focus:ring-[#5C24EB]/50 focus:outline-none resize-none transition-all leading-relaxed text-right"
                    placeholder="مثال: تنظيف وتلميع كامل للأجزاء الداخلية للسيارة..."
                    rows="4"
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                  />
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
              className="w-full sm:w-auto px-10 py-3.5 bg-[#5C24EB] rounded-xl text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-[0_8px_30px_rgba(92,36,235,0.3)] active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {createMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
              ) : (
                <span className="material-symbols-outlined text-sm">publish</span>
              )}
              Publish Service / نشر الخدمة
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
});

export default AddService;
