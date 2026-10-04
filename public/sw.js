/* Service worker de l'application cuisine Burger By M (portée /admin/).
 * Rôle : recevoir les notifications Web Push et ouvrir l'écran cuisine au toucher.
 * Aucune donnée de commande n'est mise en cache : l'écran lit toujours le serveur. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = { title: "Burger By M", body: "Nouvelle activité", url: "/admin/cuisine", tag: undefined };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    if (event.data) data.body = event.data.text();
  }
  event.waitUntil(
    (async () => {
      await self.registration.showNotification(data.title, {
        body: data.body,
        tag: data.tag,
        renotify: Boolean(data.tag),
        requireInteraction: true,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-96.png",
        data: { url: data.url },
        vibrate: [200, 100, 200, 100, 400],
      });
      // Prévient les écrans ouverts (rafraîchissement immédiat de la liste).
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      windows.forEach((w) => w.postMessage({ type: "push", tag: data.tag }));
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/admin/cuisine", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = windows.find((w) => new URL(w.url).pathname.startsWith("/admin"));
      if (existing) {
        await existing.focus();
        if ("navigate" in existing && existing.url !== target) await existing.navigate(target).catch(() => {});
        return;
      }
      await self.clients.openWindow(target);
    })(),
  );
});
