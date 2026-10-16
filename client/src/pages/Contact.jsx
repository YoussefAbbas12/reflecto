import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { contactService, pricingService, servicesService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';

const Contact = React.memo(() => {
  const { t } = useTranslation(['contact', 'common']);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    serviceType: '',
    servicePackage: '',
    fullName: '',
    phone: '',
    email: '',
    date: '',
    time: ''
    ,reason: ''
  });

  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);

  React.useEffect(() => {
    Promise.all([servicesService.getAll(), pricingService.getAll()])
      .then(([servicesRes, packagesRes]) => {
        setServices(servicesRes?.data || []);
        setPackages(packagesRes?.data || []);
      })
      .catch(() => {});
  }, []);

  const selectedService = services.find(service => service.id === formData.serviceType);
  const visiblePackages = packages.filter(pkg => !selectedService || !pkg.service_id || pkg.service_id === selectedService.id);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'serviceType' ? { servicePackage: '' } : {})
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone) {
      toast.warning('Please provide at least your full name and phone number.');
      return;
    }

    setIsLoading(true);
    try {
      // Map frontend state to backend expected payload
      const payload = {
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        car_brand: formData.brand,
        car_model: formData.model,
        car_year: parseInt(formData.year, 10) || undefined,
        service_type: formData.serviceType,
        service_package: formData.servicePackage,
        reason: formData.reason,
        preferred_date: formData.date || undefined,
        preferred_time: formData.time || undefined,
      };

      await contactService.submitForm(payload);
      
      toast.success(t('contact:contact_confirmed') || 'Your request has been submitted successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error) {
      toast.error(error.message || 'Failed to submit contact form. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, navigate, t, toast]);

  // Helper class for inputs using No-Line glassmorphism style
  const inputClass = "w-full bg-white/[0.05] border-0 shadow-inner rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-[#FF4500]/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium";
  const labelClass = "block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase";

  return (
    <main className="min-h-screen bg-[#000000] pb-24 pt-16 px-4 sm:px-6 font-body selection:bg-[#FF4500]/30 relative overflow-hidden" aria-labelledby="contact-heading">
      <SEOHead
        title={t('contact:title_secure', 'تواصل معنا واستشر خبراء حماية السيارات')}
        description="تواصل مع مركز ريفليكتو بريميوم لحماية السيارات في جدة والرياض. اتصل بنا مباشر عبر الهاتف أو الواتساب أو احجز استشارتك المجانية لتظليل وحماية طلاء سيارتك."
        canonicalPath="/contact"
        keywords="اتصل بنا ريفليكتo, تواصل ريفليكتو جدة, واتساب ريفليكتو حماية سيارات"
      />
      {/* Background accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF4500] blur-[180px] opacity-[0.05] pointer-events-none" aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <header className="text-center mb-16 mt-8">
          <h1 id="contact-heading" className="text-4xl md:text-5xl font-display uppercase tracking-widest text-white drop-shadow-lg">
            <span className="text-[#FF4500] font-bold">{t('contact:title_secure')}</span> {t('contact:title_your')} <span className="text-[#FF4500] font-bold">{t('contact:title_protection')}</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">

          {/* Left Column - Forms */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">

            {/* Vehicle & Service Details Panel */}
            <section className="bg-white/[0.02] backdrop-blur-2xl rounded-2xl border-0 p-8 shadow-2xl relative overflow-hidden" aria-labelledby="vehicle-details-heading">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#FF4500]/10 flex items-center justify-center text-[#FF4500] shadow-inner" aria-hidden="true">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 id="vehicle-details-heading" className="text-lg font-bold text-white tracking-widest uppercase">{t('contact:vehicle_service_details')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
<div className="md:col-span-2 space-y-1">
  <label htmlFor="brand" className={labelClass}>
    {t('contact:car_brand')}
  </label>
  <input
    id="brand"
    name="brand"
    type="text"
    value={formData.brand}
    onChange={handleChange}
    disabled={isLoading}
    placeholder={t('contact:select_brand')}
    className={inputClass}
  />
</div>

<div className="space-y-1">
  <label htmlFor="model" className={labelClass}>
    {t('contact:car_model')}
  </label>
  <input
    id="model"
    name="model"
    type="text"
    value={formData.model}
    onChange={handleChange}
    disabled={isLoading}
    placeholder={t('contact:select_model')}
    className={inputClass}
  />
</div>

<div className="space-y-1">
  <label htmlFor="year" className={labelClass}>
    {t('contact:car_year')}
  </label>
  <input
    id="year"
    name="year"
    type="number"
    value={formData.year}
    onChange={handleChange}
    disabled={isLoading}
    placeholder={t('contact:select_year')}
    className={inputClass}
    min="1900"
    max="2100"
  />
</div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label htmlFor="serviceType" className={labelClass}>{t('contact:select_service')}</label>
                  <select id="serviceType" name="serviceType" value={formData.serviceType} onChange={handleChange} disabled={isLoading} className={`${inputClass} appearance-none cursor-pointer`}>
                    <option value="">{t('contact:service_placeholder')}</option>
                    {services.map(service => <option key={service.id} value={service.id}>{service.name_ar || service.name_en}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="servicePackage" className={labelClass}>{t('contact:service_package')}</label>
                  <select id="servicePackage" name="servicePackage" value={formData.servicePackage} onChange={handleChange} disabled={isLoading} className={`${inputClass} appearance-none cursor-pointer`}>
                    <option value="">{t('contact:package_placeholder')}</option>
                    {visiblePackages.map(pkg => <option key={pkg.id} value={pkg.id}>{pkg.name_ar || pkg.name_en}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="reason" className={labelClass}>سبب التواصل</label>
                  <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} disabled={isLoading} className={`${inputClass} min-h-32 resize-y`} placeholder="اكتب سبب تواصلك معنا" rows="4" />
                </div>
              </div>
            </section>

            {/* Customer Information Panel */}
            <section className="bg-white/[0.02] backdrop-blur-2xl rounded-2xl border-0 p-8 shadow-2xl relative overflow-hidden" aria-labelledby="customer-info-heading">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#FF4500]/10 flex items-center justify-center text-[#FF4500] shadow-inner" aria-hidden="true">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 id="customer-info-heading" className="text-lg font-bold text-white tracking-widest uppercase">{t('contact:customer_information')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <label htmlFor="fullName" className={labelClass}>{t('contact:full_name')} *</label>
                  <input id="fullName" type="text" name="fullName" placeholder={t('contact:full_name_placeholder')} value={formData.fullName} onChange={handleChange} disabled={isLoading} className={inputClass} required aria-required="true" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="phone" className={labelClass}>{t('contact:phone_number')} *</label>
                  <input id="phone" type="tel" name="phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} disabled={isLoading} className={inputClass} required aria-required="true" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor="email" className={labelClass}>{t('contact:email_address')}</label>
                  <input id="email" type="email" name="email" placeholder={t('contact:email_placeholder')} value={formData.email} onChange={handleChange} disabled={isLoading} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="date" className={labelClass}>{t('contact:preferred_date')}</label>
                  <div className="relative">
                    <input id="date" type="date" name="date" value={formData.date} onChange={handleChange} disabled={isLoading} className={`${inputClass} appearance-none cursor-pointer`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="time" className={labelClass}>{t('contact:preferred_time')}</label>
                  <div className="relative">
                    <input id="time" type="time" name="time" value={formData.time} onChange={handleChange} disabled={isLoading} className={`${inputClass} appearance-none cursor-pointer`} />
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Right Column - Contact Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <aside className="bg-white/[0.02] backdrop-blur-2xl rounded-2xl border-0 p-8 shadow-2xl sticky top-24" aria-label="Contact Summary">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#FF4500]/10 flex items-center justify-center text-[#FF4500] shadow-inner" aria-hidden="true">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-white tracking-widest uppercase">{t('contact:contact_summary')}</h2>
              </div>

              <div className="w-full h-px bg-white/5 mb-8"></div>

              <div className="mb-8">
                <h3 className="text-[#FF4500] text-[10px] uppercase font-bold tracking-[0.2em] mb-4">{t('contact:selected_vehicle')}</h3>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{t('contact:brand')}</span>
                  <span className="text-white text-sm font-bold">{formData.brand || '-'}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{t('contact:model')}</span>
                  <span className="text-white text-sm font-bold">{formData.model || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{t('contact:year')}</span>
                  <span className="text-white text-sm font-bold">{formData.year || '-'}</span>
                </div>
              </div>

              <div className="w-full h-px bg-white/5 mb-8"></div>

              <div className="mb-10">
                <h3 className="text-[#FF4500] text-[10px] uppercase font-bold tracking-[0.2em] mb-4">{t('contact:selected_service')}</h3>
                <div className="flex justify-between items-center mb-3 gap-4">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider shrink-0">{t('contact:service_type')}</span>
                  <span className="text-white text-sm font-bold text-right truncate">{formData.serviceType || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{t('contact:package')}</span>
                  <span className="text-white text-sm font-bold">{formData.servicePackage || '-'}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-[#FF4500] hover:brightness-110 text-white text-[11px] font-bold rounded-xl uppercase tracking-[0.2em] transition-all flex items-center justify-center shadow-[0_8px_30px_rgba(255,69,0,0.3)] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
                aria-label="Confirm and Submit Contact Request"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" aria-hidden="true" />
                    Submitting...
                  </>
                ) : (
                  <>
                    {t('contact:confirm_contact')} <span className="ml-2 font-bold" aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </aside>
          </div>

        </form>
      </div>
    </main>
  );
});

export default Contact;
