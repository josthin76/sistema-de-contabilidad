import React, { useState, useEffect } from 'react';
import { ShoppingCart, ShoppingBag, TrendingDown, BookOpen, CheckCircle, Landmark, X } from 'lucide-react';
import { fetchCuentas, createTransaccionWithLineas } from '@/lib/accounting';
import { todayISO } from '@/lib/format';

const actions = [
  { id: 'vendi', title: 'Vendí', icon: ShoppingCart, color: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-white' },
  { id: 'compre', title: 'Compré', icon: ShoppingBag, color: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-white' },
  { id: 'gaste', title: 'Gasté', icon: TrendingDown, color: 'bg-red-500', hover: 'hover:bg-red-600', text: 'text-white' },
  { id: 'medeben', title: 'Me Deben', icon: BookOpen, color: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-white' },
  { id: 'cobre', title: 'Cobré', icon: CheckCircle, color: 'bg-teal-500', hover: 'hover:bg-teal-600', text: 'text-white' },
  { id: 'retire', title: 'Retiré', icon: Landmark, color: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-white' },
];

export default function QuickRegister() {
  const [cuentas, setCuentas] = useState([]);
  const [activeAction, setActiveAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [metodoPago, setMetodoPago] = useState('1-1000'); // Default Caja
  const [categoriaGasto, setCategoriaGasto] = useState('5-1100'); // Default Gastos Operativos
  const [cliente, setCliente] = useState('');

  useEffect(() => {
    loadCuentas();
  }, []);

  const loadCuentas = async () => {
    try {
      const data = await fetchCuentas();
      setCuentas(data || []);
    } catch (error) {
      console.error("Error fetching cuentas:", error);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setMonto('');
    setDescripcion('');
    setMetodoPago('1-1000');
    setCategoriaGasto('5-1100');
    setCliente('');
    setActiveAction(null);
  };

  const getCuentaId = (codigo) => {
    const cuenta = cuentas.find(c => c.codigo === codigo);
    return cuenta ? cuenta.id : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!monto || isNaN(monto) || Number(monto) <= 0) {
      alert("Por favor ingresa un monto válido mayor a 0.");
      return;
    }

    setLoading(true);
    const numMonto = parseFloat(monto);
    let lineas = [];
    let tipoTransaccion = 'ajuste';

    const cajaId = getCuentaId(metodoPago);
    const ventasId = getCuentaId('4-1000');
    const comprasId = getCuentaId('5-1000');
    const cxCobrarId = getCuentaId('1-1200');
    const capitalId = getCuentaId('3-1000');

    try {
      switch (activeAction) {
        case 'vendi':
          if (!cajaId || !ventasId) throw new Error("Cuentas de caja/banco o ventas no encontradas.");
          tipoTransaccion = 'venta';
          lineas = [
            { cuenta_id: cajaId, debito: numMonto, credito: 0 },
            { cuenta_id: ventasId, debito: 0, credito: numMonto }
          ];
          break;
        case 'compre':
          if (!cajaId || !comprasId) throw new Error("Cuentas de caja/banco o compras no encontradas.");
          tipoTransaccion = 'compra';
          lineas = [
            { cuenta_id: comprasId, debito: numMonto, credito: 0 },
            { cuenta_id: cajaId, debito: 0, credito: numMonto }
          ];
          break;
        case 'gaste':
          const gastoId = getCuentaId(categoriaGasto);
          if (!cajaId || !gastoId) throw new Error("Cuentas de caja/banco o gastos no encontradas.");
          tipoTransaccion = 'pago';
          lineas = [
            { cuenta_id: gastoId, debito: numMonto, credito: 0 },
            { cuenta_id: cajaId, debito: 0, credito: numMonto }
          ];
          break;
        case 'medeben':
          if (!cxCobrarId || !ventasId) throw new Error("Cuentas de CxC o ventas no encontradas.");
          tipoTransaccion = 'venta';
          lineas = [
            { cuenta_id: cxCobrarId, debito: numMonto, credito: 0 },
            { cuenta_id: ventasId, debito: 0, credito: numMonto }
          ];
          break;
        case 'cobre':
          if (!cajaId || !cxCobrarId) throw new Error("Cuentas de caja/banco o CxC no encontradas.");
          tipoTransaccion = 'cobre';
          lineas = [
            { cuenta_id: cajaId, debito: numMonto, credito: 0 },
            { cuenta_id: cxCobrarId, debito: 0, credito: numMonto }
          ];
          break;
        case 'retire':
          if (!cajaId || !capitalId) throw new Error("Cuentas de caja/banco o capital no encontradas.");
          tipoTransaccion = 'ajuste';
          lineas = [
            { cuenta_id: capitalId, debito: numMonto, credito: 0 },
            { cuenta_id: cajaId, debito: 0, credito: numMonto }
          ];
          break;
      }

      const desc = cliente ? `${descripcion} - ${cliente}` : (descripcion || `Registro rápido: ${activeAction}`);

      await createTransaccionWithLineas(
        desc,
        tipoTransaccion,
        lineas,
        todayISO()
      );

      showToast(`¡Registro guardado exitosamente!`);
      resetForm();
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
          <input
            type="number"
            step="0.01"
            required
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
            placeholder="0.00"
          />
        </div>

        {activeAction === 'medeben' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
            <input
              type="text"
              required
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ej: Juan Pérez"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Nota</label>
          <input
            type="text"
            required
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder={activeAction === 'vendi' ? 'Ej: Venta de mostrador' : 'Detalles...'}
          />
        </div>

        {['vendi', 'compre', 'gaste', 'cobre', 'retire'].includes(activeAction) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="1-1000">Efectivo (Caja)</option>
              <option value="1-1100">Banco (Transferencia/Tarjeta)</option>
            </select>
          </div>
        )}

        {activeAction === 'gaste' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Gasto</label>
            <select
              value={categoriaGasto}
              onChange={(e) => setCategoriaGasto(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="5-1100">Gasto Operativo (Luz, Agua, Alquiler)</option>
              <option value="5-1200">Gasto de Venta (Publicidad, Comisiones)</option>
            </select>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Registro Rápido</h1>
        <p className="text-gray-500 mt-2">¿Qué sucedió en tu negocio hoy?</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => setActiveAction(action.id)}
              className={`${action.color} ${action.hover} ${action.text} rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-md`}
            >
              <Icon className="w-16 h-16 mb-4" />
              <span className="text-2xl font-bold">{action.title}</span>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {activeAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className={`p-4 flex justify-between items-center ${actions.find(a => a.id === activeAction).color} text-white`}>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {React.createElement(actions.find(a => a.id === activeAction).icon, { className: "w-6 h-6" })}
                Registrar: {actions.find(a => a.id === activeAction).title}
              </h2>
              <button onClick={resetForm} className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {renderModalContent()}
              
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-3 text-white rounded-lg font-bold flex justify-center items-center ${actions.find(a => a.id === activeAction).color} ${actions.find(a => a.id === activeAction).hover}`}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
