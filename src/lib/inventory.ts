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
  stockMinimo: number,
  stockInicial: number = 0
): Promise<Producto> {
  if (!Number.isInteger(stockInicial) || stockInicial < 0) {
    throw new Error('El stock inicial debe ser un número entero mayor o igual a cero.');
  }

  const { data, error } = await supabase
    .from('productos')
    .insert({
      nombre,
      descripcion,
      precio_compra: precioCompra,
      precio_venta: precioVenta,
      stock_minimo: stockMinimo,
      // El trigger del movimiento inicial suma esta cantidad al stock del producto.
      stock: 0,
    })
    .select()
    .single();
  if (error) throw error;

  if (stockInicial > 0) {
    try {
      await registrarMovimientoInventario(
        data.id,
        'ajuste',
        stockInicial,
        precioCompra,
        'Inventario inicial'
      );
    } catch (error) {
      const { error: cleanupError } = await supabase.from('productos').delete().eq('id', data.id);
      if (cleanupError) {
        const originalMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`${originalMessage}. No se pudo limpiar el producto incompleto: ${cleanupError.message}`);
      }
      throw error;
    }
  }

  return data as Producto;
}

export async function updateProducto(
  id: string,
  updates: Partial<Producto>
): Promise<void> {
  if (updates.stock !== undefined && (!Number.isInteger(updates.stock) || updates.stock < 0)) {
    throw new Error('El stock debe ser un número entero mayor o igual a cero.');
  }

  const updatePayload: Record<string, string | number> = {};
  if (updates.nombre !== undefined) updatePayload.nombre = updates.nombre;
  if (updates.descripcion !== undefined) updatePayload.descripcion = updates.descripcion;
  if (updates.precio_compra !== undefined) updatePayload.precio_compra = updates.precio_compra;
  if (updates.precio_venta !== undefined) updatePayload.precio_venta = updates.precio_venta;
  if (updates.stock_minimo !== undefined) updatePayload.stock_minimo = updates.stock_minimo;
  let stockAnterior: number | null = null;
  let precioCompraActual = 0;
  if (updates.stock !== undefined) {
    const { data: currentProduct, error: currentError } = await supabase
      .from('productos')
      .select('stock, precio_compra')
      .eq('id', id)
      .single();
    if (currentError) throw currentError;
    stockAnterior = Number(currentProduct.stock) || 0;
    precioCompraActual = Number(currentProduct.precio_compra) || 0;
  }

  if (Object.keys(updatePayload).length) {
    const { error } = await supabase
      .from('productos')
      .update(updatePayload)
      .eq('id', id);
    if (error) throw error;
  }

  if (updates.stock !== undefined && stockAnterior !== null) {
    const difference = updates.stock - stockAnterior;
    if (difference !== 0) {
      await registrarMovimientoInventario(
        id,
        difference > 0 ? 'entrada' : 'salida',
        Math.abs(difference),
        Number(updates.precio_compra ?? precioCompraActual) || 0,
        'Ajuste de stock desde edición de producto'
      );
    }
  }
}

export async function ajustarStock(
  productoId: string,
  delta: number,
  motivo: string = 'Ajuste rápido de inventario'
): Promise<number> {
  if (!Number.isInteger(delta) || delta === 0) {
    throw new Error('El ajuste de stock debe ser un número entero distinto de cero.');
  }

  // Obtener producto actual
  const { data: prod, error: pErr } = await supabase
    .from('productos')
    .select('*')
    .eq('id', productoId)
    .single();
  if (pErr) throw pErr;

  const stockActual = Number(prod.stock) || 0;
  const nuevoStock = stockActual + delta;
  if (nuevoStock < 0) throw new Error('El stock no puede quedar por debajo de cero.');
  const tipoMov = delta >= 0 ? 'entrada' : 'salida';

  // Registrar movimiento
  await registrarMovimientoInventario(
    productoId,
    tipoMov,
    Math.abs(delta),
    prod.precio_compra,
    motivo
  );

  return nuevoStock;
}

export async function deleteProducto(id: string): Promise<void> {
  // Primero desvincular o eliminar movimientos asociados para evitar error de FK
  const { error: movimientosError } = await supabase
    .from('movimientos_inventario')
    .delete()
    .eq('producto_id', id);
  if (movimientosError) throw movimientosError;

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

function validateInventoryLines(lineas: LineaVenta[]): LineaVenta[] {
  if (!lineas.length) throw new Error('Agrega al menos un producto al movimiento.');
  return lineas.map((linea) => {
    if (!linea.productoId || !Number.isInteger(linea.cantidad) || linea.cantidad <= 0) {
      throw new Error('Cada producto debe tener una cantidad entera mayor que cero.');
    }
    if (!Number.isFinite(linea.precioUnitario) || linea.precioUnitario < 0) {
      throw new Error('El precio unitario debe ser un monto válido no negativo.');
    }
    return { ...linea, precioUnitario: Math.round(linea.precioUnitario * 100) / 100 };
  });
}

async function registerInventoryMovementsOrRevert(
  transactionId: string,
  lineas: LineaVenta[],
  tipo: 'entrada' | 'salida',
  nota: string
): Promise<void> {
  try {
    for (const linea of lineas) {
      await registrarMovimientoInventario(
        linea.productoId,
        tipo,
        linea.cantidad,
        linea.precioUnitario,
        nota,
        transactionId
      );
    }
  } catch (error) {
    const { error: movementsCleanupError } = await supabase
      .from('movimientos_inventario')
      .delete()
      .eq('transaccion_id', transactionId);
    if (movementsCleanupError) {
      const originalMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`${originalMessage}. No se pudieron revertir los movimientos: ${movementsCleanupError.message}`);
    }

    const { error: transactionCleanupError } = await supabase
      .from('transacciones')
      .delete()
      .eq('id', transactionId);
    if (transactionCleanupError) {
      const originalMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`${originalMessage}. No se pudo revertir el asiento: ${transactionCleanupError.message}`);
    }
    throw error;
  }
}

export async function registrarVenta(
  lineas: LineaVenta[],
  fecha: string,
  cuentaCobroId: string,
  cuentaVentasId: string,
  descripcion: string
): Promise<{ id: string; total: number }> {
  const validLines = validateInventoryLines(lineas);
  const quantitiesByProduct = new Map<string, number>();
  for (const linea of validLines) {
    quantitiesByProduct.set(linea.productoId, (quantitiesByProduct.get(linea.productoId) || 0) + linea.cantidad);
  }

  const { data: products, error: productsError } = await supabase
    .from('productos')
    .select('id, stock')
    .in('id', Array.from(quantitiesByProduct.keys()));
  if (productsError) throw productsError;
  const productsById = new Map((products || []).map((product) => [product.id, Number(product.stock) || 0]));
  for (const [productId, quantity] of quantitiesByProduct) {
    const stock = productsById.get(productId);
    if (stock === undefined) throw new Error('Uno de los productos ya no existe en el inventario.');
    if (quantity > stock) throw new Error('No hay suficiente stock para completar la venta.');
  }

  const total = validLines.reduce((sum, linea) => sum + linea.cantidad * linea.precioUnitario, 0);


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

  await registerInventoryMovementsOrRevert(result.id, validLines, 'salida', `Venta: ${descripcion}`);

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
  const validLines = validateInventoryLines(lineas);
  const total = validLines.reduce((sum, linea) => sum + linea.cantidad * linea.precioUnitario, 0);


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

  await registerInventoryMovementsOrRevert(result.id, validLines, 'entrada', `Compra: ${descripcion}`);

  return result;
}
