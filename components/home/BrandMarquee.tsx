import { Marquee } from "@/components/animations/Marquee";

export function BrandMarquee() {
  return (
    <div className="relative z-10 -my-8 overflow-hidden py-8">
      <div className="-mx-6 -rotate-[1.6deg] bg-rose py-5 text-ink md:py-7">
        <Marquee
          className="font-display text-[clamp(1.8rem,4.6vw,4.2rem)] leading-none font-medium tracking-[-0.02em] uppercase"
          items={["Smash burger", "Frenchy’s", "Frites", "Milkshakes", "À emporter", "Burger By M"]}
        />
      </div>
    </div>
  );
}
