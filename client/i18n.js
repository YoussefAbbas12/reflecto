import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources directly
import commonEn from './src/locales/en/common.json';
import homeEn from './src/locales/en/home.json';
import servicesEn from './src/locales/en/services.json';
import service5En from './src/locales/en/service5.json';
import pricingEn from './src/locales/en/pricing.json';
import ppfEn from './src/locales/en/ppf.json';
import tintEn from './src/locales/en/tint.json';
import paintCorrectionEn from './src/locales/en/paint_correction.json';
import dashcamEn from './src/locales/en/dashcam.json';
import contactEn from './src/locales/en/contact.json';
import adminClientsEn from './src/locales/en/admin_clients.json';
import branchesEn from './src/locales/en/branches.json';
import authEn from './src/locales/en/auth.json';
import checkoutEn from './src/locales/en/checkout.json';
import checkoutStatusEn from './src/locales/en/checkout_status.json';
import dashboardEn from './src/locales/en/dashboard.json';
import commercialTintEn from './src/locales/en/commercial_tint.json';

import commonAr from './src/locales/ar/common.json';
import homeAr from './src/locales/ar/home.json';
import servicesAr from './src/locales/ar/services.json';
import service5Ar from './src/locales/ar/service5.json';
import pricingAr from './src/locales/ar/pricing.json';
import ppfAr from './src/locales/ar/ppf.json';
import tintAr from './src/locales/ar/tint.json';
import paintCorrectionAr from './src/locales/ar/paint_correction.json';
import dashcamAr from './src/locales/ar/dashcam.json';
import contactAr from './src/locales/ar/contact.json';
import adminClientsAr from './src/locales/ar/admin_clients.json';
import branchesAr from './src/locales/ar/branches.json';
import authAr from './src/locales/ar/auth.json';
import checkoutAr from './src/locales/ar/checkout.json';
import checkoutStatusAr from './src/locales/ar/checkout_status.json';
import dashboardAr from './src/locales/ar/dashboard.json';
import commercialTintAr from './src/locales/ar/commercial_tint.json';

const resources = {
  en: {
    common: commonEn,
    home: homeEn,
    services: servicesEn,
    service5: service5En,
    pricing: pricingEn,
    ppf: ppfEn,
    tint: tintEn,
    paint_correction: paintCorrectionEn,
    dashcam: dashcamEn,
    contact: contactEn,
    admin_clients: adminClientsEn,
    branches: branchesEn,
    auth: authEn,
    checkout: checkoutEn,
    checkout_status: checkoutStatusEn,
    dashboard: dashboardEn,
    commercial_tint: commercialTintEn
  },
  ar: {
    common: commonAr,
    home: homeAr,
    services: servicesAr,
    service5: service5Ar,
    pricing: pricingAr,
    ppf: ppfAr,
    tint: tintAr,
    paint_correction: paintCorrectionAr,
    dashcam: dashcamAr,
    contact: contactAr,
    admin_clients: adminClientsAr,
    branches: branchesAr,
    auth: authAr,
    checkout: checkoutAr,
    checkout_status: checkoutStatusAr,
    dashboard: dashboardAr,
    commercial_tint: commercialTintAr
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    
    // Default namespace to load
    defaultNS: 'common',
    
    // Allowed namespaces
    ns: [
      'common',
      'home',
      'services',
      'service5',
      'pricing',
      'ppf',
      'tint',
      'paint_correction',
      'dashcam',
      'contact',
      'admin_clients',
      'branches',
      'auth',
      'checkout',
      'checkout_status',
      'dashboard',
      'commercial_tint'
    ],

    interpolation: {
      escapeValue: false, 
    },
    
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'navigator'],
      caches: ['localStorage', 'cookie'],
    }
  });

export default i18n;
