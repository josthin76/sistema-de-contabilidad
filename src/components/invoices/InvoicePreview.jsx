import React from 'react';
import { generateInvoiceHTML, exportToPDF, generateReceiptText } from '@/lib/invoiceExport';
import { Download, FileText, Share2, X } from 'lucide-react';

export function InvoicePreview({ transaction, lineas, businessName = 'Mi Negocio', onClose }) {
  if (!transaction) return null;

  const handleDownloadPDF = () => {
    const html = generateInvoiceHTML({ transaction, lineas, businessName });
    exportToPDF(html);
  };

  const handleShare = () => {
    const text = generateReceiptText(transaction);
    if (navigator.share) {
      navigator.share({
        title: `Comprobante ${transaction.id.substring(0, 8)}`,
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('Texto del recibo copiado al portapapeles');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Vista Previa de Comprobante</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="bg-white shadow-sm border border-gray-200 mx-auto max-w-3xl min-h-[500px]"
               dangerouslySetInnerHTML={{ __html: generateInvoiceHTML({ transaction, lineas: lineas || [], businessName }) }} />
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors shadow-sm"
          >
            <Share2 size={18} />
            <span>Compartir</span>
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Download size={18} />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
