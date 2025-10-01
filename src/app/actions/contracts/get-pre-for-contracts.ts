"use server";

import { db } from "@/db";
import { preReenrollments, students, services, contracts } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

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

export type PreReOption = {
  id: number; // preReenrollment id
  studentId: number;
  studentName: string;
  grade: Grade;
  serviceId: number | null;
  serviceKey: ServiceKey | null;
  serviceName: string | null;
};

export async function getPreReOptions(year: number): Promise<PreReOption[]> {
  const rows = await db
    .select({
      id: preReenrollments.id,
      studentId: preReenrollments.studentId,
      studentName: students.name,
      grade: preReenrollments.nextGrade,
      serviceId: preReenrollments.serviceId,
      serviceKey: services.key,
      serviceName: services.name,
      contractId: contracts.id, // para excluir quem já tem contrato
    })
    .from(preReenrollments)
    .innerJoin(students, eq(preReenrollments.studentId, students.id))
    .leftJoin(services, eq(preReenrollments.serviceId, services.id))
    .leftJoin(
      contracts,
      and(
        eq(contracts.studentId, preReenrollments.studentId),
        eq(contracts.year, year),
      ),
    )
    .where(and(eq(preReenrollments.nextYear, year), isNull(contracts.id)));

  return rows.map((r) => ({
    id: r.id as number,
    studentId: r.studentId as number,
    studentName: r.studentName,
    grade: r.grade as Grade,
    serviceId: (r.serviceId as number) ?? null,
    serviceKey: (r.serviceKey as ServiceKey) ?? null,
    serviceName: r.serviceName ?? null,
  }));
}
