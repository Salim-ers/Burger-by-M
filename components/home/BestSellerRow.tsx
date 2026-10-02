"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import { RevealImage } from "@/components/animations/RevealImage";
import { RevealText } from "@/components/animations/RevealText";
import { AddButton } from "@/components/product/AddButton";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { useProduct } from "@/hooks/use-menu";
import { useUiStore } from "@/stores/ui-store";
import { getImage } from "@/data/images";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  label: string;
  reversed?: boolean;
  position?: string;
  line: string;
}

export function BestSellerRow({ productId, label, reversed, position, line }: Props) {
  const product = useProduct(productId) as Product;
  const openProduct = useUiStore((s) => s.openProduct);
  const imgRef = useRef<HTMLDivElement>(null);
  const image = getImage(product.image);
  if (!image) return null;

  return (
    <article className="group grid items-center gap-8 md:grid-cols-12 md:gap-6">
      <button
        type="button"
        onClick={() => openProduct(product.id)}
        data-cursor="Voir"
        aria-label={`Voir ${product.name}`}
        className={cn("relative block min-w-0 md:col-span-6", reversed && "md:order-2 md:col-start-7")}
      >
        <div ref={imgRef} className="relative aspect-[4/5] overflow-hidden rounded-xs md:aspect-[5/6]">
          <RevealImage
            image={image}
            sizes="(min-width: 768px) 50vw, 100vw"
            className={cn("absolute inset-0 transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.03]", !product.available && "grayscale")}
            position={position}
            from={reversed ? "right" : "left"}
          />
        </div>
      </button>

      <div className={cn("min-w-0 md:col-span-5", reversed ? "md:order-1 md:col-start-1" : "md:col-start-8")}>
        <p className="text-xs font-semibold tracking-[0.16em] text-rose uppercase">{label}</p>
        <RevealText
          as="h3"
          lines={product.name.split(" ")}
          className="mt-4 font-display text-[clamp(2.8rem,6.4vw,6rem)] leading-[0.86] font-medium tracking-[-0.035em] uppercase transition-transform duration-700 ease-out-expo md:group-hover:translate-x-2"
        />
        <p className="mt-6 max-w-md font-display text-xl text-cream/90 italic md:text-2xl">{line}</p>
        <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-cream/65">{product.description}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <motion.span className="font-display text-4xl tabular-nums md:text-5xl" whileHover={{ x: 4 }}>
            <Price cents={product.price} />
          </motion.span>
          <AddButton product={product} sourceRef={imgRef} />
          {product.popular && <Badge tone="rose">Best seller</Badge>}
          {!product.available && <Badge tone="danger">Indisponible</Badge>}
        </div>
      </div>
    </article>
  );
}
