import type { Metadata } from "next";
import { MenuView } from "@/components/menu/MenuView";
import { getPublicMenu } from "@/features/public-data";
import { jsonLd, menuJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "La carte — smash burgers, Frenchy’s, frites et milkshakes",
  description: "La carte Burger By M à Rantigny : smash burgers, burgers classic, Frenchy’s, frites, extras, menu kids, boissons et milkshakes. Commande en ligne et retrait au restaurant.",
  path: "/menu",
});

export default async function MenuPage() {
  const menu = await getPublicMenu();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(menuJsonLd(menu))} />
      <MenuView />
    </>
  );
}
