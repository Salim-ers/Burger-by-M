"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, reducedMotion } from "@/components/motion/gsap";
import { transitionLabel } from "@/data/navigation";

/**
 * Transition entre pages (≤ 750 ms) : un volet noir traverse l'écran avec le nom de la destination
 * (« LA CARTE. »), la page change derrière, le volet repart. Ancres, nouveaux onglets, clavier
 * et liens externes ne sont pas interceptés ; en mouvement réduit, navigation directe.
 */
/** Le volet repart vers le haut, puis redevient invisible (il ne peut plus intercepter de clic). */
function leave(el: HTMLDivElement, delay: number, done: () => void) {
  gsap.killTweensOf(el);
  gsap.to(el, {
    yPercent: -100,
    duration: 0.42,
    ease: "power4.inOut",
    delay,
    onComplete: () => {
      gsap.set(el, { autoAlpha: 0, yPercent: 100 });
      done();
    },
  });
}

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const pending = useRef(false);

  // Position de repos posée par GSAP lui-même (une translation en CSS serait relue en pixels et s'additionnerait).
  useEffect(() => {
    if (panel.current) gsap.set(panel.current, { yPercent: 100, y: 0, autoAlpha: 0 });
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reducedMotion()) return;
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return;
      if (url.pathname === window.location.pathname) return; // ancre ou même page : défilement natif
      const next = transitionLabel(url.pathname);
      if (!next || !panel.current) return;
      e.preventDefault();
      pending.current = true;
      setLabel(next);
      gsap.killTweensOf(panel.current);
      gsap.fromTo(panel.current, { yPercent: 100, y: 0, autoAlpha: 1 }, { yPercent: 0, duration: 0.38, ease: "power4.inOut", onComplete: () => router.push(url.pathname + url.search + url.hash) });
      // Filet de sécurité : si la page ne change pas (erreur réseau), le volet repart quand même.
      window.setTimeout(() => {
        if (pending.current && panel.current) {
          pending.current = false;
          leave(panel.current, 0, () => setLabel(null));
        }
      }, 3000);
    };
    // Phase de capture : passe avant le gestionnaire de <Link> (qui respecte defaultPrevented).
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    if (!pending.current || !panel.current) return;
    pending.current = false;
    leave(panel.current, 0.06, () => setLabel(null));
  }, [pathname]);

  return (
    <div ref={panel} aria-hidden className="pointer-events-none invisible fixed inset-0 z-[180] grid place-items-center bg-ink text-cream">
      {label && <p className="t-xl">{label}</p>}
    </div>
  );
}
