"use client";

import { useEffect, useState } from "react";
import { KitchenBoard, type KitchenSource } from "@/components/admin/kitchen/KitchenBoard";
import { simulateDemoOrder } from "@/features/demo/sample";
import { demoAccept, demoKitchenOrders, demoRefuse, demoSetStatus, subscribeDemo, useDemo } from "@/features/demo/store";

const source: KitchenSource = {
  load: async () => demoKitchenOrders(),
  accept: demoAccept,
  refuse: demoRefuse,
  setStatus: demoSetStatus,
  subscribe: subscribeDemo,
};

export function DemoKitchen() {
  const ordersEnabled = useDemo((s) => s.ordersEnabled);
  const [serverTime] = useState(() => new Date().toISOString());

  // L'écran cuisine active aussi la démo sur ce navigateur : le site ouvert à côté reste en mode démo.
  useEffect(() => {
    useDemo.getState().set(true);
    return subscribeDemo(() => useDemo.getState().sync());
  }, []);

  return (
    <KitchenBoard
      initial={[]}
      initialServerTime={serverTime}
      source={source}
      demo={{
        ordersEnabled,
        onSimulate: () => simulateDemoOrder(),
        onToggleOrders: () => useDemo.getState().setOrdersEnabled(!useDemo.getState().ordersEnabled),
      }}
    />
  );
}
