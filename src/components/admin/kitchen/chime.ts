"use client";

/**
 * Sons de l'écran cuisine, synthétisés (Web Audio) : aucun fichier, fonctionne hors ligne.
 * Jamais joués avant un geste explicite (DÉMARRER LE SERVICE) : les navigateurs l'interdisent, et c'est voulu.
 */
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

export function audioReady() {
  return ctx !== null && ctx.state === "running";
}

function note(freq: number, start: number, length: number, peak: number) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + length + 0.05);
}

/** Nouvelle commande : deux notes claires (sol5 puis ré6), répétées — audible dans une cuisine bruyante. */
export function playChime() {
  if (!ctx) return;
  const t0 = ctx.currentTime + 0.02;
  [0, 0.55].forEach((offset) => [784, 1175].forEach((freq, i) => note(freq, t0 + offset + i * 0.16, 0.5, 0.5)));
}

/** Confirmation discrète au démarrage du service (vérifie que le son passe). */
export function playTick() {
  if (!ctx) return;
  note(1175, ctx.currentTime + 0.02, 0.25, 0.18);
}
