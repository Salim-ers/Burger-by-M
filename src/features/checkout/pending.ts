"use client";

/**
 * Commande en cours de paiement, mémorisée pour l'onglet courant (sessionStorage) :
 *  - la page de suivi vide le panier uniquement si c'est bien la commande passée depuis ce navigateur ;
 *  - au retour sur le checkout (bouton Précédent depuis la page de paiement), le client peut reprendre
 *    le paiement ou modifier sa commande.
 * La commande elle-même vit en base — rien n'est stocké uniquement ici.
 */
const KEY = "bym-pending-order";

export interface PendingOrder {
  orderNumber: string;
  token: string;
}

export function rememberPendingOrder(order: PendingOrder) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    /* navigation privée : sans conséquence */
  }
}

export function readPendingOrder(): PendingOrder | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as PendingOrder | null;
    return v && typeof v.orderNumber === "string" && typeof v.token === "string" ? v : null;
  } catch {
    return null;
  }
}

export function forgetPendingOrder() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** true (et oubli) si la commande suivie est celle passée depuis cet onglet. */
export function takePendingOrder(orderNumber: string): boolean {
  const p = readPendingOrder();
  if (p?.orderNumber !== orderNumber) return false;
  forgetPendingOrder();
  return true;
}
