/*
# Sistema Contable - Esquema de Base de Datos

1. Tablas Nuevas
- `cuentas` (Plan de Cuentas): Catálogo de cuentas contables con código, nombre, tipo (activo, pasivo, patrimonio, ingreso, gasto) y saldo actual.
- `transacciones` (Asientos Contables): Encabezado de cada asiento con fecha, descripción y tipo (compra, venta, pago, ajuste).
- `transaccion_lineas` (Detalle del Asiento): Líneas de débito/crédito que componen cada asiento, referenciando una cuenta.
- `productos` (Inventario): Catálogo de productos con nombre, descripción, precio de compra, precio de venta y stock actual.
- `movimientos_inventario`: Registro de cada entrada/salida de inventario (compra, venta, ajuste).

2. Seguridad
- Aplicación de inquilino único (sin autenticación). RLS habilitada en todas las tablas.
- Políticas anon+authenticated para CRUD completo, ya que los datos son intencionalmente compartidos.

3. Notas
- El saldo de cuenta y el stock de producto se mantienen actualizados mediante triggers.
- Los códigos de cuenta siguen la estructura: 1-XXXX (Activo), 2-XXXX (Pasivo), 3-XXXX (Patrimonio), 4-XXXX (Ingreso), 5-XXXX (Gasto).
- Se insertan cuentas iniciales y un asiento de apertura para iniciar el sistema.
*/

-- ============================================================
-- TABLA: cuentas (Plan de Cuentas)
-- ============================================================
CREATE TABLE IF NOT EXISTS cuentas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('activo', 'pasivo', 'patrimonio', 'ingreso', 'gasto')),
  saldo numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cuentas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cuentas" ON cuentas;
CREATE POLICY "anon_select_cuentas" ON cuentas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cuentas" ON cuentas;
CREATE POLICY "anon_insert_cuentas" ON cuentas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cuentas" ON cuentas;
CREATE POLICY "anon_update_cuentas" ON cuentas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cuentas" ON cuentas;
CREATE POLICY "anon_delete_cuentas" ON cuentas FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TABLA: transacciones (Asientos Contables)
-- ============================================================
CREATE TABLE IF NOT EXISTS transacciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  descripcion text NOT NULL,
  tipo text NOT NULL DEFAULT 'ajuste' CHECK (tipo IN ('compra', 'venta', 'pago', 'cobre', 'ajuste', 'apertura')),
  total numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transacciones" ON transacciones;
CREATE POLICY "anon_select_transacciones" ON transacciones FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_transacciones" ON transacciones;
CREATE POLICY "anon_insert_transacciones" ON transacciones FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_transacciones" ON transacciones;
CREATE POLICY "anon_update_transacciones" ON transacciones FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_transacciones" ON transacciones;
CREATE POLICY "anon_delete_transacciones" ON transacciones FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TABLA: transaccion_lineas (Detalle del Asiento)
-- ============================================================
CREATE TABLE IF NOT EXISTS transaccion_lineas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaccion_id uuid NOT NULL REFERENCES transacciones(id) ON DELETE CASCADE,
  cuenta_id uuid NOT NULL REFERENCES cuentas(id) ON DELETE RESTRICT,
  debito numeric(14,2) NOT NULL DEFAULT 0,
  credito numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transaccion_lineas_transaccion ON transaccion_lineas(transaccion_id);
CREATE INDEX IF NOT EXISTS idx_transaccion_lineas_cuenta ON transaccion_lineas(cuenta_id);

ALTER TABLE transaccion_lineas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transaccion_lineas" ON transaccion_lineas;
CREATE POLICY "anon_select_transaccion_lineas" ON transacciones FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_tl" ON transaccion_lineas;
CREATE POLICY "anon_select_tl" ON transaccion_lineas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tl" ON transaccion_lineas;
CREATE POLICY "anon_insert_tl" ON transaccion_lineas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tl" ON transaccion_lineas;
CREATE POLICY "anon_update_tl" ON transaccion_lineas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tl" ON transaccion_lineas;
CREATE POLICY "anon_delete_tl" ON transaccion_lineas FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TABLA: productos (Inventario)
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text DEFAULT '',
  precio_compra numeric(14,2) NOT NULL DEFAULT 0,
  precio_venta numeric(14,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  stock_minimo integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_productos" ON productos;
CREATE POLICY "anon_select_productos" ON productos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_productos" ON productos;
CREATE POLICY "anon_insert_productos" ON productos FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_productos" ON productos;
CREATE POLICY "anon_update_productos" ON productos FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_productos" ON productos;
CREATE POLICY "anon_delete_productos" ON productos FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TABLA: movimientos_inventario
-- ============================================================
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  transaccion_id uuid REFERENCES transacciones(id) ON DELETE SET NULL,
  tipo text NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad integer NOT NULL,
  precio_unitario numeric(14,2) NOT NULL DEFAULT 0,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  nota text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mov_inv_producto ON movimientos_inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_mov_inv_fecha ON movimientos_inventario(fecha);

ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_mov_inv" ON movimientos_inventario;
CREATE POLICY "anon_select_mov_inv" ON movimientos_inventario FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_mov_inv" ON movimientos_inventario;
CREATE POLICY "anon_insert_mov_inv" ON movimientos_inventario FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_mov_inv" ON movimientos_inventario;
CREATE POLICY "anon_update_mov_inv" ON movimientos_inventario FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_mov_inv" ON movimientos_inventario;
CREATE POLICY "anon_delete_mov_inv" ON movimientos_inventario FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TRIGGER: Actualizar saldo de cuenta al insertar línea
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_saldo_cuenta()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cuentas
  SET saldo = saldo + NEW.debito - NEW.credito
  WHERE id = NEW.cuenta_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_saldo_insert ON transaccion_lineas;
CREATE TRIGGER trg_actualizar_saldo_insert
  AFTER INSERT ON transaccion_lineas
  FOR EACH ROW EXECUTE FUNCTION actualizar_saldo_cuenta();

CREATE OR REPLACE FUNCTION revertir_saldo_cuenta()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cuentas
  SET saldo = saldo - OLD.debito + OLD.credito
  WHERE id = OLD.cuenta_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_revertir_saldo_delete ON transaccion_lineas;
CREATE TRIGGER trg_revertir_saldo_delete
  AFTER DELETE ON transaccion_lineas
  FOR EACH ROW EXECUTE FUNCTION revertir_saldo_cuenta();

-- ============================================================
-- TRIGGER: Actualizar stock de producto al insertar movimiento
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_stock_producto()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'entrada' OR NEW.tipo = 'ajuste' THEN
    UPDATE productos SET stock = stock + NEW.cantidad WHERE id = NEW.producto_id;
  ELSIF NEW.tipo = 'salida' THEN
    UPDATE productos SET stock = stock - NEW.cantidad WHERE id = NEW.producto_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_stock_insert ON movimientos_inventario;
CREATE TRIGGER trg_actualizar_stock_insert
  AFTER INSERT ON movimientos_inventario
  FOR EACH ROW EXECUTE FUNCTION actualizar_stock_producto();

CREATE OR REPLACE FUNCTION revertir_stock_producto()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.tipo = 'entrada' OR OLD.tipo = 'ajuste' THEN
    UPDATE productos SET stock = stock - OLD.cantidad WHERE id = OLD.producto_id;
  ELSIF OLD.tipo = 'salida' THEN
    UPDATE productos SET stock = stock + OLD.cantidad WHERE id = OLD.producto_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_revertir_stock_delete ON movimientos_inventario;
CREATE TRIGGER trg_revertir_stock_delete
  AFTER DELETE ON movimientos_inventario
  FOR EACH ROW EXECUTE FUNCTION revertir_stock_producto();

-- ============================================================
-- DATOS INICIALES: Plan de Cuentas Básico
-- ============================================================
INSERT INTO cuentas (codigo, nombre, tipo) VALUES
  ('1-1000', 'Caja / Efectivo', 'activo'),
  ('1-1100', 'Bancos', 'activo'),
  ('1-1200', 'Cuentas por Cobrar', 'activo'),
  ('1-1300', 'Inventario', 'activo'),
  ('2-1000', 'Cuentas por Pagar', 'pasivo'),
  ('3-1000', 'Capital Social', 'patrimonio'),
  ('3-1100', 'Utilidades Retenidas', 'patrimonio'),
  ('4-1000', 'Ventas', 'ingreso'),
  ('4-1100', 'Otros Ingresos', 'ingreso'),
  ('5-1000', 'Compras', 'gasto'),
  ('5-1100', 'Gastos Operativos', 'gasto'),
  ('5-1200', 'Gastos de Venta', 'gasto')
ON CONFLICT (codigo) DO NOTHING;