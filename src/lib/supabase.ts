import { createClient } from '@supabase/supabase-js';

// Credenciales públicas de Supabase (la clave anon es segura para exponer en el frontend)
const supabaseUrl = 'https://jrpkahwnrwdjavncbvji.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpycGthaHducndkamF2bmNidmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MTM5NzUsImV4cCI6MjEwNzA4OTk3NX0.4OeRGnlkmQ82TIV--AZV2DdDYK6ducJ1Jc7Vj_jQE7Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
