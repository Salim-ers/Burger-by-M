import Image from "next/image";
import { brand } from "@/data/brand";
import { cn } from "@/lib/utils";

/** Logo officiel Burger By M (non recolorisé). */
export function Logo({ size = 48, className, priority }: { size?: number; className?: string; priority?: boolean }) {
  return <Image src={brand.logo.src} alt="Burger By M" width={size} height={size} preload={priority} sizes={`${size}px`} className={cn("rounded-full", className)} />;
}

/** Logotype : « BURGER » brut (Anton), « by M » éditorial (Instrument Serif italique). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("leading-none", className)}>
      <span className="font-display tracking-[0.06em]">BURGER</span> <span className="font-serif text-[1.15em] italic">by M</span>
    </span>
  );
}
