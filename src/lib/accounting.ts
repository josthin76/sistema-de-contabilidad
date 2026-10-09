import { supabase } from './supabase';
import type { Cuenta, LineaTransaccionInput, TipoTransaccion } from './types';

export async function fetchCuentas(): Promise<Cuenta[]> {
  const { data, error } = await supabase
    .from('cuentas')
    .select('*')
    .order('codigo');
  if (error) throw error;
  return data as Cuenta[];
}

export async function createCuenta(
  codigo: string,
  nombre: string,
  tipo: Cuenta['tipo']
): Promise<Cuenta> {
  const { data, error } = await supabase
    .from('cuentas')
    .insert({ codigo, nombre, tipo })
    .select()
    .single();
  if (error) throw error;
  return data as Cuenta;
}

export async function deleteCuenta(id: string): Promise<void> {
  const { error } = await supabase.from('cuentas').delete().eq('id', id);
  if (error) throw error;
}

export async function createTransaccionWithLineas(
  descripcion: string,
  tipo: TipoTransaccion,
  lineas: LineaTransaccionInput[],
  fecha: string
): Promise<{ id: string; total: number }> {
  const totalDebito = lineas.reduce((s, l) => s + l.debito, 0);
  const totalCredito = lineas.reduce((s, l) => s + l.credito, 0);

  if (Math.abs(totalDebito - totalCredito) > 0.01) {
    throw new Error(
      `El asiento no está balanceado. Débitos: ${totalDebito.toFixed(2)}, Créditos: ${totalCredito.toFixed(2)}`
    );
  }

  const { data: txn, error: txnErr } = await supabase
    .from('transacciones')
    .insert({ descripcion, tipo, fecha, total: totalDebito })
    .select()
    .single();
  if (txnErr) throw txnErr;

  const lineasWithTxn = lineas.map((l) => ({
    ...l,
    transaccion_id: (txn as { id: string }).id,
    debito: l.debito,
    credito: l.credito,
  }));

  const { error: lineasErr } = await supabase
    .from('transaccion_lineas')
    .insert(lineasWithTxn);
  if (lineasErr) throw lineasErr;

  return { id: (txn as { id: string }).id, total: totalDebito };
}

export async function fetchTransacciones(): Promise<
  Array<{
    id: string;
    fecha: string;
    descripcion: string;
    tipo: TipoTransaccion;
    total: number;
    created_at: string;
  }>
> {
  const { data, error } = await supabase
    .from('transacciones')
    .select('*')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Array<{
    id: string;
    fecha: string;
    descripcion: string;
    tipo: TipoTransaccion;
    total: number;
    created_at: string;
  }>;
}

export async function fetchTransaccionDetail(id: string) {
  const { data: txn, error: txnErr } = await supabase
    .from('transacciones')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (txnErr) throw txnErr;

  const { data: lineas, error: lineasErr } = await supabase
    .from('transaccion_lineas')
    .select('*, cuenta:cuentas(*)')
    .eq('transaccion_id', id);
  if (lineasErr) throw lineasErr;

  return { transaccion: txn, lineas };
}

export async function deleteTransaccion(id: string): Promise<void> {
  const { error: linErr } = await supabase
    .from('transaccion_lineas')
    .delete()
    .eq('transaccion_id', id);
  if (linErr) throw linErr;

  const { error: txnErr } = await supabase
    .from('transacciones')
    .delete()
    .eq('id', id);
  if (txnErr) throw txnErr;
}

export async function registrarMovimientoInventario(
  productoId: string,
  tipo: 'entrada' | 'salida' | 'ajuste',
  cantidad: number,
  precioUnitario: number,
  nota: string,
  transaccionId?: string
): Promise<void> {
  const { error } = await supabase.from('movimientos_inventario').insert({
    producto_id: productoId,
    tipo,
    cantidad,
    precio_unitario: precioUnitario,
    nota,
    transaccion_id: transaccionId ?? null,
  });
  if (error) throw error;
}
