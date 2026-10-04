"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSite } from "@/features/site-context";
import { LineReveal } from "@/components/motion";

/** Accès direct à la carte : index éditorial des catégories, la photo apparaît au survol. */
export function MenuIndex() {
  const { menu } = useSite();
  const [hover, setHover] = useState<string | null>(null);
  const firstImage = (id: string | null) => menu.find((c) => c.id === id)?.products.find((p) => p.image)?.image ?? null;
  const preview = firstImage(hover) ?? firstImage(menu[0]?.id ?? null);

  return (
    <section aria-labelledby="index-title" className="on-light bg-ivory py-24 md:py-36">
      <div className="shell grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="kicker text-brass-deep">La carte</p>
          <LineReveal id="index-title" lines={["Choisissez", <span key="v" className="italic">votre camp.</span>]} className="display-3 mt-5" />
          <div className="relative mt-10 hidden aspect-[4/3] overflow-hidden bg-sand md:block">
            <AnimatePresence mode="popLayout">
              {preview && (
                <motion.div key={preview.src} className="absolute inset-0" initial={{ clipPath: "inset(100% 0 0 0)" }} animate={{ clipPath: "inset(0% 0 0 0)" }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}>
                  <Image src={preview.src} alt="" fill sizes="30vw" className="object-cover" style={preview.position ? { objectPosition: preview.position } : undefined} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <ol className="md:col-span-8">
          {menu.map((c, i) => (
            <li key={c.id} className="border-b border-rule first:border-t">
              <Link
                href={`/menu#cat-${c.slug}`}
                onMouseEnter={() => setHover(c.id)}
                onFocus={() => setHover(c.id)}
                onMouseLeave={() => setHover(null)}
                className="group flex items-baseline gap-5 py-5 transition-colors md:gap-8 md:py-6"
              >
                <span className="kicker w-8 shrink-0 tabular-nums text-brass-deep">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-[2.1rem] leading-none transition-transform duration-500 ease-out-expo group-hover:translate-x-3 md:text-[3.6rem]">{c.name}</span>
                <span className="ml-auto text-sm text-sub tabular-nums">{c.products.length}</span>
                <span aria-hidden className="text-xl text-ink/30 transition-all duration-500 group-hover:translate-x-1 group-hover:text-ink">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
