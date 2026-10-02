import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPageClient } from "@/components/product/ProductPageClient";
import { getProductBySlug, products } from "@/data/products";
import { getCategory } from "@/data/categories";
import { getImage } from "@/data/images";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  const image = getImage(product.image);
  const base = pageMetadata({
    title: `${product.name} — ${getCategory(product.category)?.name ?? "Carte"}`,
    description: product.description ? `${product.name} chez Burger By M à Rantigny : ${product.description}` : `${product.name} chez Burger By M à Rantigny.`,
    path: `/menu/${product.slug}`,
  });
  return image ? { ...base, openGraph: { ...base.openGraph, images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] } } : base;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  return (
    <div className="scheme-dark bg-ink pt-24 pb-24 md:pt-28">
      <div className="shell">
        <nav aria-label="Fil d’Ariane" className="kicker mb-6 text-bone/50">
          <Link href="/menu" className="hover:text-bone">
            La carte
          </Link>{" "}
          / <span className="text-bone/85">{product.name}</span>
        </nav>
        <ProductPageClient productId={product.id} />
      </div>
    </div>
  );
}
