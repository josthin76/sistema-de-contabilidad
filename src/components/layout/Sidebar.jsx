import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BookOpen, 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  ArrowLeftRight, 
  BookText, 
  FileText, 
  BarChart3, 
  GraduationCap,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, signOut } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/registro', icon: PlusCircle, label: 'Registro Rápido' },
    { to: '/productos', icon: Package, label: 'Mis Productos' },
    { to: '/transacciones', icon: ArrowLeftRight, label: 'Transacciones' },
    { to: '/fiado', icon: BookText, label: 'Libreta de Fiado' },
    { to: '/facturas', icon: FileText, label: 'Facturas' },
    { to: '/reportes', icon: BarChart3, label: 'Reportes' },
    { to: '/aprender', icon: GraduationCap, label: 'Aprender' },
  ];

  const sidebarClasses = `fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  }`;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={sidebarClasses}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-emerald-600">
            <BookOpen size={28} />
            <span className="text-xl font-bold text-gray-800">ContaBeni</span>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:bg-gray-100 p-1 rounded-md">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || 'usuario@ejemplo.com'}
              </p>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}
