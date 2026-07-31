import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://ncuhzlhgkpltucdvdwln.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_UcuF96oN4jz3kXh0eMZd3g_DIOM6Lfj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// URL de base des Edge Functions (paiementpro-init, paiementpro-callback)
export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Connexion Google via Supabase Auth (redirection OAuth)
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

/**
 * Crée ou récupère le profil lié à un compte Google authentifié.
 * Retourne le profil complet (row de la table profiles).
 */
export async function ensureProfileForAuthUser(authUser) {
  if (!authUser) return null;

  const email = authUser.email || null;
  const meta = authUser.user_metadata || {};
  const fullName = meta.full_name || meta.name || email?.split('@')[0] || 'Joueur WinnerOne';
  const avatarUrl = meta.avatar_url || meta.picture || null;

  // 1. Chercher un profil déjà lié à ce compte Google
  const { data: byAuth } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', authUser.id)
    .maybeSingle();

  if (byAuth) return byAuth;

  // 2. Sinon, tenter de rattacher un profil existant avec le même email
  if (email) {
    const { data: byEmail } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (byEmail) {
      const { data: linked } = await supabase
        .from('profiles')
        .update({ auth_id: authUser.id, avatar_url: avatarUrl })
        .eq('id', byEmail.id)
        .select()
        .single();
      return linked || byEmail;
    }
  }

  // 3. Créer un nouveau profil
  const { data: created, error } = await supabase
    .from('profiles')
    .insert({
      auth_id: authUser.id,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
      balance: 0,
    })
    .select()
    .single();

  if (error) {
    console.warn('ensureProfileForAuthUser insert error:', error);
    return null;
  }
  return created;
}
