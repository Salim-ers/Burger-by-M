/** Légère apparition du contenu à chaque changement de page. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
