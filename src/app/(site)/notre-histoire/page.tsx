import type { Metadata } from "next";
import { StoryView } from "@/components/story/StoryView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Notre histoire — smash burgers à Rantigny",
  description: "Burger By M, une adresse au 19 avenue de la Gare à Rantigny : la méthode du smash burger, une carte courte et généreuse, sur place ou à emporter.",
  path: "/notre-histoire",
});

export default function StoryPage() {
  return <StoryView />;
}
