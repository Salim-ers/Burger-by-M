import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SiteChrome } from "@/components/layout/SiteChrome";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grain">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-rose focus:px-5 focus:py-3 focus:text-ink">
        Aller au contenu
      </a>
      <Navbar />
      <main id="contenu">{children}</main>
      <Footer />
      <SiteChrome />
    </div>
  );
}
