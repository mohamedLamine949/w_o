// Edge Function : paiementpro-init
// Appelle l'API PaiementPro cote SERVEUR (impossible depuis le navigateur a cause du CORS)
// et renvoie l'URL de paiement Orange Money Mali vers laquelle rediriger le client.
//
// Deploiement :
//   supabase functions deploy paiementpro-init --no-verify-jwt
//   supabase secrets set PAIEMENTPRO_MERCHANT_ID=PP-F92288
//
// Endpoint officiel PaiementPro : POST .../onlinepayment/init/curl-init.php (JSON)

const MERCHANT_ID = Deno.env.get("PAIEMENTPRO_MERCHANT_ID") ?? "PP-F92288";
const PP_INIT_URL =
  "https://www.paiementpro.net/webservice/onlinepayment/init/curl-init.php";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ success: false, message: "Methode non autorisee" }, 405);
  }

  try {
    const body = await req.json();
    const {
      amount,
      description,
      channel = "OMML", // Orange Money Mali
      referenceNumber,
      customerEmail,
      customerFirstName,
      customerLastname,
      customerPhoneNumber,
      returnURL,
      notificationURL,
      returnContext,
    } = body ?? {};

    if (!amount || !referenceNumber || !customerPhoneNumber) {
      return json(
        {
          success: false,
          message:
            "Parametres manquants (amount, referenceNumber, customerPhoneNumber requis)",
        },
        400,
      );
    }

    const payload = {
      merchantId: MERCHANT_ID,
      amount: Number(amount),
      description: description ?? "Achat billet WinnerOne Mali",
      channel,
      countryCurrencyCode: "952", // XOF / FCFA
      referenceNumber,
      customerEmail: customerEmail ?? "joueur@winnerone.ml",
      customerFirstName: customerFirstName ?? "Joueur",
      customerLastname: customerLastname ?? "WinnerOne",
      customerPhoneNumber,
      notificationURL: notificationURL ?? "",
      returnURL: returnURL ?? "",
      returnContext: returnContext ?? "",
    };

    const ppRes = await fetch(PP_INIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const text = await ppRes.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (data?.success && data?.url) {
      return json({ success: true, url: data.url, referenceNumber });
    }

    // PaiementPro a repondu mais sans URL : on renvoie le detail pour diagnostic
    return json(
      {
        success: false,
        message: data?.message ?? "Echec de l'initialisation PaiementPro",
        details: data,
      },
      502,
    );
  } catch (e) {
    return json({ success: false, message: String(e) }, 500);
  }
});
