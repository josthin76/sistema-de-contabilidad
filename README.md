# ContaBeni - Sistema Contable para Micronegocios del Beni

**ContaBeni** es una aplicación web contable con soporte para funcionamiento sin conexión diseñada específicamente para micronegocios de Trinidad y del departamento del Beni, presentada para la **TecnoFeria 2026** (Universidad Autónoma del Beni José Ballivián - Carrera de Ingeniería de Sistemas).

---

## 🌟 Características Principales

1. **Registro Rápido por Hechos Cotidianos:**
   - Botones sencillos: *"Vendí"*, *"Compré"*, *"Gasté"*, *"Me deben"*, *"Cobré"*, *"Retiré"*.
   - **Motor de reglas determinista de partida doble:** Genera asientos contables automáticos (Debe/Haber balanceado al 100%) sin requerir conocimientos contables previos.
   - Separación de retiros del propietario (*Negocio ≠ Dueño*).

2. **Libreta de Fiado:**
   - Control de cuentas por cobrar por cliente.
   - Generación de estados de cuenta compartibles vía WhatsApp.
   - Registro de cobros y abonos rápidos.

3. **Control de Inventarios:**
   - Catálogo de productos con precio de compra, venta y margen de ganancia.
   - Alertas automáticas de stock mínimo.
   - Kárdex y registro de movimientos (entradas, salidas y ajustes).

4. **Facturación y Comprobantes:**
   - Previsualización e impresión directa en formato PDF.
   - Exportación de transacciones y registros a formato Excel / CSV.

5. **Semáforo de Salud Financiera:**
   - Indicador visual rápido (🟢 Verde, 🟡 Amarillo, 🔴 Rojo) basado en efectivo en caja, comparación de ingresos vs egresos y estado del inventario.

6. **Reportes Contables:**
   - Balance General.
   - Estado de Resultados (Pérdidas y Ganancias).
   - Libro Diario.

7. **Área Didáctica de Aprendizaje:**
   - Tutoriales interactivos paso a paso para que cualquier comerciante comprenda sus finanzas en lenguaje cotidiano.

8. **Soporte Sin Conexión & Sincronización:**
   - Indicador en tiempo real de conexión (*En línea*, *Sincronizando*, *Fuera de línea*).
   - Modo demostración sin conexión para exhibiciones y ferias.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React (JSX) con Vite.
- **Estilos:** TailwindCSS.
- **Iconos:** Lucide React.
- **Enrutamiento:** React Router DOM v6.
- **Backend & Base de Datos:** Supabase (PostgreSQL, Triggers PL/pgSQL, Row Level Security).
- **Autenticación:** Supabase Auth (Google OAuth, Correo/Contraseña, Modo Demo).

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/josthin76/sistema-de-contabilidad.git
cd sistema-de-contabilidad
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
```

### 4. Configurar la Base de Datos en Supabase
Ejecuta el script SQL ubicado en `supabase/migrations/20261008235949_create_accounting_schema.sql` en el **SQL Editor** de tu panel de Supabase.

### 5. Iniciar en modo desarrollo
```bash
npm run dev
```
Abre en tu navegador `http://localhost:5173`.

---

## 👥 Equipo ContaBeni
- **Universidad Autónoma del Beni José Ballivián (UABJB)**
- **Facultad de Ingeniería y Tecnología - Carrera de Ingeniería de Sistemas**
- **TecnoFeria 2026**
