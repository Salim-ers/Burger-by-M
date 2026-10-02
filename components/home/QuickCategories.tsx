"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { PhotoPlaceholder } from "@/components/product/ProductVisual";
import { useMenuSections } from "@/hooks/use-menu-sections";
import { getImage } from "@/data/images";
import { categoryAnchor, type CategoryId } from "@/types/category";

const SHOWN: CategoryId[] = ["smash", "classics", "frenchys", "frites", "desserts", "milkshakes", "boissons"];

/** Accès rapide à la carte : une tuile par catégorie → /menu#cat-… */
export function QuickCategories() {
  const sections = useMenuSections().filter((s) => SHOWN.includes(s.category.id));
  return (
    <section aria-labelledby="quick-title" className="shell py-10 md:py-14">
      <div className="flex items-end justify-between gap-4">
        <h2 id="quick-title" className="font-display text-[2.6rem] leading-none md:text-[3.4rem]">
          Notre carte
        </h2>
        <Link href="/menu" className="hidden items-center gap-1.5 text-[0.95rem] font-semibold hover:underline sm:inline-flex">
          Voir toute la carte <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sections.map(({ category, items }) => {
          const img = getImage(category.imageId);
          return (
            <li key={category.id}>
              <Link href={`/menu#${categoryAnchor(category.id)}`} className="group flex h-full items-center gap-3 rounded-xl border border-line bg-white p-2.5 pr-3 transition-[border-color,box-shadow] duration-200 hover:border-stone hover:shadow-soft">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg md:size-16">
                  {img ? <Image src={img.src} alt="" fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: img.position, ...(img.zoom ? { transform: `scale(${img.zoom})`, transformOrigin: img.origin } : {}) }} /> : <PhotoPlaceholder className="size-full" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{category.name}</span>
                  <span className="block text-sm text-muted">
                    {items.length} produit{items.length > 1 ? "s" : ""}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </li>
          );
        })}
        <li>
          <Link href="/menu" className="flex h-full min-h-[4.75rem] items-center justify-between gap-3 rounded-xl bg-ink p-4 font-bold text-white transition-colors hover:bg-coal">
            Toute la carte <ArrowRight className="size-4" aria-hidden />
          </Link>
        </li>
      </ul>
    </section>
  );
}
