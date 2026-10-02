import { DEMO_MODE } from "@/config/demo";
import { localOrderRepository } from "./local/order-repository";
import { localProductRepository } from "./local/product-repository";
import { localSettingsRepository } from "./local/settings-repository";

/**
 * Point d'entrée unique. Pour brancher un backend : créer `lib/repositories/remote/*`
 * implémentant les mêmes interfaces, puis les sélectionner ici quand DEMO_MODE = false.
 */
if (!DEMO_MODE) {
  // TODO_BACKEND: remplacer par les implémentations distantes.
}

export const orderRepository = localOrderRepository;
export const productRepository = localProductRepository;
export const settingsRepository = localSettingsRepository;
