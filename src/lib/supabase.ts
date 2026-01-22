
import { createClient } from '@supabase/supabase-js';

// Chaves de conexão com o projeto orunejxiurgihmeiouti
const supabaseUrl: string = 'https://orunejxiurgihmeiouti.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydW5lanhpdXJnaWhtZWlvdXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTIyNDIsImV4cCI6MjA4NDU4ODI0Mn0.dHDEx4xuT-13GOaaire6qXKhF6URefJOl_lntf7YloI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * NOTA DE CONFIGURAÇÃO:
 * Se o Dashboard do Supabase exibir avisos sobre RLS, certifique-se de 
 * executar as "Policies" (Políticas de Acesso) para usuários autenticados.
 * Isso garante que o app consiga ler e gravar dados corretamente.
 */
export const isSupabaseConfigured = 
  supabaseUrl !== '' && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== '' &&
  supabaseAnonKey !== 'your-anon-key';
