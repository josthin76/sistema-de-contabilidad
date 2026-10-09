import React, { useState, useEffect } from 'react';
import { BalanceGeneral } from './BalanceGeneral';
import { EstadoResultados } from './EstadoResultados';
import { LibroDiario } from './LibroDiario';
import { fetchCuentas, fetchTransacciones } from '@/lib/accounting';
import { Printer, Download, FileText, PieChart, BookOpen } from 'lucide-react';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('balance');
  const [cuentas, setCuentas] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const cuentasData = await fetchCuentas();
      const txData = await fetchTransacciones();
      setCuentas(cuentasData);
      setTransacciones(txData);
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reportes Financieros</h1>
          <p className="text-gray-600 mt-1">Analice el estado financiero de su negocio</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Printer size={18} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200 flex overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('balance')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === 'balance' 
              ? 'border-b-2 border-emerald-500 text-emerald-700 bg-emerald-50/50' 
              : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
          }`}
        >
          <PieChart size={18} />
          Balance General
        </button>
        <button
          onClick={() => setActiveTab('resultados')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === 'resultados' 
              ? 'border-b-2 border-emerald-500 text-emerald-700 bg-emerald-50/50' 
              : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
          }`}
        >
          <FileText size={18} />
          Estado de Resultados
        </button>
        <button
          onClick={() => setActiveTab('diario')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === 'diario' 
              ? 'border-b-2 border-emerald-500 text-emerald-700 bg-emerald-50/50' 
              : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
          }`}
        >
          <BookOpen size={18} />
          Libro Diario
        </button>
      </div>

      <div className="mt-6 print:mt-0">
        <div className={activeTab === 'balance' ? 'block' : 'hidden print:block mb-12'}>
          <BalanceGeneral cuentas={cuentas} />
        </div>
        <div className={activeTab === 'resultados' ? 'block' : 'hidden print:block mb-12'}>
          <EstadoResultados cuentas={cuentas} />
        </div>
        <div className={activeTab === 'diario' ? 'block' : 'hidden print:block'}>
          <LibroDiario transacciones={transacciones} />
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
