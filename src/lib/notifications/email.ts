import "server-only";
import { env } from "@/lib/env";
import { formatPrice } from "@/lib/money";
import { formatParisDateTime } from "@/lib/schedule";
import type { OrderView } from "@/features/orders/service";

/**
 * Email de confirmation de commande. Prestataire : Resend (API HTTP) si RESEND_API_KEY est défini.
 * Un échec d'envoi ne bloque jamais la commande.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(msg: EmailMessage): Promise<boolean> {
  const e = env();
  if (!e.RESEND_API_KEY || !e.EMAIL_FROM) {
    console.info(`[email] non configuré — « ${msg.subject} » non envoyé à ${msg.to}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${e.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: e.EMAIL_FROM, to: msg.to, subject: msg.subject, text: msg.text, html: msg.html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error("[email] refus du prestataire", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (err) {
    console.error("[email] envoi impossible", err);
    return false;
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function orderConfirmationEmail(order: OrderView, trackingUrl: string, address: string): EmailMessage {
  const when = formatParisDateTime(order.requestedTime);
  const lines = order.items.map((i) => {
    const opts = [...i.modifiers.map((m) => m.name), ...i.removedIngredients.map((r) => `sans ${r.toLowerCase()}`)].join(", ");
    return { label: `${i.quantity} × ${i.productName}${opts ? ` (${opts})` : ""}`, price: formatPrice(i.lineTotalCents) };
  });
  const paid = order.paymentStatus === "paid" ? "Payée en ligne" : order.paymentStatus === "authorized" ? "Montant réservé sur votre carte, débité à l’acceptation" : "À régler au retrait";
  const text = [
    `Merci ${order.customerFirstName} !`,
    `Votre commande ${order.orderNumber} est bien reçue. La cuisine la valide dans un instant : suivez son avancement en direct.`,
    `Retrait : ${when}`,
    `Adresse : ${address}`,
    "",
    ...lines.map((l) => `${l.label} — ${l.price}`),
    "",
    `Total : ${formatPrice(order.totalCents)} (${paid})`,
    `Suivi : ${trackingUrl}`,
  ].join("\n");
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#F1EADF;font-family:Arial,Helvetica,sans-serif;color:#0A0A0A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#F8F4EC;border:1px solid #DDD2C1">
<tr><td style="background:#0A0A0A;color:#F1EADF;padding:24px 28px;font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:26px;letter-spacing:1px">BURGER <span style="font-family:Georgia,serif;font-style:italic;letter-spacing:0">by M</span></td></tr>
<tr><td style="padding:28px">
<p style="margin:0 0 6px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#A9620E">Commande reçue</p>
<h1 style="margin:0 0 10px;font-family:Georgia,serif;font-size:30px;font-weight:normal;font-style:italic">Merci, ${esc(order.customerFirstName)}.</h1>
<p style="margin:0 0 18px;color:#6B6155">La cuisine valide votre commande dans un instant. Suivez son avancement en direct et présentez votre numéro au comptoir.</p>
<p style="margin:0 0 4px;font-size:22px">Commande <strong>${esc(order.orderNumber)}</strong></p>
<p style="margin:0 0 4px">Retrait : <strong>${esc(when)}</strong></p>
<p style="margin:0 0 20px">${esc(address)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #DDD2C1">
${lines.map((l) => `<tr><td style="padding:10px 0;border-bottom:1px solid #DDD2C1">${esc(l.label)}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #DDD2C1;white-space:nowrap">${esc(l.price)}</td></tr>`).join("")}
<tr><td style="padding:14px 0;font-weight:bold">Total — ${esc(paid)}</td><td align="right" style="padding:14px 0;font-weight:bold">${esc(formatPrice(order.totalCents))}</td></tr>
</table>
<p style="margin:24px 0 0"><a href="${esc(trackingUrl)}" style="display:inline-block;background:#0A0A0A;color:#F1EADF;padding:14px 22px;text-decoration:none;font-size:13px;letter-spacing:1px;text-transform:uppercase">Suivre ma commande</a></p>
</td></tr></table></td></tr></table></body></html>`;
  return { to: order.customerEmail ?? "", subject: `Burger By M — commande ${order.orderNumber} reçue`, text, html };
}
