import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export default function HealthSemaphore({ cuentas = [], productos = [] }) {
  const healthData = useMemo(() => {
    // 1. Calculate Cash
    const cajaCuenta = cuentas.find(c => c.codigo === '1-1000' || c.nombre.toLowerCase().includes('caja'));
    const bancosCuenta = cuentas.find(c => c.codigo === '1-1100' || c.nombre.toLowerCase().includes('banco'));
    
    const efectivoDisponible = (cajaCuenta?.saldo || 0) + (bancosCuenta?.saldo || 0);

    // 2. Calculate Revenue vs Expenses
    const ingresos = cuentas.filter(c => c.tipo === 'ingreso').reduce((acc, c) => acc + (c.saldo || 0), 0);
    const gastos = cuentas.filter(c => c.tipo === 'gasto').reduce((acc, c) => acc + (c.saldo || 0), 0);
    const compras = cuentas.filter(c => c.codigo && c.codigo.startsWith('5-1000')).reduce((acc, c) => acc + (c.saldo || 0), 0);
    
    const totalGastos = gastos + compras;

    // 3. Calculate Low Stock
    const productosBajoStock = productos.filter(p => p.stock <= (p.stock_minimo || 0));

    // Determine Status
    let status = 'GREEN';
    let message = '¡Tu negocio está saludable!';
    let StatusIcon = CheckCircle;
    
    if (efectivoDisponible <= 0 || ingresos < totalGastos) {
      status = 'RED';
      message = 'Atención urgente requerida';
      StatusIcon = AlertCircle;
    } else if (ingresos < totalGastos * 1.2 || productosBajoStock.length > 0) {
      status = 'YELLOW';
      message = 'Precaución: Revisa tus números';
      StatusIcon = AlertTriangle;
    }

    return {
      status,
      message,
      StatusIcon,
      efectivoDisponible,
      ingresos,
      totalGastos,
      productosBajoStock: productosBajoStock.length
    };
  }, [cuentas, productos]);

  const { status, message, StatusIcon, efectivoDisponible, ingresos, totalGastos, productosBajoStock } = healthData;

  const getLightClass = (lightColor) => {
    const baseClass = "w-16 h-16 rounded-full border-4 border-gray-200 transition-all duration-300 shadow-inner";
    if (status === lightColor) {
      if (lightColor === 'RED') return `${baseClass} bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]`;
      if (lightColor === 'YELLOW') return `${baseClass} bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)]`;
      if (lightColor === 'GREEN') return `${baseClass} bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]`;
    }
    return `${baseClass} bg-gray-100 opacity-30`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">Salud del Negocio</h2>
      
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Semaphore body */}
        <div className="bg-gray-800 p-4 rounded-3xl flex flex-col gap-4 shadow-xl">
          <div className={getLightClass('RED')}></div>
          <div className={getLightClass('YELLOW')}></div>
          <div className={getLightClass('GREEN')}></div>
        </div>

        {/* Status Info */}
        <div className="flex-1 space-y-6 w-full">
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-8 h-8 ${status === 'RED' ? 'text-red-500' : status === 'YELLOW' ? 'text-amber-500' : 'text-emerald-500'}`} />
            <h3 className="text-xl font-bold text-gray-800">{message}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Efectivo Disponible</p>
              <p className={`text-lg font-bold ${efectivoDisponible > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ${efectivoDisponible.toFixed(2)}
              </p>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                {efectivoDisponible > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                En caja y bancos
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Ingresos vs Gastos</p>
              <p className={`text-lg font-bold ${ingresos >= totalGastos ? 'text-emerald-600' : 'text-amber-600'}`}>
                ${ingresos.toFixed(2)} / ${totalGastos.toFixed(2)}
              </p>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                Balance general
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Inventario</p>
              <p className={`text-lg font-bold ${productosBajoStock === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {productosBajoStock}
              </p>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Prod. con bajo stock
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
