import "server-only";
import { NextResponse } from "next/server";

/** Lit un corps JSON en refusant les charges trop lourdes (protection contre les abus). */
export async function readJson(req: Request, maxBytes = 32_000): Promise<unknown> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > maxBytes) throw new PayloadError(413);
  const text = await req.text();
  if (text.length > maxBytes) throw new PayloadError(413);
  try {
    return JSON.parse(text);
  } catch {
    throw new PayloadError(400);
  }
}

export class PayloadError extends Error {
  constructor(public status: 400 | 413) {
    super(status === 413 ? "Requête trop volumineuse." : "Requête invalide.");
  }
}

export function json(data: unknown, init?: number | ResponseInit) {
  const res = NextResponse.json(data, typeof init === "number" ? { status: init } : init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export function ipFrom(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Refuse les requêtes d'écriture venant d'une autre origine (en plus de sameSite et des en-têtes Fetch Metadata). */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  try {
    return new URL(origin).host === new URL(req.url).host || origin === process.env.NEXT_PUBLIC_APP_URL;
  } catch {
    return false;
  }
}
