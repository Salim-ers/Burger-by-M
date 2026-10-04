"use client";

/** Dernier filet de sécurité (erreur dans la mise en page racine) : HTML autonome, styles en ligne. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#f4efe6", color: "#0d0d0d", fontFamily: "Georgia, 'Times New Roman', serif" }}>
        <main style={{ padding: "2rem", maxWidth: 560 }}>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", color: "#9c7f47" }}>Burger By M</p>
          <h1 style={{ fontSize: "clamp(2.4rem, 7vw, 4rem)", lineHeight: 0.95, margin: "1rem 0" }}>Le site fait une courte pause.</h1>
          <p style={{ fontFamily: "system-ui, sans-serif", color: "#6e655a", lineHeight: 1.6 }}>Réessayez dans un instant, ou appelez le restaurant au 03 44 24 89 18.</p>
          <button type="button" onClick={reset} style={{ marginTop: "1.5rem", height: 52, padding: "0 28px", border: 0, background: "#0d0d0d", color: "#f4efe6", fontFamily: "system-ui, sans-serif", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", fontSize: 12, cursor: "pointer" }}>
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
