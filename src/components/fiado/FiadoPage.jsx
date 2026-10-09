import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Users, DollarSign } from 'lucide-react';
import { fetchResumenFiado, createCliente, fetchFiadosByCliente, marcarFiadoPagado } from '@/lib/fiado';
import { formatCurrency, todayISO } from '@/lib/format';
import { fetchCuentas } from '@/lib/accounting';
import ClienteForm from './ClienteForm';
import EstadoCuenta from './EstadoCuenta';

export default function FiadoPage() {
  const [resumen, setResumen] = useState([]);
  const [totalPendiente, setTotalPendiente] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  
  // Estado Cuenta View
  const [viewingCliente, setViewingCliente] = useState(null);
  const [clienteTxs, setClienteTxs] = useState([]);
  
  // Cobro Form
  const [showCobroForm, setShowCobroForm] = useState(false);
  const [cobroMonto, setCobroMonto] = useState('');
  const [cuentas, setCuentas] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { resumen, totalPendiente } = await fetchResumenFiado();
      setResumen(resumen);
      setTotalPendiente(totalPendiente);
      
      const cts = await fetchCuentas();
      setCuentas(cts);
    } catch (err) {
      alert('Error cargando fiados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCliente = (data) => {
    try {
      createCliente(data.nombre, data.telefono, data.notas);
      setShowClienteForm(false);
      loadData();
    } catch (err) {
      alert('Error guardando cliente: ' + err.message);
    }
  };

  const handleViewCliente = async (cliente) => {
    try {
      setLoading(true);
      const txs = await fetchFiadosByCliente(cliente.id);
      setClienteTxs(txs);
      setViewingCliente(cliente);
    } catch (err) {
      alert('Error cargando estado de cuenta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarAbono = async (e) => {
    e.preventDefault();
    if (!cobroMonto || isNaN(cobroMonto) || Number(cobroMonto) <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }
    
    // Simplificación para encontrar cuentas por defecto (Caja y Cuentas por Cobrar)
    const caja = cuentas.find(c => c.nombre.toLowerCase().includes('caja') || c.codigo.startsWith('1.1.1'));
    const cxc = cuentas.find(c => c.nombre.toLowerCase().includes('cobrar') || c.codigo.startsWith('1.1.2'));
    
    if (!caja || !cxc) {
      alert("Falta configurar las cuentas de Caja o Cuentas por Cobrar en el catálogo.");
      return;
    }

    try {
      setLoading(true);
      await marcarFiadoPagado(
        viewingCliente.id, 
        Number(cobroMonto), 
        todayISO(), 
        caja.id, 
        cxc.id, 
        'Abono en efectivo'
      );
      setShowCobroForm(false);
      setCobroMonto('');
      await handleViewCliente(viewingCliente); // refresh transactions
      loadData(); // refresh background summary
    } catch (err) {
      alert('Error al registrar abono: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResumen = resumen.filter(r => 
    r.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewingCliente) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <EstadoCuenta 
          cliente={viewingCliente} 
          transacciones={clienteTxs} 
          onBack={() => setViewingCliente(null)}
          onCobrar={() => setShowCobroForm(true)}
        />

        {showCobroForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
              <h3 className="text-lg font-bold mb-4">Registrar Abono</h3>
              <form onSubmit={handleRegistrarAbono}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Monto del Abono</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={cobroMonto}
                    onChange={(e) => setCobroMonto(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowCobroForm(false)} className="px-4 py-2 border rounded text-gray-600">Cancelar</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Guardar Abono
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          Libreta de Fiado
        </h1>
        <button
          onClick={() => setShowClienteForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-red-100 rounded-xl text-red-600">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Fiado Pendiente</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalPendiente)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-indigo-100 rounded-xl text-indigo-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Clientes Registrados</p>
            <p className="text-3xl font-bold text-gray-900">{resumen.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          />
        </div>
      </div>

      {loading && !viewingCliente ? (
        <div className="text-center py-12 text-gray-500">Cargando libreta...</div>
      ) : filteredResumen.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no hay clientes registrados</h3>
          <p className="text-gray-500">Agrega tu primer cliente para comenzar a registrar fiados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResumen.map(({ cliente, saldo, txsCount }) => (
            <div 
              key={cliente.id}
              onClick={() => handleViewCliente(cliente)}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                  {cliente.nombre}
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  saldo > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {saldo > 0 ? 'Pendiente' : 'Al día'}
                </span>
              </div>
              {cliente.telefono && <p className="text-sm text-gray-500 mb-4">{cliente.telefono}</p>}
              
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-50">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Deuda Total</p>
                  <p className={`font-bold ${saldo > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatCurrency(saldo)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{txsCount} movimientos</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showClienteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <ClienteForm
            onSave={handleSaveCliente}
            onCancel={() => setShowClienteForm(false)}
          />
        </div>
      )}
    </div>
  );
}
