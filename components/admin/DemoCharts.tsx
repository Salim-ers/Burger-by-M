"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DEMO_ANALYTICS } from "@/data/mock-analytics";
import { formatPrice } from "@/lib/currency";

const axis = { fill: "rgba(242,239,231,0.5)", fontSize: 12 };

export default function DemoCharts() {
  return (
    <div className="grid gap-5 xl:grid-cols-5">
      <figure className="rounded-sm border border-edge bg-panel p-5 xl:col-span-3">
        <figcaption className="mb-4 text-sm font-semibold">Chiffre d’affaires — 7 derniers jours</figcaption>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEMO_ANALYTICS.week.map((d) => ({ ...d, euros: d.revenue / 100 }))}>
              <CartesianGrid stroke="rgba(242,239,231,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} width={44} />
              <Tooltip
                cursor={{ fill: "rgba(242,239,231,0.05)" }}
                contentStyle={{ background: "#151515", border: "1px solid #272727", borderRadius: 2, color: "#f2efe7" }}
                formatter={(v) => [formatPrice(Number(v) * 100), "CA"]}
              />
              <Bar dataKey="euros" fill="#f0a21a" radius={[1, 1, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>
      <figure className="rounded-sm border border-edge bg-panel p-5 xl:col-span-2">
        <figcaption className="mb-4 text-sm font-semibold">Produits les plus vendus</figcaption>
        <ol className="space-y-3">
          {DEMO_ANALYTICS.topProducts.map((p) => {
            const max = DEMO_ANALYTICS.topProducts[0]!.qty;
            return (
              <li key={p.name}>
                <div className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-bone/60 tabular-nums">{p.qty}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-sm bg-bone/10">
                  <div className="h-full rounded-sm bg-cheddar" style={{ width: `${(p.qty / max) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ol>
      </figure>
    </div>
  );
}
