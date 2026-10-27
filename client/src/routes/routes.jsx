import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Eagerly loaded components for instant initial paint
import HomeView from '../pages/HomeView';
import ProtectedRoute from '../components/components/ProtectedRoute';
import PageTransition from '../components/components/PageTransition';
import { getSubdomainPortal } from '../utils/portal';

// Lazy loaded pages for performance & minimal initial JS payload
const PricingView = lazy(() => import('../pages/PricingView'));
const BranchesView = lazy(() => import('../pages/Branches'));
const DashboardView = lazy(() => import('../pages/ClientDashboard'));
const LoginView = lazy(() => import('../pages/LoginView'));
const OTPView = lazy(() => import('../pages/OTPView'));
const RegisterView = lazy(() => import('../pages/RegisterView'));
const RegisterOTPView = lazy(() => import('../pages/RegisterOTPView'));
const SetPasswordView = lazy(() => import('../pages/SetPasswordView'));
const ForgotPasswordView = lazy(() => import('../pages/ForgotPasswordView'));
const ForgotPasswordOTPView = lazy(() => import('../pages/ForgotPasswordOTPView'));
const ResetPasswordView = lazy(() => import('../pages/ResetPasswordView'));
const Contact = lazy(() => import('../pages/Contact'));

const Ppf = lazy(() => import('../pages/services/Ppf'));
const Tint = lazy(() => import('../pages/services/Tint'));
const PaintCorrection = lazy(() => import('../pages/services/PaintCorrection'));
const DashCam = lazy(() => import('../pages/services/DashCam'));
const NanoCeramic = lazy(() => import('../pages/services/NanoCeramic'));
const CommercialTinting = lazy(() => import('../pages/services/CommercialTinting'));

const AdminOverview = lazy(() => import('../pages/AdminOverview'));
const AdminScheduling = lazy(() => import('../pages/AdminScheduling'));
const AdminClients = lazy(() => import('../pages/AdminClients'));
const AdminEmployees = lazy(() => import('../pages/AdminEmployees'));
const AdminCompanies = lazy(() => import('../pages/AdminCompanies'));
const AdminAppointments = lazy(() => import('../pages/AdminAppointments'));
const AddClient = lazy(() => import('../pages/AddClient'));
const EditClient = lazy(() => import('../pages/EditClient'));
const EditPackage = lazy(() => import('../pages/EditPackage'));
const AddPackage = lazy(() => import('../pages/AddPackage'));
const AddService = lazy(() => import('../pages/AddService'));
const EditService = lazy(() => import('../pages/EditService'));
const AdminOrders = lazy(() => import('../pages/AdminOrders'));
const AdminPriceQuotation = lazy(() => import('../pages/AdminPriceQuotation'));
const AdminQuotationPreview = lazy(() => import('../pages/AdminQuotationPreview'));
const AddOrder = lazy(() => import('../pages/AddOrder'));
const EditOrder = lazy(() => import('../pages/EditOrder'));
const OrderDetails = lazy(() => import('../pages/OrderDetails'));
const ClientDetails = lazy(() => import('../pages/ClientDetails'));
const AdminContactRequests = lazy(() => import('../pages/AdminContactRequests'));
const AdminCoupons = lazy(() => import('../pages/AdminCoupons'));
const AdminAiPrompt = lazy(() => import('../pages/AdminAiPrompt'));
const AdminReviews = lazy(() => import('../pages/AdminReviews'));
const AdminPermissions = lazy(() => import('../pages/AdminPermissions'));
const TechnicianDashboard = lazy(() => import('../pages/TechnicianDashboard'));
const AddEmployee = lazy(() => import('../pages/AddEmployee'));
const EditEmployee = lazy(() => import('../pages/EditEmployee'));

const OrdersBilling = lazy(() => import('../pages/OrdersBilling'));
const Checkout = lazy(() => import('../pages/Checkout'));
const CheckoutStatus = lazy(() => import('../pages/CheckoutStatus'));
const BookService = lazy(() => import('../pages/BookService'));
const PayRemainingBalance = lazy(() => import('../pages/PayRemainingBalance'));
const AdminLoginView = lazy(() => import('../pages/AdminLoginView'));
const TechLoginView = lazy(() => import('../pages/TechLoginView'));
const AboutSeeda = lazy(() => import('../pages/AboutSeeda'));
const NotFound = lazy(() => import('../error-page/notFound'));

const PageFallback = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-black" aria-label="Loading page">
    <div className="w-10 h-10 border-4 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const AnimatedRoute = ({ children }) => {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
};

const AppRoutes = () => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [location.pathname]);

  const portal = getSubdomainPortal();

  // If on public Client portal (reflecto.com.sa / www.reflecto.com.sa), render ONLY client routes
  if (portal === 'client') {
    return (
      <Suspense fallback={<PageFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedRoute><HomeView /></AnimatedRoute>} />
          <Route path="/branches" element={<AnimatedRoute><BranchesView /></AnimatedRoute>} />
          <Route path="/pricing" element={<AnimatedRoute><PricingView /></AnimatedRoute>} />
          <Route path="/contact" element={<AnimatedRoute><Contact /></AnimatedRoute>} />
          <Route path="/login" element={<AnimatedRoute><LoginView /></AnimatedRoute>} />
          <Route path="/otp" element={<AnimatedRoute><OTPView /></AnimatedRoute>} />
          <Route path="/register" element={<AnimatedRoute><RegisterView /></AnimatedRoute>} />
          <Route path="/register/otp" element={<AnimatedRoute><RegisterOTPView /></AnimatedRoute>} />
          <Route path="/register/password" element={<AnimatedRoute><SetPasswordView /></AnimatedRoute>} />
          <Route path="/forgot-password" element={<AnimatedRoute><ForgotPasswordView /></AnimatedRoute>} />
          <Route path="/forgot-password/otp" element={<AnimatedRoute><ForgotPasswordOTPView /></AnimatedRoute>} />
          <Route path="/forgot-password/reset" element={<AnimatedRoute><ResetPasswordView /></AnimatedRoute>} />
          <Route path="/clientDashboard" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="client">
                <DashboardView />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/services/ppf" element={<AnimatedRoute><Ppf /></AnimatedRoute>} />
          <Route path="/services/window-tint" element={<AnimatedRoute><Tint /></AnimatedRoute>} />
          <Route path="/services/paint-correction" element={<AnimatedRoute><PaintCorrection /></AnimatedRoute>} />
          <Route path="/services/dash-cam" element={<AnimatedRoute><DashCam /></AnimatedRoute>} />
          <Route path="/services/nano-ceramic" element={<AnimatedRoute><NanoCeramic /></AnimatedRoute>} />
          <Route path="/services/commercial-tint" element={<AnimatedRoute><CommercialTinting /></AnimatedRoute>} />
          <Route path="/checkout" element={<AnimatedRoute><Checkout /></AnimatedRoute>} />
          <Route path="/checkout/success" element={<AnimatedRoute><CheckoutStatus status="success" /></AnimatedRoute>} />
          <Route path="/checkout/cancel" element={<AnimatedRoute><CheckoutStatus status="cancel" /></AnimatedRoute>} />
          <Route path="/book-service" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="client">
                <BookService />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/pay-balance" element={<AnimatedRoute><PayRemainingBalance /></AnimatedRoute>} />
          <Route path="/pay-remaining" element={<AnimatedRoute><PayRemainingBalance /></AnimatedRoute>} />
          <Route path="/checkout/pay-remaining" element={<AnimatedRoute><PayRemainingBalance /></AnimatedRoute>} />
          <Route path="/about-seeda" element={<AnimatedRoute><AboutSeeda /></AnimatedRoute>} />
          <Route path="/seeda" element={<AnimatedRoute><AboutSeeda /></AnimatedRoute>} />
          
          {/* Explicitly block and 404 all admin and technician endpoints on client portal */}
          <Route path="/admin/*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
          <Route path="/technical/*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
          <Route path="/tech/*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
          <Route path="/technician" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
          <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
        </Routes>
      </Suspense>
    );
  }

  // If on Technical portal (technical.reflecto.com.sa / tech.reflecto.com.sa), render ONLY technician routes
  if (portal === 'technical') {
    return (
      <Suspense fallback={<PageFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedRoute><TechLoginView /></AnimatedRoute>} />
          <Route path="/login" element={<AnimatedRoute><TechLoginView /></AnimatedRoute>} />
          <Route path="/technical/login" element={<AnimatedRoute><TechLoginView /></AnimatedRoute>} />
          <Route path="/tech/login" element={<AnimatedRoute><TechLoginView /></AnimatedRoute>} />
          <Route path="/technician" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole={['technician', 'admin']}>
                <TechnicianDashboard />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
        </Routes>
      </Suspense>
    );
  }

  // Admin Portal (admin.reflecto.com.sa / admin.localhost)
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes location={location} key={location.pathname}>
          {/* Admin Login & Root Routes */}
          <Route path="/" element={<AnimatedRoute><AdminLoginView /></AnimatedRoute>} />
          <Route path="/login" element={<AnimatedRoute><AdminLoginView /></AnimatedRoute>} />
          <Route path="/admin/login" element={<AnimatedRoute><AdminLoginView /></AnimatedRoute>} />
          <Route path="/about-seeda" element={<AnimatedRoute><AboutSeeda /></AnimatedRoute>} />
          <Route path="/seeda" element={<AnimatedRoute><AboutSeeda /></AnimatedRoute>} />
          <Route path="/admin/about-seeda" element={<AnimatedRoute><AboutSeeda /></AnimatedRoute>} />
          <Route path="/admin" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AdminOverview />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/overview" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/scheduling" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AdminScheduling />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/appointments" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AdminAppointments />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/clients" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AdminClients />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/employees" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AdminEmployees />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/add-employee" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AddEmployee />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/edit-employee" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <EditEmployee />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/edit-employee/:id" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <EditEmployee />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/companies" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin" requiredPermission="view_companies">
                <AdminCompanies />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/clientsDashboard" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AdminClients />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/add-client" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AddClient />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/edit-client" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin" requiredPermission="edit_client">
                <EditClient />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/edit-client/:id" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin" requiredPermission="edit_client">
                <EditClient />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/client-details" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <ClientDetails />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/client-details/:id" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <ClientDetails />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/edit-package" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin" requiredPermission="manage_packages">
                <EditPackage />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/edit-package/:id" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin" requiredPermission="manage_packages">
                <EditPackage />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/add-package" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin" requiredPermission="manage_packages">
                <AddPackage />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/add-service" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin" requiredPermission="manage_packages">
                <AddService />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/edit-service/:id" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin" requiredPermission="manage_packages">
                <EditService />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/billing" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin" requiredPermission="view_billing">
                <OrdersBilling />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/orders" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AdminOrders />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/create-quotation" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AdminPriceQuotation />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/quotation-preview" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AdminQuotationPreview />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/add-order" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AddOrder />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/edit-order/:id" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <EditOrder />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/order-details/:id" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <OrderDetails />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/orders/:id" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <OrderDetails />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/client-details" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <ClientDetails />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/client-details/:id" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <ClientDetails />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/contact-requests" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AdminContactRequests />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/coupons" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin" requiredPermission="manage_coupons">
                <AdminCoupons />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/permissions" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AdminPermissions />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/ai-prompt" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin" requiredPermission="manage_ai">
                <AdminAiPrompt />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="/admin/reviews" element={
            <AnimatedRoute>
              <ProtectedRoute requiredRole="admin">
                <AdminReviews />
              </ProtectedRoute>
            </AnimatedRoute>
          } />
          <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
        </Routes>
    </Suspense>
  );
};

export default AppRoutes;
