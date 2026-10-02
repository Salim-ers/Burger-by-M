import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealText } from "@/components/animations/RevealText";
import { images, type SiteImage } from "@/data/images";
import { products } from "@/data/products";
import type { CategoryId } from "@/types/category";
import { cn } from "@/lib/utils";

interface Block {
  title: string;
  href: string;
  cats: CategoryId[];
  image?: SiteImage;
  position?: string;
  span: string;
  height: string;
  caption: string;
}

const BLOCKS: Block[] = [
  { title: "Smash", href: "/menu#smash", cats: ["smash"], image: images.smashSpecial, position: "50% 66%", span: "md:col-span-7", height: "md:h-[78vh] md:max-h-[760px]", caption: "Potatoes bun frais" },
  { title: "Classics", href: "/menu#classics", cats: ["classics"], image: images.spicyChicken, position: "50% 40%", span: "md:col-span-5", height: "md:h-[78vh] md:max-h-[760px]", caption: "Steak façon bouchère" },
  { title: "Frenchy’s", href: "/menu#frenchys", cats: ["frenchys"], image: images.frenchyHot, position: "50% 45%", span: "md:col-span-5", height: "md:h-[60vh] md:max-h-[600px]", caption: "Baguette briochée" },
  { title: "Sides", href: "/menu#sides", cats: ["frites", "extras", "kids"], image: images.plateau, position: "50% 38%", span: "md:col-span-7", height: "md:h-[60vh] md:max-h-[600px]", caption: "Frites, extras, kids" },
  { title: "Milkshakes", href: "/menu#desserts", cats: ["milkshakes"], image: images.dubaiShake, position: "50% 30%", span: "md:col-span-8", height: "md:h-[56vh] md:max-h-[540px]", caption: "Dubai Shake, Bueno Bomb’…" },
];

const count = (cats: CategoryId[]) => products.filter((p) => cats.includes(p.category)).length;

export function Categories() {
  return (
    <section aria-labelledby="categories-title" className="bg-ink py-28 md:py-40">
      <div className="container-site">
        <RevealText
          id="categories-title"
          lines={["Choisis", "ton camp."]}
          className="font-display text-giant font-medium uppercase"
        />
      </div>

      <ul className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[clamp(1.25rem,4vw,3.5rem)] md:container-site md:mt-20 md:grid md:grid-cols-12 md:gap-4 md:overflow-visible">
        {BLOCKS.map((b) => (
          <li key={b.title} className={cn("w-[78vw] shrink-0 snap-start md:w-auto", b.span)}>
            <Link href={b.href} data-cursor="Voir" className={cn("group relative block h-[108vw] max-h-[560px] overflow-hidden rounded-xs bg-ink-soft md:max-h-none", b.height)}>
              {b.image && (
                <Image
                  src={b.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 58vw, 78vw"
                  className="object-cover transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.06]"
                  style={{ objectPosition: b.position }}
                />
              )}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              <span aria-hidden className="absolute top-5 right-5 grid size-12 translate-y-2 place-items-center rounded-full bg-cream text-ink opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
                <ArrowUpRight className="size-5" />
              </span>
              <span className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 md:inset-x-8 md:bottom-7">
                <span>
                  <span className="block text-[0.72rem] font-semibold tracking-[0.14em] text-cream/70 uppercase">{b.caption}</span>
                  <span className="mt-2 block font-display text-[clamp(2rem,5.6vw,5.4rem)] leading-[0.85] font-medium tracking-[-0.03em] uppercase transition-transform duration-700 ease-out-expo group-hover:translate-x-3">
                    {b.title}
                  </span>
                </span>
                <span className="mb-1 shrink-0 text-xs text-cream/60 tabular-nums">{count(b.cats)} choix</span>
              </span>
            </Link>
          </li>
        ))}
        <li className="w-[78vw] shrink-0 snap-start md:col-span-4 md:w-auto">
          <Link href="/menu#desserts" className="group relative flex h-[108vw] max-h-[560px] flex-col justify-between overflow-hidden rounded-xs bg-cream p-6 text-ink md:h-[56vh] md:max-h-[540px] md:p-8">
            <span className="text-[0.72rem] font-semibold tracking-[0.14em] text-brown uppercase">Pour finir</span>
            <span>
              <span className="block font-display text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.85] font-medium tracking-[-0.03em] uppercase transition-transform duration-700 ease-out-expo group-hover:translate-x-3">
                Desserts
              </span>
              <span className="mt-5 block max-w-xs text-[0.95rem] leading-relaxed text-brown-dark">
                Tiramisu Nutella, caramel, fraisier ou pistache-framboise.
              </span>
            </span>
            <span aria-hidden className="absolute top-6 right-6 grid size-12 place-items-center rounded-full border border-ink/20 transition-colors group-hover:bg-ink group-hover:text-cream">
              <ArrowUpRight className="size-5" />
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
