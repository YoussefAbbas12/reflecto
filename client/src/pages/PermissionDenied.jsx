import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const PermissionDenied = () => {
  const navigate = useNavigate();

  const handleGoDashboard = (e) => {
    e.preventDefault();
    navigate('/admin', { replace: true });
  };

  return (
    <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-24 md:pt-8 z-10">
      <AdminSidebar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-20">
        <div className="bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-red-500/20 max-w-lg shadow-2xl space-y-6 relative z-30 pointer-events-auto">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
            <span className="material-symbols-outlined text-4xl">block</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-white">غير مصرح بالوصول (Access Denied)</h1>
            <p className="text-sm text-gray-400">
              عذراً، لا تمتلك الصلاحيات الكافية لدخول هذه الصفحة. يمكنك التحدث مع إدارة النظام (Super Admin) لمنحك الصلاحيات المطلوبة.
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Link
              to="/admin"
              onClick={handleGoDashboard}
              className="px-6 py-3 bg-[#FF5C35] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 pointer-events-auto"
            >
              <span className="material-symbols-outlined text-base">dashboard</span>
              <span>الرجوع للوحة التحكم الرئيسية</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PermissionDenied;
