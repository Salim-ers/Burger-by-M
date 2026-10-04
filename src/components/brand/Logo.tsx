import Image from "next/image";
import { brand } from "@/data/brand";
import { cn } from "@/lib/utils";

/** Logo officiel Burger By M (non recolorisé). */
export function Logo({ size = 48, className, priority }: { size?: number; className?: string; priority?: boolean }) {
  return <Image src={brand.logo.src} alt="Burger By M" width={size} height={size} preload={priority} sizes={`${size}px`} className={cn("rounded-full", className)} />;
}

/** Logotype éditorial : « BURGER by M » en Bodoni, le « by » en italique. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-serif leading-none tracking-[0.16em]", className)}>
      BURGER <span className="tracking-normal italic">by</span> M
    </span>
  );
}
