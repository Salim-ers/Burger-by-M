"use client";

import { ProductCard } from "@/components/menu/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { useMenuProducts } from "@/hooks/use-menu";
import { featuredProductIds } from "@/data/products";
import type { Product } from "@/types/product";

/** « Nos incontournables » : 4 produits, même design que la carte. */
export function Featured() {
  const products = useMenuProducts();
  const featured = featuredProductIds.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
  return (
    <section aria-labelledby="featured-title" className="shell py-10 md:py-14">
      <h2 id="featured-title" className="font-display text-[2.6rem] leading-none md:text-[3.4rem]">
        Nos incontournables
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} variant="tile" />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <ButtonLink href="/menu" variant="dark" size="lg" arrow>
          Voir toute la carte
        </ButtonLink>
      </div>
    </section>
  );
}
