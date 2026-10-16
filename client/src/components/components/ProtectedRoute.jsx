import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PermissionDenied from '../../pages/PermissionDenied';
import { getSubdomainPortal } from '../../utils/portal';

/**
 * @param {ProtectedRouteProps} props
 */
const ProtectedRoute = React.memo(({ children, requiredRole, requiredPermission }) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#000000] flex items-center justify-center" aria-busy="true" aria-label="Loading protected route">
        <div className="w-10 h-10 border-4 border-[#FF5C35] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,92,53,0.5)]" />
      </main>
    );
  }

  const portal = getSubdomainPortal();
  const isStaffUser = (u) => u && (u.role === 'admin' || u.role === 'super_admin' || Boolean(u.is_super_admin) || Boolean(u.role_id) || (u.role && u.role !== 'client' && u.role !== 'technician'));
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : null);

  if (!isAuthenticated) {
    const loginTarget = portal === 'admin' || (allowedRoles && allowedRoles.includes('admin'))
      ? '/admin/login'
      : (portal === 'technical' || (allowedRoles && allowedRoles.includes('technician')))
        ? '/technical/login'
        : '/login';
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  const hasRoleAccess = allowedRoles ? (
    allowedRoles.includes(user?.role) || (allowedRoles.includes('admin') && isStaffUser(user))
  ) : true;

  if (!hasRoleAccess) {
    if (portal === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    if (portal === 'technical') {
      return <Navigate to="/technical/login" replace />;
    }
    // If the user doesn't have the required role, redirect them to their respective dashboard
    if (isStaffUser(user)) {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'technician') {
      return <Navigate to="/technician" replace />;
    } else {
      return <Navigate to="/clientDashboard" replace />;
    }
  }

  // Permission check for admins/staff (Super Admin bypasses)
  const isSuperAdmin = user?.is_super_admin || user?.role === 'super_admin';
  if (requiredPermission && isStaffUser(user) && !isSuperAdmin) {
    let perms = {};
    if (user?.permissions) {
      try {
        perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
      } catch (e) { perms = {}; }
    }
    if (!perms[requiredPermission]) {
      return <PermissionDenied />;
    }
  }

  // Mobile screen lock for admin/staff accounts
  if (isStaffUser(user) && isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-[#000000] text-[#e5e2e1] flex flex-col items-center justify-center p-6 text-center font-body selection:bg-[#FF5C35]/30">
        <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-xl border border-[#FF5C35]/20 p-8 rounded-3xl shadow-[0_0_50px_rgba(255,92,53,0.15)] flex flex-col items-center space-y-6">
          <div className="w-20 h-20 bg-[#FF5C35]/10 border border-[#FF5C35]/30 rounded-2xl flex items-center justify-center text-[#FF5C35] shadow-inner">
            <span className="material-symbols-outlined text-4xl">desktop_access_disabled</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">عفواً، الدخول غير متاح من الجوال</h2>
            <p className="text-sm text-gray-300 font-bold leading-relaxed">
              ممنوع تسجيل الدخول بحساب الأدمن من الهاتف المحمول أو الشاشات الصغيرة. يرجى الدخول من جهاز كمبيوتر (Desktop) لمتابعة إدارة النظام.
            </p>
          </div>

          <div className="pt-4 w-full flex justify-center">
            <button
              type="button"
              onClick={logout}
              className="w-full py-4 bg-[#FF5C35] hover:bg-[#ff481b] text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-[0_0_25px_rgba(255,92,53,0.4)] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span>تسجيل الخروج (Logout)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
});

export default ProtectedRoute;