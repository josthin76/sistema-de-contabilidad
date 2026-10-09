import React from 'react';
import { formatCurrency, formatDate } from '@/lib/format';
import { ArrowLeft, Send, DollarSign } from 'lucide-react';

export default function EstadoCuenta({ cliente, transacciones, onBack, onCobrar }) {
  let saldoActual = 0;
  
  const txsWithBalance = transacciones.map(t => {
    const isFiado = t.descripcion.startsWith(`Fiado:`);
    const isAbono = t.descripcion.startsWith(`Abono Fiado:`);
    const amount = t.total;
    
    if (isFiado) saldoActual += amount;
    else if (isAbono) saldoActual -= amount;
    
    return {
      ...t,
      isFiado,
      isAbono,
      runningBalance: saldoActual
    };
  });

  const totalOwed = saldoActual;

  const handleShare = () => {
    let msg = `Hola ${cliente.nombre}, te comparto tu estado de cuenta actual:\n\n`;
    txsWithBalance.forEach(t => {
      const type = t.isFiado ? 'Cargo' : 'Abono';
      const desc = t.descripcion.split(' - ')[1] || t.descripcion;
      msg += `${formatDate(t.fecha)} - ${type}: ${desc} - ${formatCurrency(t.total)}\n`;
    });
    msg += `\nSaldo Total Pendiente: ${formatCurrency(totalOwed)}\n\nGracias!`;
    
    const url = `https://wa.me/${cliente.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{cliente.nombre}</h2>
            {cliente.telefono && <p className="text-sm text-gray-500">{cliente.telefono}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Saldo Pendiente</p>
          <p className={`text-2xl font-bold ${totalOwed > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatCurrency(totalOwed)}
          </p>
        </div>
      </div>

      <div className="p-6 flex gap-3 justify-end border-b border-gray-100">
        <button 
          onClick={handleShare}
          disabled={!cliente.telefono}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
          Enviar por WhatsApp
        </button>
        <button 
          onClick={onCobrar}
          disabled={totalOwed <= 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <DollarSign className="w-4 h-4" />
          Registrar Abono
        </button>
      </div>

      <div className="p-0 sm:p-6">
        {transacciones.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay movimientos registrados para este cliente.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-3 border-b">Fecha</th>
                  <th className="p-3 border-b">Descripción</th>
                  <th className="p-3 border-b text-right">Cargo</th>
                  <th className="p-3 border-b text-right">Abono</th>
                  <th className="p-3 border-b text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {txsWithBalance.map((t, idx) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(t.fecha)}</td>
                    <td className="p-3 text-sm text-gray-900">{t.descripcion.split(' - ')[1] || t.descripcion}</td>
                    <td className="p-3 text-sm text-red-600 text-right">
                      {t.isFiado ? formatCurrency(t.total) : '-'}
                    </td>
                    <td className="p-3 text-sm text-emerald-600 text-right">
                      {t.isAbono ? formatCurrency(t.total) : '-'}
                    </td>
                    <td className="p-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(t.runningBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
