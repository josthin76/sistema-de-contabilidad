import { supabase } from './supabase';
import type { Producto } from './types';
import { registrarMovimientoInventario, createTransaccionWithLineas } from './accounting';

export async function fetchProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre');
  if (error) throw error;
  return data as Producto[];
}

export async function createProducto(
  nombre: string,
  descripcion: string,
  precioCompra: number,
  precioVenta: number,
  stockMinimo: number
): Promise<Producto> {
  const { data, error } = await supabase
    .from('productos')
    .insert({
      nombre,
      descripcion,
      precio_compra: precioCompra,
      precio_venta: precioVenta,
      stock_minimo: stockMinimo,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Producto;
}

export async function updateProducto(
  id: string,
  updates: Partial<Producto>
): Promise<void> {
  const { error } = await supabase
    .from('productos')
    .update({
      nombre: updates.nombre,
      descripcion: updates.descripcion,
      precio_compra: updates.precio_compra,
      precio_venta: updates.precio_venta,
      stock_minimo: updates.stock_minimo,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProducto(id: string): Promise<void> {
  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchMovimientos() {
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .select('*, producto:productos(*)')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export interface LineaVenta {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export async function registrarVenta(
  lineas: LineaVenta[],
  fecha: string,
  cuentaCobroId: string,
  cuentaVentasId: string,
  descripcion: string
): Promise<{ id: string; total: number }> {
  const total = lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0);


  const txnLineas = [
    {
      cuenta_id: cuentaCobroId,
      debito: total,
      credito: 0,
    },
    {
      cuenta_id: cuentaVentasId,
      debito: 0,
      credito: total,
    },
  ];

  const result = await createTransaccionWithLineas(
    descripcion,
    'venta',
    txnLineas,
    fecha
  );

  for (const linea of lineas) {
    await registrarMovimientoInventario(
      linea.productoId,
      'salida',
      linea.cantidad,
      linea.precioUnitario,
      `Venta: ${descripcion}`,
      result.id
    );
  }

  return result;
}

export async function registrarCompra(
  lineas: LineaVenta[],
  fecha: string,
  cuentaPagoId: string,
  cuentaComprasId: string,
  cuentaInventarioId: string,
  descripcion: string
): Promise<{ id: string; total: number }> {
  const total = lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0);


  const txnLineas = [
    {
      cuenta_id: cuentaInventarioId,
      debito: total,
      credito: 0,
    },
    {
      cuenta_id: cuentaPagoId,
      debito: 0,
      credito: total,
    },
  ];

  const result = await createTransaccionWithLineas(
    descripcion,
    'compra',
    txnLineas,
    fecha
  );

  for (const linea of lineas) {
    await registrarMovimientoInventario(
      linea.productoId,
      'entrada',
      linea.cantidad,
      linea.precioUnitario,
      `Compra: ${descripcion}`,
      result.id
    );
  }

  return result;
}
