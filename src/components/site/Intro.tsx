import { IntroSeen } from "./IntroSeen";

/**
 * Ouverture de l'accueil : le logo n'apparaît sur le noir qu'une fois par session (voir .cine-logo dans globals.css).
 * Le script en ligne (nonce CSP) s'exécute avant le premier affichage du hero, pour éviter tout flash.
 */
export function Intro({ nonce }: { nonce?: string }) {
  return (
    <>
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: "try{var k='bym-intro';if(sessionStorage.getItem(k))document.documentElement.classList.add('intro-seen');else sessionStorage.setItem(k,'1')}catch(e){document.documentElement.classList.add('intro-seen')}" }}
      />
      <IntroSeen />
    </>
  );
}
