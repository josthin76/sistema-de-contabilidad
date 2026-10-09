import { createTransaccionWithLineas, fetchTransacciones } from './accounting';

export interface ClienteFiado {
  id: string;
  nombre: string;
  telefono: string;
  notas: string;
  created_at: string;
}

const STORAGE_KEY = 'contabeni_clientes_fiado';

export function fetchClientes(): ClienteFiado[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function createCliente(nombre: string, telefono: string, notas: string): ClienteFiado {
  const clientes = fetchClientes();
  const nuevoCliente: ClienteFiado = {
    id: crypto.randomUUID(),
    nombre,
    telefono,
    notas,
    created_at: new Date().toISOString()
  };
  clientes.push(nuevoCliente);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
  return nuevoCliente;
}

export function updateCliente(id: string, updates: Partial<ClienteFiado>): void {
  const clientes = fetchClientes();
  const index = clientes.findIndex(c => c.id === id);
  if (index !== -1) {
    clientes[index] = { ...clientes[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
  }
}

export function deleteCliente(id: string): void {
  const clientes = fetchClientes();
  const filtered = clientes.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// Fetch all fiado transactions (both debts and payments)
export async function fetchFiadosByCliente(clienteId: string) {
  const cliente = fetchClientes().find(c => c.id === clienteId);
  if (!cliente) throw new Error("Cliente no encontrado");

  const transacciones = await fetchTransacciones();
  
  return transacciones.filter(t => 
    t.descripcion.startsWith(`Fiado: ${cliente.nombre} - `) || 
    t.descripcion.startsWith(`Abono Fiado: ${cliente.nombre} - `)
  ).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
}

export async function createFiado(
  clienteId: string, 
  monto: number, 
  descripcion: string, 
  fecha: string,
  cuentaCxCId: string,
  cuentaVentasId: string
) {
  const cliente = fetchClientes().find(c => c.id === clienteId);
  if (!cliente) throw new Error("Cliente no encontrado");

  const lineas = [
    { cuenta_id: cuentaCxCId, debito: monto, credito: 0 },
    { cuenta_id: cuentaVentasId, debito: 0, credito: monto }
  ];

  return await createTransaccionWithLineas(
    `Fiado: ${cliente.nombre} - ${descripcion}`,
    'venta',
    lineas,
    fecha
  );
}

export async function marcarFiadoPagado(
  clienteId: string,
  montoPagado: number,
  fecha: string,
  cuentaCajaId: string,
  cuentaCxCId: string,
  descripcion: string = 'Pago'
) {
  const cliente = fetchClientes().find(c => c.id === clienteId);
  if (!cliente) throw new Error("Cliente no encontrado");

  const lineas = [
    { cuenta_id: cuentaCajaId, debito: montoPagado, credito: 0 },
    { cuenta_id: cuentaCxCId, debito: 0, credito: montoPagado }
  ];

  return await createTransaccionWithLineas(
    `Abono Fiado: ${cliente.nombre} - ${descripcion}`,
    'cobre',
    lineas,
    fecha
  );
}

export async function fetchResumenFiado() {
  const clientes = fetchClientes();
  const transacciones = await fetchTransacciones();
  
  let totalPendiente = 0;
  
  const resumen = clientes.map(cliente => {
    const txsCliente = transacciones.filter(t => 
      t.descripcion.startsWith(`Fiado: ${cliente.nombre} - `) || 
      t.descripcion.startsWith(`Abono Fiado: ${cliente.nombre} - `)
    );
    
    let saldo = 0;
    txsCliente.forEach(t => {
      if (t.descripcion.startsWith(`Fiado: ${cliente.nombre} - `)) {
        saldo += t.total;
      } else if (t.descripcion.startsWith(`Abono Fiado: ${cliente.nombre} - `)) {
        saldo -= t.total;
      }
    });

    totalPendiente += saldo;
    
    return {
      cliente,
      saldo,
      txsCount: txsCliente.length
    };
  });

  return { resumen, totalPendiente };
}
