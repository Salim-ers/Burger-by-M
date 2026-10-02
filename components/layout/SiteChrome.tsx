"use client";

import dynamic from "next/dynamic";
import { MobileCartBar } from "@/components/cart/MobileCartBar";

// Modules chargés à la demande : ils ne pèsent pas sur le premier rendu.
const ProductSheet = dynamic(() => import("@/components/product/ProductSheet").then((m) => m.ProductSheet), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer), { ssr: false });
const Cursor = dynamic(() => import("@/components/motion/Cursor").then((m) => m.Cursor), { ssr: false });

export function SiteChrome() {
  return (
    <>
      <ProductSheet />
      <CartDrawer />
      <MobileCartBar />
      <Cursor />
    </>
  );
}
