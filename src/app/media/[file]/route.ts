import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { mediaAssets } from "@/db/schema";

export const dynamic = "force-dynamic";

/** Photos téléversées depuis l'administration : /media/<uuid>.webp (contenu immuable). */
export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const m = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.webp$/.exec(file);
  if (!m) return new Response("Introuvable", { status: 404 });
  const [asset] = await getDb().select().from(mediaAssets).where(eq(mediaAssets.id, m[1]!)).limit(1);
  if (!asset) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(asset.data), {
    headers: {
      "Content-Type": asset.contentType,
      "Content-Length": String(asset.byteSize),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
