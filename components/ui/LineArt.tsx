/** Illustrations line-art maison (SVG, aucune image générée). */
export function BurgerLineArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className} aria-hidden>
      <path d="M24 58c0-24 25-40 56-40s56 16 56 40H24Z" />
      <path d="M56 32l2 3M78 26l1 3M100 31l-1 3M66 44l2 2M92 42l-2 3M116 46l-2 2M44 46l2 2" />
      <path d="M20 66c10 6 20-4 30 2s20-4 30 2 20-4 30 2 20-4 30 0" />
      <rect x="22" y="74" width="116" height="12" rx="6" />
      <path d="M26 92h108l-6 8c-2 3-6 5-10 5H42c-4 0-8-2-10-5l-6-8Z" />
    </svg>
  );
}

export function BagLineArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className} aria-hidden>
      <path d="M36 44h88l8 82H28l8-82Z" />
      <path d="M58 56V38a22 22 0 0 1 44 0v18" />
      <circle cx="80" cy="88" r="17" />
      <path d="M71 85h18M73 91h14" />
    </svg>
  );
}

export function ReceiptLineArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 160" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className} aria-hidden>
      <path d="M30 18h80v124l-10-7-10 7-10-7-10 7-10-7-10 7-10-7-10 7V18Z" />
      <path d="M46 46h48M46 62h36M46 78h44M46 104h20M80 104h14" />
    </svg>
  );
}
