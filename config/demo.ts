/**
 * MODE DÉMONSTRATION
 * Quand DEMO_MODE = true :
 *  - le checkout n'effectue aucun paiement et n'envoie aucune commande réelle ;
 *  - les commandes sont stockées dans le navigateur (localStorage) ;
 *  - la connexion au back-office est fictive (DEMO AUTH ONLY) ;
 *  - les notifications sont simulées.
 * Passer à false uniquement une fois les repositories branchés à un vrai backend (voir README).
 */
export const DEMO_MODE = true;

/** Affiche le bouton « Simuler une nouvelle commande » dans l'admin. */
export const SHOW_DEV_TOOLS = DEMO_MODE;
