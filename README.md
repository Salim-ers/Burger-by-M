# Burger By M — site, carte, Click & Collect et back-office

Site officiel de **Burger By M**, 19 avenue de la Gare, 60290 Rantigny (03 44 24 89 18).

- Site public pensé « application de commande », mobile d’abord : accueil court, **carte au centre**, fiche produit en bottom sheet (mobile) / modale (desktop), contact, pages légales, 404.
- Commande à emporter (Click & Collect) : panier persistant, créneaux de retrait, checkout, confirmation avec suivi.
- Back-office de démonstration : commandes en temps réel, écran cuisine, produits, ruptures, horaires, promotions, notifications.

> ⚠️ **Mode démonstration actif.** Aucun paiement, aucune commande réelle, aucune authentification réelle.
> Les données vivent dans le navigateur (localStorage). Voir « Passer en production » plus bas.

---

## 1. Installation

Prérequis : **Node.js 20.9 ou plus** (testé avec Node 22) et npm.

```bash
npm install
cp .env.example .env.local   # puis renseigner NEXT_PUBLIC_SITE_URL
npm run dev                  # http://localhost:3000
```

## 2. Commandes

| Commande            | Rôle                                         |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Serveur de développement                     |
| `npm run build`     | Build de production (vérifie aussi les types) |
| `npm run start`     | Sert le build de production                  |
| `npm run typecheck` | Vérification TypeScript seule                |

## 3. Tester la démo de bout en bout

1. Ouvrir le site dans un onglet, et **/admin** dans un second onglet (connexion fictive : les identifiants sont pré-remplis).
2. Côté site : ajouter des produits, aller jusqu’au checkout, confirmer.
3. Côté admin : la commande arrive instantanément (alerte + cloche). L’accepter, choisir un temps de préparation, puis Préparer → Prête → Terminer.
4. La page de confirmation client se met à jour en direct (Envoyée → Acceptée → En préparation → Prête).
5. Le bouton **« Simuler une nouvelle commande »** génère une commande fictive.
6. **Paramètres → Réinitialiser la démo** remet toutes les données à zéro.

## 4. Architecture

```
app/
  (site)/            Site public (en-tête, pied de page, barre de commande mobile)
    page.tsx           Accueil : hero, accès rapide aux catégories, incontournables, restaurant
    menu/              Carte (ancres #cat-smash, #cat-classics…) + /menu/[slug] (statiques)
    commander/         La carte + panier latéral (desktop)
    panier/  checkout/  confirmation/
    contact/           Le restaurant : façade, coordonnées, horaires, plan, formulaire
    legal/(mentions-legales|confidentialite|cookies)
                       (/restaurant et /commande/confirmation redirigent vers les nouvelles routes)
  admin/
    login/             Connexion de démonstration (DEMO AUTH ONLY)
    (panel)/           Back-office protégé côté client : dashboard, commandes,
                       commandes/[id], kitchen, menu, produits, categories,
                       disponibilites, horaires, promotions, notifications, parametres
  sitemap.ts  robots.ts  not-found.tsx  icon.png  apple-icon.png
components/          ui · brand · layout · home · menu · product
                     cart · ordering · checkout · restaurant · admin
data/                SOURCE UNIQUE des contenus (voir §5)
lib/                 prix, horaires/créneaux, validation (Zod), SEO, repositories
stores/              Zustand : panier (persisté), UI, checkout, admin (persisté)
config/demo.ts       DEMO_MODE et outils de développement
types/               Types partagés (Product, CartItem, Order…)
```

Stack : Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind CSS 4, Framer Motion, Zustand, Zod, Lucide.

Principes :
- **Prix en centimes** (entiers) partout ; formatage `11,90 €` via `lib/currency.ts`.
- Les pages statiques sont pré-rendues ; tout ce qui dépend du navigateur (panier, heure, admin) s’affiche après hydratation, sans écart serveur/client.
- `prefers-reduced-motion` est respecté (Framer Motion + CSS).
- Polices auto-hébergées (`app/fonts/`) : Anton (titres) et Inter (interface). Aucun appel à Google Fonts.

Direction artistique (tokens dans `app/globals.css`) :
- Palette dérivée du logo : noir `#0B0B0B`, `#161616`, crème `#F5F1E8` (fond), blanc (cards), gris `#D6D1C8`, bordures `#E6E2DA`. Rose `#D8A1A6` réservé aux micro-détails (cœur « Best-seller »). CTA noir / blanc.
- Cards produit : fond blanc, bordure `#E6E2DA`, rayon 12 px max, pas d’ombre forte, bouton « + » rond noir.
- Motion discret : fondu des pages, apparition de la fiche produit, pastille de catégorie active, compteur du panier, confirmation d’ajout.
- Le back-office reste sombre (`scheme-dark`) ; les composants partagés utilisent `text-fg` / `bg-canvas` et s’adaptent au fond.

## 5. Modifier les contenus

Tout se fait dans `data/`. Aucune donnée n’est codée en dur dans les composants.

| Je veux modifier…           | Fichier                    |
| --------------------------- | -------------------------- |
| Adresse, téléphone, réseaux, réglages de commande par défaut | `data/restaurant.ts` |
| Horaires (restaurant et Click & Collect) | `data/opening-hours.ts` |
| Produits, prix, descriptions, options | `data/products.ts` |
| Suppléments, formule menu    | `data/options.ts`          |
| Catégories et leur ordre     | `data/categories.ts`       |
| Photos                       | `data/images.ts` + `public/images/` |
| Mentions légales             | `data/legal.ts`            |

- **Prix** : en centimes (`1190` = 11,90 €). `price: null` affiche « Voir au restaurant » et rend le produit non commandable en ligne (la fiche propose d’appeler).
- **Statut et commande** (`data/restaurant.ts` → `orderingDefaults`) : `prepMinutes` + `prepSpreadMinutes` donnent le « Temps estimé : 15–25 min » ; `allowOrdersWhenClosed: false` bloque la validation quand le restaurant est fermé (message « Les commandes reprendront … »). Les horaires et le temps de préparation se règlent aussi depuis **/admin/horaires**.
- **Accueil** : la sélection « Nos incontournables » est `featuredProductIds` dans `data/products.ts`.
- **Options** : définies produit par produit dans `data/products.ts` (`burgerOptions([...])` liste uniquement les ingrédients réellement présents dans la recette, pour « Retirer un ingrédient »).
- **Images** : déposer le fichier dans `public/images/…`, puis mettre à jour `src`, `width`, `height`, `alt` et le cadrage `position` (object-position propre à chaque photo, `zoom`/`origin` pour un crop serré) dans `data/images.ts`. Un produit sans photo correspondante (`image: null`) affiche un visuel neutre au logo (`PhotoPlaceholder`) : on n’utilise jamais la photo d’un autre plat.
- **Horaires** : passer `OPENING_HOURS_VALIDATED` à `true` une fois validés, pour les publier dans le balisage Google (JSON-LD).
- **Réseaux sociaux** : renseigner les `url` dans `data/restaurant.ts` ; tant qu’elles valent `null`, aucun lien n’est affiché.

En mode démo, les changements faits depuis l’admin (prix, ruptures, horaires…) sont enregistrés dans le navigateur et **surchargent** les fichiers `data/` pour ce navigateur uniquement.

## 6. Données à compléter avant la mise en ligne

Rechercher `TODO` dans `data/` pour la liste exhaustive.

- **Prix illisibles** sur la carte fournie : Le Forestier et les 4 frites (`price: null`).
- **Descriptions partielles** : Le Forestier, Menu Kids (« cheese bu… »), une boisson « Fan… » non intégrée.
- **Contenance des canettes** (33 cl affiché, à confirmer).
- **Formule « Menu +2 € »** : composition exacte et catégories concernées.
- **Allergènes** : non communiqués pour aucun produit (le site renvoie vers le restaurant).
- **Horaires** : relevés sur la carte imprimée, à valider (lundi considéré fermé).
- **Mentions légales** : raison sociale, SIRET, RCS, TVA, directeur de publication, hébergeur, contact RGPD, durées de conservation.
- **Coordonnées GPS**, email de contact, URLs Instagram/Facebook, lien d’avis Google.
- **Photos HD** : les photos fournies font 720 px de large. Elles sont nettes sur mobile mais légèrement douces sur grands écrans : fournir les originaux (2000 px minimum) et remplacer les fichiers de `public/images/food/`.
- **Domaine** : renseigner `NEXT_PUBLIC_SITE_URL` (canonical, sitemap, Open Graph).

## 7. Passer de la démo à un vrai backend

L’accès aux données passe par des **repositories** (`lib/repositories/`) dont l’implémentation actuelle est locale (`local/*`).

1. **Base de données** (Supabase ou PostgreSQL + Prisma). Tables prévues : `customers`, `orders`, `order_items`, `products`, `categories`, `product_options`, `opening_hours`, `promotions`, `notifications`, `settings`. Les types de `types/` décrivent les colonnes.
2. Créer `lib/repositories/remote/*` qui implémentent `OrderRepository`, `ProductRepository` et `RestaurantSettingsRepository`, puis les sélectionner dans `lib/repositories/index.ts`.
3. Créer les **route handlers** (`app/api/orders/route.ts`…). **Recalculer les prix côté serveur** à partir de la base : ne jamais faire confiance au total envoyé par le navigateur. Valider avec les schémas Zod de `lib/validation.ts`.
4. **Temps réel** : remplacer la synchronisation entre onglets (`StoreHydrator` + `OrderToasts`) par Supabase Realtime, SSE ou WebSocket.
5. **Authentification admin** : remplacer `app/admin/login` (DEMO AUTH ONLY) par une vraie authentification (Supabase Auth, Auth.js…), cookies `httpOnly`, protection des routes `/admin` côté serveur (middleware), rate limiting sur la connexion.
6. **Paiement en ligne** (optionnel) : implémenter `PaymentProvider` (Stripe recommandé), activer l’option « Carte en ligne » du checkout, gérer les webhooks côté serveur.
7. **Notifications** : email de confirmation client, alerte restaurant (push, SMS ou email).
8. **Formulaire de contact** : brancher un endpoint (le pot de miel anti-spam est déjà en place).
9. Passer `DEMO_MODE` à `false` dans `config/demo.ts` (masque le badge, le bouton de simulation et la mention démo du checkout).

Variables d’environnement prévues : voir `.env.example`. **Aucune clé secrète ne doit avoir le préfixe `NEXT_PUBLIC_`.**

## 8. Check-list de mise en production

- [ ] Données du §6 complétées et validées par le restaurant
- [ ] Photos HD remplacées
- [ ] Backend, authentification et temps réel branchés (§7), `DEMO_MODE = false`
- [ ] Mentions légales, confidentialité et cookies finalisées
- [ ] Bandeau de consentement si un outil d’audience est ajouté
- [ ] `NEXT_PUBLIC_SITE_URL` défini, Search Console + fiche Google Business Profile liées
- [ ] Test complet d’une commande réelle (de la commande au retrait)
- [ ] Lighthouse mobile vérifié sur l’URL de production

## 9. Ce qui a été vérifié

- `npm run build` sans erreur (TypeScript strict).
- Aucun défilement horizontal de 320 à 1920 px sur les pages publiques et l’admin.
- Parcours complet testé en navigateur sans erreur console : ajout rapide, composition d’un milkshake, panier, erreurs de formulaire, commande, confirmation, réception dans l’admin, acceptation, rupture produit reflétée sur la carte, édition de prix, création de produit, horaires, promotion, réinitialisation.
