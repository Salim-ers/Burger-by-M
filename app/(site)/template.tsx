import { PageCurtain } from "@/components/layout/PageCurtain";

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageCurtain />
      {children}
    </>
  );
}
