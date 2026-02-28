import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import { AlertProvider } from './context/AlertContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserDashboard from './pages/User/UserDashboard';
import GuardDashboard from './pages/Guard/GuardDashboard';
import CommitteeDashboard from './pages/Committee/CommitteeDashboard';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/Landing/FeaturesPage';
import PricingPage from './pages/Landing/PricingPage';
import AboutUsPage from './pages/Landing/AboutUsPage';
import ContactUsPage from './pages/Landing/ContactUsPage';
import SecurityPage from './pages/Landing/SecurityPage';
import DemoPortal from './pages/Landing/DemoPortal';
import VerifyAccount from './pages/VerifyAccount';
import OTPRegistration from './pages/OTPRegistration';
import OTPLogin from './pages/OTPLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './App.css';

// --- Page Transition Wrapper ---
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    exit={{ opacity: 0, y: -15, filter: 'blur(5px)' }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white font-black tracking-widest uppercase italic">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        Authenticating Protocol...
      </motion.div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'superadmin') return <Navigate to="/super-admin-dashboard" />;
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" />;
    if (user.role === 'guard') return <Navigate to="/gate-pass" />;
    if (['chairman', 'secretary', 'treasurer', 'committee_member'].includes(user.role)) return <Navigate to="/committee-dashboard" />;
    return <Navigate to="/user-dashboard" />;
  }

  return children;
};

import usePageTracking from './hooks/usePageTracking';

// --- Animated Routes Component ---
const AnimatedRoutes = () => {
  usePageTracking(); // Start tracking page views
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/features" element={<PageWrapper><FeaturesPage /></PageWrapper>} />
        <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><AboutUsPage /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><ContactUsPage /></PageWrapper>} />
        <Route path="/security" element={<PageWrapper><SecurityPage /></PageWrapper>} />
        <Route path="/demo" element={<PageWrapper><DemoPortal /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/login-otp" element={<PageWrapper><OTPLogin /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><OTPRegistration /></PageWrapper>} />
        <Route path="/verify-account/:token" element={<PageWrapper><VerifyAccount /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/reset-password/:resetToken" element={<PageWrapper><ResetPassword /></PageWrapper>} />

        <Route path="/super-admin-dashboard" element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <PageWrapper><SuperAdminDashboard /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PageWrapper><AdminDashboard /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/user-dashboard" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><UserDashboard /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/gate-pass" element={
          <ProtectedRoute allowedRoles={['guard']}>
            <PageWrapper><GuardDashboard /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/committee-dashboard" element={
          <ProtectedRoute allowedRoles={['chairman', 'secretary', 'treasurer', 'member', 'committee_member']}>
            <PageWrapper><CommitteeDashboard /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

import { EventThemeProvider } from './context/EventThemeContext';
import DynamicEventBackground from './components/DynamicEventBackground';
import { App as CapApp } from '@capacitor/app'; // <--- Capacitor App Plugin

function App() {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Standard way to trigger a browser's "Leave site?" warning
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // --- CAPACITOR MOBILE BACK BUTTON HANDLER ---
    const setupBackButton = async () => {
      try {
        await CapApp.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            // At the root page, exit the app
            CapApp.exitApp();
          } else {
            // Traverse history backward (instead of exiting)
            window.history.back();
          }
        });
      } catch (e) {
        console.log("Capacitor App plugin not running natively. Ignored.", e);
      }
    };

    setupBackButton();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      try {
        CapApp.removeAllListeners();
      } catch (e) { }
    };
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <EventThemeProvider>
            <DynamicEventBackground />
            <div style={{ position: 'relative', zIndex: 9999 }}>{/* Ensure Toast/Alerts are top */}
              <ToastProvider>
                <AlertProvider>
                  <AnimatedRoutes />
                </AlertProvider>
              </ToastProvider>
            </div>
          </EventThemeProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

