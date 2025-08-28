"use server";

import { db } from "@/db";
import { preReenrollments, students, services } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

export type PreEnrollmentRow = {
  id: number;
  studentName: string;
  birthDate: string; // "YYYY-MM-DD"
  guardianName: string;
  guardianPhone: string;
  service:
    | "integral"
    | "meio_periodo"
    | "infantil_vespertino"
    | "fundamental_vespertino";
  grade:
    | "MATERNAL_3"
    | "PRE_I_4"
    | "PRE_II_5"
    | "ANO_1"
    | "ANO_2"
    | "ANO_3"
    | "ANO_4"
    | "ANO_5";
  paymentOption: "one_oct" | "two_sep_oct";
  status: "realizada" | "em_conversas" | "finalizado" | "cancelado";
  createdAt: string; // ISO
};

function toYMD(d: Date | string): string {
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getPreEnrollments(): Promise<PreEnrollmentRow[]> {
  noStore();

  const rows = await db
    .select({
      id: preReenrollments.id,
      studentName: students.name,
      birthDate: students.birthDate,
      guardianName: students.guardianName,
      guardianPhone: students.guardianPhone,
      grade: preReenrollments.nextGrade,
      serviceKey: services.key,
      paymentOptionDb: preReenrollments.paymentOption, // "one_sep" | "two_sep_oct" | null
      status: preReenrollments.status,
      createdAt: preReenrollments.createdAt,
    })
    .from(preReenrollments)
    .innerJoin(students, eq(preReenrollments.studentId, students.id))
    .leftJoin(services, eq(preReenrollments.serviceId, services.id))
    .orderBy(asc(preReenrollments.createdAt));

  return rows.map((r) => ({
    id: r.id,
    studentName: r.studentName,
    birthDate: toYMD(r.birthDate as any),
    guardianName: r.guardianName,
    guardianPhone: r.guardianPhone,
    service: (r.serviceKey ?? "integral") as PreEnrollmentRow["service"],
    grade: r.grade as PreEnrollmentRow["grade"],
    paymentOption:
      (r.paymentOptionDb === "one_sep" ? "one_oct" : r.paymentOptionDb) ??
      "two_sep_oct",
    status: r.status as PreEnrollmentRow["status"],
    createdAt:
      r.createdAt instanceof Date
        ? r.createdAt.toISOString()
        : new Date(r.createdAt as any).toISOString(),
  }));
}
