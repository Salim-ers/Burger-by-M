"use client";

import dynamic from "next/dynamic";
import { MobileCartBar } from "@/components/cart/MobileCartBar";

// Modules chargés à la demande : ils ne pèsent pas sur le premier rendu.
const ProductModal = dynamic(() => import("@/components/product/ProductModal").then((m) => m.ProductModal), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer), { ssr: false });
const CustomCursor = dynamic(() => import("@/components/animations/CustomCursor").then((m) => m.CustomCursor), { ssr: false });

export function SiteChrome() {
  return (
    <>
      <ProductModal />
      <CartDrawer />
      <MobileCartBar />
      <CustomCursor />
    </>
  );
}
