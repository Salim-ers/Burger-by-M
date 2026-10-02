"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { SiteImage } from "@/data/images";
import { cn } from "@/lib/utils";

interface Props {
  image: SiteImage;
  className?: string;
  imgClassName?: string;
  sizes: string;
  from?: "bottom" | "left" | "right";
  priority?: boolean;
  /** Recadrage CSS (object-position). */
  position?: string;
  decorative?: boolean;
  quality?: number;
}

const clips = {
  bottom: "inset(100% 0% 0% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

/** Image révélée par clip-path + léger dézoom : la photo « s'ouvre » comme une page de magazine. */
export function RevealImage({ image, className, imgClassName, sizes, from = "bottom", priority, position, decorative, quality = 80 }: Props) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      initial={{ clipPath: clips[from] }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.15, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src={image.src}
          alt={decorative ? "" : image.alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          className={cn("object-cover", imgClassName)}
          style={position ? { objectPosition: position } : undefined}
        />
      </motion.div>
    </motion.div>
  );
}
