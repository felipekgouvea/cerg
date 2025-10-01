// src/app/actions/pre-payments.ts
"use server";

import { db } from "@/db";
import {
  preReenrollments,
  serviceValues,
  services,
  preReenrollInstallments,
  type PreReenrollment,
  type Service,
  type ServiceValue,
} from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

/* ========== Tipos públicos (UI) ========== */
export type Plan = "1_sep" | "1_oct" | "2_sep_oct" | "3_sep_oct_nov";

export type ServiceKey =
  | "integral"
  | "meio_periodo"
  | "infantil_vespertino"
  | "fundamental_vespertino";

export type Grade =
  | "MATERNAL_3"
  | "PRE_I_4"
  | "PRE_II_5"
  | "ANO_1"
  | "ANO_2"
  | "ANO_3"
  | "ANO_4"
  | "ANO_5";

export type PaymentRow = {
  id: number;
  dueDate: string; // "YYYY-MM-DD"
  amountCents: number;
  discountCents: number;
  paidAt: string | null; // ISO
  paidAmountCents: number | null;
};
export type PaymentInfo = {
  preId: number;
  studentId: number;
  studentName: string;
  nextYear: number; // ex. 2026
  nextGrade: Grade;
  serviceKey: ServiceKey | null;
  // valores
  reenrollCents: number; // vem do BD (service_values.reenrollPriceCents) ou fallback
  materialCents: number; // 15000 fixo
  totalCents: number; // reenroll + material
  monthlyFullCents: number | null; // opcional (apenas informativo)
};

/* ========== Constantes ========== */

// fallback quando não houver serviceValues.reenrollPriceCents
const REENROLL_FALLBACK_BY_SERVICE: Record<ServiceKey, number> = {
  infantil_vespertino: 50000,
  fundamental_vespertino: 60000,
  integral: 120000,
  meio_periodo: 90000,
};

// mensalidade cheia (informativa)
const MONTHLY_FULL_BY_SERVICE: Record<ServiceKey, number> = {
  infantil_vespertino: 55000,
  fundamental_vespertino: 65000,
  integral: 141000,
  meio_periodo: 102000,
};

const MATERIAL_COLETIVO_CENTS = 15000;

/* ========== Utils ========== */

function sumCents(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

function makeDateYMD(y: number, m: number, d: number) {
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function splitEven(total: number, parts: number): number[] {
  // distribui com arredondamento, jogando centavos restantes para as últimas parcelas
  const base = Math.floor(total / parts);
  const arr = Array(parts).fill(base);
  const rest = total - base * parts;
  for (let i = 0; i < rest; i++) arr[parts - 1 - i] += 1;
  return arr;
}

/* ========== Loader base dos dados do pré ========== */
export async function getPrePaymentInfo(
  preId: number,
): Promise<PaymentInfo | null> {
  const row = await db
    .select({
      id: preReenrollments.id,
      studentId: preReenrollments.studentId,
      nextYear: preReenrollments.nextYear,
      nextGrade: preReenrollments.nextGrade,
      serviceId: preReenrollments.serviceId,
      valueId: preReenrollments.valueId,
      studentName: services.name, // vamos trocar já já — não temos nome do aluno aqui
      serviceKey: services.key,
      svId: serviceValues.id,
      svReenroll: serviceValues.reenrollPriceCents,
    })
    .from(preReenrollments)
    .leftJoin(serviceValues, eq(preReenrollments.valueId, serviceValues.id))
    .leftJoin(services, eq(preReenrollments.serviceId, services.id))
    .where(eq(preReenrollments.id, preId))
    .limit(1);

  if (!row.length) return null;

  // ATENÇÃO: o schema de preReenrollments não tem studentName direto.
  // Busque o nome do aluno na tabela 'students' se quiser exibir o nome real.
  // Para não criar outro join pesado aqui, retornamos um placeholder e
  // você pode ajustar com um join em students se desejar.
  const serviceKey = (row[0].serviceKey ?? null) as ServiceKey | null;

  const reenrollCents =
    row[0].svReenroll ??
    (serviceKey ? REENROLL_FALLBACK_BY_SERVICE[serviceKey] : 0);

  const monthlyFullCents = serviceKey
    ? MONTHLY_FULL_BY_SERVICE[serviceKey]
    : null;

  const totalCents = reenrollCents + MATERIAL_COLETIVO_CENTS;

  return {
    preId,
    studentId: row[0].studentId,
    studentName: "Aluno (carregar do students)", // ajuste com join se quiser
    nextYear: row[0].nextYear,
    nextGrade: row[0].nextGrade as Grade,
    serviceKey,
    reenrollCents,
    materialCents: MATERIAL_COLETIVO_CENTS,
    totalCents,
    monthlyFullCents,
  };
}

/* ========== CRUD de parcelas ========== */

export async function listPreInstallments(
  preId: number,
): Promise<PaymentRow[]> {
  const rows = await db
    .select()
    .from(preReenrollInstallments)
    .where(eq(preReenrollInstallments.preReenrollmentId, preId))
    .orderBy(
      asc(preReenrollInstallments.dueDate),
      asc(preReenrollInstallments.id),
    );

  return rows.map((r) => ({
    id: r.id,
    dueDate: r.dueDate as string,
    amountCents: r.amountCents,
    discountCents: r.discountCents ?? 0,
    paidAt: r.paidAt ? new Date(r.paidAt).toISOString() : null,
    paidAmountCents: r.paidAmountCents ?? null,
  }));
}

export async function createPreInstallment(params: {
  preId: number;
  dueDate: string; // "YYYY-MM-DD"
  amountCents: number;
  discountCents?: number;
}) {
  await db.insert(preReenrollInstallments).values({
    preReenrollmentId: params.preId,
    dueDate: params.dueDate,
    amountCents: params.amountCents,
    discountCents: params.discountCents ?? 0,
  });
  return { success: true };
}

export async function updatePreInstallment(params: {
  id: number;
  dueDate?: string;
  amountCents?: number;
  discountCents?: number;
}) {
  await db
    .update(preReenrollInstallments)
    .set({
      ...(params.dueDate ? { dueDate: params.dueDate } : {}),
      ...(typeof params.amountCents === "number"
        ? { amountCents: params.amountCents }
        : {}),
      ...(typeof params.discountCents === "number"
        ? { discountCents: params.discountCents }
        : {}),
    })
    .where(eq(preReenrollInstallments.id, params.id));
  return { success: true };
}

export async function deletePreInstallment(id: number) {
  await db
    .delete(preReenrollInstallments)
    .where(eq(preReenrollInstallments.id, id));
  return { success: true };
}

export async function settlePreInstallment(params: {
  id: number;
  paidAt: string; // ISO ou "YYYY-MM-DD"
  paidAmountCents: number;
}) {
  await db
    .update(preReenrollInstallments)
    .set({
      paidAt: new Date(params.paidAt),
      paidAmountCents: params.paidAmountCents,
    })
    .where(eq(preReenrollInstallments.id, params.id));
  return { success: true };
}

/* ========== Gerador de parcelas por plano ========== */

export async function generatePreInstallments(params: {
  preId: number;
  plan: Plan;
  replace?: boolean; // default true (apaga e cria novamente)
}) {
  const info = await getPrePaymentInfo(params.preId);
  if (!info) return { success: false, error: "NOT_FOUND" };

  const { nextYear, totalCents } = info;
  const baseYear = nextYear - 1; // rematrícula em 2025

  let schedule: { dueDate: string; amountCents: number }[] = [];

  if (params.plan === "1_sep") {
    schedule = [
      { dueDate: makeDateYMD(baseYear, 9, 20), amountCents: totalCents },
    ];
  } else if (params.plan === "1_oct") {
    schedule = [
      { dueDate: makeDateYMD(baseYear, 10, 5), amountCents: totalCents },
    ];
  } else if (params.plan === "2_sep_oct") {
    const [a, b] = splitEven(totalCents, 2);
    schedule = [
      { dueDate: makeDateYMD(baseYear, 9, 20), amountCents: a },
      { dueDate: makeDateYMD(baseYear, 10, 5), amountCents: b },
    ];
  } else {
    const [a, b, c] = splitEven(totalCents, 3);
    schedule = [
      { dueDate: makeDateYMD(baseYear, 9, 20), amountCents: a },
      { dueDate: makeDateYMD(baseYear, 10, 5), amountCents: b },
      { dueDate: makeDateYMD(baseYear, 11, 5), amountCents: c },
    ];
  }

  // apaga anteriores se replace (default)
  if (params.replace !== false) {
    await db
      .delete(preReenrollInstallments)
      .where(eq(preReenrollInstallments.preReenrollmentId, params.preId));
  }

  // insere novas
  if (schedule.length) {
    await db.insert(preReenrollInstallments).values(
      schedule.map((s) => ({
        preReenrollmentId: params.preId,
        dueDate: s.dueDate,
        amountCents: s.amountCents,
        discountCents: 0,
      })),
    );
  }

  return { success: true };
}
