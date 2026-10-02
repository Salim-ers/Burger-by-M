import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/menu", priority: 0.9, freq: "weekly" },
    { path: "/commander", priority: 0.9, freq: "weekly" },
    { path: "/contact", priority: 0.7, freq: "monthly" },
    { path: "/legal/mentions-legales", priority: 0.2, freq: "yearly" },
    { path: "/legal/confidentialite", priority: 0.2, freq: "yearly" },
    { path: "/legal/cookies", priority: 0.2, freq: "yearly" },
  ];
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p.path}`, lastModified: now, changeFrequency: p.freq, priority: p.priority })),
    ...products.map((p) => ({ url: `${siteUrl}/menu/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
