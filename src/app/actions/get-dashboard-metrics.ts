// src/app/actions/get-dashboard-metrics.ts
"use server";

import { db } from "@/db";
import { preRegistrations, preReenrollments, services } from "@/db/schema";
import { and, asc, eq, gte, lte } from "drizzle-orm";

export type MetricsMode = "registration" | "enrollment";
type KV = { key: string; value: number };

function endOfDay(dateStr: string) {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d;
}

// agrega em JS (mais simples que groupBy do Drizzle)
function bump(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}
function toKV(map: Record<string, number>): KV[] {
  return Object.keys(map).map((k) => ({ key: k, value: map[k] }));
}

export async function getDashboardMetrics(params: {
  from?: string;
  to?: string;
  mode: MetricsMode;
}) {
  const { from, to, mode } = params;

  if (mode === "registration") {
    const conds: any[] = [];
    if (from) conds.push(gte(preRegistrations.createdAt, new Date(from)));
    if (to) conds.push(lte(preRegistrations.createdAt, endOfDay(to)));

    const rows = await db
      .select({
        createdAt: preRegistrations.createdAt,
        grade: preRegistrations.targetGrade,
        paymentOption: preRegistrations.paymentOption, // 'one_sep' | 'two_sep_oct' | null
        serviceKey: services.key, // via join
      })
      .from(preRegistrations)
      .leftJoin(services, eq(preRegistrations.serviceId, services.id))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(asc(preRegistrations.targetGrade));

    const byGrade: Record<string, number> = {};
    const byService: Record<string, number> = {};
    const byPayment: Record<string, number> = {};
    const byMonth: Record<string, number> = {};

    for (const r of rows) {
      bump(byGrade, r.grade ?? "—");
      bump(byService, r.serviceKey ?? "—");

      // mapeia BD->UI para manter label existente
      const payKey =
        r.paymentOption === "one_sep" ? "one_oct" : (r.paymentOption ?? "—");
      bump(byPayment, payKey);

      const d = new Date(r.createdAt as any);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      bump(byMonth, ym);
    }

    return {
      total: rows.length,
      byGrade: toKV(byGrade),
      byService: toKV(byService),
      byPayment: toKV(byPayment),
      byMonth: toKV(byMonth),
    };
  }

  // enrollment (pré-rematrículas)
  const conds2: any[] = [];
  if (from) conds2.push(gte(preReenrollments.createdAt, new Date(from)));
  if (to) conds2.push(lte(preReenrollments.createdAt, endOfDay(to)));

  const rows2 = await db
    .select({
      createdAt: preReenrollments.createdAt,
      grade: preReenrollments.nextGrade, // exibir por turma futura (2026)
      paymentOption: preReenrollments.paymentOption,
      serviceKey: services.key,
    })
    .from(preReenrollments)
    .leftJoin(services, eq(preReenrollments.serviceId, services.id))
    .where(conds2.length ? and(...conds2) : undefined)
    .orderBy(asc(preReenrollments.nextGrade));

  const byGrade: Record<string, number> = {};
  const byService: Record<string, number> = {};
  const byPayment: Record<string, number> = {};
  const byMonth: Record<string, number> = {};

  for (const r of rows2) {
    bump(byGrade, r.grade ?? "—");
    bump(byService, r.serviceKey ?? "—");

    const payKey =
      r.paymentOption === "one_sep" ? "one_oct" : (r.paymentOption ?? "—");
    bump(byPayment, payKey);

    const d = new Date(r.createdAt as any);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    bump(byMonth, ym);
  }

  return {
    total: rows2.length,
    byGrade: toKV(byGrade),
    byService: toKV(byService),
    byPayment: toKV(byPayment),
    byMonth: toKV(byMonth),
  };
}
