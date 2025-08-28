"use server";

import { db } from "@/db";
import {
  students,
  enrollments,
  services,
  serviceValues,
  preReenrollments,
} from "@/db/schema";
import { and, asc, eq, sql } from "drizzle-orm";

// Tipos de apoio
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

export type PaymentDB = "one_sep" | "two_sep_oct";
export type PriceTier = "table" | "punctual" | "reenrollment";

export type GradeCountDTO = { grade: Grade; count: number };
export type StudentDTO = {
  id: number;
  name: string;
  guardianPhone: string;
  grade: Grade;
  serviceId?: number | null;
};
export type ServiceDTO = { id: number; key: ServiceKey; name: string };
export type ValueDTO = {
  id: number;
  listPriceCents: number;
  punctualPriceCents: number;
  reenrollPriceCents: number;
};

// 1) Lista turmas (grades) com contagem no ano
export async function fetchGradesWithStudents(
  year: number,
): Promise<GradeCountDTO[]> {
  const rows = await db
    .select({
      grade: enrollments.grade,
      count: sql<number>`count(*)::int`,
    })
    .from(enrollments)
    .where(eq(enrollments.year, year))
    .groupBy(enrollments.grade)
    .orderBy(asc(enrollments.grade));

  return rows.map((r) => ({ grade: r.grade as Grade, count: r.count }));
}

// 2) Alunos por turma no ano
export async function fetchStudentsByGrade(
  year: number,
  grade: Grade,
): Promise<StudentDTO[]> {
  const rows = await db
    .select({
      id: students.id,
      name: students.name,
      guardianPhone: students.guardianPhone,
      grade: enrollments.grade,
      serviceId: enrollments.serviceId,
    })
    .from(enrollments)
    .innerJoin(students, eq(students.id, enrollments.studentId))
    .where(and(eq(enrollments.year, year), eq(enrollments.grade, grade)))
    .orderBy(asc(students.name));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    guardianPhone: r.guardianPhone,
    grade: r.grade as Grade,
    serviceId: r.serviceId ?? null,
  }));
}

// 3) Serviços ativos
export async function fetchServices(): Promise<ServiceDTO[]> {
  const rows = await db
    .select({
      id: services.id,
      key: services.key,
      name: services.name,
    })
    .from(services)
    .where(eq(services.active, 1))
    .orderBy(asc(services.name));

  return rows as ServiceDTO[];
}

// 4) Valores (ano + série + serviço)
export async function fetchServiceValue(
  year: number,
  grade: Grade,
  serviceId: number,
): Promise<ValueDTO | null> {
  const row = await db
    .select({
      id: serviceValues.id,
      listPriceCents: serviceValues.listPriceCents,
      punctualPriceCents: serviceValues.punctualPriceCents,
      reenrollPriceCents: serviceValues.reenrollPriceCents,
    })
    .from(serviceValues)
    .where(
      and(
        eq(serviceValues.year, year),
        eq(serviceValues.grade, grade),
        eq(serviceValues.serviceId, serviceId),
      ),
    )
    .limit(1);

  return row.length ? (row[0] as ValueDTO) : null;
}

// 5) Criar pré-rematrícula
export async function createPreReenrollment(input: {
  studentId: number;
  currentYear: number;
  currentGrade: Grade;
  nextYear: number;
  nextGrade: Grade;
  serviceId: number;
  valueId: number | null;
  priceTier: PriceTier; // "reenrollment"
  appliedPriceCents: number | null;
  paymentOption: PaymentDB; // "one_sep" | "two_sep_oct"
}): Promise<{ ok: boolean; id?: number }> {
  const [row] = await db
    .insert(preReenrollments)
    .values({
      studentId: input.studentId,
      currentYear: input.currentYear,
      currentGrade: input.currentGrade,
      nextYear: input.nextYear,
      nextGrade: input.nextGrade,
      serviceId: input.serviceId,
      valueId: input.valueId,
      priceTier: input.priceTier,
      appliedPriceCents: input.appliedPriceCents,
      paymentOption: input.paymentOption,
    })
    .returning({ id: preReenrollments.id });

  return { ok: true, id: row?.id };
}

export async function fetchPreReenrolledIds(nextYear: number) {
  const rows = await db
    .select({ studentId: preReenrollments.studentId })
    .from(preReenrollments)
    .where(eq(preReenrollments.nextYear, nextYear));
  return rows.map((r) => r.studentId);
}
