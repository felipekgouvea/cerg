// src/app/actions/get-pre-registrations.ts
"use server";

import { db } from "@/db";
import { preRegistrations, services } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import type {
  Grade,
  PaymentUI,
  PreStatus,
} from "@/lib/validation/pre-registration";

export type ServiceKey =
  | "integral"
  | "meio_periodo"
  | "infantil_vespertino"
  | "fundamental_vespertino";

export interface PreRegistrationRow {
  id: number;
  studentName: string;
  birthDate: string; // "YYYY-MM-DD"
  guardianName: string;
  guardianPhone: string;
  grade: Grade; // targetGrade
  service: ServiceKey | null; // join ↔ services.key
  paymentOption: PaymentUI | null;
  createdAt: string; // ISO
  status: PreStatus;
}

function toYMD(d: Date | string): string {
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const date = new Date(d);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function toISO(d: Date | string): string {
  const date = new Date(d);
  return date.toISOString();
}

export async function getPreRegistrations(): Promise<PreRegistrationRow[]> {
  const rows = await db
    .select({
      id: preRegistrations.id,
      studentName: preRegistrations.studentName,
      birthDate: preRegistrations.birthDate,
      guardianName: preRegistrations.guardianName,
      guardianPhone: preRegistrations.guardianPhone,
      grade: preRegistrations.targetGrade,
      paymentOption: preRegistrations.paymentOption,
      createdAt: preRegistrations.createdAt,
      status: preRegistrations.status,
      serviceKey: services.key,
    })
    .from(preRegistrations)
    .leftJoin(services, eq(preRegistrations.serviceId, services.id))
    .orderBy(asc(preRegistrations.studentName));

  return rows.map((r) => {
    const paymentUI: PaymentUI | null =
      r.paymentOption === "one_sep"
        ? "one_oct"
        : r.paymentOption === "two_sep_oct"
          ? "two_sep_oct"
          : null;

    return {
      id: r.id as number,
      studentName: r.studentName,
      birthDate: toYMD(r.birthDate as any),
      guardianName: r.guardianName,
      guardianPhone: r.guardianPhone,
      grade: r.grade as Grade,
      service: (r.serviceKey as ServiceKey) ?? null,
      paymentOption: paymentUI,
      createdAt: toISO(r.createdAt as any),
      status: (r.status as PreStatus) ?? "realizada",
    };
  });
}
