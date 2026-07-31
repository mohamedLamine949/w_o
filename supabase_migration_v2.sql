-- WinnerOne - Migration v2
-- À exécuter dans l'Éditeur SQL du dashboard Supabase (https://ncuhzlhgkpltucdvdwln.supabase.co)
-- Objectif : supporter la connexion Google (utilisateurs sans téléphone) + sauvegarder le numéro Orange Money.

-- 1. Rendre le téléphone optionnel (les comptes Google n'ont pas de numéro au départ)
ALTER TABLE public.profiles ALTER COLUMN phone_number DROP NOT NULL;

-- 2. Nouvelles colonnes pour l'authentification Google et le paiement des gains
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS om_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Un compte Google (auth_id) = un seul profil
CREATE UNIQUE INDEX IF NOT EXISTS profiles_auth_id_key
  ON public.profiles(auth_id) WHERE auth_id IS NOT NULL;

-- 4. Recherche rapide par email
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
