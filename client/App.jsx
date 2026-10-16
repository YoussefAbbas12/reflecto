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

const App = () => {
  useLanguage();
  const location = useLocation();
  const { user } = useAuth();

  const portal = useMemo(() => getSubdomainPortal(), []);
  const pathname = location.pathname.toLowerCase();

  const isAdminPortal = portal === 'admin' || pathname.startsWith('/admin');
  const isTechPortal = portal === 'technical' || pathname.startsWith('/technical') || pathname.startsWith('/tech');
  const isAdminLoginPage = pathname === '/admin/login';
  const isTechLoginPage = pathname === '/technical/login' || pathname === '/tech/login';

  const isStaffUser = (u) => u && (u.role === 'admin' || u.role === 'super_admin' || Boolean(u.is_super_admin) || Boolean(u.role_id) || (u.role && u.role !== 'client' && u.role !== 'technician'));
  const isTechUser = (u) => u && (u.role === 'technician' || isStaffUser(u));

  // Strict Subdomain Portal Routing Isolation:
  // 1. ADMIN PORTAL (admin.reflecto.com.sa)
  if (portal === 'admin') {
    if (!user) {
      // If not authenticated, ONLY /admin/login is allowed. Any other route redirects to /admin/login.
      if (pathname !== '/admin/login') {
        return <Navigate to="/admin/login" replace />;
      }
    } else {
      // If authenticated as non-staff (e.g. regular client), reject from admin portal
      if (!isStaffUser(user)) {
        return <Navigate to="/admin/login" replace />;
      }
      // If already logged in as admin and visiting login page or any non-admin route, redirect to /admin
      if (pathname === '/admin/login' || pathname === '/' || pathname === '/login' || !pathname.startsWith('/admin')) {
        return <Navigate to="/admin" replace />;
      }
    }
  }

  // 2. TECHNICAL PORTAL (technical.reflecto.com.sa or tech.reflecto.com.sa)
  if (portal === 'technical') {
    if (!user) {
      // If not authenticated, ONLY tech login is allowed
      if (pathname !== '/technical/login' && pathname !== '/tech/login') {
        return <Navigate to="/technical/login" replace />;
      }
    } else {
      if (!isTechUser(user)) {
        return <Navigate to="/technical/login" replace />;
      }
      // If already logged in and visiting login or any non-tech route, redirect to /technician
      if (pathname === '/technical/login' || pathname === '/tech/login' || pathname === '/' || pathname === '/login' || (!pathname.startsWith('/technician') && !pathname.startsWith('/tech'))) {
        return <Navigate to="/technician" replace />;
      }
    }
  }

  // Determine whether to hide the public navbar & footer
  const hidePublicNavbarAndFooter = isAdminPortal || isTechPortal;

  return (
    <div className={`min-h-screen flex flex-col bg-[#0a0a0a] text-white overflow-x-hidden ${isAdminPortal ? 'pb-0' : ''}`}>
      <ToastContainer />

      {/* Navigation Header Selection */}
      {isAdminPortal ? (
        // Show AdminNavbar only when logged in or inside admin area (not on admin login page)
        !isAdminLoginPage && <AdminNavbar />
      ) : isTechPortal ? (
        // Tech portal has a clean workspace header (no public navbar)
        null
      ) : (
        // Main / Client Portal
        <Navbar />
      )}

      <main className={`flex-grow ${isAdminLoginPage || isTechLoginPage ? 'pt-0' : 'pt-20'} ${isAdminPortal && !isAdminLoginPage ? 'lg:pl-72' : ''}`}>
        <AppRoutes />
      </main>

      {/* Public Footer */}
      {!hidePublicNavbarAndFooter && <Footer />}

      {/* Floating customer widgets — hidden on admin and technician portals */}
      {!hidePublicNavbarAndFooter && (
        <>
          <FloatingContactWidget />
          <FloatingAiAssistant />
        </>
      )}
    </div>
  );
};

export default App;

