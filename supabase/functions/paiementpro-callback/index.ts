// Edge Function : paiementpro-callback
// Webhook appele par PaiementPro (notificationURL) apres le paiement.
// C'est la SEULE source fiable pour confirmer un paiement (serveur -> serveur).
// response=0 => succes ; sinon => echec.
//
// Deploiement :
//   supabase functions deploy paiementpro-callback --no-verify-jwt
// (SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont injectes automatiquement)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // PaiementPro peut envoyer les donnees en query string, JSON ou form-urlencoded
  const url = new URL(req.url);
  let params: Record<string, string> = Object.fromEntries(url.searchParams);

  if (req.method === "POST") {
    const ct = req.headers.get("content-type") ?? "";
    try {
      if (ct.includes("application/json")) {
        params = { ...params, ...(await req.json()) };
      } else {
        const form = await req.formData();
        for (const [k, v] of form.entries()) params[k] = String(v);
      }
    } catch {
      // corps illisible : on garde les params de l'URL
    }
  }

  const response = params.response ?? params.responsecode ?? params.status;
  const referenceNumber = params.referenceNumber ?? params.reference;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (!referenceNumber) {
    return new Response("Missing reference", { status: 400, headers: corsHeaders });
  }

  const isSuccess = String(response) === "0";
  const ticketStatus = isSuccess ? "PAID" : "FAILED";
  const txStatus = isSuccess ? "SUCCESS" : "FAILED";

  // Les billets ont une reference du type "<referenceNumber>-<random>"
  await supabase
    .from("tickets")
    .update({ payment_status: ticketStatus })
    .like("reference_number", `${referenceNumber}%`)
    .eq("payment_status", "PENDING");

  await supabase
    .from("transactions")
    .update({ status: txStatus })
    .eq("reference", referenceNumber);

  // PaiementPro attend un accuse de reception simple
  return new Response("OK", { status: 200, headers: corsHeaders });
});
