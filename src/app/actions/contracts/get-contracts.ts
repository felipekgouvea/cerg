"use server";

import { db } from "@/db";
import { contracts, students, services } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export type ServiceKey =
  | "integral"
  | "meio_periodo"
  | "infantil_vespertino"
  | "fundamental_vespertino";

export type ContractRow = {
  id: number;
  year: number;
  status: "draft" | "active" | "completed" | "cancelled";
  studentId: number;
  studentName: string;
  guardianName: string;
  guardianPhone: string;
  serviceId: number | null;
  serviceKey: ServiceKey | null;
  serviceName: string | null;
};

export async function getContracts(year: number): Promise<ContractRow[]> {
  const rows = await db
    .select({
      id: contracts.id,
      year: contracts.year,
      status: contracts.status,
      studentId: contracts.studentId,
      studentName: students.name,
      guardianName: students.guardianName,
      guardianPhone: students.guardianPhone,
      serviceId: contracts.serviceId,
      serviceKey: services.key,
      serviceName: services.name,
    })
    .from(contracts)
    .innerJoin(students, eq(contracts.studentId, students.id))
    .leftJoin(services, eq(contracts.serviceId, services.id))
    .where(eq(contracts.year, year))
    .orderBy(asc(students.name));

  return rows as ContractRow[];
}
