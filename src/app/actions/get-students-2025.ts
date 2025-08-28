// app/actions/get-students-2025.ts
"use server";

import { db } from "@/db";
import { students, enrollments } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export type Grade =
  | "MATERNAL_3"
  | "PRE_I_4"
  | "PRE_II_5"
  | "ANO_1"
  | "ANO_2"
  | "ANO_3"
  | "ANO_4"
  | "ANO_5";

export type StudentsByGrade = Record<Grade, { id: number; name: string }[]>;

const GRADES_ALL = [
  "MATERNAL_3",
  "PRE_I_4",
  "PRE_II_5",
  "ANO_1",
  "ANO_2",
  "ANO_3",
  "ANO_4",
  "ANO_5",
] as const;

const isGrade = (x: unknown): x is Grade =>
  typeof x === "string" && (GRADES_ALL as readonly string[]).includes(x);

/**
 * Retorna um índice dos alunos matriculados em 2025, agrupados por série.
 * Fonte: tabela `enrollments` (year=2025) + join com `students`.
 */
export async function getStudents2025Index(): Promise<StudentsByGrade> {
  const rows = await db
    .select({
      id: students.id,
      name: students.name,
      grade: enrollments.grade, // enum grade_enum no BD
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .where(eq(enrollments.year, 2025))
    .orderBy(asc(enrollments.grade), asc(students.name));

  const base: StudentsByGrade = {
    MATERNAL_3: [],
    PRE_I_4: [],
    PRE_II_5: [],
    ANO_1: [],
    ANO_2: [],
    ANO_3: [],
    ANO_4: [],
    ANO_5: [],
  };

  for (const r of rows) {
    const g = String(r.grade);
    if (isGrade(g)) {
      base[g].push({ id: r.id, name: r.name });
    }
  }

  return base;
}
