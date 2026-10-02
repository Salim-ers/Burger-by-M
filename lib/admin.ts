/** Utilitaires du back-office. */

export function timeAgo(iso: string, now = Date.now()) {
  const min = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "à l’instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  return `il y a ${h} h${min % 60 ? ` ${min % 60}` : ""}`;
}

export function isToday(iso: string, now = new Date()) {
  const d = new Date(iso);
  return d.toDateString() === now.toDateString();
}

let ctx: AudioContext | null = null;
/** Signal sonore discret (Web Audio, aucun fichier). Désactivé par défaut dans les réglages. */
export function playOrderChime() {
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    [880, 1318.5].forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t + i * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.25, t + i * 0.16 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.16 + 0.5);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t + i * 0.16);
      osc.stop(t + i * 0.16 + 0.55);
    });
  } catch {
    /* audio indisponible : silencieux */
  }
}
