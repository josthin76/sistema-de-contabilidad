import React from 'react';
import { formatCurrency } from '@/lib/format';

export function EstadoResultados({ cuentas = [] }) {
  const ingresos = cuentas.filter(c => c.tipo === 'ingreso');
  const gastos = cuentas.filter(c => c.tipo === 'gasto');

  const totalIngresos = ingresos.reduce((sum, c) => sum + Math.abs(c.saldo || 0), 0);
  const totalGastos = gastos.reduce((sum, c) => sum + Math.abs(c.saldo || 0), 0);
  
  const utilidadNeta = totalIngresos - totalGastos;
  const isProfit = utilidadNeta >= 0;

  const renderSection = (title, data, total) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">{title}</h3>
      <table className="w-full text-left border-collapse">
        <tbody>
          {data.map(cuenta => (
            <tr key={cuenta.id} className="border-b border-gray-100 last:border-0">
              <td className="py-2 text-gray-600">{cuenta.codigo} - {cuenta.nombre}</td>
              <td className="py-2 text-right font-medium text-gray-800">{formatCurrency(Math.abs(cuenta.saldo || 0))}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="2" className="py-2 text-gray-500 italic text-center">No hay cuentas en esta sección</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-semibold">
            <td className="py-2 px-2 text-gray-800">Total {title}</td>
            <td className="py-2 px-2 text-right text-gray-800">{formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Estado de Resultados</h2>
      
      {renderSection('Ingresos', ingresos, totalIngresos)}
      {renderSection('Gastos', gastos, totalGastos)}

      <div className={`mt-8 p-6 rounded-lg text-center ${isProfit ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
        <h3 className={`text-xl font-bold mb-2 ${isProfit ? 'text-emerald-800' : 'text-red-800'}`}>
          {isProfit ? 'Utilidad Neta' : 'Pérdida Neta'}
        </h3>
        <p className={`text-3xl font-extrabold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
          {formatCurrency(Math.abs(utilidadNeta))}
        </p>
      </div>
    </div>
  );
}
