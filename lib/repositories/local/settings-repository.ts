import type { RestaurantSettingsRepository } from "../types";
import { useAdminStore } from "@/stores/admin-store";

export const localSettingsRepository: RestaurantSettingsRepository = {
  async get() {
    return useAdminStore.getState().settings;
  },
  async update(key, value) {
    useAdminStore.getState().setSetting(key, value);
  },
};
