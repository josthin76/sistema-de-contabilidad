import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ Faltan las variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY.\n' +
    'Crea un archivo .env en la raíz del proyecto con:\n' +
    '  VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=eyJ...\n'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
