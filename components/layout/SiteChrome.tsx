"use client";

import dynamic from "next/dynamic";
import { MobileOrderBar } from "@/components/cart/MobileOrderBar";
import { AddedToast } from "@/components/cart/AddedToast";

// Fiche produit chargée à la demande : elle ne pèse pas sur le premier rendu.
const ProductSheet = dynamic(() => import("@/components/product/ProductSheet").then((m) => m.ProductSheet), { ssr: false });

export function SiteChrome() {
  return (
    <>
      <ProductSheet />
      <AddedToast />
      <MobileOrderBar />
    </>
  );
}
