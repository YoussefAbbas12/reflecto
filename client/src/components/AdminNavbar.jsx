import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import '../main-style.css';

/**
 * Dedicated Admin Navbar:
 * - Independent component specifically for the Admin portal and management pages.
 * - Links can be customized, and clicking items doesn't trigger unexpected navigation unless desired.
 * - Displays active Admin badge, admin username, and quick controls.
 */
const AdminNavbar = React.memo(() => {
  const location = useLocation();
  const { t } = useTranslation(['common']);
  const { language, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();

  // Safe dummy handler: Does NOT redirect anywhere when clicked
  const handleDummyClick = (e, label) => {
    e.preventDefault();
    // Intentionally stays on the same page as requested by user
  };

  return (
    <nav 
      style={{ direction: 'ltr' }} 
      className="fixed top-0 left-0 right-0 z-50 bg-[#08080a]/90 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.7)] border-b border-[#FF5C35]/20 h-20"
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
              className="main-logo" 
              width="160" 
              height="36" 
              src="/assets/photo/main-logo.png" 
              alt="Reflecto Logo" 
            />
          </a>
        </div>

        {/* Custom Admin Nav Links (Dummy clicks as requested - won't redirect) */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-wider">
          <button
            type="button"
            onClick={(e) => handleDummyClick(e, 'overview')}
            className="text-gray-300 hover:text-indigo-400 transition-colors uppercase tracking-widest px-2 py-1 cursor-default"
          >
            نظرة عامة
          </button>
          <button
            type="button"
            onClick={(e) => handleDummyClick(e, 'operations')}
            className="text-gray-400 hover:text-indigo-400 transition-colors uppercase tracking-widest px-2 py-1 cursor-default"
          >
            إدارة العمليات
          </button>
          <button
            type="button"
            onClick={(e) => handleDummyClick(e, 'security')}
            className="text-gray-400 hover:text-indigo-400 transition-colors uppercase tracking-widest px-2 py-1 cursor-default"
          >
            سجل الأمان
          </button>
        </div>

        {/* Right Action Controls: Language, Admin Profile & Session */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-[11px] font-bold text-gray-300 hover:text-white transition-all uppercase tracking-wider cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">translate</span>
            {language === 'en' ? 'العربية' : 'EN'}
          </button>

          {/* Admin User Info — Static display only, no dropdown */}
          <div className="flex items-center gap-2.5 bg-[#FF5C35]/10 border border-[#FF5C35]/25 px-3.5 py-1.5 rounded-2xl select-none">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#FF5C35] to-[#ff8060] text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
            </div>
            <div className="text-start hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">
                {user?.full_name || 'مسؤول النظام'}
              </p>
              <p style={{color:"#ff5c35"}} className="text-[10px] font-semibold leading-tight">
                {user?.is_super_admin ? 'سوبر أدمن' : 'إدارة الفروع'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </nav>
  );
});

export default AdminNavbar;
