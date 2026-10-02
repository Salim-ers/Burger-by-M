/**
 * Contrats d'accès aux données.
 * Implémentation actuelle : `local/*` (navigateur, mode démo).
 * Implémentations futures prévues : Supabase ou PostgreSQL + Prisma, avec les tables
 * customers, orders, order_items, products, categories, product_options, opening_hours,
 * promotions, notifications, settings.
 */
import type { NewOrderInput, Order, OrderStatus } from "@/types/order";
import type { Product } from "@/types/product";
import type { AdminSettings } from "@/stores/admin-store";

export interface OrderRepository {
  create(input: NewOrderInput): Promise<Order>;
  getById(id: string): Promise<Order | null>;
  list(filter?: { status?: OrderStatus[] }): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
  accept(id: string, announcedMinutes: number): Promise<void>;
}

export interface ProductRepository {
  list(): Promise<Product[]>;
  setAvailability(id: string, available: boolean): Promise<void>;
}

export interface RestaurantSettingsRepository {
  get(): Promise<AdminSettings>;
  update<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]): Promise<void>;
}

/** Futur paiement : seul `cash_on_pickup` est actif en démo (aucun prestataire installé). */
export interface PaymentProvider {
  id: "cash_on_pickup" | "card_online";
  createIntent?(order: Order): Promise<{ clientSecret: string }>;
}
