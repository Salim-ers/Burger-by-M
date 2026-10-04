# Burger By M — site, commande en ligne, écran cuisine

Site officiel de **Burger By M** (SAS, SIRET 937 935 609 00027), 19 avenue de la Gare, 60290 Rantigny — 03 44 24 89 18.

- **Site public** « luxury street food » : accueil éditorial (burger qui se construit au défilement), carte avec fiche produit personnalisable, restaurant, galerie, notre histoire, pages légales.
- **Commande invitée** (aucun compte client) : panier, créneau de retrait, coordonnées, paiement en ligne **Stripe** ou au retrait, suivi en direct.
- **Back-office** `/admin` : tableau de bord, **écran cuisine installable (PWA)** avec notifications push, commandes et remboursements, carte (prix, photos, options, ruptures), horaires, réglages.

Stack : Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4, **Neon (PostgreSQL) + Drizzle ORM**, **Better Auth**, **Stripe**, Web Push (VAPID), Resend (email, optionnel), Vitest, Playwright.

---

## 1. Démarrer en local (sans compte cloud)

Prérequis : Node.js ≥ 20.9.

```bash
npm install
cp .env.example .env.local          # puis renseigner les valeurs (voir § 3)
npm run db:local                    # PostgreSQL local (PGlite), à laisser tourner
npm run db:setup                    # migrations + carte initiale
npm run admin:create -- --email vous@exemple.fr --name "Gérant" --role owner
npm run dev                         # http://localhost:3000
```

Pour la base locale, `.env.local` contient :

```
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:54329/postgres
DATABASE_POOL_MAX=1
```

Sans clés Stripe, seul le paiement au retrait est proposé ; sans clés VAPID, l’écran cuisine se met à jour par rafraîchissement automatique (toutes les 5 s).

## 2. Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` / `build` / `start` | Développement, build de production, serveur de production |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Tests unitaires et d’intégration (Vitest, base PostgreSQL PGlite en mémoire) |
| `npm run test:e2e` | Tests navigateur (Playwright) sur un serveur démarré — voir `playwright.config.ts` |
| `npm run db:local` | Base PostgreSQL locale (PGlite, données dans `.data/`) |
| `npm run db:generate` | Génère une migration SQL après modification de `src/db/schema` |
| `npm run db:migrate` / `db:seed` / `db:setup` | Applique les migrations / insère la carte initiale / les deux |
| `npm run admin:create -- --email … --name … --role owner\|staff` | Crée ou réinitialise un compte de l’équipe (mot de passe demandé, ou `ADMIN_PASSWORD`) |
| `npm run vapid:generate` | Génère la paire de clés Web Push |
| `npm run media:products` / `media:cutouts` / `media:icons` | Régénère les visuels produits, les détourages, les icônes PWA |

Tests E2E : `PW_CHANNEL=chrome E2E_OWNER_EMAIL=… E2E_OWNER_PASSWORD=… npm run test:e2e` (créer d’abord le compte avec `admin:create`).

## 3. Variables d’environnement

Liste complète et commentée : [.env.example](.env.example) (noms uniquement, **aucune vraie clé dans le dépôt**).

| Variable | Obligatoire | Usage |
| --- | --- | --- |
| `DATABASE_URL` | oui | Chaîne Neon « pooled » (`…-pooler….neon.tech/…?sslmode=require`) |
| `BETTER_AUTH_SECRET` | oui | 32 caractères aléatoires minimum (`openssl rand -base64 32`). Sert aussi à dériver les jetons de suivi de commande |
| `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` | oui | URL publique du site (`https://…`) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pour la CB | Les trois sont requises pour activer le paiement en ligne |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | pour le push | Notifications « 🔔 Nouvelle commande » sur la tablette |
| `RESEND_API_KEY`, `EMAIL_FROM` | non | Email de confirmation client (non bloquant) |

Seule `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` est exposée au navigateur ; aucun secret n’est préfixé `NEXT_PUBLIC_`.

## 4. Mise en production (Vercel + Neon + Stripe)

1. **Neon** : créer le projet (région UE, ex. Francfort), copier la chaîne *pooled* dans `DATABASE_URL`.
2. **Vercel** : importer le dépôt, saisir les variables, déployer.
3. **Base** : depuis un poste, avec `DATABASE_URL` de production : `npm run db:setup`, puis `npm run admin:create -- --email … --role owner`.
4. **Stripe** (Dashboard → Développeurs → Webhooks) : point de terminaison `https://<domaine>/api/webhooks/stripe`, événements :
   `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `charge.refunded`. Copier le secret `whsec_…` dans `STRIPE_WEBHOOK_SECRET`.
   Activer les moyens de paiement voulus (CB, Apple Pay, Google Pay) dans Paramètres → Moyens de paiement ; pour Apple Pay, vérifier le domaine.
   En local : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
5. **Push** : `npm run vapid:generate`, renseigner les trois variables `VAPID_*`, redéployer.
6. Dans `/admin/settings` : vérifier coordonnées, temps de préparation, capacité par créneau, moyens de paiement, lien des avis Google ; ouvrir les commandes en ligne depuis le tableau de bord.

## 5. Commande et paiement — comment c’est sécurisé

- Le navigateur n’envoie **que des identifiants** (produit, options, quantité). Le serveur relit la carte dans Neon et **recalcule tous les prix** ; le total affiché par le navigateur ne sert que de garde-fou (refus si la carte a changé), jamais de référence.
- Création : commande `payment_pending` + réservation **atomique** du créneau (capacité maximale par créneau) dans une transaction → PaymentIntent Stripe → Payment Element (la carte n’est jamais vue par nos serveurs).
- **Seul le webhook signé** (ou une relecture serveur chez Stripe) valide le paiement ; chaque événement est enregistré dans la même transaction que son effet : un webhook répété ne crée ni ne paie jamais deux fois.
- Double clic / réseau coupé : clé d’idempotence par contenu de commande → la même commande est renvoyée.
- Paiement abandonné : annulé et créneau libéré après 30 min ; paiement arrivé tardivement : la commande repart en cuisine.
- Suivi client `/commande/M-1042?t=…` : jeton personnel (seul son empreinte est stockée), pages non indexées.
- Annulation d’une commande payée et remboursements (total ou partiel) : **gérant uniquement**, via Stripe, tracés dans `audit_logs`.
- Abstraction `PaymentProvider` (`src/lib/payments`) : Mollie pourra remplacer Stripe sans toucher au reste.

### Statuts

| Commande (`order_status`) | Signification | Écran cuisine |
| --- | --- | --- |
| `payment_pending` | En attente du paiement en ligne | invisible |
| `new` | Payée, ou à régler au retrait | NOUVELLES |
| `preparing` | En préparation | EN PRÉPARATION |
| `ready` | Prête au comptoir | PRÊTES |
| `completed` | Récupérée | TERMINÉES (du jour) |
| `cancelled` | Annulée / expirée | — |

Paiement (`payment_status`) : `pending`, `paid`, `failed`, `refunded`, `partially_refunded`, `on_site` (à régler au retrait).

## 6. Administration

- Connexion `/admin/login` (Better Auth) : email + mot de passe (12 caractères min.), sessions en base, cookies httpOnly / secure / sameSite, **limitation des tentatives** (8 / 15 min), inscription publique désactivée — **aucun compte par défaut**.
- Rôles : `owner` (gérant : tout) et `staff` (équipe : cuisine, commandes, disponibilités, interrupteur des commandes en ligne).
- Double authentification : activable plus tard avec le plugin `twoFactor` de Better Auth (TOTP), sans changer le schéma des comptes existants (une table s’ajoute par migration).
- `/admin` jamais indexé (en-têtes `X-Robots-Tag`, métadonnées, `robots.txt`).
- Écran cuisine `/admin/kitchen` sur tablette : ouvrir la page dans Chrome/Safari → « Installer l’application » / « Sur l’écran d’accueil », toucher **Notifications** pour autoriser le push, **Activer le son** au début du service (les navigateurs exigent un geste), plein écran, écran maintenu allumé.

## 7. Médias

Toutes les images passent par [src/data/media.ts](src/data/media.ts) (banque unique). Sources originales des visuels fournis : `assets/sources/` (WebP sans perte).

- `public/images/products/` : visuels de la carte extraits des planches (`npm run media:products`), texte incrusté retiré — le texte est en HTML.
- `public/images/cutouts/` : versions détourées (hero, construction du burger, incontournables).
- `public/images/food/`, `restaurant/` : photos réelles.
- Un produit dont la photo n’est pas exactement le produit porte `needsFinalProductPhoto` → mention « Photo d’illustration » sur le site (frites, milkshake à composer). À remplacer par de vraies photos depuis `/admin/menu` (import → WebP stocké en base, servi par `/media/…`).

## 8. À compléter avant la mise en ligne publique

- **Prix des frites** : non lisibles sur la carte fournie → produits visibles mais non commandables tant que le prix n’est pas saisi dans `/admin/menu` (aucun prix inventé).
- **Allergènes** : non communiqués → le site indique « liste disponible au restaurant ». Les renseigner produit par produit dans `/admin/menu`.
- **Mentions légales** ([src/data/legal.ts](src/data/legal.ts)) : capital social, ville du RCS, n° de TVA, directeur·rice de la publication, **médiateur de la consommation** (obligatoire pour la vente en ligne aux consommateurs). Les lignes vides ne sont pas affichées.
- **Lien des avis Google** et réseaux sociaux : `/admin/settings`.
- **Notre histoire** : la page ne contient que des faits vérifiables (adresse, méthode, carte) ; elle peut être enrichie avec le vrai récit de la maison.

## 9. Structure

```
src/
  app/(site)/        pages publiques (accueil, carte, produit, checkout, suivi, restaurant, galerie, légal)
  app/admin/         back-office (login, tableau de bord, cuisine, commandes, carte, horaires, réglages)
  app/api/           checkout, créneaux, suivi, webhook Stripe, cuisine, push, auth
  components/        interface (home, menu, cart, checkout, admin, site, ui, motion)
  db/                schéma Drizzle, migrations SQL, seed de la carte
  features/          logique métier (orders/service.ts, menu/pricing.ts, admin/actions…)
  lib/               env, auth, paiements, sécurité, horaires (fuseau Europe/Paris), SEO
  data/              marque, médias, navigation, informations légales
tests/               unit, integration (PGlite), e2e (Playwright)
scripts/             base locale, création de compte, chargement .env, pipeline médias
```
