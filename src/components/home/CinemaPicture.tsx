import { cinemaAssets } from "@/data/cinema-assets";
import { cn } from "@/lib/utils";

type CinemaId = keyof typeof cinemaAssets;

const srcSet = (id: CinemaId, ext: "avif" | "webp") =>
  cinemaAssets[id].widths.map((w) => `/images/cinema/${id}-${w}.${ext} ${w}w`).join(", ");

/** Écrans en portrait (téléphones, tablettes à la verticale) : vrai cadrage vertical, pas une découpe du paysage. */
const PORTRAIT = "(orientation: portrait)";
const LANDSCAPE = "(orientation: landscape)";

/**
 * Préchargement de la première image (LCP), un seul cadrage selon l'orientation.
 * AVIF uniquement : un navigateur qui ne le gère pas ignore le préchargement et lit le <picture>.
 */
export function CinemaPreload({ landscape, portrait, sizes }: { landscape: CinemaId; portrait: CinemaId; sizes: string }) {
  return (
    <>
      <link rel="preload" as="image" type="image/avif" media={LANDSCAPE} imageSrcSet={srcSet(landscape, "avif")} imageSizes={sizes} fetchPriority="high" />
      <link rel="preload" as="image" type="image/avif" media={PORTRAIT} imageSrcSet={srcSet(portrait, "avif")} imageSizes={sizes} fetchPriority="high" />
    </>
  );
}

/**
 * Visuel de l'accueil : variantes AVIF/WebP pré-calculées, cadrage dédié au portrait,
 * aperçu flou intégré à la page pour que rien ne saute pendant le chargement.
 */
export function CinemaPicture({ id, portraitId, alt, sizes, priority, position, className }: { id: CinemaId; portraitId?: CinemaId; alt: string; sizes: string; priority?: boolean; position?: string; className?: string }) {
  const main = cinemaAssets[id];
  const blur = (lqip: string, at = "center") => ({ backgroundImage: `url("${lqip}")`, backgroundSize: "cover", backgroundPosition: at });
  return (
    <>
      <span aria-hidden className={cn("absolute inset-0", portraitId && "portrait:hidden")} style={blur(main.lqip, position)} />
      {portraitId && <span aria-hidden className="absolute inset-0 landscape:hidden" style={blur(cinemaAssets[portraitId].lqip)} />}
      <picture>
        {portraitId && <source media={PORTRAIT} type="image/avif" srcSet={srcSet(portraitId, "avif")} sizes={sizes} />}
        {portraitId && <source media={PORTRAIT} type="image/webp" srcSet={srcSet(portraitId, "webp")} sizes={sizes} />}
        <source type="image/avif" srcSet={srcSet(id, "avif")} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(id, "webp")} sizes={sizes} />
        {/* eslint-disable-next-line @next/next/no-img-element -- variantes déjà optimisées, servies sans passer par l'optimiseur */}
        <img
          src={`/images/cinema/${id}-${main.widths[1] ?? main.widths[0]}.webp`}
          alt={alt}
          width={main.width}
          height={main.height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          draggable={false}
          className={cn("absolute inset-0 size-full object-cover", portraitId && "portrait:object-center!", className)}
          style={position ? { objectPosition: position } : undefined}
        />
      </picture>
    </>
  );
}
