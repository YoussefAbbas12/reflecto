import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n.language || window.localStorage.i18nextLng || 'ar';
    const dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', currentLang);
  }, [i18n.language]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  return {
    language: i18n.language,
    changeLanguage,
    toggleLanguage,
    isRTL: i18n.language === 'ar'
  };
};
