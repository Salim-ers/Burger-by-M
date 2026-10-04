import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicMenu } from "@/features/public-data";
import { compositionText } from "@/features/menu/types";
import { ProductImage } from "@/components/menu/ProductImage";
import { ProductBadges } from "@/components/menu/Badges";
import { ProductCard } from "@/components/menu/ProductCard";
import { OpenProductButton } from "@/components/menu/OpenProductButton";
import { Price } from "@/components/ui/Price";
import { jsonLd, pageMetadata, siteUrl } from "@/lib/seo";

async function findProduct(slug: string) {
  const menu = await getPublicMenu();
  for (const category of menu) {
    const product = category.products.find((p) => p.slug === slug);
    if (product) return { product, category };
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await findProduct(slug);
  if (!found) return { title: "Produit introuvable", robots: { index: false } };
  const { product, category } = found;
  return pageMetadata({
    title: `${product.name} — ${category.title}`,
    description: `${product.name} chez Burger By M à Rantigny : ${compositionText(product) || category.title}`.slice(0, 160),
    path: `/menu/${product.slug}`,
    ...(product.image ? { image: { url: product.image.src, width: product.image.width, height: product.image.height, alt: product.image.alt } } : {}),
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findProduct(slug);
  if (!found) notFound();
  const { product, category } = found;
  const related = category.products.filter((p) => p.id !== product.id && p.image).slice(0, 3);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: `${siteUrl}/menu/${product.slug}`,
    category: category.title,
    description: compositionText(product) || undefined,
    brand: { "@type": "Brand", name: "Burger By M" },
    ...(product.image ? { image: `${siteUrl}${product.image.src}` } : {}),
    ...(product.priceCents !== null
      ? {
          offers: {
            "@type": "Offer",
            price: (product.priceCents / 100).toFixed(2),
            priceCurrency: "EUR",
            availability: product.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: { "@id": `${siteUrl}/#restaurant` },
          },
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(productLd)} />
      <article className="on-light bg-ivory pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="shell">
          <nav aria-label="Fil d’Ariane" className="kicker flex flex-wrap gap-2 text-sub">
            <Link href="/menu" className="hover:text-fg">
              La carte
            </Link>
            <span aria-hidden>/</span>
            <Link href={`/menu#cat-${category.slug}`} className="hover:text-fg">
              {category.name}
            </Link>
          </nav>
          <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-14">
            <div className="md:col-span-7">
              <ProductImage image={product.image} name={product.name} sizes="(min-width: 768px) 58vw, 100vw" priority className="aspect-[4/3] w-full" />
              {product.image && product.needsFinalProductPhoto && <p className="mt-3 text-xs text-sub">Photo d’illustration : la présentation peut varier.</p>}
            </div>
            <div className="flex flex-col md:col-span-5 md:pt-6">
              <ProductBadges product={product} />
              <h1 className="display-2 mt-5">{product.name}</h1>
              <p className="mt-5 font-serif text-3xl">
                <Price cents={product.priceCents} />
              </p>
              <p className="mt-6 text-[1.05rem] leading-relaxed text-sub">{compositionText(product)}</p>
              {category.note && <p className="mt-3 font-serif text-lg italic">{category.note}.</p>}
              <p className="mt-4 text-sm text-sub">Allergènes : {product.allergens ?? "liste disponible au restaurant, sur simple demande."}</p>
              <div className="mt-10">
                <OpenProductButton productId={product.id} />
              </div>
            </div>
          </div>
        </div>
      </article>
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="on-light border-t border-rule bg-paper py-20 md:py-28">
          <div className="shell">
            <h2 id="related-title" className="display-4">
              Aussi en <span className="italic">{category.name}</span>
            </h2>
            <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
