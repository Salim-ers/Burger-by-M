import { connection } from "next/server";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteProvider } from "@/features/site-context";
import { getPublicMenu, getPublicStore } from "@/features/public-data";

// Données lues dans Neon à la requête (avec cache) : le build n'a besoin d'aucune base.
export const dynamic = "force-dynamic";

/** Site public : carte et réglages servis depuis Neon (cache invalidé à chaque modification admin). */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const [menu, store] = await Promise.all([getPublicMenu(), getPublicStore()]);
  return (
    <SiteProvider menu={menu} store={store}>
      <div className="grain">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:bg-ink focus:px-5 focus:py-3 focus:text-ivory">
          Aller au contenu
        </a>
        <SiteHeader />
        <main id="contenu">{children}</main>
        <SiteFooter store={store} />
        <SiteChrome />
      </div>
    </SiteProvider>
  );
}
