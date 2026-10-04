import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getPublicMenu } from "@/features/public-data";
import { siteUrl } from "@/lib/seo";

/** Sitemap dynamique : pages publiques + une page par produit visible (lue dans Neon). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const now = new Date();
  const pages: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/menu", priority: 0.9, freq: "weekly" },
    { path: "/restaurant", priority: 0.8, freq: "monthly" },
    { path: "/galerie", priority: 0.5, freq: "monthly" },
    { path: "/notre-histoire", priority: 0.5, freq: "yearly" },
    { path: "/legal/mentions-legales", priority: 0.1, freq: "yearly" },
    { path: "/legal/cgv", priority: 0.1, freq: "yearly" },
    { path: "/legal/confidentialite", priority: 0.1, freq: "yearly" },
    { path: "/legal/cookies", priority: 0.1, freq: "yearly" },
  ];
  let products: { slug: string }[] = [];
  try {
    products = (await getPublicMenu()).flatMap((c) => c.products);
  } catch (err) {
    console.error("[sitemap] carte indisponible", err);
  }
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p.path}`, lastModified: now, changeFrequency: p.freq, priority: p.priority })),
    ...products.map((p) => ({ url: `${siteUrl}/menu/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
