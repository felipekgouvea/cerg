// src/app/actions/get-dashboard-students.ts
"use server";

import { db } from "@/db";
import {
  preRegistrations,
  preReenrollments,
  services,
  students,
} from "@/db/schema";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import type { MetricsMode } from "./get-dashboard-metrics";

type StudentRow = {
  id: number;
  studentName: string;
  guardianName: string;
  grade: string; // chave (ex.: 'PRE_I_4')
  service: string; // chave (ex.: 'integral' | '—')
  createdAt: Date;
};

function endOfDay(dateStr: string) {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getDashboardStudents(params: {
  from?: string;
  to?: string;
  mode: MetricsMode; // "registration" | "enrollment"
}): Promise<StudentRow[]> {
  const { from, to, mode } = params;

  if (mode === "registration") {
    const conds: any[] = [];
    if (from) conds.push(gte(preRegistrations.createdAt, new Date(from)));
    if (to) conds.push(lte(preRegistrations.createdAt, endOfDay(to)));

    const rows = await db
      .select({
        id: preRegistrations.id,
        studentName: preRegistrations.studentName,
        guardianName: preRegistrations.guardianName,
        grade: preRegistrations.targetGrade,
        service: services.key,
        createdAt: preRegistrations.createdAt,
      })
      .from(preRegistrations)
      .leftJoin(services, eq(preRegistrations.serviceId, services.id))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(
        asc(preRegistrations.targetGrade),
        asc(services.key),
        asc(preRegistrations.studentName),
      );

    return rows.map((r) => ({
      id: r.id as number,
      studentName: r.studentName,
      guardianName: r.guardianName,
      grade: r.grade ?? "—",
      service: r.service ?? "—",
      createdAt: r.createdAt as Date,
    }));
  }

  // enrollment: junta com students para obter nomes
  const conds2: any[] = [];
  if (from) conds2.push(gte(preReenrollments.createdAt, new Date(from)));
  if (to) conds2.push(lte(preReenrollments.createdAt, endOfDay(to)));

  const rows2 = await db
    .select({
      id: preReenrollments.id,
      studentName: students.name,
      guardianName: students.guardianName,
      grade: preReenrollments.nextGrade,
      service: services.key,
      createdAt: preReenrollments.createdAt,
    })
    .from(preReenrollments)
    .leftJoin(students, eq(preReenrollments.studentId, students.id))
    .leftJoin(services, eq(preReenrollments.serviceId, services.id))
    .where(conds2.length ? and(...conds2) : undefined)
    .orderBy(
      asc(preReenrollments.nextGrade),
      asc(services.key),
      asc(students.name),
    );

  return rows2.map((r) => ({
    id: r.id as number,
    studentName: r.studentName ?? "—",
    guardianName: r.guardianName ?? "—",
    grade: r.grade ?? "—",
    service: r.service ?? "—",
    createdAt: r.createdAt as Date,
  }));
}
