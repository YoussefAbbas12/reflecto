import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meService, servicesService, pricingService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Icon from '../components/Icon.jsx';
import { useLanguage } from '../hooks/useLanguage.jsx';
import SEOHead from '../components/SEOHead';

const BookService = React.memo(() => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPricing, setSelectedPricing] = useState(null);
  const { language, toggleLanguage, isRTL } = useLanguage();
  const [customVehicle, setCustomVehicle] = useState({
    brand: '',
    model: '',
    year: '',
    color: '',
    plate_number: ''
  });

  const { data: profile } = useQuery({
    queryKey: ['clientProfile'],
    queryFn: () => meService.getProfile(),
  });

  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesService.getAll(true),
  });
  const services = servicesData?.data || [];

  const userCompId = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('reflecto_user') || '{}');
      return u?.company_id || u?.company?.id || 'guest';
    } catch { return 'guest'; }
  })();

  const { data: pricerData } = useQuery({
    queryKey: ['pricing', userCompId],
    queryFn: () => pricingService.getAll(),
    staleTime: 10 * 1000,
  });
  const pricingTiers = pricerData?.data || [];

  const { data: vehiclesData } = useQuery({
    queryKey: ['myVehicles'],
    queryFn: () => meService.getVehicles(),
  });
  const vehicles = vehiclesData?.data || [];

  const addVehicleMutation = useMutation({
    mutationFn: (data) => meService.addVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
      toast.success('Vehicle added successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add vehicle.');
    }
  });

  const nextStep = useCallback(() => setStep(s => Math.min(3, s + 1)), []);
  const prevStep = useCallback(() => setStep(s => Math.max(1, s - 1)), []);

  const handleContinueFromStep1 = useCallback(async () => {
    if (!selectedVehicle) {
      try {
        const res = await addVehicleMutation.mutateAsync(customVehicle);
        if (res?.data) {
          setSelectedVehicle(res.data);
          nextStep();
        }
      } catch (err) {
        // error already handled by mutation onError
      }
    } else {
      nextStep();
    }
  }, [selectedVehicle, customVehicle, addVehicleMutation, nextStep]);

  const handleSelectVehicle = useCallback((vehicle) => {
    setSelectedVehicle(vehicle);
    setCustomVehicle({ brand: '', model: '', year: '', color: '', plate_number: '' });
  }, []);

  const handleCustomVehicleChange = useCallback((e) => {
    const { name, value } = e.target;
    setCustomVehicle(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleProceedToCheckout = useCallback(() => {
    const vehicle = selectedVehicle || {
      id: 'custom',
      ...customVehicle
    };
    
    navigate('/checkout', {
      state: {
        vehicle,
        service: selectedService,
        pricing: selectedPricing
      }
    });
  }, [selectedVehicle, customVehicle, selectedService, selectedPricing, navigate]);

  const progressPercent = (step / 3) * 100;

  return (
    <main className="min-h-screen bg-[#000000] text-white pt-24 pb-12 font-body selection:bg-[#FF5C35]/30 relative overflow-hidden" aria-labelledby="book-service-heading">
      <SEOHead
        title={isRTL ? 'حجز خدمة حماية وتظليل السيارات' : 'Book Car Protection & Tinting Service'}
        description={isRTL ? 'احجز موعدك أونلاين لتركيب أفلام حماية الطلاء PPF، النانو سيراميك، والعازل الحراري في مراكز ريفليكتو جدة والرياض بخطوات بسيطة.' : 'Book your appointment online for PPF paint protection, Nano Ceramic, and window tinting at Reflecto centers Jeddah & Riyadh in 3 simple steps.'}
        canonicalPath="/book-service"
        keywords="حجز حماية سيارات, موعد PPF جدة, موعد نانو سيراميك الرياض, حجز تظليل ريفليكتو"
      />
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF5C35] blur-[150px] opacity-[0.06] pointer-events-none" aria-hidden="true"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <header className="mb-10">
          <button 
            type="button"
            onClick={() => navigate('/clientDashboard')}
            className="flex items-center text-gray-400 hover:text-white transition-colors text-sm font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 rounded px-2 py-1 mb-6"
            aria-label="Back to dashboard"
          >
            <span className="material-symbols-outlined text-sm mr-2" aria-hidden="true">arrow_back</span>
            Back to Dashboard
          </button>
          <h1 id="book-service-heading" className="text-4xl font-black font-headline tracking-tight">Book a Service</h1>
          <p className="text-gray-400 mt-2 font-medium">Complete your reservation in 3 simple steps.</p>
        </header>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-12 px-4" aria-label="Booking progress">
          {[
            { num: 1, label: 'Vehicle Info' },
            { num: 2, label: 'Select Service' },
            { num: 3, label: 'Review & Pay' }
          ].map((s, i, arr) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  step >= s.num ? 'bg-[#FF5C35] text-white' : 'bg-white/[0.05] text-gray-400'
                }`}>
                  {step > s.num ? <Icon name="check" /> : s.num}
                </div>
                <span className={`text-xs font-bold mt-2 uppercase tracking-wider ${
                  step >= s.num ? 'text-white' : 'text-gray-500'
                }`}>{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className="flex-1 h-1 mx-4 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className={`h-full bg-[#FF5C35] transition-all duration-500`} style={{ width: step > s.num ? '100%' : '0%' }}></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Vehicle Selection */}
        {step === 1 && (
          <section className="bg-white/[0.02] backdrop-blur-xl shadow-2xl border-0 rounded-2xl p-8" aria-label="Step 1: Vehicle Information">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Icon name="directions_car" className="text-[#FF5C35]" />
              Select Your Vehicle
            </h2>

            {vehicles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Your Vehicles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map((v) => (
                    <article
                      key={v.id}
                      onClick={() => handleSelectVehicle(v)}
                      className={`p-5 rounded-xl cursor-pointer transition-all border-2 ${
                        selectedVehicle?.id === v.id
                          ? 'border-[#FF5C35] bg-[#FF5C35]/10'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                      }`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSelectVehicle(v)}
                    >
                      <h3 className="font-bold text-white">{v.brand} {v.model}</h3>
                      <p className="text-xs text-gray-400 mt-1">{v.year} • {v.color || 'N/A'}</p>
                      {v.plate_number && (
                        <p className="text-xs text-gray-500 mt-2 font-medium">Plate: {v.plate_number}</p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Or Add New Vehicle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="brand" className="block text-xs font-bold uppercase tracking-wider text-gray-400">Brand *</label>
                  <input
                    id="brand"
                    type="text"
                    name="brand"
                    value={customVehicle.brand}
                    onChange={handleCustomVehicleChange}
                    placeholder="e.g. BMW"
                    className="w-full bg-white/[0.05] border-0 shadow-inner rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="model" className="block text-xs font-bold uppercase tracking-wider text-gray-400">Model *</label>
                  <input
                    id="model"
                    type="text"
                    name="model"
                    value={customVehicle.model}
                    onChange={handleCustomVehicleChange}
                    placeholder="e.g. X5"
                    className="w-full bg-white/[0.05] border-0 shadow-inner rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="year" className="block text-xs font-bold uppercase tracking-wider text-gray-400">Year *</label>
                  <input
                    id="year"
                    type="number"
                    name="year"
                    value={customVehicle.year}
                    onChange={handleCustomVehicleChange}
                    placeholder="e.g. 2024"
                    className="w-full bg-white/[0.05] border-0 shadow-inner rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="color" className="block text-xs font-bold uppercase tracking-wider text-gray-400">Color</label>
                  <input
                    id="color"
                    type="text"
                    name="color"
                    value={customVehicle.color}
                    onChange={handleCustomVehicleChange}
                    placeholder="e.g. Black"
                    className="w-full bg-white/[0.05] border-0 shadow-inner rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleContinueFromStep1}
                disabled={addVehicleMutation.isPending || (!selectedVehicle && (!customVehicle.brand || !customVehicle.model || !customVehicle.year))}
                className="px-8 py-3 bg-[#FF5C35] text-white rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 shadow-[0_8px_30px_rgba(255,92,53,0.2)] flex items-center gap-2"
              >
                {addVehicleMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                Continue
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Service & Package Selection */}
        {step === 2 && (
          <section className="bg-white/[0.02] backdrop-blur-xl shadow-2xl border-0 rounded-2xl p-8" aria-label="Step 2: Select Service">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Icon name="build" className="text-[#FF5C35]" />
              Choose Your Service
            </h2>

            <div className="space-y-8">
              {/* Services */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.filter(s => s.is_active).map((s) => {
                    // Find the cheapest pricing tier for this service to show a "starting from" price
                    const relatedTiers = pricingTiers.filter(t => t.service_id === s.id);
                    const minPrice = relatedTiers.length > 0 ? Math.min(...relatedTiers.map(t => t.price)) : null;
                    return (
                      <article
                        key={s.id}
                        onClick={() => {
                          setSelectedService(s);
                          setSelectedPricing(null);
                        }}
                        className={`p-5 rounded-xl cursor-pointer transition-all border-2 ${
                          selectedService?.id === s.id
                            ? 'border-[#FF5C35] bg-[#FF5C35]/10'
                            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                        }`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedService(s)}
                      >
                        <h3 className="font-bold text-white">{(isRTL ? s.name_ar : s.name_en) || s.name_en}</h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{(isRTL ? s.description_ar : s.description_en) || s.description_en}</p>
                        {minPrice !== null && (
                          <p className="text-sm font-bold text-[#FF5C35] mt-3">{isRTL ? `يبدأ من ${minPrice.toLocaleString()} ريال` : `Starting from ${minPrice.toLocaleString()} SAR`}</p>
                        )}
                        {relatedTiers.length > 0 && (
                          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{isRTL ? `${relatedTiers.length} باقات متاحة` : `${relatedTiers.length} package${relatedTiers.length > 1 ? 's' : ''} available`}</p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* Packages for selected service */}
              {selectedService && (() => {
                const relatedTiers = pricingTiers.filter(t => t.service_id === selectedService.id);
                return relatedTiers.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                      {isRTL ? `اختر باقة لـ ${(isRTL ? selectedService.name_ar : selectedService.name_en) || selectedService.name_en}` : `Choose a Package for ${selectedService.name_en}`}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {relatedTiers.map((t) => (
                        <article
                          key={t.id}
                          onClick={() => setSelectedPricing(t)}
                          className={`p-5 rounded-xl cursor-pointer transition-all border-2 relative ${
                            selectedPricing?.id === t.id
                              ? 'border-[#FF5C35] bg-[#FF5C35]/10'
                              : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                          }`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && setSelectedPricing(t)}
                        >
                          {t.is_popular && (
                            <span className="absolute top-2 right-2 px-2 py-1 bg-[#FF5C35] text-white text-[10px] font-bold rounded-full uppercase">
                              {isRTL ? 'الأكثر طلباً' : 'Popular'}
                            </span>
                          )}
                          <h3 className="font-bold text-white">{(isRTL ? t.name_ar : t.name_en) || t.name_en}</h3>
                          <p className="text-xs text-gray-400 mt-1">{(isRTL ? t.tagline_ar : t.tagline_en) || t.tagline_en}</p>
                          <div className="flex flex-wrap items-baseline gap-2 mt-3">
                            {(t.is_company_price || (t.original_price && t.original_price > t.price)) && (
                              <span className="line-through text-gray-500 text-xs font-mono opacity-80 decoration-[#FF5C35]">
                                {t.original_price?.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}
                              </span>
                            )}
                            <span className="font-bold text-xl text-[#FF5C35]">{t.price?.toLocaleString()}</span>
                            <span className="text-xs text-gray-400">{isRTL ? 'ريال' : 'SAR'}</span>
                            {(t.is_company_price || (t.original_price && t.original_price > t.price)) && (
                              <span className="px-2 py-0.5 rounded-full bg-[#FF5C35]/20 text-[#FF5C35] text-[9px] font-bold border border-[#FF5C35]/30">
                                {isRTL ? 'خصم شركة' : 'Corporate'}
                              </span>
                            )}
                          </div>
                          {t.warranty_years > 0 && (
                            <p className="text-xs text-gray-400 mt-1">{isRTL ? `ضمان ${t.warranty_years} سنوات` : `${t.warranty_years} Year Warranty`}</p>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Standalone Packages (no service_id) */}
              {(() => {
                const standaloneTiers = pricingTiers.filter(t => !t.service_id && !t.client_id);
                return standaloneTiers.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Standalone Packages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {standaloneTiers.map((t) => (
                        <article
                          key={t.id}
                          onClick={() => {
                            setSelectedService(null);
                            setSelectedPricing(t);
                          }}
                          className={`p-5 rounded-xl cursor-pointer transition-all border-2 relative ${
                            selectedPricing?.id === t.id && !selectedService
                              ? 'border-[#FF5C35] bg-[#FF5C35]/10'
                              : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                          }`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && (() => { setSelectedService(null); setSelectedPricing(t); })()}
                        >
                          {t.is_popular && (
                            <span className="absolute top-2 right-2 px-2 py-1 bg-[#FF5C35] text-white text-[10px] font-bold rounded-full uppercase">Popular</span>
                          )}
                          <h3 className="font-bold text-white">{t.name_en}</h3>
                          <p className="text-xs text-gray-400 mt-1">{t.tagline_en}</p>
                          <div className="flex items-baseline gap-1 mt-3">
                            <span className="font-bold text-xl text-[#FF5C35]">{t.price?.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">SAR</span>
                          </div>
                          {t.warranty_years > 0 && (
                            <p className="text-xs text-gray-400 mt-1">{t.warranty_years} Year Warranty</p>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="px-8 py-3 bg-white/[0.05] text-white rounded-xl font-bold hover:bg-white/[0.1] transition-all shadow-inner"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!selectedService && !selectedPricing}
                className="px-8 py-3 bg-[#FF5C35] text-white rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 shadow-[0_8px_30px_rgba(255,92,53,0.2)]"
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Review & Checkout */}
        {step === 3 && (
          <section className="bg-white/[0.02] backdrop-blur-xl shadow-2xl border-0 rounded-2xl p-8" aria-label="Step 3: Review and Checkout">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Icon name="shopping_cart" className="text-[#FF5C35]" />
              Review Your Booking
            </h2>

            <div className="space-y-6">
              <div className="p-6 bg-white/[0.02] rounded-xl shadow-inner">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Vehicle</h3>
                <p className="font-bold text-white">
                  {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year})` : 
                   customVehicle.brand && customVehicle.model ? `${customVehicle.brand} ${customVehicle.model} (${customVehicle.year})` : 'Not specified'}
                </p>
              </div>

              <div className="p-6 bg-white/[0.02] rounded-xl shadow-inner">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Service / Package</h3>
                <p className="font-bold text-white">{selectedService?.name_en || selectedPricing?.name_en || 'Not specified'}</p>
                {selectedService && selectedPricing && (
                  <p className="text-sm text-gray-400 mt-1">{selectedPricing.name_en} Package</p>
                )}
              </div>

              <div className="p-6 bg-white/[0.02] rounded-xl shadow-inner">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Price</h3>
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-3xl text-[#FF5C35]">
                    {(selectedPricing?.price)?.toLocaleString() || '—'}
                  </span>
                  <span className="text-xs font-bold text-gray-400">SAR</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="px-8 py-3 bg-white/[0.05] text-white rounded-xl font-bold hover:bg-white/[0.1] transition-all shadow-inner"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="px-8 py-3 bg-gradient-to-r from-[#FF5C35] to-[#ff8060] text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-[0_8px_30px_rgba(255,92,53,0.2)] flex items-center gap-2"
              >
                <Icon name="lock" />
                Proceed to Checkout
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
});

export default BookService;