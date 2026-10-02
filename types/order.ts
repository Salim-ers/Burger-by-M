import type { Cents } from "./product";
import type { SelectedOption } from "./cart";

export const ORDER_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PaymentMethod = "cash_on_pickup" | "card_online";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: Cents;
  options: SelectedOption[];
}

export interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  marketingOptIn: boolean;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  pickup: { mode: "asap" | "scheduled"; time: string };
  customer: Customer;
  items: OrderItem[];
  subtotal: Cents;
  discount: Cents;
  total: Cents;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  /** Temps annoncé au client lors de l'acceptation (minutes). */
  announcedMinutes?: number;
  /** true pour les commandes fictives générées par le mode démo. */
  isDemo: boolean;
}

export interface NewOrderInput {
  customer: Customer;
  items: OrderItem[];
  pickup: { mode: "asap" | "scheduled"; time: string };
  paymentMethod: PaymentMethod;
  notes?: string;
}

export type NotificationKind = "new_order" | "order_cancelled" | "order_ready" | "product_unavailable";

export interface AdminNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  orderId?: string;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  type: "percent" | "fixed";
  value: number;
  startsAt: string;
  endsAt: string;
  minimumOrder: Cents;
  active: boolean;
}
