"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, reducedMotion } from "@/components/motion/gsap";
import { transitionLabel } from "@/data/navigation";

/**
 * Transition entre pages (≤ 800 ms) : le même geste que l'ouverture du hero. Deux volets se referment
 * vers le centre de l'écran, le nom de la destination apparaît, la page change derrière, le cadre se rouvre.
 * Ancres, nouveaux onglets, clavier et liens externes ne sont pas interceptés ; en mouvement réduit, navigation directe.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const pending = useRef(false);

  const parts = () => {
    const el = root.current!;
    return { top: el.querySelector("[data-bar=top]")!, bottom: el.querySelector("[data-bar=bottom]")!, text: el.querySelector("[data-label]") };
  };

  /** Le cadre se rouvre, puis redevient invisible (il ne peut plus intercepter de clic). */
  const open = (delay: number) => {
    if (!root.current) return;
    const { top, bottom } = parts();
    gsap.killTweensOf([top, bottom]);
    gsap.to(root.current.querySelector("[data-label]"), { autoAlpha: 0, duration: 0.14, delay, ease: "power1.out" });
    gsap.to([top, bottom], {
      scaleY: 0,
      duration: 0.44,
      ease: "power4.inOut",
      delay: delay + 0.06,
      onComplete: () => {
        gsap.set(root.current, { autoAlpha: 0 });
        setLabel(null);
      },
    });
  };

  useEffect(() => {
    if (!root.current) return;
    const { top, bottom } = parts();
    gsap.set([top, bottom], { scaleY: 0 });
    gsap.set(root.current, { autoAlpha: 0 });
  }, []);

  useEffect(() => {
    let safety = 0;

    /** Lien interne vers une autre page du site, qui mérite la transition ; sinon null. */
    const destination = (target: EventTarget | null) => {
      const a = (target as HTMLElement | null)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return null;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return null;
      if (url.pathname === window.location.pathname) return null; // ancre ou même page : défilement natif
      const label = transitionLabel(url.pathname);
      return label ? { url, label } : null;
    };

    /**
     * Préchargement complet dès l'intention (survol, focus, appui) : les pages sont dynamiques (CSP à nonce),
     * Next ne les précharge donc pas de lui-même et chaque navigation attendait le serveur après la fermeture
     * des volets. La requête part maintenant avant le clic, pendant que les volets se referment.
     */
    const warmed = new Map<string, number>();
    const warm = (e: Event) => {
      const dest = destination(e.target);
      if (!dest) return;
      const href = dest.url.pathname + dest.url.search;
      if (Date.now() - (warmed.get(href) ?? 0) < 30_000) return;
      warmed.set(href, Date.now());
      router.prefetch(href, { kind: "full" } as unknown as Parameters<typeof router.prefetch>[1]);
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reducedMotion()) return;
      const dest = destination(e.target);
      if (!dest || !root.current) return;
      const { url, label: next } = dest;
      warm(e);
      e.preventDefault();
      pending.current = true;
      setLabel(next);
      const { top, bottom } = parts();
      gsap.killTweensOf([top, bottom]);
      gsap.set(root.current, { autoAlpha: 1 });
      gsap.fromTo(root.current.querySelector("[data-label]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.32, delay: 0.14, ease: "power2.out" });
      gsap.fromTo([top, bottom], { scaleY: 0 }, { scaleY: 1, duration: 0.36, ease: "power4.inOut", onComplete: () => router.push(url.pathname + url.search + url.hash) });
      // Filet de sécurité : si la page ne change pas (erreur réseau), le cadre se rouvre quand même.
      window.clearTimeout(safety);
      safety = window.setTimeout(() => {
        if (pending.current) {
          pending.current = false;
          open(0);
        }
      }, 3000);
    };
    // Phase de capture : passe avant le gestionnaire de <Link> (qui respecte defaultPrevented).
    window.addEventListener("click", onClick, true);
    const intent = { capture: true, passive: true } as const;
    for (const type of ["pointerover", "pointerdown", "focusin"]) window.addEventListener(type, warm, intent);
    return () => {
      window.removeEventListener("click", onClick, true);
      for (const type of ["pointerover", "pointerdown", "focusin"]) window.removeEventListener(type, warm, intent);
      window.clearTimeout(safety);
    };
  }, [router]);

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    open(0.05);
  }, [pathname]);

  return (
    <div ref={root} aria-hidden className="pointer-events-none invisible fixed inset-0 z-[180] text-cream">
      <div data-bar="top" className="absolute inset-x-0 top-0 h-[50.5%] origin-top bg-ink" />
      <div data-bar="bottom" className="absolute inset-x-0 bottom-0 h-[50.5%] origin-bottom bg-ink" />
      <div className="absolute inset-0 grid place-items-center">
        <p data-label className="t-xl invisible">
          {label}
        </p>
      </div>
    </div>
  );
}
