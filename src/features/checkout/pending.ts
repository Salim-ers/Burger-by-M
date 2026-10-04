"use client";

/**
 * Commande en cours de paiement, mémorisée pour l'onglet courant (sessionStorage) :
 * la page de suivi vide le panier uniquement si c'est bien la commande passée depuis ce navigateur.
 * La commande elle-même vit en base — rien n'est stocké uniquement ici.
 */
const KEY = "bym-pending-order";

export function rememberPendingOrder(orderNumber: string) {
  try {
    sessionStorage.setItem(KEY, orderNumber);
  } catch {
    /* navigation privée : sans conséquence */
  }
}

export function takePendingOrder(orderNumber: string): boolean {
  try {
    if (sessionStorage.getItem(KEY) !== orderNumber) return false;
    sessionStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
