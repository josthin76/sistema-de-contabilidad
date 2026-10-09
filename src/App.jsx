import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

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

// Error Boundary para evitar pantallas blancas
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary detectó:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
          <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full border border-gray-200">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error al cargar la pantalla</h2>
            <p className="text-sm text-gray-600 mb-4">{this.state.error?.message || 'Ocurrió un error inesperado'}</p>
            <button 
              onClick={() => { localStorage.clear(); window.location.href = '/#/login'; window.location.reload(); }} 
              className="w-full bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Reiniciar aplicación
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      
      {/* Catch-all redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
