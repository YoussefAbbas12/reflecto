import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import '../main-style.css'

const Navbar = React.memo(() => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
    const location = useLocation();
    const { t } = useTranslation(['common', 'services']);
    const { language, toggleLanguage, isRTL } = useLanguage();
    const { user } = useAuth();
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Determine dashboard URL based on user role
    const isStaff = user && (user.role === 'admin' || user.role === 'super_admin' || Boolean(user.is_super_admin) || Boolean(user.role_id) || (user.role && user.role !== 'client' && user.role !== 'technician'));
    const dashboardUrl = isStaff ? '/admin' : (user?.role === 'technician' ? '/technician' : '/clientDashboard');

    const closeMenus = useCallback(() => {
        setIsMobileMenuOpen(false);
        setShowDropdown(false);
        setIsMobileServicesOpen(false);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowDropdown(false);
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const NavLink = ({ label, path }) => (
        <Link
            to={path}
            onClick={closeMenus}
            className={`whitespace-nowrap text-[11px] font-bold tracking-widest uppercase transition-colors hover:text-[#FF5C35] ${location.pathname === path ? 'text-[#FF5C35]' : 'text-gray-400'}`}
        >
            {label}
        </Link>
    );

    const LangToggle = ({ className = "" }) => (
        <button
            onClick={toggleLanguage}
            aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            className={`flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] shadow-inner rounded-xl text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all uppercase tracking-widest border-0 ${className}`}
        >
            {language === 'en' ? 'Arabic' : 'English'}
        </button>
    );

    return (
        <nav style={{ direction: "ltr" }} className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-0 h-20" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-full flex items-center justify-between">
                <div className="flex-1 flex justify-start">
                    <Link
                        to="/"
                        onClick={closeMenus}
                        className="flex items-center gap-2 cursor-pointer group z-50"
                        aria-label="Reflecto Home"
                    >
                        <img className='main-logo' width="180" height="40" src="/assets/photo/main-logo.png" alt="Reflecto Logo" fetchPriority="high"/>
                    </Link>
                </div>

                <div className="hidden md:flex flex-1 justify-center items-center gap-8">
                    <NavLink label={t('common:nav_home')} path="/" />
                    <NavLink label={t('common:nav_pricing')} path="/pricing" />

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onMouseEnter={() => setShowDropdown(true)}
                            onFocus={() => setShowDropdown(true)}
                            aria-expanded={showDropdown}
                            aria-haspopup="true"
                            className="text-[11px] font-bold text-gray-400 hover:text-[#FF5C35] flex items-center gap-1 transition-colors whitespace-nowrap tracking-widest uppercase outline-none focus:text-[#FF5C35]"
                        >
                            {t('common:nav_services')}
                            <svg className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                        </button>

                        <div
                            className={`absolute top-full ${isRTL ? 'right-0' : 'left-1/2 -translate-x-1/2'} mt-4 w-56 bg-[#08090b]/95 backdrop-blur-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] border border-white/[0.08] rounded-2xl py-3 transition-all duration-300 z-50 overflow-hidden ${showDropdown ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}`}
                        >
                            {[
                                { label: t('services:ppf_title'), path: '/services/ppf' },
                                { label: t('services:thermal_insulation_title'), path: '/services/window-tint' },
                                { label: t('services:paint_correction_title'), path: '/services/paint-correction' },
                                { label: t('services:nano_ceramic_title'), path: '/services/nano-ceramic' },
                                { label: t('services:dash_cam_title'), path: '/services/dash-cam' },
                                { label: t('services:window_tinting_title'), path: '/services/commercial-tint' }
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    onClick={closeMenus}
                                    className="block w-full text-left px-5 py-2.5 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors tracking-widest uppercase"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <NavLink label={t('common:nav_branches', 'Branches')} path="/branches" />

                    <NavLink label={t('common:nav_contact')} path="/contact" />
                </div>

                <div className="hidden md:flex flex-1 justify-end items-center gap-4">
                    <LangToggle />
                    <Link
                        to={dashboardUrl}
                        style={{ whiteSpace: 'nowrap' }}
                        className="px-4 py-2 bg-[#FF5C35]/10 text-[#FF5C35] font-bold text-[10px] tracking-widest uppercase rounded-xl hover:bg-[#FF5C35] hover:text-white transition-all shadow-inner border-0 whitespace-nowrap flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50">
                        {t('common:nav_dashboard')}
                        <span className="material-symbols-outlined text-lg">account_circle</span>
                    </Link>
                </div>

                <div className="md:hidden flex items-center gap-2 z-50">
                    <LangToggle className="px-2 py-1 text-[9px] sm:text-[10px]" />
                    <Link
                        to={dashboardUrl}
                        className="px-2.5 py-1.5 bg-[#FF5C35]/10 text-[#FF5C35] font-bold text-[10px] tracking-widest uppercase rounded-lg hover:bg-[#FF5C35] hover:text-white transition-all flex items-center gap-1.5 shadow-inner border-0 whitespace-nowrap">
                        <span className="hidden sm:inline">{t('common:nav_dashboard')}</span>
                        <span className="material-symbols-outlined text-base">account_circle</span>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        onKeyDown={(e) => e.key === 'Escape' && setIsMobileMenuOpen(false)}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        className="text-white p-2 bg-white/[0.05] rounded-lg shadow-inner border-0 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        )}
                    </button>
                </div>
            </div>

            <div
                id="mobile-menu"
                className={`md:hidden absolute top-20 left-0 right-0 bg-[#000000]/95 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-0 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="flex flex-col p-5 gap-2">
                    <Link
                        to={dashboardUrl}
                        onClick={closeMenus}
                        className="flex items-center justify-between p-3.5 bg-[#FF5C35]/15 border border-[#FF5C35]/30 rounded-xl text-[#FF5C35] font-bold text-xs uppercase tracking-wider mb-2 shadow-sm"
                    >
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">account_circle</span>
                            {t('common:nav_dashboard')}
                        </span>
                        <span className="material-symbols-outlined text-sm">{isRTL ? 'chevron_left' : 'chevron_right'}</span>
                    </Link>

                    <Link to="/" onClick={closeMenus} className={`text-left text-[11px] font-bold tracking-widest uppercase p-3 rounded-xl transition-colors ${location.pathname === '/' ? 'text-[#FF5C35] bg-[#FF5C35]/10 shadow-inner' : 'text-white hover:bg-white/[0.05]'}`}>{t('common:nav_home')}</Link>
                    <Link to="/pricing" onClick={closeMenus} className={`text-left text-[11px] font-bold tracking-widest uppercase p-3 rounded-xl transition-colors ${location.pathname === '/pricing' ? 'text-[#FF5C35] bg-[#FF5C35]/10 shadow-inner' : 'text-white hover:bg-white/[0.05]'}`}>{t('common:nav_pricing')}</Link>

                    <div className="my-1 py-2 flex flex-col gap-1 border-y border-white/[0.05]">
                        <button
                            type="button"
                            onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                            className="flex items-center justify-between w-full p-3 text-[11px] font-bold tracking-widest uppercase text-gray-300 hover:text-white transition-colors"
                        >
                            <span>{t('common:nav_services')}</span>
                            <svg className={`transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                        
                        {isMobileServicesOpen && (
                            <div className="flex flex-col gap-1 pl-2">
                                {[
                                    { label: t('services:ppf_title'), path: '/services/ppf' },
                                    { label: t('services:thermal_insulation_title'), path: '/services/window-tint' },
                                    { label: t('services:nano_ceramic_title'), path: '/services/nano-ceramic' },
                                    { label: t('services:paint_correction_title'), path: '/services/paint-correction' },
                                    { label: t('services:dash_cam_title'), path: '/services/dash-cam' },
                                    { label: t('services:window_tinting_title'), path: '/services/commercial-tint' },
                                ].map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        onClick={closeMenus}
                                        className={`text-left text-[10px] font-bold tracking-widest uppercase p-3 pl-6 rounded-xl transition-colors ${location.pathname === item.path ? 'text-[#FF5C35] bg-[#FF5C35]/5 shadow-inner' : 'text-gray-400 hover:bg-white/[0.02]'}`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link to="/contact" onClick={closeMenus} className={`text-left text-[11px] font-bold tracking-widest uppercase p-3 rounded-xl transition-colors ${location.pathname === '/contact' ? 'text-[#FF5C35] bg-[#FF5C35]/10 shadow-inner' : 'text-white hover:bg-white/[0.05]'}`}>{t('common:nav_contact')}</Link>
                    <Link to="/branches" onClick={closeMenus} className={`text-left text-[11px] font-bold tracking-widest uppercase p-3 rounded-xl transition-colors ${location.pathname === '/branches' ? 'text-[#FF5C35] bg-[#FF5C35]/10 shadow-inner' : 'text-white hover:bg-white/[0.05]'}`}>{t('common:nav_branches', 'Branches')}</Link>
                    
                    <div className="pt-3 mt-1 border-t border-white/[0.05] flex justify-between items-center px-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Language / اللغة</span>
                        <LangToggle className="px-3 py-1.5" />
                    </div>
                </div>
            </div>
        </nav>
    );
});

export default Navbar;