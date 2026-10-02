"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { useReduce } from "@/components/motion/use-reduced";
import { useScrollMap } from "@/components/motion/use-scroll-map";
import type { SiteImage } from "@/data/images";
import { cn } from "@/lib/utils";

type From = "bottom" | "top" | "left" | "right";

const clipFrom: Record<From, string> = {
  bottom: "inset(100% 0% 0% 0%)",
  top: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

interface Props {
  image: SiteImage;
  sizes: string;
  className?: string;
  /** Sens de la révélation (masque clip-path). */
  from?: From;
  /** Amplitude de la parallaxe verticale de l'image, en % (0 = aucune). */
  parallax?: number;
  priority?: boolean;
  /** Image décorative (alt vide). */
  decorative?: boolean;
  quality?: number;
  cursor?: string;
  delay?: number;
}

/**
 * Photo révélée par un masque rectangulaire à l'entrée dans le viewport,
 * légère parallaxe pendant le scroll. Le cadrage (object-position / zoom) vient du registre d'images.
 */
export function RevealImage({ image, sizes, className, from = "bottom", parallax = 8, priority, decorative, quality = 85, cursor = "view", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useScrollMap(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`]);
  const zoom = image.zoom ?? 1;

  return (
    <motion.div
      ref={ref}
      data-cursor={cursor}
      className={cn("relative overflow-hidden bg-graphite", className)}
      initial={{ clipPath: clipFrom[from] }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay }}
    >
      <motion.div className="absolute -inset-y-[10%] inset-x-0" style={reduce || !parallax ? undefined : { y }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.18 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay }}
        >
          <Image
            src={image.src}
            alt={decorative ? "" : image.alt}
            fill
            sizes={sizes}
            priority={priority}
            quality={quality}
            className="object-cover"
            style={{ objectPosition: image.position, ...(zoom !== 1 ? { transform: `scale(${zoom})`, transformOrigin: image.origin ?? image.position } : {}) }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
