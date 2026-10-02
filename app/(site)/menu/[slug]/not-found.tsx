import { EmptyState } from "@/components/ui/EmptyState";

export default function ProductNotFound() {
  return <EmptyState className="min-h-[50vh] justify-center" title="Produit introuvable" text="Ce produit n’est pas (ou plus) à la carte." action={{ href: "/menu", label: "Voir la carte" }} />;
}
