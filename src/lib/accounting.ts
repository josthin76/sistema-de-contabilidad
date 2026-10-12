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
  if (lineas.length < 2) {
    throw new Error('Un asiento contable debe incluir al menos dos líneas.');
  }

  const lineasNormalizadas = lineas.map((linea) => {
    const debito = Number(linea.debito);
    const credito = Number(linea.credito);
    if (!linea.cuenta_id || !Number.isFinite(debito) || !Number.isFinite(credito) || debito < 0 || credito < 0) {
      throw new Error('Cada línea debe tener una cuenta y montos válidos no negativos.');
    }
    if (debito > 0 && credito > 0) {
      throw new Error('Una línea no puede tener débito y crédito al mismo tiempo.');
    }
    if (debito === 0 && credito === 0) {
      throw new Error('Cada línea debe registrar un débito o un crédito mayor que cero.');
    }
    return {
      ...linea,
      debito: Math.round(debito * 100) / 100,
      credito: Math.round(credito * 100) / 100,
    };
  });

  const totalDebito = lineasNormalizadas.reduce((sum, linea) => sum + linea.debito, 0);
  const totalCredito = lineasNormalizadas.reduce((sum, linea) => sum + linea.credito, 0);
  const debitoCentavos = Math.round(totalDebito * 100);
  const creditoCentavos = Math.round(totalCredito * 100);

  if (debitoCentavos !== creditoCentavos) {
    throw new Error(
      `El asiento no está balanceado. Débitos: ${totalDebito.toFixed(2)}, Créditos: ${totalCredito.toFixed(2)}`
    );
  }
  if (debitoCentavos === 0) throw new Error('El total del asiento debe ser mayor que cero.');

  const { data: txn, error: txnErr } = await supabase
    .from('transacciones')
    .insert({ descripcion, tipo, fecha, total: debitoCentavos / 100 })
    .select()
    .single();
  if (txnErr) throw txnErr;
  if (!txn) throw new Error('No se pudo crear la transacción.');

  const lineasWithTxn = lineasNormalizadas.map((l) => ({
    ...l,
    transaccion_id: (txn as { id: string }).id,
    debito: l.debito,
    credito: l.credito,
  }));

  const { error: lineasErr } = await supabase
    .from('transaccion_lineas')
    .insert(lineasWithTxn);
  if (lineasErr) {
    const { error: cleanupError } = await supabase
      .from('transacciones')
      .delete()
      .eq('id', (txn as { id: string }).id);
    if (cleanupError) {
      throw new Error(`${lineasErr.message}. No se pudo limpiar el encabezado incompleto: ${cleanupError.message}`);
    }
    throw lineasErr;
  }

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
    lineas?: Array<{
      id: string;
      cuenta_id: string;
      debito: number;
      credito: number;
      cuenta?: {
        id: string;
        codigo: string;
        nombre: string;
        tipo: string;
      };
    }>;
  }>
> {
  const { data, error } = await supabase
    .from('transacciones')
    .select('*, lineas:transaccion_lineas(*, cuenta:cuentas(*))')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchTransaccionDetail(id: string) {
  const { data: txn, error: txnErr } = await supabase
    .from('transacciones')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (txnErr) throw txnErr;
  if (!txn) throw new Error('No se encontró la transacción solicitada.');

  const { data: lineas, error: lineasErr } = await supabase
    .from('transaccion_lineas')
    .select('*, cuenta:cuentas(*)')
    .eq('transaccion_id', id);
  if (lineasErr) throw lineasErr;

  return { transaccion: txn, lineas };
}

export async function deleteTransaccion(id: string): Promise<void> {
  const { error } = await supabase.rpc('delete_transaccion_with_inventory', {
    p_transaccion_id: id,
  });
  if (error) throw error;
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
