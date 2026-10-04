import "server-only";
import { unstable_cache } from "next/cache";
import { getDb } from "@/db/client";
import { loadMenu } from "@/features/menu/load";
import { loadSchedule, loadSettings, effectivePrepMinutes, type RestaurantSettings } from "@/features/store/load";
import { env, paymentsConfigured } from "@/lib/env";
import { availablePaymentMethods } from "@/features/orders/service";
import type { ScheduleInput } from "@/lib/schedule";

/**
 * Données publiques mises en cache (carte, réglages, horaires).
 * Invalidation immédiate à chaque modification depuis l'administration (tags « menu », « store »).
 */
export const CACHE_TAGS = { menu: "menu", store: "store" } as const;

export const getPublicMenu = unstable_cache(async () => loadMenu(getDb()), ["public-menu"], { tags: [CACHE_TAGS.menu], revalidate: 3600 });

const getStoreRaw = unstable_cache(
  async () => {
    const db = getDb();
    const [settings, schedule] = await Promise.all([loadSettings(db), loadSchedule(db)]);
    return { settings, schedule };
  },
  ["public-store"],
  { tags: [CACHE_TAGS.store], revalidate: 3600 },
);

/** Informations du restaurant transmises aux composants client (sérialisables, sans secret). */
export interface PublicStore {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  phoneHref: string;
  email: string | null;
  onlineOrderingEnabled: boolean;
  pickupEnabled: boolean;
  /** null : non configuré par le restaurant (aucune estimation affichée, commande fermée). */
  prepMinutes: number | null;
  /** Mode « coup de feu » actif. */
  busyMode: boolean;
  minOrderCents: number;
  orderNotesEnabled: boolean;
  paymentMethods: ("card" | "on_site")[];
  /** Carte : « manual » = montant réservé, encaissé à l'acceptation par la cuisine. */
  cardCapture: "manual" | "automatic";
  googleReviewsUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  schedule: ScheduleInput;
}

function toPublic(settings: RestaurantSettings, schedule: ScheduleInput): PublicStore {
  return {
    name: settings.name,
    street: settings.street,
    postalCode: settings.postalCode,
    city: settings.city,
    phone: settings.phone,
    phoneHref: `tel:${settings.phone.replace(/[^\d+]/g, "")}`,
    email: settings.email,
    onlineOrderingEnabled: settings.onlineOrderingEnabled,
    pickupEnabled: settings.pickupEnabled,
    prepMinutes: effectivePrepMinutes(settings),
    busyMode: settings.busyMode,
    minOrderCents: settings.minOrderCents,
    orderNotesEnabled: settings.orderNotesEnabled,
    paymentMethods: availablePaymentMethods(settings, paymentsConfigured()),
    cardCapture: env().MOLLIE_CARD_CAPTURE,
    googleReviewsUrl: settings.googleReviewsUrl,
    instagramUrl: settings.instagramUrl,
    facebookUrl: settings.facebookUrl,
    schedule,
  };
}

export async function getPublicStore(): Promise<PublicStore> {
  const { settings, schedule } = await getStoreRaw();
  return toPublic(settings, schedule);
}
