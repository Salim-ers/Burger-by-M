import { EmptyState } from "@/components/ui/EmptyState";

export default function ProductNotFound() {
  return (
    <div className="bg-ink pt-24">
      <EmptyState lines={["Ce burger", "n’est pas", "à la carte."]} text="Il n’est pas (ou plus) au menu." action={{ href: "/menu", label: "Voir le menu" }} />
    </div>
  );
}
