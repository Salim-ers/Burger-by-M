import { RouteTransition } from "@/components/layout/RouteTransition";

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteTransition />
      {children}
    </>
  );
}
