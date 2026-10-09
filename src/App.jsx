import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';

// Layout
import Layout from '@/components/layout/Layout';

// Pages
import AuthPage from '@/components/auth/AuthPage';
import Dashboard from '@/components/dashboard/Dashboard';
import QuickRegister from '@/components/transactions/QuickRegister';
import InventoryPage from '@/components/inventory/InventoryPage';
import TransactionList from '@/components/transactions/TransactionList';
import FiadoPage from '@/components/fiado/FiadoPage';
import InvoicePage from '@/components/invoices/InvoicePage';
import ReportsPage from '@/components/reports/ReportsPage';
import TutorialPage from '@/components/tutorial/TutorialPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Auth Route Wrapper (redirects to dashboard if already logged in)
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <AuthRoute>
          <AuthPage />
        </AuthRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="registro" element={<QuickRegister />} />
        <Route path="productos" element={<InventoryPage />} />
        <Route path="transacciones" element={<TransactionList />} />
        <Route path="fiado" element={<FiadoPage />} />
        <Route path="facturas" element={<InvoicePage />} />
        <Route path="reportes" element={<ReportsPage />} />
        <Route path="aprender" element={<TutorialPage />} />
      </Route>
      
      {/* Catch-all redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
