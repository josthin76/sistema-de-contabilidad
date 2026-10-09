import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
      case '/dashboard': return 'Dashboard';
      case '/registro': return 'Registro Rápido';
      case '/productos': return 'Mis Productos';
      case '/transacciones': return 'Transacciones';
      case '/fiado': return 'Libreta de Fiado';
      case '/facturas': return 'Facturas';
      case '/reportes': return 'Reportes';
      case '/aprender': return 'Aprender';
      default: return 'ContaBeni';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          title={getPageTitle(location.pathname)} 
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
