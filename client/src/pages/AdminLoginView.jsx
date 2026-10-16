import React from 'react';
import PortalLoginLayout from '../components/PortalLoginLayout';

const AdminLoginView = () => {
  return (
    <PortalLoginLayout
      portalType="admin"
      subtitle="سجل دخولك إلى النظام الإداري"
      redirectPath="/admin"
      storageKey="reflecto_remember_admin"
      forgotPasswordMessage="يرجى التواصل مع مسؤول النظام العام أو قسم الدعم الفني لمساعدتك في استعادة وتعيين كلمة مرور الحساب الإداري."
    />
  );
};

export default AdminLoginView;
