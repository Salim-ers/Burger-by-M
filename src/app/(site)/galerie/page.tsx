import type { Metadata } from "next";
import { GalleryView } from "@/components/gallery/GalleryView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Galerie — burgers, frites et milkshakes",
  description: "La galerie Burger By M : smash burgers, Frenchy’s, frites cheddar, milkshakes, la devanture et la terrasse du restaurant de Rantigny.",
  path: "/galerie",
});

export default function GalleryPage() {
  return <GalleryView />;
}
