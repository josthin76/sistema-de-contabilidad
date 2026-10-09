import React from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

export default function ProductCard({ product, onEdit, onDelete }) {
  const stock = product.stock || 0;
  const isLowStock = stock < product.stock_minimo;
  const isWarningStock = stock === product.stock_minimo;
  
  let stockBadgeClass = "bg-emerald-100 text-emerald-800";
  if (isLowStock) stockBadgeClass = "bg-red-100 text-red-800";
  else if (isWarningStock) stockBadgeClass = "bg-yellow-100 text-yellow-800";

  const margin = product.precio_venta - product.precio_compra;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5 border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 line-clamp-1" title={product.nombre}>
              {product.nombre}
            </h3>
            {product.descripcion && (
              <p className="text-sm text-gray-500 line-clamp-1">{product.descripcion}</p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(product)} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded hover:bg-gray-50">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(product)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Precio Compra</p>
          <p className="font-medium text-gray-700">{formatCurrency(product.precio_compra)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Precio Venta</p>
          <p className="font-medium text-emerald-600">{formatCurrency(product.precio_venta)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Stock:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${stockBadgeClass}`}>
            {stock}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Margen: <span className="font-medium text-gray-700">{formatCurrency(margin)}</span>
        </div>
      </div>
    </div>
  );
}
