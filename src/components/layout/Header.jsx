import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useTheme } from '@/context/ThemeContext';

export default function Header({ toggleSidebar, title }) {
  const status = useSyncStatus();
  const { theme, toggleTheme } = useTheme();

  const dateStr = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
            {title || 'ContaBeni'}
          </h1>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:block text-sm text-gray-500 capitalize">
            {dateStr}
          </div>
          
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className={`w-2.5 h-2.5 rounded-full ${
              status === 'online' ? 'bg-green-500' :
              status === 'syncing' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`}></span>
            <span className="text-gray-600 hidden sm:inline-block">
              {status === 'online' ? 'En línea' :
               status === 'syncing' ? 'Sincronizando...' : 'Fuera de línea'}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo nocturno'}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo nocturno'}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
