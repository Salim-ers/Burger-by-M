import { WordScrub } from "@/components/motion/WordScrub";
import { FadeIn } from "@/components/motion/LineReveal";

/** 02 — MANIFESTE. Pas de cards : une phrase énorme qui s'allume mot à mot au scroll. */
export function Manifesto() {
  return (
    <section aria-labelledby="manifesto-title" className="scheme-light relative overflow-hidden bg-bone py-24 text-ink md:py-40">
      {/* Grille éditoriale visible : filets verticaux. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 shell">
        <div className="grid-12 h-full">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="hidden h-full border-l border-ink/[0.06] md:block" />
          ))}
        </div>
      </div>

      <div className="shell relative">
        <div className="flex items-center justify-between border-b-2 border-ink pb-3">
          <span className="kicker">02 — Manifeste</span>
          <span className="kicker text-ink/50">This is not fast food.</span>
        </div>

        <div className="grid-12 mt-14 gap-y-12 md:mt-20">
          <WordScrub id="manifesto-title" lines={["Ici,", "on ne fait", "pas semblant."]} className="col-span-12 font-display text-d1 leading-[0.92] lg:col-span-9" />

          <FadeIn className="col-span-12 self-end sm:col-span-6 lg:col-span-3" delay={0.1}>
            <ul className="border-t-2 border-ink font-display text-[clamp(1.6rem,2.4vw,2.3rem)] leading-[1.05]">
              {["Smash burgers.", "Frenchy’s.", "Sides.", "Milkshakes."].map((t, i) => (
                <li key={t} className="flex items-baseline justify-between border-b border-ink/15 py-2">
                  {t}
                  <span className="font-sans text-[0.6rem] font-semibold text-ink/35 tabular-nums">0{i + 1}</span>
                </li>
              ))}
              <li className="py-2">
                <span className="bg-cheddar px-1.5">À Rantigny.</span>
              </li>
            </ul>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
