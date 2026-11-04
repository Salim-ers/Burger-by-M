/**
 * Génération contrôlée des visuels (API d'images OpenAI) — à lancer à la main, en développement.
 * Jamais appelé par le site : ni au build, ni à l'exécution, ni à la visite d'une page.
 *
 * La clé est lue dans OPENAI_API_KEY (.env.local, non versionné). Elle n'est jamais écrite ni affichée,
 * et n'a pas besoin d'être déclarée sur Vercel.
 *
 *   npm run media:generate -- --list
 *   npm run media:generate -- --only hero-desktop,plancha --draft   basse définition, pour juger le cadrage
 *   npm run media:generate -- --only hero-desktop                   version finale, retenue automatiquement
 *   npm run media:generate -- --only hero-desktop --refine          reprend le cadrage retenu en pleine définition
 *   npm run media:generate -- --select hero-desktop=<fichier>       retient une autre version
 *
 * Sorties : assets/generated/<id>/… (finales), assets/generated/_drafts/… (ignorées par Git).
 * Chaque version est tracée dans assets/generated/manifest.json : modèle, prompt, références, statut.
 * Les versions existantes ne sont jamais écrasées. Publication web : npm run media:publish.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { request } from "node:https";
import { briefs } from "./image-briefs.mjs";

const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-sunburst";
const ROOT = "assets/generated";
const MANIFEST = join(ROOT, "manifest.json");

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

function loadManifest() {
  if (!existsSync(MANIFEST)) {
    return {
      _notice: "Créations générées via l'API d'images OpenAI. Ce ne sont pas des photos du restaurant : à faire valider avant publication, jamais à présenter comme contractuelles.",
      assets: {},
    };
  }
  return JSON.parse(readFileSync(MANIFEST, "utf8"));
}
function saveManifest(m) {
  mkdirSync(ROOT, { recursive: true });
  writeFileSync(MANIFEST, `${JSON.stringify(m, null, 2)}\n`);
}

const manifest = loadManifest();

if (flag("list")) {
  for (const [id, b] of Object.entries(briefs)) {
    const a = manifest.assets[id];
    console.log(`${id.padEnd(26)} ${b.size.padEnd(10)} ${a?.selected ?? "(aucune version retenue)"}`);
  }
  process.exit(0);
}

const selection = option("select");
if (selection) {
  const [id, file] = selection.split("=");
  if (!briefs[id] || !file || !existsSync(file)) throw new Error(`--select : brief ou fichier introuvable (${selection}).`);
  manifest.assets[id] = { ...manifest.assets[id], usage: briefs[id].usage, status: "à valider", selected: file.replaceAll("\\", "/") };
  saveManifest(manifest);
  console.log(`${id} → ${file}`);
  process.exit(0);
}

try {
  process.loadEnvFile(".env.local");
} catch {
  // Variable éventuellement fournie directement par l'environnement.
}
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY absente : ajoutez-la à .env.local (fichier non versionné).");
  process.exit(1);
}

const only = option("only")?.split(",").map((s) => s.trim()).filter(Boolean);
if (!only?.length) {
  console.error(`Précisez les visuels à générer : --only ${Object.keys(briefs).join(",")}`);
  process.exit(1);
}
for (const id of only) if (!briefs[id]) throw new Error(`Brief inconnu : ${id}`);

const draft = flag("draft");
const quality = option("quality") ?? (draft ? "medium" : "high");
const MIME = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

function resolveRef(ref) {
  if (typeof ref === "string") return ref;
  const selected = manifest.assets[ref.asset]?.selected;
  if (!selected) throw new Error(`Référence « ${ref.asset} » sans version retenue : générez-la d'abord.`);
  return selected;
}

/** Appel HTTPS sans délai d'attente imposé par fetch : une image 4K peut prendre plusieurs minutes. */
function post(path, headers, body) {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: "api.openai.com", path, method: "POST", headers: { Authorization: `Bearer ${apiKey}`, ...headers }, timeout: 900_000 }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          return reject(new Error(`Réponse illisible (HTTP ${res.statusCode}).`));
        }
        if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode} : ${json.error?.code ?? ""} ${json.error?.message ?? ""}`));
        resolve(json);
      });
    });
    req.on("timeout", () => req.destroy(new Error("Délai dépassé.")));
    req.on("error", reject);
    req.end(body);
  });
}

function multipart(fields, files) {
  const boundary = `----bym${Date.now().toString(16)}`;
  const parts = [];
  for (const [name, value] of Object.entries(fields)) {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
  }
  for (const path of files) {
    const type = MIME[extname(path).toLowerCase()] ?? "application/octet-stream";
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="${basename(path)}"\r\nContent-Type: ${type}\r\n\r\n`));
    parts.push(readFileSync(path));
    parts.push(Buffer.from("\r\n"));
  }
  parts.push(Buffer.from(`--${boundary}--\r\n`));
  return { body: Buffer.concat(parts), contentType: `multipart/form-data; boundary=${boundary}` };
}

async function generate(id) {
  const brief = briefs[id];
  const size = draft ? brief.draftSize : brief.size;
  const approved = flag("refine") ? manifest.assets[id]?.selected : null;
  if (flag("refine") && !approved) throw new Error(`${id} : --refine exige une version retenue.`);
  const base = approved
    ? `The FIRST attached image is the approved composition. Reproduce this exact composition, framing, objects and lighting at much higher resolution, with finer natural detail. The other attached images are the references below, numbered from 1 in order, used only to stay faithful to the real products.\n\n${brief.prompt}`
    : brief.prompt;
  const prompt = option("note") ? `${base}\n\nDirector's note: ${option("note")}` : base;
  const refs = [...(approved ? [approved] : []), ...(brief.refs ?? []).map(resolveRef).filter((r) => r !== approved)];
  const fields = { model: MODEL, prompt, size, quality, output_format: "webp", output_compression: "95", n: "1" };
  const started = Date.now();
  console.log(`[${id}] ${MODEL} ${size} ${quality} — ${refs.length} référence(s)…`);

  let res;
  if (refs.length) {
    const { body, contentType } = multipart(fields, refs);
    res = await post("/v1/images/edits", { "Content-Type": contentType, "Content-Length": body.length }, body);
  } else {
    const body = Buffer.from(JSON.stringify({ ...fields, output_compression: 95, n: 1 }));
    res = await post("/v1/images/generations", { "Content-Type": "application/json", "Content-Length": body.length }, body);
  }

  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("Réponse sans image.");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
  const dir = draft ? join(ROOT, "_drafts") : join(ROOT, id);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${id}__genere-ia__${stamp}.webp`).replaceAll("\\", "/");
  if (existsSync(file)) throw new Error(`Version déjà présente : ${file}`);
  writeFileSync(file, Buffer.from(b64, "base64"));

  const seconds = Math.round((Date.now() - started) / 1000);
  console.log(`[${id}] ${file} (${seconds} s, ${res.usage?.total_tokens ?? "?"} tokens)`);

  const current = manifest.assets[id] ?? { versions: [] };
  manifest.assets[id] = {
    usage: brief.usage,
    status: "à valider",
    selected: draft && current.selected && !current.selected.includes("_drafts") ? current.selected : file,
    versions: [
      ...(current.versions ?? []),
      { file, generated: true, model: MODEL, size, quality, draft, references: refs, prompt, createdAt: new Date().toISOString(), usage: res.usage ?? null },
    ],
  };
  saveManifest(manifest);
  return file;
}

mkdirSync(dirname(MANIFEST), { recursive: true });
const results = await Promise.allSettled(only.map(generate));
let failed = 0;
for (const [i, r] of results.entries()) {
  if (r.status === "rejected") {
    failed++;
    console.error(`[${only[i]}] ÉCHEC : ${r.reason?.message ?? r.reason}`);
  }
}
process.exit(failed ? 1 : 0);
