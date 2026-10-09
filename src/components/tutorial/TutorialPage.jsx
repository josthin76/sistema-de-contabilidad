import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShoppingCart, 
  Package, 
  BookText, 
  BarChart3, 
  AlertCircle, 
  FileText,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Banknote,
  Receipt,
  Users,
  Wallet
} from 'lucide-react';

const AccordionItem = ({ title, icon: Icon, children, isOpen, onClick }) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm transition-all duration-200">
      <button 
        className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-gray-50 focus:outline-none"
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <Icon size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 text-left">{title}</h3>
        </div>
        <div className="text-gray-400">
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 text-gray-700 leading-relaxed text-base">
          {children}
        </div>
      )}
    </div>
  );
};

const TutorialPage = () => {
  const [openSection, setOpenSection] = useState(0);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? -1 : index);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-600 rounded-full mb-4">
          <GraduationCap size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Aprende a usar ContaBeni</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Una guía rápida para sacarle el máximo provecho a tu asistente contable sin necesidad de ser experto.
        </p>
      </div>

      <div className="space-y-4">
        <AccordionItem 
          title="¿Qué es ContaBeni?" 
          icon={GraduationCap} 
          isOpen={openSection === 0} 
          onClick={() => toggleSection(0)}
        >
          <p className="mb-4">
            <strong>ContaBeni es tu asistente contable.</strong> Traduce lo que haces todos los días en tu negocio a registros contables automáticos.
          </p>
          <p>
            No necesitas saber de contabilidad para usarlo. Simplemente registra lo que haces (vender, comprar, gastar) usando tus propias palabras, y ContaBeni se encarga de organizar los números, actualizar tu inventario y preparar tus reportes.
          </p>
        </AccordionItem>

        <AccordionItem 
          title="Registro Rápido - Tus acciones del día a día" 
          icon={ShoppingCart} 
          isOpen={openSection === 1} 
          onClick={() => toggleSection(1)}
        >
          <p className="mb-4">
            En la pantalla principal, verás botones rápidos para las 6 acciones más comunes en tu negocio. Así es como funcionan:
          </p>
          
          <div className="grid gap-4 mt-6">
            <div className="flex items-start bg-white p-3 rounded-lg border border-gray-200">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full mr-3 shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Vendí</h4>
                <p className="text-sm text-gray-600">Cuando un cliente te paga por un producto o servicio.</p>
                <p className="text-sm text-emerald-700 mt-1 italic">Ejemplo: Vendí 3 pollos a Bs 25 cada uno.</p>
              </div>
            </div>

            <div className="flex items-start bg-white p-3 rounded-lg border border-gray-200">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full mr-3 shrink-0">
                <ShoppingCart size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Compré</h4>
                <p className="text-sm text-gray-600">Cuando compras mercadería o insumos para tu negocio.</p>
                <p className="text-sm text-emerald-700 mt-1 italic">Ejemplo: Compré 10 kg de arroz a Bs 8 el kilo.</p>
              </div>
            </div>

            <div className="flex items-start bg-white p-3 rounded-lg border border-gray-200">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-full mr-3 shrink-0">
                <Receipt size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Gasté</h4>
                <p className="text-sm text-gray-600">Cuando pagas algo necesario para tu negocio (luz, agua, alquiler, transporte).</p>
                <p className="text-sm text-emerald-700 mt-1 italic">Ejemplo: Pagué Bs 150 de alquiler.</p>
              </div>
            </div>

            <div className="flex items-start bg-white p-3 rounded-lg border border-gray-200">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-full mr-3 shrink-0">
                <Users size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Me Deben</h4>
                <p className="text-sm text-gray-600">Cuando vendes al fiado (el cliente se lleva el producto pero pagará después).</p>
                <p className="text-sm text-emerald-700 mt-1 italic">Ejemplo: Don Juan se llevó 2 kg de carne y pagará el viernes.</p>
              </div>
            </div>

            <div className="flex items-start bg-white p-3 rounded-lg border border-gray-200">
              <div className="p-2 bg-teal-100 text-teal-600 rounded-full mr-3 shrink-0">
                <Banknote size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Cobré</h4>
                <p className="text-sm text-gray-600">Cuando un cliente que te debía te paga.</p>
                <p className="text-sm text-emerald-700 mt-1 italic">Ejemplo: Don Juan pagó los Bs 50 que debía.</p>
              </div>
            </div>

            <div className="flex items-start bg-white p-3 rounded-lg border border-gray-200">
              <div className="p-2 bg-red-100 text-red-600 rounded-full mr-3 shrink-0">
                <Wallet size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Retiré</h4>
                <p className="text-sm text-gray-600">Cuando sacas dinero del negocio para uso personal.</p>
                <p className="text-sm text-emerald-700 mt-1 italic">Ejemplo: Retiré Bs 200 para mis gastos personales.</p>
              </div>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem 
          title="Tu Inventario" 
          icon={Package} 
          isOpen={openSection === 2} 
          onClick={() => toggleSection(2)}
        >
          <ul className="list-disc pl-5 space-y-3">
            <li><strong>Agregar productos:</strong> Ve a la sección de inventario para registrar lo que vendes. Asegúrate de poner el precio al que compras y al que vendes.</li>
            <li><strong>Por qué es importante:</strong> Si registras tus productos, ContaBeni actualizará tu stock automáticamente cuando uses los botones "Vendí" o "Compré".</li>
            <li><strong>Alertas de stock:</strong> Verás productos marcados si te estás quedando sin mercadería, ayudándote a saber cuándo volver a comprar.</li>
          </ul>
        </AccordionItem>

        <AccordionItem 
          title="Libreta de Fiado" 
          icon={BookText} 
          isOpen={openSection === 3} 
          onClick={() => toggleSection(3)}
        >
          <p className="mb-3">Es tu cuaderno digital de clientes que te deben dinero.</p>
          <ul className="list-disc pl-5 space-y-3">
            <li><strong>Anotar deudas:</strong> Usa el botón "Me Deben" para registrar si le fiaste a alguien.</li>
            <li><strong>Registrar pagos:</strong> Usa el botón "Cobré" para anotar cuando te pagan.</li>
            <li><strong>Recordatorios:</strong> Podrás ver una lista clara de quién te debe y cuánto. Próximamente, podrás compartir un estado de cuenta por WhatsApp.</li>
          </ul>
        </AccordionItem>

        <AccordionItem 
          title="Tus Reportes" 
          icon={BarChart3} 
          isOpen={openSection === 4} 
          onClick={() => toggleSection(4)}
        >
          <p className="mb-4">ContaBeni hace los cálculos contables por ti. Estos son los reportes que genera:</p>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-gray-800">Balance General</h4>
              <p>Es como una foto de tu negocio. Muestra lo que tienes (dinero, mercadería), lo que debes a proveedores, y lo que es verdaderamente tuyo.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800">Estado de Resultados</h4>
              <p>Te dice si tu negocio está ganando o perdiendo dinero en un periodo de tiempo. Resta tus gastos a tus ventas para decirte tu ganancia real.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800">Libro Diario</h4>
              <p>Es como un cuaderno donde se anotan, en orden y con todos los detalles contables, todas las operaciones que hiciste.</p>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem 
          title="El Semáforo de tu Negocio" 
          icon={AlertCircle} 
          isOpen={openSection === 5} 
          onClick={() => toggleSection(5)}
        >
          <p className="mb-4">En el panel principal verás indicadores con colores para que sepas cómo está tu negocio de un vistazo:</p>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="w-4 h-4 bg-emerald-500 rounded-full mr-3 shrink-0"></div>
              <p><strong className="text-emerald-800">VERDE:</strong> Tu negocio va bien. Tienes dinero en caja, vendes más de lo que gastas.</p>
            </div>
            
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3 shrink-0"></div>
              <p><strong className="text-yellow-800">AMARILLO:</strong> Cuidado. Tus ingresos y gastos están muy parejos, o tienes productos por acabarse.</p>
            </div>
            
            <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3 shrink-0"></div>
              <p><strong className="text-red-800">ROJO:</strong> Alerta. Estás gastando más de lo que ganas o te estás quedando sin efectivo.</p>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem 
          title="Facturas y Exportaciones" 
          icon={FileText} 
          isOpen={openSection === 6} 
          onClick={() => toggleSection(6)}
        >
          <ul className="list-disc pl-5 space-y-3">
            <li><strong>Generar Facturas:</strong> Puedes crear facturas o recibos para tus clientes por las ventas realizadas.</li>
            <li><strong>Exportar:</strong> Puedes descargar tus reportes, listas de transacciones o el estado de tu inventario en PDF o Excel para compartirlos o guardarlos.</li>
          </ul>
        </AccordionItem>
      </div>
    </div>
  );
};

export default TutorialPage;
