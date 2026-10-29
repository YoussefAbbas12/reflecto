import React, { useMemo } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import Navbar from './src/components/Navbar';
import AdminNavbar from './src/components/AdminNavbar';
import Footer from './src/components/Footer';
import AppRoutes from './src/routes/routes';
import ToastContainer from './src/components/ui/Toast';
import { useLanguage } from './src/hooks/useLanguage';
import FloatingContactWidget from './src/components/FloatingContactWidget';
import FloatingAiAssistant from './src/components/FloatingAiAssistant';
import { getSubdomainPortal } from './src/utils/portal';
import { useAuth } from './src/contexts/AuthContext';
import { useAdminTheme } from './src/contexts/AdminThemeContext';

const App = () => {
  useLanguage();
  const location = useLocation();
  const { user } = useAuth();
  const { isLight } = useAdminTheme();

  const portal = useMemo(() => getSubdomainPortal(), []);
  const pathname = location.pathname.toLowerCase();

  const isAdminPortal = portal === 'admin';
  const isTechPortal = portal === 'technical';
  const isAdminLoginPage = pathname === '/admin/login' || pathname === '/login';
  const isTechLoginPage = pathname === '/technical/login' || pathname === '/tech/login';
  const isAnyStaffLoginPage = pathname === '/admin/login' || pathname === '/technical/login' || pathname === '/tech/login';
  const isClientLoginPage = portal === 'client' && pathname === '/login';

  const isAboutSeedaPage = pathname === '/about-seeda' || pathname === '/seeda' || pathname === '/admin/about-seeda';

  const isStaffUser = (u) => u && (u.role === 'admin' || u.role === 'super_admin' || Boolean(u.is_super_admin) || Boolean(u.role_id) || (u.role && u.role !== 'client' && u.role !== 'technician'));
  const isTechUser = (u) => u && (u.role === 'technician' || isStaffUser(u));

  // Strict Subdomain Portal Routing Isolation:
  // 1. ADMIN PORTAL (admin.reflecto.com.sa / admin.localhost)
  if (portal === 'admin') {
    if (!user) {
      // If not authenticated, allow login and public about-seeda info page
      const isPublicAdminRoute = 
        pathname === '/admin/login' || 
        pathname === '/login' || 
        pathname === '/' || 
        isAboutSeedaPage;

      if (!isPublicAdminRoute) {
        return (typeof window !== "undefined" ? (window.location.href = "https://seeda.reflecto.com.sa/#login", null) : null);
      }
    } else {
      // If authenticated as non-staff (e.g. regular client), reject from admin portal
      if (!isStaffUser(user)) {
        return <Navigate to="/admin/login" replace />;
      }
      // If already logged in as admin and visiting login page or home, redirect to /admin
      if (pathname === '/admin/login' || pathname === '/' || pathname === '/login') {
        return <Navigate to="/admin" replace />;
      }
    }
  }

    // 2. TECHNICAL PORTAL (technical.reflecto.com.sa / tech.reflecto.com.sa)
  if (portal === 'technical') {
    if (!user) {
      const hasAuthInUrl = typeof window !== 'undefined' && (
        window.location.hash.includes('auth_data') || 
        window.location.search.includes('auth_data') ||
        window.location.hash.includes('access_token') ||
        window.location.search.includes('access_token')
      );
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (!hasAuthInUrl && !isLocal) {
        return (typeof window !== "undefined" ? (window.location.href = "https://seeda.reflecto.com.sa/#login", null) : null);
      }
    }
  }

  // 3. CLIENT PORTAL (reflecto.com.sa / www.reflecto.com.sa)
  // Strictly isolate: NEVER allow admin or technician pages/logins on the public customer domain!
  if (portal === 'client') {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/technical') ||
      pathname.startsWith('/tech')
    ) {
      if (isAnyStaffLoginPage) {
        return (
          <div className="min-h-screen flex flex-col bg-[#07080a] text-white">
            <main className="flex-grow pt-0">
              <AppRoutes />
            </main>
          </div>
        );
      }
      return (
        <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
          <Navbar />
          <main className="flex-grow pt-20">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      );
    }
  }

  // Determine whether to hide the public navbar & footer
  const hidePublicNavbarAndFooter = isAdminPortal || isTechPortal || isAnyStaffLoginPage || isClientLoginPage;

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300 ${isAdminPortal ? 'pb-0' : ''} ${
      isAdminPortal
        ? (isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#0a0a0a] text-white admin-dark-theme')
        : 'bg-[#0a0a0a] text-white'
    }`}>
      <ToastContainer />

      {/* Navigation Header Selection - strictly hidden on login pages */}
      {isAnyStaffLoginPage || isClientLoginPage ? null : isAdminPortal ? (
        // Show AdminNavbar only when logged in or inside admin area (not on admin login page or about-seeda)
        !isAboutSeedaPage && <AdminNavbar />
      ) : isTechPortal ? (
        // Tech portal has a clean workspace header (no public navbar)
        null
      ) : (
        // Main / Client Portal — hide Navbar on about-seeda (standalone page)
        !isAboutSeedaPage && <Navbar />
      )}

      <main className={`flex-grow ${isAnyStaffLoginPage || isClientLoginPage || isAboutSeedaPage || isTechPortal ? 'pt-0' : 'pt-20'} ${isAdminPortal && !isAnyStaffLoginPage && !isAboutSeedaPage ? 'lg:pl-72' : ''}`}>
        <AppRoutes />
      </main>

      {/* Public Footer — hidden on login pages and about-seeda */}
      {!hidePublicNavbarAndFooter && !isAboutSeedaPage && <Footer />}

      {/* Floating customer widgets — hidden on admin/technician portals, login pages and about-seeda */}
      {!hidePublicNavbarAndFooter && !isAboutSeedaPage && (
        <>
          <FloatingContactWidget />
          <FloatingAiAssistant />
        </>
      )}
    </div>
  );
};

export default App;

