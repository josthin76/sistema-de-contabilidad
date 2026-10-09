import React, { useState, useEffect } from 'react';
import { fetchTransaccionDetail } from '@/lib/accounting';
import { formatCurrency } from '@/lib/format';
import { Receipt, AlertCircle } from 'lucide-react';

export function TransactionDetail({ transactionId }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transactionId) {
      loadDetail();
    }
  }, [transactionId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await fetchTransaccionDetail(transactionId);
      setDetail(data);
    } catch (error) {
      console.error("Error loading transaction detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 text-sm">Cargando detalles...</div>;
  }

  if (!detail) {
    return <div className="p-8 text-center text-red-500 text-sm">Error al cargar los detalles.</div>;
  }

  const totalDebito = detail.lineas?.reduce((sum, l) => sum + (l.debito || 0), 0) || 0;
  const totalCredito = detail.lineas?.reduce((sum, l) => sum + (l.credito || 0), 0) || 0;
  const isBalanced = Math.abs(totalDebito - totalCredito) < 0.01;

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="text-emerald-600" size={20} />
        <h3 className="font-semibold text-gray-800">Detalle de Asiento Contable</h3>
        <span className="text-xs text-gray-400 ml-auto font-mono">ID: {detail.id}</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="py-2 px-4 font-medium">Cuenta</th>
              <th className="py-2 px-4 font-medium text-right">Débito</th>
              <th className="py-2 px-4 font-medium text-right">Crédito</th>
            </tr>
          </thead>
          <tbody>
            {detail.lineas?.map((linea) => (
              <tr key={linea.id} className="border-t border-gray-100">
                <td className="py-2 px-4">
                  <span className="text-gray-800 font-medium">{linea.cuenta?.nombre}</span>
                  <span className="text-xs text-gray-500 ml-2 block sm:inline">({linea.cuenta?.codigo})</span>
                </td>
                <td className="py-2 px-4 text-right text-gray-700">
                  {linea.debito > 0 ? formatCurrency(linea.debito) : '-'}
                </td>
                <td className="py-2 px-4 text-right text-gray-700">
                  {linea.credito > 0 ? formatCurrency(linea.credito) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-200">
            <tr>
              <td className="py-3 px-4 text-right font-bold text-gray-700">TOTALES:</td>
              <td className={`py-3 px-4 text-right font-bold ${!isBalanced ? 'text-red-600' : 'text-emerald-700'}`}>
                {formatCurrency(totalDebito)}
              </td>
              <td className={`py-3 px-4 text-right font-bold ${!isBalanced ? 'text-red-600' : 'text-emerald-700'}`}>
                {formatCurrency(totalCredito)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!isBalanced && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle size={16} />
          <strong>¡Advertencia!</strong> El asiento no está cuadrado. Diferencia: {formatCurrency(Math.abs(totalDebito - totalCredito))}
        </div>
      )}
    </div>
  );
}
