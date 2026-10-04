import { IntroSeen } from "./IntroSeen";

/**
 * Intro de l'accueil (≈ 1,6 s, une fois par session) : une ligne ivoire dessine le cercle du logo,
 * « BURGER BY M » apparaît, puis le cercle s'ouvre comme un masque sur le hero.
 * Entièrement en CSS (aucun blocage si le JavaScript échoue) ; aucun son.
 * Le script en ligne (nonce CSP) masque l'intro si elle a déjà été vue dans la session.
 */
export function Intro({ nonce }: { nonce?: string }) {
  return (
    <>
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: "try{var k='bym-intro';if(sessionStorage.getItem(k))document.documentElement.classList.add('intro-seen');else sessionStorage.setItem(k,'1')}catch(e){document.documentElement.classList.add('intro-seen')}" }}
      />
      <div className="intro" aria-hidden>
        <div className="relative grid size-[min(64vw,340px)] place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.45" pathLength={1} />
          </svg>
          <p className="text-center leading-none">
            <span className="intro-word block font-display text-[clamp(2.6rem,9vw,4.6rem)] tracking-[0.04em]" style={{ animationDelay: "0.35s" }}>
              BURGER
            </span>
            <span className="intro-word mt-1 block font-serif text-[clamp(2rem,7vw,3.4rem)] text-pink italic" style={{ animationDelay: "0.5s" }}>
              by M
            </span>
          </p>
        </div>
      </div>
      <IntroSeen />
    </>
  );
}
