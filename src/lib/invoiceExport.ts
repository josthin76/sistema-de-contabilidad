import { Transaccion, TransaccionLinea } from './types';
import { formatCurrency, formatDate } from './format';

export function generateInvoiceHTML(data: { transaction: Transaccion, lineas: TransaccionLinea[], businessName: string }) {
  const { transaction, lineas, businessName } = data;
  
  const itemsHTML = lineas.filter(l => l.credito > 0).map(l => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">1</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${l.cuenta?.nombre || transaction.descripcion}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(l.credito)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(l.credito)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Comprobante ${transaction.id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 20px; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; background: white; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #059669; padding-bottom: 20px; }
        .business-name { font-size: 24px; font-weight: bold; color: #059669; }
        .invoice-details { text-align: right; }
        .details-title { font-weight: bold; font-size: 20px; margin-bottom: 5px; color: #374151; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #f9fafb; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #4b5563; }
        th.right { text-align: right; }
        .total-row td { font-weight: bold; font-size: 18px; padding-top: 20px; }
        .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; }
        @media print { .invoice-box { box-shadow: none; border: none; padding: 0; } body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div>
            <div class="business-name">${businessName || 'ContaBeni'}</div>
            <div>Comprobante de Operación</div>
          </div>
          <div class="invoice-details">
            <div class="details-title">COMPROBANTE</div>
            <div>No. ${transaction.id.substring(0, 8)}</div>
            <div>Fecha: ${formatDate(transaction.fecha)}</div>
            <div>Tipo: <span style="text-transform: uppercase;">${transaction.tipo}</span></div>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <strong>Descripción:</strong><br>
          ${transaction.descripcion}
        </div>

        <table>
          <thead>
            <tr>
              <th>Cant.</th>
              <th>Descripción</th>
              <th class="right">Precio Unit.</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML || `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">1</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${transaction.descripcion}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(transaction.total)}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(transaction.total)}</td>
              </tr>
            `}
            <tr class="total-row">
              <td colspan="3" style="text-align: right; padding-right: 20px;">TOTAL:</td>
              <td style="text-align: right; color: #059669;">${formatCurrency(transaction.total)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          Gracias por su preferencia.<br>
          Generado por ContaBeni
        </div>
      </div>
    </body>
    </html>
  `;
}

export function exportToPDF(htmlContent: string) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}

export function exportToCSV(transactions: Transaccion[], filename = 'transacciones.csv') {
  const headers = ['Fecha', 'Descripción', 'Tipo', 'Total'];
  const rows = transactions.map(t => [
    t.fecha.split('T')[0],
    `"${t.descripcion.replace(/"/g, '""')}"`,
    t.tipo,
    t.total.toString()
  ]);
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function generateReceiptText(transaction: Transaccion): string {
  return `🧾 COMPROBANTE - ContaBeni\n\nFecha: ${formatDate(transaction.fecha)}\nTipo: ${transaction.tipo.toUpperCase()}\nNo: ${transaction.id.substring(0, 8)}\n\nDescripción: ${transaction.descripcion}\n\n========================\nTOTAL: ${formatCurrency(transaction.total)}\n========================\n\n¡Gracias!`;
}
