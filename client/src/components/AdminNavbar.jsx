import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import { useAdminTheme } from '../contexts/AdminThemeContext';
import '../main-style.css';

/**
 * Dedicated Admin Navbar:
 * - Independent component specifically for the Admin portal and management pages.
 * - Displays active Admin badge, admin username, Dark/Light mode toggle, and quick controls.
 */
const AdminNavbar = React.memo(() => {
  const location = useLocation();
  const { t } = useTranslation(['common']);
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const { theme, isLight, toggleTheme } = useAdminTheme();

  // Safe dummy handler: Does NOT redirect anywhere when clicked
  const handleDummyClick = (e, label) => {
    e.preventDefault();
  };

  const logoSrc = isLight ? '/assets/photo/seeda-dark-text.png' : '/assets/photo/seeda.png';

  return (
    <nav 
      style={{ direction: 'ltr' }} 
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl transition-colors duration-300 h-20 ${
        isLight
          ? 'bg-white/95 shadow-[0_4px_25px_rgba(0,0,0,0.06)] border-b border-gray-200'
          : 'bg-[#08080a]/90 shadow-[0_10px_35px_rgba(0,0,0,0.7)] border-b border-[#5C24EB]/25'
      }`}
      aria-label="Admin navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        
        {/* Brand / Logo + Admin Badge */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => handleDummyClick(e, 'logo')}
            className="flex items-center gap-2 cursor-default select-none"
            aria-label="Reflecto Admin Portal"
          >
            <img 
              className="main-logo object-contain transition-all duration-300" 
              style={{ maxHeight: '42px', width: 'auto' }}
              src={logoSrc} 
              alt="Seeda Logo" 
            />
          </a>
        </div>


        {/* Right Action Controls: Theme Toggle & Language Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer border ${
              isLight
                ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-amber-500 shadow-sm'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-amber-400 hover:text-white'
            }`}
            title={isLight ? (language === 'ar' ? 'الوضع الليلي' : 'Dark Mode') : (language === 'ar' ? 'الوضع المضيء' : 'Light Mode')}
            aria-label="Toggle dark/light mode"
          >
            <span className="material-symbols-outlined text-lg">
              {isLight ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider cursor-pointer border ${
              isLight
                ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 shadow-sm'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-gray-300 hover:text-white'
            }`}
            title="تغيير اللغة"
          >
            <span className="material-symbols-outlined text-sm">translate</span>
            {language === 'en' ? 'العربية' : 'EN'}
          </button>
        </div>

      </div>
    </nav>
  );
});

export default AdminNavbar;
