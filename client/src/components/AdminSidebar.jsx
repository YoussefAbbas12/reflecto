import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { useAdminTheme } from '../contexts/AdminThemeContext';

const AdminSidebar = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, hasPermission } = useAuth();
  const { language } = useLanguage();
  const { isLight } = useAdminTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Grouped Navigation Sections into Collapsible Dropdowns
  const navSections = useMemo(() => [
    {
      id: 'dashboard',
      type: 'link',
      label: 'Dashboard',
      labelAr: 'لوحة التحكم',
      icon: 'grid',
      path: '/admin',
      permission: 'view_overview'
    },
    {
      id: 'operations',
      type: 'group',
      label: 'Operations & Orders',
      labelAr: 'العمليات والطلبات',
      icon: 'checklist',
      items: [
        { label: 'Check List & Orders', labelAr: 'قوائم الفحص والطلبات', icon: 'checklist', path: '/admin/orders', permission: 'view_checklists' },
        { label: 'Appointments', labelAr: 'المواعيد والحجوزات', icon: 'calendar', path: '/admin/appointments', permission: 'view_appointments' },
        { label: 'Contact Requests', labelAr: 'طلبات التواصل', icon: 'message-square', path: '/admin/contact-requests', permission: 'view_contact_requests' },
      ]
    },
    {
      id: 'clients',
      type: 'group',
      label: 'Clients & CRM',
      labelAr: 'إدارة العملاء',
      icon: 'users',
      items: [
        { label: 'Clients Management', labelAr: 'إدارة العملاء', icon: 'users', path: '/admin/clients', permission: 'view_clients' },
        { label: 'Customer Details Search', labelAr: 'البحث عن بيانات عميل', icon: 'search', path: '/admin/client-details', permission: 'view_client_details' },
        { label: 'Reviews & Feedback', labelAr: 'التقييمات والآراء', icon: 'star', path: '/admin/reviews', permission: 'view_reviews' },
      ]
    },
    {
      id: 'employees',
      type: 'group',
      label: 'Employees Management',
      labelAr: 'إدارة الموظفين',
      icon: 'badge',
      items: [
        { label: 'Employees Management', labelAr: 'إدارة الموظفين والفنيين', icon: 'badge', path: '/admin/employees', permission: 'view_employees' },
      ]
    },
    {
      id: 'companies',
      type: 'group',
      label: 'Companies & Corporate',
      labelAr: 'الشركات والعقود',
      icon: 'building',
      items: [
        { label: 'Companies & Corporate', labelAr: 'الشركات والجهات', icon: 'building', path: '/admin/companies', permission: 'view_companies' },
      ]
    },
    {
      id: 'packages',
      type: 'group',
      label: 'Services & Packages',
      labelAr: 'الخدمات والباقات',
      icon: 'box',
      items: [
        { label: 'Edit Packages', labelAr: 'تعديل الباقات', icon: 'edit', path: '/admin/edit-package', permission: 'view_packages' },
        { label: 'Add Package', labelAr: 'إضافة باقة جديدة', icon: 'box', path: '/admin/add-package', permission: 'manage_packages' },
        { label: 'Discount Coupons', labelAr: 'كوبونات الخصم', icon: 'tag', path: '/admin/coupons', permission: 'manage_coupons' },
      ]
    },
    {
      id: 'finance',
      type: 'group',
      label: 'Finance & Billing',
      labelAr: 'المالية والفواتير',
      icon: 'credit-card',
      items: [
        { label: 'Price Quotations', labelAr: 'عروض الأسعار', icon: 'file-text', path: '/admin/create-quotation', permission: 'view_quotations' },
        { label: 'Orders & Billing', labelAr: 'الطلبات والفواتير', icon: 'credit-card', path: '/admin/billing', permission: 'view_billing' },
      ]
    },
    {
      id: 'settings',
      type: 'group',
      label: 'System & Settings',
      labelAr: 'النظام والإعدادات',
      icon: 'lock',
      items: [
        { label: 'Permissions Management', labelAr: 'إدارة الصلاحيات', icon: 'lock', path: '/admin/permissions', permission: 'manage_permissions' },
        { label: 'AI Assistant Settings', labelAr: 'إعدادات الذكاء الاصطناعي', icon: 'bot', path: '/admin/ai-prompt', permission: 'manage_ai' },
      ]
    },
  ], []);

  // Track open state for dropdown groups
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    navSections.forEach(section => {
      if (section.type === 'group' && section.items) {
        const isChildActive = section.items.some(
          item => location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
        );
        if (isChildActive) {
          initial[section.id] = true;
        }
      }
    });
    return initial;
  });

  // Whenever the pathname changes, automatically open the parent group of the active route
  useEffect(() => {
    navSections.forEach(section => {
      if (section.type === 'group' && section.items) {
        const isChildActive = section.items.some(
          item => location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
        );
        if (isChildActive) {
          setOpenGroups(prev => ({ ...prev, [section.id]: true }));
        }
      }
    });
  }, [location.pathname, navSections]);

  const toggleGroup = (groupId) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const checkHasPerm = (permKey) => {
    return hasPermission(permKey);
  };

  const displayLabel = (item) => {
    if (language === 'ar' && item.labelAr) {
      return item.labelAr;
    }
    return item.label;
  };

  // Reusable Icon Renderer
  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'grid':
      case 'dashboard':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
        );
      case 'users':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <circle cx="19" cy="11" r="2" />
          </svg>
        );
      case 'building':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
          </svg>
        );
      case 'edit':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        );
      case 'calendar':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'box':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        );
      case 'checklist':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        );
      case 'message-square':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'tag':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        );
      case 'bot':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8.01" y2="16" />
            <line x1="16" y1="16" x2="16.01" y2="16" />
          </svg>
        );
      case 'star':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case 'credit-card':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
        );
      case 'search':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        );
      case 'badge':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="12" cy="9" r="2.5" />
            <path d="M7 17c0-2 2-3 5-3s5 1 5 3" />
          </svg>
        );
      case 'lock':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      case 'file-text':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
  };

  const sidebarContent = (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-24 left-4 z-40 p-2 backdrop-blur-xl rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5C24EB]/50 transition-colors ${
          isLight
            ? 'bg-white/95 border-gray-200 text-gray-800 shadow-md'
            : 'bg-white/[0.05] border-white/10 text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
        }`}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isOpen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {isOpen ? (
            <line x1="18" y1="6" x2="6" y2="18" />
          ) : (
            <line x1="3" y1="12" x2="21" y2="12" />
          )}
          {isOpen ? <line x1="6" y1="6" x2="18" y2="18" /> : <line x1="3" y1="6" x2="21" y2="6" />}
          {!isOpen && <line x1="3" y1="18" x2="21" y2="18" />}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{ direction: 'ltr' }}
        className={`fixed top-20 left-0 h-[calc(100vh-5rem)] w-72 border-r z-40 flex flex-col justify-between transition-all duration-300 ${
          isLight
            ? 'bg-white border-gray-200'
            : 'bg-[#0B0C10] border-white/10'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 pt-1 px-1">
            <img 
              src={isLight ? '/assets/photo/seeda-dark-text.png' : '/assets/photo/seeda.png'} 
              alt="Seeda Logo" 
              fetchPriority="high" 
              className="h-10 w-auto object-contain transition-all duration-300" 
            />
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-1.5" aria-label="Admin Navigation">
            {navSections.map(section => {
              // Direct single link (e.g. Dashboard)
              if (section.type === 'link') {
                const isActive =
                  location.pathname === section.path ||
                  (section.path !== '/admin' && location.pathname.startsWith(section.path));
                const hasPerm = checkHasPerm(section.permission);

                return (
                  <Link
                    key={section.id}
                    to={hasPerm ? section.path : '#'}
                    onClick={(e) => {
                      if (!hasPerm) {
                        e.preventDefault();
                        alert("معندكش صلاحية الوصول للصفحه دي");
                        return;
                      }
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider border-0 ${
                      !hasPerm
                        ? 'opacity-40 filter grayscale cursor-not-allowed text-gray-400'
                        : (isActive 
                            ? (isLight 
                                ? 'bg-purple-100 text-[#5C24EB] border border-purple-200 shadow-xs font-extrabold' 
                                : 'bg-[#5C24EB]/20 text-[#8B5CF6] border border-[#5C24EB]/30 shadow-inner font-extrabold')
                            : (isLight 
                                ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' 
                                : 'text-gray-300 hover:text-white hover:bg-white/[0.05]')
                          )
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${isActive ? 'text-[#8B5CF6]' : 'text-gray-500'}`}>
                        {renderIcon(section.icon)}
                      </div>
                      <span>{displayLabel(section)}</span>
                    </div>
                  </Link>
                );
              }

              // Collapsible Dropdown Group
              const isGroupOpen = Boolean(openGroups[section.id]);
              const isChildActive = section.items.some(
                item => location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
              );

              return (
                <div key={section.id} className="space-y-1">
                  {/* Dropdown Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(section.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider cursor-pointer select-none ${
                      isChildActive
                        ? (isLight 
                            ? 'bg-purple-50/80 text-[#5C24EB]' 
                            : 'bg-[#5C24EB]/10 text-[#8B5CF6]')
                        : (isLight 
                            ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' 
                            : 'text-gray-300 hover:text-white hover:bg-white/[0.04]')
                    }`}
                    aria-expanded={isGroupOpen}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${isChildActive ? 'text-[#8B5CF6]' : 'text-gray-500'}`}>
                        {renderIcon(section.icon)}
                      </div>
                      <span className="truncate">{displayLabel(section)}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isChildActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                      )}
                      {/* Dropdown Arrow matching reference image */}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isChildActive ? 'text-[#8B5CF6]' : 'text-gray-400'
                        } ${isGroupOpen ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  {/* Dropdown Sub-Items List */}
                  {isGroupOpen && (
                    <div className={`pl-5 pr-1 py-1 space-y-1 transition-all duration-200 border-l ${
                      isLight ? 'border-purple-200 ml-4' : 'border-[#5C24EB]/30 ml-4'
                    }`}>
                      {section.items.map(item => {
                        const isActive =
                          location.pathname === item.path ||
                          (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        const hasPerm = checkHasPerm(item.permission);

                        return (
                          <Link
                            key={item.path}
                            to={hasPerm ? item.path : '#'}
                            onClick={(e) => {
                              if (!hasPerm) {
                                e.preventDefault();
                                alert("لا تملك صلاحية الوصول الى هنا");
                                return;
                              }
                              setIsOpen(false);
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-bold text-[10.5px] uppercase tracking-wider ${
                              !hasPerm
                                ? 'opacity-40 filter grayscale cursor-not-allowed text-gray-400'
                                : (isActive 
                                    ? (isLight 
                                        ? 'bg-purple-100 text-[#5C24EB] border border-purple-200 shadow-xs font-extrabold' 
                                        : 'bg-[#5C24EB]/20 text-[#8B5CF6] border border-[#5C24EB]/30 shadow-inner font-extrabold')
                                    : (isLight 
                                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/[0.05]')
                                  )
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <div className={`w-4 h-4 flex items-center justify-center shrink-0 ${isActive ? 'text-[#8B5CF6]' : 'text-gray-500'}`}>
                              {renderIcon(item.icon)}
                            </div>
                            <span className="truncate">{displayLabel(item)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className={`p-4 mt-auto border-t shrink-0 transition-colors duration-300 ${
          isLight ? 'bg-gray-50/80 border-gray-200' : 'bg-[#090A0F] border-white/10'
        }`}>
          {/* Actions: Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                await logout();
                navigate('/admin/login', { replace: true });
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                isLight
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-200 shadow-xs'
                  : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-rose-500/25 shadow-xs'
              }`}
              aria-label="Log out"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span className="text-xs font-bold tracking-wider">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(sidebarContent, document.body);
  }

  return sidebarContent;
});

export default AdminSidebar;
