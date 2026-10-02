import { EmptyState } from "@/components/ui/EmptyState";

export default function ProductNotFound() {
  return (
    <div className="pt-24">
      <EmptyState lines={["Ce burger", "s’est fait la malle."]} text="Il n’est pas (ou plus) à la carte." action={{ href: "/menu", label: "Retour à la carte" }} />
    </div>
  );
}
