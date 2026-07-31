# Déploiement WinnerOne — Paiement réel + Connexion Google

Les changements de code sont faits. Il reste **3 actions à effectuer** (elles se font hors-code, dans les dashboards) pour que le paiement réel et Google fonctionnent.

---

## ✅ Étape 1 — Migration de la base de données

1. Ouvre le dashboard Supabase → **SQL Editor** : https://ncuhzlhgkpltucdvdwln.supabase.co
2. Colle et exécute le contenu de **`supabase_migration_v2.sql`**.

Cela rend le téléphone optionnel (comptes Google) et ajoute les colonnes `email`, `auth_id`, `om_number`, `avatar_url`.

---

## ✅ Étape 2 — Déployer les Edge Functions (le vrai paiement)

Il faut la CLI Supabase. Installe-la si besoin puis, dans le dossier du projet :

```bash
npm install -g supabase
supabase login
supabase link --project-ref ncuhzlhgkpltucdvdwln
supabase functions deploy paiementpro-init --no-verify-jwt
supabase functions deploy paiementpro-callback --no-verify-jwt
supabase secrets set PAIEMENTPRO_MERCHANT_ID=PP-F92288
```

> `--no-verify-jwt` est nécessaire : l'app appelle la fonction avec la clé publique (pas un JWT utilisateur), et PaiementPro appelle le callback sans authentification.

Après déploiement, les URLs sont :
- Init : `https://ncuhzlhgkpltucdvdwln.supabase.co/functions/v1/paiementpro-init`
- Callback (webhook) : `https://ncuhzlhgkpltucdvdwln.supabase.co/functions/v1/paiementpro-callback`

---

## ✅ Étape 3 — Configurer la connexion Google

### 3a. Google Cloud Console (https://console.cloud.google.com)
1. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → type *Web application*.
2. **Authorized redirect URIs**, ajoute :
   `https://ncuhzlhgkpltucdvdwln.supabase.co/auth/v1/callback`
3. Copie le **Client ID** et le **Client Secret**.

### 3b. Supabase Dashboard
1. **Authentication → Providers → Google** → active-le.
2. Colle le **Client ID** et le **Client Secret** de Google.
3. **Authentication → URL Configuration → Site URL** : mets l'URL de ton site en production (et ajoute-la dans *Redirect URLs*).

---

## ⚠️ À vérifier côté PaiementPro
Certaines passerelles exigent de **déclarer les URLs de retour et de notification** dans l'espace marchand.
Si le paiement échoue à l'init, connecte-toi à ton compte PaiementPro et autorise/whiteliste :
- returnURL : l'URL de ton site
- notificationURL : `https://ncuhzlhgkpltucdvdwln.supabase.co/functions/v1/paiementpro-callback`

---

## ✅ Étape 4 — Déploiement automatique du site (GitHub Actions → Hostinger)

Le site (app-locus.com) se met à jour **automatiquement à chaque `git push`** grâce à
`.github/workflows/deploy.yml` (build Vite + upload FTP).

### 4a. Récupérer les identifiants FTP sur Hostinger
hPanel Hostinger → **Fichiers → Comptes FTP** (ou *FTP Accounts*). Note :
- **FTP Host** (ex. `ftp.app-locus.com` ou une IP)
- **FTP Username**
- **FTP Password** (crée-en un nouveau si besoin)

### 4b. Ajouter les secrets dans GitHub
Dépôt GitHub → **Settings → Secrets and variables → Actions → New repository secret**.
Crée ces 3 secrets (noms exacts) :
- `FTP_HOST`
- `FTP_USERNAME`
- `FTP_PASSWORD`

### 4c. Vérifier le dossier de destination
Dans `.github/workflows/deploy.yml`, `server-dir: public_html/`.
- Si ton compte FTP s'ouvre **déjà** dans `public_html`, remplace par `server-dir: ./`.
- Sinon laisse `public_html/`.

### 4d. Nettoyer l'ancien site (une seule fois)
Avant le premier déploiement, supprime l'ancien contenu de `public_html` via le
Gestionnaire de fichiers Hostinger (le workflow ne supprime pas les anciens fichiers étrangers).

### 4e. Déclencher
Chaque `push` sur `master` lance le déploiement. Suis-le dans l'onglet **Actions** du dépôt.
Tu peux aussi le lancer à la main (bouton *Run workflow*).

> `.htaccess` est inclus dans le build (via `public/.htaccess`) et uploadé automatiquement.

---

## Comment tester
1. Après déploiement, clique sur **Payer** : tu dois être **redirigé vers la vraie page Orange Money** (plus de succès instantané simulé).
2. Après paiement, tu reviens sur le site (onglet *Mes Billets*). Le webhook passe le billet de `PENDING` à `PAID`.
3. Si l'init échoue, le message d'erreur affiche la réponse exacte de PaiementPro (utile pour diagnostiquer un souci de compte marchand).
