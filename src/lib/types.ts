export type TipoCuenta = 'activo' | 'pasivo' | 'patrimonio' | 'ingreso' | 'gasto';

export interface Cuenta {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  saldo: number;
  created_at: string;
}

export type TipoTransaccion = 'compra' | 'venta' | 'pago' | 'cobre' | 'ajuste' | 'apertura';

export interface Transaccion {
  id: string;
  fecha: string;
  descripcion: string;
  tipo: TipoTransaccion;
  total: number;
  created_at: string;
  lineas?: TransaccionLinea[];
}

export interface TransaccionLinea {
  id: string;
  transaccion_id: string;
  cuenta_id: string;
  debito: number;
  credito: number;
  created_at: string;
  cuenta?: Cuenta;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  created_at: string;
}

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste';

export interface MovimientoInventario {
  id: string;
  producto_id: string;
  transaccion_id: string | null;
  tipo: TipoMovimiento;
  cantidad: number;
  precio_unitario: number;
  fecha: string;
  nota: string;
  created_at: string;
  producto?: Producto;
}

export interface LineaTransaccionInput {
  cuenta_id: string;
  debito: number;
  credito: number;
}
