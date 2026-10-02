"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/stores/admin-store";

/** true quand le store admin a été relu depuis localStorage (évite une redirection prématurée). */
export function useAdminHydrated() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (useAdminStore.persist.hasHydrated()) setDone(true);
    return useAdminStore.persist.onFinishHydration(() => setDone(true));
  }, []);
  return done;
}
