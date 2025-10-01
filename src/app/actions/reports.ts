"use server";

import { db } from "@/db";
import {
  preRegistrations,
  preReenrollments,
  services,
  students,
} from "@/db/schema";
import { and, eq, gte, lte, SQL } from "drizzle-orm";

/** ===== Tipos base ===== */
export type Grade =
  | "MATERNAL_3"
  | "PRE_I_4"
  | "PRE_II_5"
  | "ANO_1"
  | "ANO_2"
  | "ANO_3"
  | "ANO_4"
  | "ANO_5";

export type ServiceKey =
  | "integral"
  | "meio_periodo"
  | "infantil_vespertino"
  | "fundamental_vespertino";

export type PreStatus =
  | "realizada"
  | "em_conversas"
  | "finalizado"
  | "cancelado";
export type PaymentUI = "one_oct" | "two_sep_oct";
export type ReportDataset = "registration" | "reenrollment";

/** ===== Filtros com "ALL" ===== */
export type GradeFilter = Grade | "ALL";
export type ServiceFilter = ServiceKey | "ALL";
export type StatusFilter = PreStatus | "ALL";
export type PaymentFilter = PaymentUI | "ALL";

export type ReportFilters = {
  dataset: ReportDataset;
  grade: GradeFilter;
  service: ServiceFilter;
  status: StatusFilter;
  payment: PaymentFilter;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
};

/** ===== Linha de relatório unificada ===== */
export type ReportRow = {
  dataset: ReportDataset;

  id: number;
  studentName: string;
  guardianName: string;
  guardianPhone: string;

  // registration
  targetYear?: number | null;
  targetGrade?: Grade | null;

  // reenrollment
  currentYear?: number | null;
  currentGrade?: Grade | null;
  nextYear?: number | null;
  nextGrade?: Grade | null;

  // comuns
  service: ServiceKey | null; // via join services.key
  paymentOption: PaymentUI | null;
  status: PreStatus | null;
  createdAt: string; // ISO string
};

/** ===== Helpers ===== */
function endOfDay(dateStr: string) {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d;
}

function toISO(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString();
}

function mapPaymentDBtoUI(
  db?: "one_sep" | "two_sep_oct" | null,
): PaymentUI | null {
  if (!db) return null;
  return db === "one_sep" ? "one_oct" : "two_sep_oct";
}

/** ===== Server Action principal =====
 *  Aceita `undefined|null` e aplica defaults → resolve o erro 500.
 */
export async function fetchReportRows(
  input?: Partial<ReportFilters> | null,
): Promise<ReportRow[]> {
  const filters: ReportFilters = {
    dataset: input?.dataset ?? "reenrollment",
    grade: (input?.grade as GradeFilter) ?? "ALL",
    service: (input?.service as ServiceFilter) ?? "ALL",
    status: (input?.status as StatusFilter) ?? "ALL",
    payment: (input?.payment as PaymentFilter) ?? "ALL",
    from: input?.from,
    to: input?.to,
  };

  const { dataset, grade, service, status, payment, from, to } = filters;

  /** -------- Pré-Matrículas (novos) -------- */
  if (dataset === "registration") {
    const conds: SQL[] = [];
    if (grade !== "ALL") conds.push(eq(preRegistrations.targetGrade, grade));
    if (from) conds.push(gte(preRegistrations.createdAt, new Date(from)));
    if (to) conds.push(lte(preRegistrations.createdAt, endOfDay(to)));

    const rows = await db
      .select({
        id: preRegistrations.id,
        studentName: preRegistrations.studentName,
        guardianName: preRegistrations.guardianName,
        guardianPhone: preRegistrations.guardianPhone,
        targetYear: preRegistrations.targetYear,
        targetGrade: preRegistrations.targetGrade,
        paymentDB: preRegistrations.paymentOption,
        // se sua tabela tem a coluna `status`, mantenha a linha abaixo;
        // se não tiver, ela vira sempre null
        status: (preRegistrations as any).status,
        createdAt: preRegistrations.createdAt,
        serviceKey: services.key,
      })
      .from(preRegistrations)
      .leftJoin(services, eq(preRegistrations.serviceId, services.id))
      .where(conds.length ? and(...conds) : undefined);

    const mapped: ReportRow[] = rows.map((r) => ({
      dataset: "registration",
      id: Number(r.id),
      studentName: r.studentName,
      guardianName: r.guardianName,
      guardianPhone: r.guardianPhone,
      targetYear: r.targetYear,
      targetGrade: r.targetGrade as Grade,
      currentYear: null,
      currentGrade: null,
      nextYear: null,
      nextGrade: null,
      service: (r.serviceKey as ServiceKey) ?? null,
      paymentOption: mapPaymentDBtoUI(r.paymentDB),
      status: (r.status as PreStatus) ?? null,
      createdAt: toISO(r.createdAt as any),
    }));

    // filtros restantes (service/status/payment) aplicados em memória
    return mapped.filter((row) => {
      if (service !== "ALL" && row.service !== service) return false;
      if (status !== "ALL" && row.status !== status) return false;
      if (payment !== "ALL" && row.paymentOption !== payment) return false;
      return true;
    });
  }

  /** -------- Pré-Rematrículas (da casa) -------- */
  const conds: SQL[] = [];
  if (grade !== "ALL") conds.push(eq(preReenrollments.nextGrade, grade));
  if (from) conds.push(gte(preReenrollments.createdAt, new Date(from)));
  if (to) conds.push(lte(preReenrollments.createdAt, endOfDay(to)));

  const rows = await db
    .select({
      id: preReenrollments.id,
      currentYear: preReenrollments.currentYear,
      currentGrade: preReenrollments.currentGrade,
      nextYear: preReenrollments.nextYear,
      nextGrade: preReenrollments.nextGrade,
      paymentDB: preReenrollments.paymentOption,
      status: (preReenrollments as any).status, // se inexistente, vira null
      createdAt: preReenrollments.createdAt,

      // Dados do aluno via join com students
      studentName: students.name,
      guardianName: students.guardianName,
      guardianPhone: students.guardianPhone,

      serviceKey: services.key,
    })
    .from(preReenrollments)
    .leftJoin(services, eq(preReenrollments.serviceId, services.id))
    .innerJoin(students, eq(preReenrollments.studentId, students.id))
    .where(conds.length ? and(...conds) : undefined);

  const mapped: ReportRow[] = rows.map((r) => ({
    dataset: "reenrollment",
    id: Number(r.id),
    studentName: r.studentName as string,
    guardianName: r.guardianName as string,
    guardianPhone: r.guardianPhone as string,
    targetYear: null,
    targetGrade: null,
    currentYear: r.currentYear,
    currentGrade: r.currentGrade as Grade,
    nextYear: r.nextYear,
    nextGrade: r.nextGrade as Grade,
    service: (r.serviceKey as ServiceKey) ?? null,
    paymentOption: mapPaymentDBtoUI(r.paymentDB),
    status: (r.status as PreStatus) ?? null,
    createdAt: toISO(r.createdAt as any),
  }));

  return mapped.filter((row) => {
    if (service !== "ALL" && row.service !== service) return false;
    if (status !== "ALL" && row.status !== status) return false;
    if (payment !== "ALL" && row.paymentOption !== payment) return false;
    return true;
  });
}
