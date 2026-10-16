import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';

const AdminSidebar = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, hasPermission } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = useMemo(() => [
    { label: 'Dashboard', icon: 'grid', path: '/admin', permission: 'view_overview' },
    { label: 'Check List & Orders', icon: 'checklist', path: '/admin/orders', permission: 'view_checklists' },
    { label: 'Price Quotations', icon: 'file-text', path: '/admin/create-quotation', permission: 'view_quotations' },
    { label: 'Customer Details Search', icon: 'search', path: '/admin/client-details', permission: 'view_client_details' },
    { label: 'Appointments', icon: 'calendar', path: '/admin/appointments', permission: 'view_appointments' },
    { label: 'Contact Requests', icon: 'message-square', path: '/admin/contact-requests', permission: 'view_contact_requests' },
    { label: 'Clients Management', icon: 'users', path: '/admin/clients', permission: 'view_clients' },
    { label: 'Employees Management', icon: 'badge', path: '/admin/employees', permission: 'view_employees' },
    { label: 'Companies & Corporate', icon: 'building', path: '/admin/companies', permission: 'view_companies' },
    { label: 'Edit Packages', icon: 'edit', path: '/admin/edit-package', permission: 'view_packages' },
    { label: 'Add Package', icon: 'box', path: '/admin/add-package', permission: 'manage_packages' },
    { label: 'Discount Coupons', icon: 'tag', path: '/admin/coupons', permission: 'manage_coupons' },
    { label: 'Reviews & Feedback', icon: 'star', path: '/admin/reviews', permission: 'view_reviews' },
    { label: 'Orders & Billing', icon: 'credit-card', path: '/admin/billing', permission: 'view_billing' },
    { label: 'AI Assistant Settings', icon: 'bot', path: '/admin/ai-prompt', permission: 'manage_ai' },
    { label: 'Permissions Management', icon: 'lock', path: '/admin/permissions', permission: 'manage_permissions' },
  ], []);

  const checkHasPerm = (permKey) => {
    return hasPermission(permKey);
  };

  const sidebarContent = (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-24 left-4 z-40 p-2 bg-white/[0.05] backdrop-blur-xl rounded-xl border-0 text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-colors"
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
        className={`fixed top-20 left-0 h-[calc(100vh-5rem)] w-72 bg-[#0B0C10] border-r border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.8)] z-40 flex flex-col justify-between transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 mb-6 pt-1">
            <img src="/assets/photo/main-logo.png" alt="Reflecto Logo" fetchPriority="high" className="h-10 w-auto object-contain" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Admin Navigation">
            {menuItems.map(item => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              const hasPerm = checkHasPerm(item.permission);

              return (
                <Link
                  key={item.label}
                  to={hasPerm ? item.path : '#'}
                  onClick={(e) => {
                    if (!hasPerm) {
                      e.preventDefault();
                      alert("معندكش صلاحية الوصول للصفحه دي");
                      return;
                    }
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider border-0 ${
                    !hasPerm
                      ? 'opacity-40 filter grayscale cursor-not-allowed text-gray-500'
                      : (isActive ? 'bg-[#FF5C35]/15 text-[#FF5C35] shadow-inner font-extrabold' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]')
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div
                    className={`w-5 h-5 flex items-center justify-center shrink-0 ${isActive ? 'text-[#FF5C35]' : 'text-gray-500'}`}
                    aria-hidden="true"
                  >
                    {(item.icon === 'grid' || item.icon === 'dashboard') && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                    )}
                    {item.icon === 'users' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <circle cx="19" cy="11" r="2" />
                      </svg>
                    )}
                    {item.icon === 'building' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                        <path d="M9 22v-4h6v4" />
                        <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
                      </svg>
                    )}
                    {item.icon === 'edit' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    )}
                    {item.icon === 'calendar' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    )}
                    {item.icon === 'box' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                    )}
                    {item.icon === 'checklist' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                    )}
                    {item.icon === 'message-square' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    )}
                    {item.icon === 'tag' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                    )}
                    {item.icon === 'bot' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <circle cx="12" cy="5" r="2" />
                        <path d="M12 7v4" />
                        <line x1="8" y1="16" x2="8.01" y2="16" />
                        <line x1="16" y1="16" x2="16.01" y2="16" />
                      </svg>
                    )}
                    {item.icon === 'star' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}
                    {item.icon === 'credit-card' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                    )}
                    {item.icon === 'search' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    )}
                    {item.icon === 'badge' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <circle cx="12" cy="9" r="2.5" />
                        <path d="M7 17c0-2 2-3 5-3s5 1 5 3" />
                      </svg>
                    )}
                    {item.icon === 'lock' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                    {item.icon === 'file-text' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    )}
                    {!['grid', 'dashboard', 'users', 'building', 'edit', 'calendar', 'box', 'checklist', 'message-square', 'tag', 'bot', 'star', 'credit-card', 'search', 'badge', 'lock', 'file-text'].includes(item.icon) && (
                      <span className="material-symbols-outlined text-base">dashboard</span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 mt-auto bg-[#090A0F] border-t border-white/10 shrink-0">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.04] rounded-xl border border-white/10">
              <div className="w-9 h-9 rounded-full bg-[#FF5C35]/15 border border-[#FF5C35]/30 text-[#FF5C35] flex items-center justify-center shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-xl">person</span>
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-[11px] font-black tracking-wider uppercase text-white truncate">{user?.full_name || 'Administrator'}</div>
                <div className="text-[9px] font-bold text-[#FF5C35] tracking-wider uppercase truncate">{user?.role || 'Admin'}</div>
              </div>
            </div>
            <button
              onClick={async () => {
                await logout();
                navigate('/admin/login', { replace: true });
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors w-full text-left cursor-pointer"
              aria-label="Log out"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span className="text-[10px] font-black tracking-widest uppercase">Logout</span>
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
