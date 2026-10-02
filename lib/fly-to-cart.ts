/**
 * Animation « photo → panier » : un clone de la photo produit vole jusqu'à l'icône panier.
 * Web Animations API, aucune dépendance. Ignorée si mouvement réduit.
 */
export function flyToCart(source: HTMLElement | null) {
  if (typeof window === "undefined" || !source) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]")).find((el) => el.offsetParent !== null);
  if (!target) return;
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (from.width === 0) return;
  const size = Math.min(from.width, from.height, 220);
  const ghost = document.createElement("div");
  const img = source.querySelector("img");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "2px",
    backgroundImage: img ? `url("${img.currentSrc || img.src}")` : "none",
    backgroundColor: "#f0a21a",
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: "120",
    pointerEvents: "none",
    boxShadow: "0 20px 40px -10px rgba(0,0,0,.6)",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(ghost);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const anim = ghost.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 60}px) scale(0.55)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.4 },
    ],
    { duration: 720, easing: "cubic-bezier(0.65, 0, 0.35, 1)" },
  );
  anim.onfinish = () => ghost.remove();
}
