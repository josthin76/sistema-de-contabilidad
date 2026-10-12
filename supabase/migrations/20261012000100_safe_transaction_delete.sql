-- Elimina un asiento y sus movimientos de inventario en una sola transacción.
-- Los triggers existentes revierten el stock y los saldos de cuentas.
CREATE OR REPLACE FUNCTION public.delete_transaccion_with_inventory(p_transaccion_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.movimientos_inventario
  WHERE transaccion_id = p_transaccion_id;

  DELETE FROM public.transacciones
  WHERE id = p_transaccion_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_transaccion_with_inventory(uuid) TO anon, authenticated;
