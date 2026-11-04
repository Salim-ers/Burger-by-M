import Image from "next/image";
import { brand } from "@/data/brand";
import { cn } from "@/lib/utils";

/** Logo officiel Burger By M (non recolorisé). */
export function Logo({ size = 48, className, priority }: { size?: number; className?: string; priority?: boolean }) {
  return <Image src={brand.logo.src} alt="Burger By M" width={size} height={size} preload={priority} sizes={`${size}px`} className={cn("rounded-full", className)} />;
}

/** Logotype en toutes lettres, dans la police du site. */
export function Wordmark({ className, accent }: { className?: string; accent?: boolean }) {
  return (
    <span className={cn("font-display leading-none uppercase", className)}>
      Burger <span className={accent ? "text-pink" : undefined}>by M</span>
    </span>
  );
}
