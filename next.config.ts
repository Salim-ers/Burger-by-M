import type { NextConfig } from "next";

const production = process.env.NODE_ENV === "production";

/** En-têtes de sécurité communs (la CSP à nonce est posée par src/proxy.ts). */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // Apple Pay / Google Pay dans l'iframe Stripe : « payment » autorisé pour Stripe uniquement.
  { key: "Permissions-Policy", value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(self "https://js.stripe.com")' },
  ...(production ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const nextConfig: NextConfig = {
  // Pas de génération automatique d'AGENTS.md / CLAUDE.md par `next dev` dans le dépôt.
  agentRules: false,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 80, 90],
    deviceSizes: [384, 640, 750, 828, 1080, 1200, 1600, 1920],
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/media/**", search: "" },
    ],
  },
  async redirects() {
    return [
      // Anciennes adresses du site
      { source: "/contact", destination: "/restaurant", permanent: true },
      { source: "/commander", destination: "/menu", permanent: true },
      { source: "/panier", destination: "/checkout", permanent: false },
      { source: "/confirmation", destination: "/", permanent: false },
      { source: "/commande/confirmation", destination: "/", permanent: false },
      // Anciennes adresses de l'administration
      { source: "/admin/dashboard", destination: "/admin", permanent: false },
      { source: "/admin/commandes/:path*", destination: "/admin/orders", permanent: false },
      { source: "/admin/produits", destination: "/admin/menu", permanent: false },
      { source: "/admin/categories", destination: "/admin/menu", permanent: false },
      { source: "/admin/disponibilites", destination: "/admin/menu", permanent: false },
      { source: "/admin/horaires", destination: "/admin/hours", permanent: false },
      { source: "/admin/parametres", destination: "/admin/settings", permanent: false },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
    ];
  },
};

export default nextConfig;
