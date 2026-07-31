// Client PaiementPro : appelle l'Edge Function Supabase (cote serveur) qui
// contacte reellement PaiementPro. Impossible d'appeler PaiementPro directement
// depuis le navigateur (bloque par CORS) -> c'est pourquoi l'ancien code retombait
// toujours en mode simule.
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from './supabaseClient';

export const PAIEMENTPRO_MERCHANT_ID = 'PP-F92288';
export const PAIEMENTPRO_CHANNEL = 'OMML'; // Orange Money Mali

/**
 * Génère une référence unique de transaction (ex: W1-ML-1722400000-XYZ)
 */
export function generateTransactionReference() {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `W1-ML-${timestamp}-${randomStr}`;
}

/**
 * Initialise la demande de paiement via l'Edge Function `paiementpro-init`.
 * Retourne { success, url, referenceNumber } — `url` = passerelle Orange Money
 * vers laquelle rediriger l'utilisateur.
 */
export async function initiatePaiementProCheckout({
  amount,
  description,
  customerPhoneNumber,
  customerFirstName = 'Joueur',
  customerLastName = 'WinnerOne',
  customerEmail = 'joueur@winnerone.ml',
  referenceNumber = generateTransactionReference(),
}) {
  const origin = window.location.origin;

  const res = await fetch(`${FUNCTIONS_URL}/paiementpro-init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      amount,
      description: description || 'Achat Billet WinnerOne Mali (200 FCFA)',
      channel: PAIEMENTPRO_CHANNEL,
      referenceNumber,
      customerPhoneNumber,
      customerFirstName,
      customerLastname: customerLastName,
      customerEmail,
      returnURL: `${origin}/?payment=return&ref=${encodeURIComponent(referenceNumber)}`,
      notificationURL: `${FUNCTIONS_URL}/paiementpro-callback`,
      returnContext: referenceNumber,
    }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || !data?.success || !data?.url) {
    const message =
      data?.message ||
      "Impossible d'initialiser le paiement Orange Money. Veuillez réessayer.";
    throw new Error(message);
  }

  return {
    success: true,
    url: data.url,
    referenceNumber: data.referenceNumber || referenceNumber,
  };
}
