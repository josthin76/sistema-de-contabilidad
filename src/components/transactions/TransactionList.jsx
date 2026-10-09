import React, { useState, useEffect } from 'react';
import { fetchTransacciones, deleteTransaccion } from '@/lib/accounting';
import { formatDate, formatCurrency } from '@/lib/format';
import { Trash2, ChevronDown, ChevronUp, Search, Calendar, Filter } from 'lucide-react';
import { TransactionDetail } from './TransactionDetail';

export function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await fetchTransacciones();
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('¿Está seguro de que desea eliminar esta transacción? Esta acción es irreversible.')) {
      try {
        await deleteTransaccion(id);
        setTransactions(transactions.filter(t => t.id !== id));
        if (expandedId === id) setExpandedId(null);
      } catch (error) {
        console.error("Error deleting:", error);
        alert('Error al eliminar. Puede que tenga movimientos de inventario asociados.');
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredData = transactions.filter(t => {
    const matchesSearch = t.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.tipo === typeFilter;
    const matchesDateFrom = !dateFrom || new Date(t.fecha) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(t.fecha) <= new Date(dateTo);
    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
  });

  const getTypeColor = (tipo) => {
    switch (tipo) {
      case 'venta': return 'bg-emerald-100 text-emerald-800';
      case 'compra': return 'bg-blue-100 text-blue-800';
      case 'pago': return 'bg-amber-100 text-amber-800';
      case 'cobre': return 'bg-cyan-100 text-cyan-800';
      case 'apertura': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Historial de Transacciones</h1>
      <p className="text-gray-600 mb-6">Explore y administre todos los movimientos contables</p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por descripción..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={18} />
            <select 
              className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-emerald-500 focus:border-emerald-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="venta">Venta</option>
              <option value="compra">Compra</option>
              <option value="pago">Pago</option>
              <option value="cobre">Cobro</option>
              <option value="ajuste">Ajuste</option>
              <option value="apertura">Apertura</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400" size={18} />
            <div className="flex gap-1 w-full">
              <input type="date" className="w-1/2 border-gray-300 rounded-lg text-xs" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <input type="date" className="w-1/2 border-gray-300 rounded-lg text-xs" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <th className="py-3 px-4 font-semibold w-10"></th>
                <th className="py-3 px-4 font-semibold">Fecha</th>
                <th className="py-3 px-4 font-semibold">Descripción</th>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold text-right">Total</th>
                <th className="py-3 px-4 font-semibold text-center w-20">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-500">No hay transacciones que coincidan con los filtros.</td></tr>
              ) : (
                filteredData.map((tx) => (
                  <React.Fragment key={tx.id}>
                    <tr 
                      onClick={() => toggleExpand(tx.id)}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${expandedId === tx.id ? 'bg-emerald-50/30' : ''}`}
                    >
                      <td className="py-3 px-4 text-gray-400 text-center">
                        {expandedId === tx.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(tx.fecha)}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{tx.descripcion}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTypeColor(tx.tipo)}`}>
                          {tx.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-800">{formatCurrency(tx.total)}</td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={(e) => handleDelete(tx.id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                    {expandedId === tx.id && (
                      <tr className="bg-gray-50/80 border-b border-gray-200">
                        <td colSpan="6" className="p-0">
                          <TransactionDetail transactionId={tx.id} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TransactionList;
