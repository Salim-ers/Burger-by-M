"use client";

import { useRouter } from "next/navigation";
import { ProductConfigurator } from "./ProductConfigurator";
import { ProductVisual } from "./ProductVisual";
import { useProduct } from "@/hooks/use-menu";

export function ProductPageClient({ productId }: { productId: string }) {
  const product = useProduct(productId);
  const router = useRouter();
  if (!product) return null;
  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      <ProductVisual product={product} sizes="(min-width: 768px) 50vw, 100vw" priority className="aspect-[4/3] w-full rounded-xl md:sticky md:top-28 md:self-start" />
      <ProductConfigurator product={product} layout="page" onDone={() => router.push("/panier")} />
    </div>
  );
}
