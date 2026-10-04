"use client";

import { useCallback, useEffect, useState } from "react";
import { useNotify } from "../ui";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Abonnement Web Push de cet appareil (service worker /sw.js, portée /admin/).
 * La permission n'est demandée qu'au clic sur « Notifications ».
 */
export function usePushSubscription() {
  const notify = useNotify();
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(ok);
    if (!ok) return;
    void (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/admin/" });
        const res = await fetch("/api/admin/push", { cache: "no-store" });
        const body = (await res.json()) as { enabled: boolean; publicKey: string | null };
        setEnabled(body.enabled);
        setPublicKey(body.publicKey);
        const existing = await reg.pushManager.getSubscription();
        if (existing && body.enabled) {
          // Ré-enregistre l'abonnement (nouvel appareil, base réinitialisée…).
          await fetch("/api/admin/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(existing.toJSON()) });
          setSubscribed(Notification.permission === "granted");
        }
      } catch (err) {
        console.warn("[push]", err);
      }
    })();
  }, []);

  const subscribe = useCallback(async () => {
    if (!publicKey) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        notify("Notifications refusées : autorisez-les dans les réglages du navigateur.", "error");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }));
      const res = await fetch("/api/admin/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
      if (!res.ok) throw new Error(String(res.status));
      setSubscribed(true);
      notify("Notifications activées sur cet appareil.");
    } catch {
      notify("Impossible d’activer les notifications sur cet appareil.", "error");
    } finally {
      setBusy(false);
    }
  }, [publicKey, notify]);

  const test = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/push?test=1", { method: "POST" });
      const body = (await res.json()) as { sent?: number };
      notify(body.sent ? "Notification d’essai envoyée." : "Aucun appareil abonné.", body.sent ? "ok" : "error");
    } finally {
      setBusy(false);
    }
  }, [notify]);

  return { supported, enabled, subscribed, busy, subscribe, test };
}
