import Image from "next/image";
import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/utils";

/** Logo officiel (photo détourée du logo existant). */
export function Logo({ size = 48, className, priority }: { size?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src={restaurant.logo.src}
      alt={restaurant.logo.alt}
      width={size}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      className={cn("rounded-full", className)}
    />
  );
}
