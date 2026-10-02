import type { OrderRepository } from "../types";
import { useAdminStore } from "@/stores/admin-store";

/** Implémentation navigateur (mode démo). Aucune commande n'est envoyée au restaurant. */
export const localOrderRepository: OrderRepository = {
  async create(input) {
    return useAdminStore.getState().createOrder(input);
  },
  async getById(id) {
    return useAdminStore.getState().orders.find((o) => o.id === id) ?? null;
  },
  async list(filter) {
    const orders = useAdminStore.getState().orders;
    return filter?.status ? orders.filter((o) => filter.status!.includes(o.status)) : orders;
  },
  async updateStatus(id, status) {
    useAdminStore.getState().setOrderStatus(id, status);
  },
  async accept(id, minutes) {
    useAdminStore.getState().acceptOrder(id, minutes);
  },
};
