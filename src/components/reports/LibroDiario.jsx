import React, { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/format';
import { Filter } from 'lucide-react';

export function LibroDiario({ transacciones = [] }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredTransacciones = transacciones.filter(t => {
    if (dateFrom && new Date(t.fecha) < new Date(dateFrom)) return false;
    if (dateTo && new Date(t.fecha) > new Date(dateTo)) return false;
    if (typeFilter && t.tipo !== typeFilter) return false;
    return true;
  });

  const totalDebito = filteredTransacciones.reduce((sum, t) => {
    return sum + (t.lineas?.reduce((s, l) => s + (l.debito || 0), 0) || 0);
  }, 0);

  const totalCredito = filteredTransacciones.reduce((sum, t) => {
    return sum + (t.lineas?.reduce((s, l) => s + (l.credito || 0), 0) || 0);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Libro Diario</h2>
        
        <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-200 print:hidden">
          <Filter className="w-5 h-5 text-gray-500" />
          <input 
            type="date" 
            className="border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="text-gray-500">hasta</span>
          <input 
            type="date" 
            className="border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <select 
            className="border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="venta">Venta</option>
            <option value="compra">Compra</option>
            <option value="pago">Pago</option>
            <option value="cobre">Cobro</option>
            <option value="ajuste">Ajuste</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-3 px-4 font-semibold border-b">Fecha</th>
              <th className="py-3 px-4 font-semibold border-b">Descripción / Cuenta</th>
              <th className="py-3 px-4 font-semibold border-b text-right">Débito</th>
              <th className="py-3 px-4 font-semibold border-b text-right">Crédito</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransacciones.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500">
                  No hay transacciones en este período.
                </td>
              </tr>
            ) : (
              filteredTransacciones.map((t, index) => (
                <React.Fragment key={t.id}>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td className="py-2 px-4 font-medium text-gray-800 whitespace-nowrap">{formatDate(t.fecha)}</td>
                    <td className="py-2 px-4 font-medium text-gray-800" colSpan="3">
                      {t.descripcion} <span className="text-xs ml-2 text-gray-500 uppercase px-2 py-1 bg-gray-200 rounded-full">{t.tipo}</span>
                    </td>
                  </tr>
                  {t.lineas && t.lineas.map(linea => (
                    <tr key={linea.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 px-4"></td>
                      <td className={`py-2 px-4 ${linea.credito > 0 ? 'pl-10 text-gray-600' : 'text-gray-800'}`}>
                        {linea.cuenta?.nombre || `Cuenta ${linea.cuenta_id}`}
                      </td>
                      <td className="py-2 px-4 text-right">{linea.debito > 0 ? formatCurrency(linea.debito) : ''}</td>
                      <td className="py-2 px-4 text-right">{linea.credito > 0 ? formatCurrency(linea.credito) : ''}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
          {filteredTransacciones.length > 0 && (
            <tfoot>
              <tr className="bg-emerald-50 font-bold border-t-2 border-emerald-200">
                <td colSpan="2" className="py-3 px-4 text-emerald-800 text-right">TOTALES:</td>
                <td className="py-3 px-4 text-right text-emerald-700">{formatCurrency(totalDebito)}</td>
                <td className="py-3 px-4 text-right text-emerald-700">{formatCurrency(totalCredito)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
