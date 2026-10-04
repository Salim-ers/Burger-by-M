"use client";

/** Carillon synthétisé (Web Audio) : aucun fichier son, fonctionne hors ligne. */
let ctx: AudioContext | null = null;

/** À appeler dans un geste utilisateur (clic) : les navigateurs bloquent le son sinon. */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null;
  }
}

export function playChime() {
  if (!ctx) return;
  const t0 = ctx.currentTime + 0.02;
  // Deux notes claires (sol5 puis ré6), répétées : audible dans une cuisine bruyante.
  [0, 0.55].forEach((offset) => {
    [784, 1175].forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const start = t0 + offset + i * 0.16;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.5, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  });
}
