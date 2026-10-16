import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { checkoutService, meService, couponService, authService, configService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { buildFullPhone, cleanPhoneNumber } from '../utils/phone';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const Checkout = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, login } = useAuth();
  const { t, i18n } = useTranslation(['checkout', 'common', 'auth']);
  const isRTL = i18n.language === 'ar';

  // Get booking data from BookService page
  const bookingData = location.state || {};
  const searchParams = new URLSearchParams(location.search);

  const itemName = (isRTL ? (bookingData?.service?.name_ar || bookingData?.pricing?.name_ar || bookingData?.name_ar) : (bookingData?.service?.name_en || bookingData?.pricing?.name_en || bookingData?.name_en)) || bookingData?.name || searchParams.get('item') || (isRTL ? 'باقة ريفليكتو المميزة' : 'Reflecto Premium Package');
  const itemPrice = bookingData?.service?.price || bookingData?.pricing?.price || bookingData?.price || (searchParams.get('price') ? parseInt(searchParams.get('price')) : 1500);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    address: ''
  });

  const [vehicleData, setVehicleData] = useState({
    brand: bookingData?.vehicle?.brand || '',
    model: bookingData?.vehicle?.model || '',
    year: bookingData?.vehicle?.year || '',
    color: bookingData?.vehicle?.color || '',
    plate_number: bookingData?.vehicle?.plate_number || ''
  });

  const handleVehicleChange = useCallback((e) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Phone verification state for guest checkout
  const [isPhoneVerified, setIsPhoneVerified] = useState(isAuthenticated);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useBodyScrollLock(isOtpModalOpen);

  const [selectedPayment, setSelectedPayment] = useState('tabby');
  const [config, setConfig] = useState({ test_mode: false });
  const [companyDiscount, setCompanyDiscount] = useState(0);

  // Load backend configuration (such as test_mode status) on mount
  useEffect(() => {
    configService.getConfig()
      .then(res => {
        if (res) {
          setConfig(res);
          if (res.test_mode) {
            setSelectedPayment('test'); // Automatically default to test payment when test mode is active
          }
        }
      })
      .catch(() => { });
  }, []);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  // Apply the coupon first, then the corporate discount from the client profile.
  const couponPrice = couponResult ? couponResult.final_price : itemPrice;
  const companyDiscountAmount = companyDiscount > 0 ? (couponPrice * companyDiscount) / 100 : 0;
  const finalPrice = Math.max(0, couponPrice - companyDiscountAmount);

  // Fetch client profile if logged in
  useEffect(() => {
    if (isAuthenticated) {
      setIsPhoneVerified(true);
      meService.getProfile()
        .then(res => {
          if (res?.full_name || res?.phone) {
            const names = (res.full_name || '').split(' ');
            setFormData({
              firstName: names[0] || '',
              lastName: names.slice(1).join(' ') || '',
              email: res.email || '',
              phone: res.phone ? `+966${res.phone.replace(/^\+?966/, '').replace(/^0/, '')}` : '',
              city: res.city || '',
              address: res.address || ''
            });
          }
          setCompanyDiscount(parseFloat(res.company?.discount_percent || res.company_discount_percent || 0));
        })
        .catch(() => { });
    }
  }, [isAuthenticated]);

  const handleVerifyPhoneClick = useCallback(async () => {
    const rawDigits = cleanPhoneNumber(formData.phone.trim());
    if (!rawDigits) {
      toast.warning(isRTL ? 'يرجى إدخال رقم الهاتف أولاً' : 'Please enter your phone number first');
      return;
    }
    const fullPhone = buildFullPhone(rawDigits);
    setIsSendingOtp(true);
    try {
      const res = await authService.sendSignupOTP(fullPhone, formData.email.trim());
      toast.success(res.message || (isRTL ? 'تم إرسال كود التحقق بنجاح' : 'OTP sent successfully'));
      setIsOtpModalOpen(true);
    } catch (err) {
      toast.error(err.message || (isRTL ? 'فشل إرسال كود التحقق' : 'Failed to send OTP'));
    } finally {
      setIsSendingOtp(false);
    }
  }, [formData.phone, formData.email, toast, isRTL]);

  const handleConfirmOtp = useCallback(async () => {
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      toast.warning(isRTL ? 'يرجى إدخال كود التحقق المكون من 6 أرقام' : 'Please enter full 6-digit code');
      return;
    }
    const rawDigits = cleanPhoneNumber(formData.phone.trim());
    const fullPhone = buildFullPhone(rawDigits);
    setIsVerifyingOtp(true);
    try {
      await authService.verifySignupOTP(fullPhone, otpCode.trim());
      setIsPhoneVerified(true);
      setIsOtpModalOpen(false);
      toast.success(isRTL ? 'تم التحقق من رقم الهاتف بنجاح!' : 'Phone verified successfully!');
    } catch (err) {
      toast.error(err.message || (isRTL ? 'كود التحقق غير صحيح' : 'Invalid OTP code'));
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [otpCode, formData.phone, toast, isRTL]);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    setIsCouponLoading(true);
    try {
      const res = await couponService.apply(couponCode.trim(), itemPrice);
      setCouponResult(res);
      toast.success(`${t('coupon_applied')} ${t('you_saved')} ${res.discount_amount} ${t('sar')}`);
    } catch (err) {
      toast.error(err.message || 'Invalid or expired coupon code.');
      setCouponResult(null);
    } finally {
      setIsCouponLoading(false);
    }
  }, [couponCode, itemPrice, toast, t]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponCode('');
    setCouponResult(null);
  }, []);

  const checkoutMutation = useMutation({
    mutationFn: (data) => {
      const method = data._paymentMethod || selectedPayment;
      const cleanData = { ...data };
      delete cleanData._paymentMethod;
      if (method === 'tamara') return checkoutService.createTamara({ ...cleanData, total_amount: cleanData.amount });
      if (method === 'test') return checkoutService.createTest(cleanData);
      return checkoutService.createTabby(cleanData);
    },
    onSuccess: (res) => {
      if (res?.data?.auth) {
        login(res.data.auth);
        sessionStorage.setItem('reflecto_new_account_notice', 'true');
      }
      const redirectUrl = res?.data?.checkoutUrl || res?.data?.checkout_url || res?.data?.redirect_url || res?.redirect_url || res?.checkoutUrl;
      if (redirectUrl) { window.location.href = redirectUrl; return; }
      toast.success(isRTL ? 'تم الشراء بنجاح!' : 'Purchase completed successfully!');
      setTimeout(() => {
        navigate('/clientDashboard', { replace: true });
        window.location.reload();
      }, 800);
      navigate('/checkout/success');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to process payment. Please try again.');
    }
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'phone' && !isAuthenticated) {
      setIsPhoneVerified(false);
    }
  }, [isAuthenticated]);

  const handleCheckout = useCallback((e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.phone) {
      toast.warning(`${t('first_name')} ${t('required')} - ${t('phone')} ${t('required')}.`);
      return;
    }

    if (!isAuthenticated && !isPhoneVerified) {
      toast.warning(isRTL ? 'يرجى التحقق من رقم الهاتف أولاً بالضغط على زر "تحقق"' : 'Please verify your phone number first by clicking "Verify"');
      return;
    }

    const appointmentData = {
      vehicle_id: bookingData?.vehicle?.id || null,
      vehicle: (vehicleData.brand || vehicleData.model) ? vehicleData : null,
      service_id: bookingData?.service?.id || bookingData?.service?.uuid || null,
      pricing_tier_id: bookingData?.pricing?.id || null,
      preferred_date: new Date().toISOString().split('T')[0],
      notes: `Service: ${itemName}`
    };

    const payload = {
      amount: finalPrice,
      total_amount: finalPrice,
      currency: "SAR",
      coupon_code: couponResult?.coupon?.code || null,
      work_order_id: bookingData?.work_order_id || null,
      work_order_number: bookingData?.work_order_number || null,
      is_work_order_payment: Boolean(bookingData?.is_work_order_payment || bookingData?.work_order_id || bookingData?.work_order_number),
      customer: {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: buildFullPhone(cleanPhoneNumber(formData.phone)),
        phone_number: buildFullPhone(cleanPhoneNumber(formData.phone)),
        city: formData.city,
        address: formData.address
      },
      items: [
        {
          title: itemName,
          name: itemName,
          quantity: 1,
          unit_price: finalPrice,
          reference_id: `REF-${Date.now()}`,
          sku: `SKU-${itemName.substring(0, 5).toUpperCase()}`
        }
      ],
      appointment_data: appointmentData
    };

    checkoutMutation.mutate(payload);
  }, [formData, isAuthenticated, isPhoneVerified, itemName, finalPrice, couponResult, checkoutMutation, toast, bookingData, t, isRTL]);

  const handlePayWithMethod = useCallback((method) => {
    setSelectedPayment(method);
    if (!formData.firstName || !formData.phone) {
      toast.warning(`${t('first_name')} ${t('required')} - ${t('phone')} ${t('required')}.`);
      return;
    }
    if (!isAuthenticated && !isPhoneVerified) {
      toast.warning(isRTL ? 'يرجى التحقق من رقم الهاتف أولاً بالضغط على زر "تحقق"' : 'Please verify your phone number first by clicking "Verify"');
      return;
    }

    const appointmentData = {
      vehicle_id: bookingData?.vehicle?.id || null,
      vehicle: (vehicleData.brand || vehicleData.model) ? vehicleData : null,
      service_id: bookingData?.service?.id || bookingData?.service?.uuid || null,
      pricing_tier_id: bookingData?.pricing?.id || null,
      preferred_date: new Date().toISOString().split('T')[0],
      notes: `Service: ${itemName}`
    };

    const payload = {
      _paymentMethod: method,
      amount: finalPrice,
      total_amount: finalPrice,
      currency: "SAR",
      coupon_code: couponResult?.coupon?.code || null,
      customer: {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: buildFullPhone(cleanPhoneNumber(formData.phone)),
        phone_number: buildFullPhone(cleanPhoneNumber(formData.phone)),
        city: formData.city,
        address: formData.address
      },
      items: [
        {
          title: itemName,
          name: itemName,
          quantity: 1,
          unit_price: finalPrice,
          reference_id: `REF-${Date.now()}`,
          sku: `SKU-${itemName.substring(0, 5).toUpperCase()}`
        }
      ],
      appointment_data: appointmentData
    };

    checkoutMutation.mutate(payload);
  }, [formData, vehicleData, isAuthenticated, isPhoneVerified, itemName, finalPrice, couponResult, checkoutMutation, toast, bookingData, t, isRTL]);

  const inputStyle = "w-full bg-white/[0.05] border-0 shadow-inner rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all font-medium";
  const labelStyle = "block text-xs font-bold uppercase tracking-wider text-gray-400";

  return (
    <main
      className="min-h-screen bg-[#000000] text-white pt-24 pb-12 font-body selection:bg-[#FF5C35]/30 relative overflow-hidden"
      aria-labelledby="checkout-heading"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF5C35] blur-[150px] opacity-[0.08] pointer-events-none" aria-hidden="true"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        <header className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white transition-colors text-sm font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 rounded px-2 py-1"
            aria-label={t('back')}
          >
            <span className="material-symbols-outlined text-sm mr-2" aria-hidden="true">
              {isRTL ? 'arrow_forward' : 'arrow_back'}
            </span>
            {t('back')}
          </button>
          <h1 id="checkout-heading" className="text-4xl font-black font-headline mt-6 tracking-tight">{t('title')}</h1>
          <p className="text-gray-400 mt-2 font-medium">{t('subtitle')}</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* Left Column: Form */}
          <div className="flex-1 space-y-8">

            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">

              {/* Customer Details */}
              <section className="bg-white/[0.02] backdrop-blur-2xl rounded-2xl p-8 shadow-2xl relative overflow-hidden border-0" aria-label={t('customer_info')}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5C35] to-transparent opacity-50" aria-hidden="true"></div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#FF5C35] bg-[#FF5C35]/10 p-1.5 rounded-lg" aria-hidden="true">person</span>
                  {t('customer_info')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className={labelStyle}>{t('first_name')} *</label>
                    <input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required disabled={checkoutMutation.isPending} className={inputStyle} aria-required="true" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className={labelStyle}>{t('last_name')}</label>
                    <input id="lastName" type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={checkoutMutation.isPending} className={inputStyle} />
                  </div>

                  {/* Phone field with Verify button */}
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="phone" className={labelStyle}>{t('phone')} *</label>
                    <div className="flex items-center gap-3" dir="ltr">
                      <div className="relative flex-1 flex items-center bg-white/[0.05] border-0 shadow-inner rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#FF5C35]/50 transition-all" dir="ltr">
                        <span className="px-3.5 py-3 text-gray-400 font-mono text-sm font-bold border-r border-white/10 bg-white/[0.03] select-none flex items-center gap-1.5 shrink-0">
                          <span className="text-base">🇸🇦</span>
                          <span>+966</span>
                        </span>
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          disabled={checkoutMutation.isPending || (!isAuthenticated && isPhoneVerified)}
                          className="w-full bg-transparent border-0 px-4 py-3 text-white focus:outline-none font-medium placeholder:text-gray-600"
                          aria-required="true"
                          placeholder="501234567"
                          dir="ltr"
                        />
                      </div>
                      {!isAuthenticated && (
                        isPhoneVerified ? (
                          <span className="px-4 py-3 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-lg flex items-center gap-1.5 whitespace-nowrap shadow-inner border border-emerald-500/30">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {t('verified')}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleVerifyPhoneClick}
                            disabled={isSendingOtp || !formData.phone.trim()}
                            className="px-5 py-3 bg-[#FF5C35] text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap shadow-md cursor-pointer"
                          >
                            {isSendingOtp && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {t('verify_phone')}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className={labelStyle}>{t('email')}</label>
                    <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={checkoutMutation.isPending} className={inputStyle} dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="city" className={labelStyle}>{t('city')}</label>
                    <input id="city" type="text" name="city" value={formData.city} onChange={handleInputChange} disabled={checkoutMutation.isPending} className={inputStyle} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="address" className={labelStyle}>{t('address')}</label>
                    <input id="address" type="text" name="address" value={formData.address} onChange={handleInputChange} disabled={checkoutMutation.isPending} className={inputStyle} />
                  </div>
                </div>
              </section>

              {/* Vehicle Details Section */}
              <section className="bg-white/[0.02] backdrop-blur-2xl rounded-2xl p-8 shadow-2xl relative overflow-hidden border-0" aria-label={t('vehicle_details')}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5C35] to-transparent opacity-30" aria-hidden="true"></div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#FF5C35] bg-[#FF5C35]/10 p-1.5 rounded-lg" aria-hidden="true">directions_car</span>
                  {t('vehicle_details')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="v_brand" className={labelStyle}>{t('vehicle_brand')} *</label>
                    <input id="v_brand" type="text" name="brand" value={vehicleData.brand} onChange={handleVehicleChange} disabled={checkoutMutation.isPending} className={inputStyle} placeholder={t('vehicle_brand_placeholder')} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="v_model" className={labelStyle}>{t('vehicle_model')} *</label>
                    <input id="v_model" type="text" name="model" value={vehicleData.model} onChange={handleVehicleChange} disabled={checkoutMutation.isPending} className={inputStyle} placeholder={t('vehicle_model_placeholder')} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="v_year" className={labelStyle}>{t('vehicle_year')}</label>
                    <input id="v_year" type="number" name="year" value={vehicleData.year} onChange={handleVehicleChange} disabled={checkoutMutation.isPending} className={inputStyle} placeholder="2024" min="1990" max="2030" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="v_color" className={labelStyle}>{t('vehicle_color')}</label>
                    <input id="v_color" type="text" name="color" value={vehicleData.color} onChange={handleVehicleChange} disabled={checkoutMutation.isPending} className={inputStyle} placeholder={t('vehicle_color_placeholder')} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="v_plate" className={labelStyle}>{t('vehicle_plate')}</label>
                    <input id="v_plate" type="text" name="plate_number" value={vehicleData.plate_number} onChange={handleVehicleChange} disabled={checkoutMutation.isPending} className={inputStyle} placeholder={t('vehicle_plate_placeholder')} dir="ltr" />
                  </div>
                </div>
              </section>

            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[400px]">
            <aside className="bg-white/[0.02] backdrop-blur-2xl rounded-2xl p-8 shadow-2xl border-0 sticky top-24" aria-label={t('order_summary')}>
              <h2 className="text-xl font-bold mb-6">{t('order_summary')}</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start pb-4 border-b border-white/5">
                  <div>
                    <h3 className="font-bold text-white tracking-tight">{itemName}</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-2">{t('service_label')}</p>
                  </div>
                  <span className="font-bold whitespace-nowrap">{itemPrice.toLocaleString()} {t('sar')}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-400 font-medium">
                  <span>{t('subtotal')}</span>
                  <span>{itemPrice.toLocaleString()} {t('sar')}</span>
                </div>

                {couponResult && (
                  <div className="flex justify-between text-sm text-emerald-400 font-bold">
                    <span>{t('coupon_discount')}</span>
                    <span>- {couponResult.discount_amount?.toLocaleString()} {t('sar')}</span>
                  </div>
                )}

                {companyDiscount > 0 && (
                  <div className="flex justify-between text-sm text-[#FFB19D] font-bold">
                    <span>خصم الشركة ({companyDiscount}%)</span>
                    <span>- {companyDiscountAmount.toLocaleString()} {t('sar')}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-400 font-medium">
                  <span>{t('vat')}</span>
                  <span>{t('vat_included')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-6 border-t border-white/5 mb-8">
                <span className="font-bold text-lg uppercase tracking-wider">{t('total')}</span>
                <div className="text-right flex items-baseline gap-1.5">
                  <span className="font-black text-3xl text-[#FF5C35] drop-shadow-md">{finalPrice.toLocaleString()}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('sar')}</span>
                </div>
              </div>

              <section className="mb-6 p-5 bg-white/[0.02] rounded-2xl border border-white/10" aria-label={t('discount_coupon')}>
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF5C35] text-lg" aria-hidden="true">local_offer</span>
                  {t('discount_coupon')}
                </h2>
                {couponResult ? (
                  <div className="flex items-center justify-between gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <div>
                      <p className="text-emerald-400 font-bold text-xs">{t('coupon_applied')} <span className="font-mono">{couponResult.coupon?.code}</span></p>
                      <p className="text-emerald-300/70 text-[11px] mt-1">{t('you_saved')} {couponResult.discount_amount?.toLocaleString()} {t('sar')}</p>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer">{t('remove')}</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input id="coupon-code-input" type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder={t('enter_coupon')} className="min-w-0 flex-1 bg-white/[0.05] shadow-inner border-0 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all placeholder:text-gray-600 placeholder:" disabled={isCouponLoading} dir="ltr" />
                    <button type="button" onClick={handleApplyCoupon} disabled={isCouponLoading || !couponCode.trim()} className="px-4 py-2.5 bg-[#FF5C35] text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                      {isCouponLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {t('apply')}
                    </button>
                  </div>
                )}
              </section>

              {/* Loyalty points reminder */}
              <div className="mb-6 p-4 bg-[#FF5C35]/5 rounded-xl border border-[#FF5C35]/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#FF5C35] text-xl">redeem</span>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t('loyalty_points_note')} <span className="text-[#FF5C35] font-bold">{t('loyalty_points')}</span> {t('loyalty_points_suffix')}
                </p>
              </div>

              {/* 3 Dedicated Payment Action Buttons */}
              <div className="space-y-3">
                {/* Tabby Button */}
                <button
                  type="button"
                  style={{ backgroundColor: "#3bffa2" }}
                  onClick={() => handlePayWithMethod('tabby')}
                  disabled={checkoutMutation.isPending}
                  className="w-full py-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black text-black hover:brightness-95 shadow-[0_4px_20px_rgba(63,239,218,0.25)] focus:ring-[#3bffa2] cursor-pointer"
                >
                  {checkoutMutation.isPending && selectedPayment === 'tabby' ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                  )}
                  {t('pay_tabby')}
                </button>

                {/* Tamara Button */}
                <button
                  type="button"
                  style={{ backgroundColor: "#ebbfa2" }}
                  onClick={() => handlePayWithMethod('tamara')}
                  disabled={checkoutMutation.isPending}
                  className="w-full py-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black text-black hover:brightness-95 shadow-[0_4px_20px_rgba(255,92,155,0.25)] focus:ring-[#ebbfa2] cursor-pointer"
                >
                  {checkoutMutation.isPending && selectedPayment === 'tamara' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                  )}
                  {t('pay_tamara')}
                </button>

                {/* Test Mode Button */}
                <button
                  type="button"
                  onClick={() => handlePayWithMethod('test')}
                  disabled={checkoutMutation.isPending}
                  className="w-full py-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-105 shadow-[0_4px_20px_rgba(245,158,11,0.25)] focus:ring-amber-500 cursor-pointer"
                >
                  {checkoutMutation.isPending && selectedPayment === 'test' ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-xl" aria-hidden="true">check_circle</span>
                  )}
                  {t('pay_test')}
                </button>
              </div>

            </aside>
          </div>

        </div>
      </div>

      {/* OTP Verification Modal for Guest Checkout */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 bg-black/80 backdrop-blur-md h-screen w-screen overflow-hidden overscroll-contain">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full text-center shadow-2xl relative shrink-0 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar overscroll-contain">
            <button
              type="button"
              onClick={() => setIsOtpModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold cursor-pointer p-1 rounded-full hover:bg-white/10 transition-all"
            >
              ✕
            </button>

            <div className="w-12 h-12 bg-[#FF5C35]/10 border border-[#FF5C35]/30 rounded-2xl flex items-center justify-center text-[#FF5C35] mx-auto mb-3">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              {t('enter_otp', 'إدخال رمز التحقق')}
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              {t('otp_sent_to_phone', 'تم إرسال رمز التحقق (OTP) إلى رقم الجوال')}
            </p>

            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-center text-2xl sm:text-3xl font-bold font-mono text-white tracking-[0.3em] focus:ring-2 focus:ring-[#FF5C35]/50 outline-none mb-4"
              dir="ltr"
              autoFocus
            />

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleConfirmOtp}
                disabled={isVerifyingOtp || otpCode.length !== 6}
                className="w-full py-3 bg-[#FF5C35] hover:brightness-110 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5C35]/20 text-sm"
              >
                {isVerifyingOtp && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {t('confirm_code', 'تأكيد الرمز')}
              </button>

              <button
                type="button"
                onClick={handleVerifyPhoneClick}
                disabled={isSendingOtp}
                className="w-full py-2 bg-transparent text-gray-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {isRTL ? 'إعادة إرسال الرمز' : 'Resend Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
});

export default Checkout;
