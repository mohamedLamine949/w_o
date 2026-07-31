import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ncuhzlhgkpltucdvdwln.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UcuF96oN4jz3kXh0eMZd3g_DIOM6Lfj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Connexion Google via Supabase Auth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Récupérer la session utilisateur authentifiée
 */
export async function getAuthSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Déconnexion
 */
export async function signOut() {
  await supabase.auth.signOut();
}
