import React from 'react';
import { formatCurrency } from '@/lib/format';

export function BalanceGeneral({ cuentas = [] }) {
  const activos = cuentas.filter(c => c.tipo === 'activo');
  const pasivos = cuentas.filter(c => c.tipo === 'pasivo');
  const patrimonio = cuentas.filter(c => c.tipo === 'patrimonio');

  const totalActivos = activos.reduce((sum, c) => sum + (c.saldo || 0), 0);
  const totalPasivos = pasivos.reduce((sum, c) => sum + (c.saldo || 0), 0);
  const totalPatrimonio = patrimonio.reduce((sum, c) => sum + (c.saldo || 0), 0);

  const isBalanced = Math.abs(totalActivos - (totalPasivos + totalPatrimonio)) < 0.01;

  const renderSection = (title, data, total) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">{title}</h3>
      <table className="w-full text-left border-collapse">
        <tbody>
          {data.map(cuenta => (
            <tr key={cuenta.id} className="border-b border-gray-100 last:border-0">
              <td className="py-2 text-gray-600">{cuenta.codigo} - {cuenta.nombre}</td>
              <td className="py-2 text-right font-medium text-gray-800">{formatCurrency(cuenta.saldo || 0)}</td>
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
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Balance General</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {renderSection('Activos', activos, totalActivos)}
        </div>
        <div>
          {renderSection('Pasivos', pasivos, totalPasivos)}
          {renderSection('Patrimonio', patrimonio, totalPatrimonio)}
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Pasivos + Patrimonio:</span>
              <span>{formatCurrency(totalPasivos + totalPatrimonio)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-8 p-4 rounded-lg text-center font-medium ${isBalanced ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
        Ecuación Contable: {formatCurrency(totalActivos)} = {formatCurrency(totalPasivos + totalPatrimonio)}
        {!isBalanced && ' (Descuadre detectado)'}
      </div>
    </div>
  );
}
