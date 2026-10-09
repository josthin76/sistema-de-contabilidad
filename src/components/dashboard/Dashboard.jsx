import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Package, Clock, AlertTriangle } from 'lucide-react';
import StatCard from './StatCard';
import HealthSemaphore from './HealthSemaphore';
import { fetchCuentas, fetchTransacciones } from '@/lib/accounting';
import { fetchProductos } from '@/lib/inventory';
import { formatCurrency } from '@/lib/format';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [cuentas, setCuentas] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [stats, setStats] = useState({
    efectivo: 0,
    ventasMes: 0,
    gastosMes: 0,
    totalProductos: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [cuentasData, transaccionesData, productosData] = await Promise.all([
        fetchCuentas(),
        fetchTransacciones(),
        fetchProductos()
      ]);

      setCuentas(cuentasData || []);
      setTransacciones(transaccionesData || []);
      setProductos(productosData || []);

      // Calculate Stats
      const cajaCuenta = (cuentasData || []).find(c => c.codigo === '1-1000' || c.nombre.toLowerCase().includes('caja'));
      const efectivo = cajaCuenta?.saldo || 0;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let ventasMes = 0;
      let gastosMes = 0;

      (transaccionesData || []).forEach(t => {
        const tDate = new Date(t.fecha);
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
          if (t.tipo === 'venta') ventasMes += t.total;
          if (t.tipo === 'compra' || t.tipo === 'pago') gastosMes += t.total;
        }
      });

      setStats({
        efectivo,
        ventasMes,
        gastosMes,
        totalProductos: (productosData || []).length
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando tablero...</div>;
  }

  const recentTransactions = transacciones.slice(0, 5);
  const lowStockProducts = productos.filter(p => p.stock <= (p.stock_minimo || 0)).slice(0, 5);
  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hola, Bienvenido</h1>
        <p className="text-gray-500 mt-1 capitalize">{currentDate}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Efectivo" 
          value={formatCurrency(stats.efectivo)} 
          icon={Wallet} 
          color="emerald" 
        />
        <StatCard 
          title="Ventas del Mes" 
          value={formatCurrency(stats.ventasMes)} 
          icon={TrendingUp} 
          color="blue" 
        />
        <StatCard 
          title="Gastos del Mes" 
          value={formatCurrency(stats.gastosMes)} 
          icon={TrendingDown} 
          color="red" 
        />
        <StatCard 
          title="Productos" 
          value={stats.totalProductos} 
          icon={Package} 
          color="purple" 
        />
      </div>

      <HealthSemaphore cuentas={cuentas} productos={productos} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Transacciones Recientes
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(t => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800">{t.descripcion}</p>
                    <p className="text-xs text-gray-500">{new Date(t.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className={`font-bold ${t.tipo === 'venta' ? 'text-emerald-600' : 'text-gray-800'}`}>
                    {t.tipo === 'venta' ? '+' : '-'}{formatCurrency(t.total)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No hay transacciones recientes</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas de Inventario
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(p => (
                <div key={p.id} className="p-4 flex flex-col hover:bg-gray-50">
                  <p className="font-medium text-gray-800">{p.nombre}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                      Quedan {p.stock}
                    </span>
                    <span className="text-xs text-gray-500">Mínimo: {p.stock_minimo}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">Todo el inventario está bien</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
