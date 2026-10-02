"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { useReduce } from "@/components/motion/use-reduced";
import { useScrollMap } from "@/components/motion/use-scroll-map";
import { Phone, Navigation } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { LineReveal } from "@/components/motion/LineReveal";
import { HoursGrid } from "@/components/restaurant/HoursGrid";
import { shots } from "@/data/images";
import { directionsUrl, restaurant } from "@/data/restaurant";

const front = shots.restaurantFront;

/** 09 — RESTAURANT. La vraie façade en très grand, overlay noir, infos pratiques claires. */
export function RestaurantBlock({ index = "09", headingLevel = "h2" }: { index?: string; headingLevel?: "h1" | "h2" }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useScrollMap(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const scale = useScrollMap(scrollYProgress, [0, 1], [1.15, 1.02]);

  return (
    <section ref={ref} aria-labelledby="resto-title" className="scheme-dark relative isolate overflow-hidden bg-ink">
      <motion.div className="absolute -inset-y-[12%] inset-x-0 -z-10" style={reduce ? undefined : { y, scale }}>
        <Image src={front.src} alt={front.alt} fill sizes="100vw" quality={80} className="object-cover" style={{ objectPosition: front.position }} />
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-ink/70" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-ink to-transparent" />

      <div className="shell flex min-h-[110svh] flex-col justify-end pt-32 pb-14 md:pb-20">
        <div className="flex items-center justify-between">
          <p className="kicker text-bone/70">{index} — Le restaurant</p>
          <OpeningStatus className="text-bone/85" />
        </div>
        <LineReveal as={headingLevel} id="resto-title" lines={["Rantigny.", <>We’re here<span className="text-cheddar">.</span></>]} className="mt-6 font-display text-d1" />

        <div className="grid-12 mt-12 gap-y-8 border-t border-bone/25 pt-8">
          <address className="col-span-12 not-italic sm:col-span-6 lg:col-span-4">
            <p className="kicker text-bone/55">Adresse</p>
            <p className="mt-2 font-display text-d5">
              {restaurant.address.street}
              <br />
              {restaurant.address.postalCode} {restaurant.address.city}
            </p>
          </address>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <p className="kicker text-bone/55">Téléphone</p>
            <a href={restaurant.phone.href} className="mt-2 block font-display text-d5 tabular-nums transition-colors hover:text-cheddar">
              {restaurant.phone.display}
            </a>
          </div>
          <div className="col-span-12 flex flex-wrap gap-3 lg:col-span-5 lg:justify-end lg:self-end">
            <ButtonLink href={directionsUrl} variant="primary" size="lg">
              <Navigation className="size-4" aria-hidden /> Itinéraire
            </ButtonLink>
            <ButtonLink href={restaurant.phone.href} variant="outline" size="lg">
              <Phone className="size-4" aria-hidden /> Appeler
            </ButtonLink>
          </div>
        </div>

        <div className="mt-10">
          <p className="kicker mb-3 text-bone/55">Horaires</p>
          <HoursGrid className="bg-ink/40" />
          <p className="mt-3 text-xs text-bone/50">À emporter. Commande en ligne, retrait au restaurant.</p>
        </div>
      </div>
    </section>
  );
}
