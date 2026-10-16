import React from 'react';
import PortalLoginLayout from '../components/PortalLoginLayout';

const TechLoginView = () => {
  return (
    <PortalLoginLayout
      portalType="technician"
      subtitle="سجل دخولك إلى نظام الفنيين"
      redirectPath="/technician"
      storageKey="reflecto_remember_tech"
      forgotPasswordMessage="يرجى مراجعة مدير الفرع أو إدارة الورشة لمساعدتك في إعادة تعيين كلمة مرور حساب الفني."
    />
  );
};

export default TechLoginView;
