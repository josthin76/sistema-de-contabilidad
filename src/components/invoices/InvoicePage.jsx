import React, { useState, useEffect } from 'react';
import { fetchTransacciones, fetchTransaccionDetail } from '@/lib/accounting';
import { formatDate, formatCurrency } from '@/lib/format';
import { InvoicePreview } from './InvoicePreview';
import { exportToCSV } from '@/lib/invoiceExport';
import { FileText, Download, Search, Filter, Receipt } from 'lucide-react';

export function InvoicePage() {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);
  const [txDetailLoading, setTxDetailLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await fetchTransacciones();
      // Solo mostrar ventas y compras para facturación
      setTransacciones(data.filter(t => t.tipo === 'venta' || t.tipo === 'compra'));
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransacciones = transacciones.filter(t => {
    const matchesSearch = t.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.tipo === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenInvoice = async (tx) => {
    setTxDetailLoading(true);
    try {
      const detail = await fetchTransaccionDetail(tx.id);
      setSelectedTx(detail);
    } catch (error) {
      console.error("Error fetching detail:", error);
    } finally {
      setTxDetailLoading(false);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(filteredTransacciones, 'facturacion.csv');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="text-emerald-600" size={32} />
            Facturación y Recibos
          </h1>
          <p className="text-gray-600 mt-1">Gestione comprobantes de ventas y compras</p>
        </div>
        
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download size={18} />
          <span>Exportar CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por descripción..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={18} />
            <select 
              className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="venta">Ventas</option>
              <option value="compra">Compras</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <th className="py-3 px-6 font-semibold">Fecha</th>
                <th className="py-3 px-6 font-semibold">Descripción</th>
                <th className="py-3 px-6 font-semibold">Tipo</th>
                <th className="py-3 px-6 font-semibold text-right">Total</th>
                <th className="py-3 px-6 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
                  </td>
                </tr>
              ) : filteredTransacciones.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No se encontraron comprobantes.
                  </td>
                </tr>
              ) : (
                filteredTransacciones.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3 px-6 text-gray-600">{formatDate(tx.fecha)}</td>
                    <td className="py-3 px-6 font-medium text-gray-800">{tx.descripcion}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                        tx.tipo === 'venta' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tx.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right font-medium text-gray-800">{formatCurrency(tx.total)}</td>
                    <td className="py-3 px-6 text-center">
                      <button 
                        onClick={() => handleOpenInvoice(tx)}
                        disabled={txDetailLoading}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 rounded text-sm transition-colors"
                      >
                        <FileText size={16} />
                        Ver Recibo
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTx && (
        <InvoicePreview 
          transaction={selectedTx} 
          lineas={selectedTx.lineas} 
          onClose={() => setSelectedTx(null)} 
        />
      )}
    </div>
  );
}

export default InvoicePage;
