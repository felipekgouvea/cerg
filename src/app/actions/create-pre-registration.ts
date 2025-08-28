"use server";

import { db } from "@/db";
import { preRegistrations, type NewPreRegistration } from "@/db/schema";
import {
  preRegistrationSchema,
  preStatusSchema,
  type PreRegistrationForm,
} from "@/lib/validation/pre-registration";
import { z } from "zod";

/* ================= Helpers ================= */

function stripMask(phone: string) {
  return phone.replace(/\D/g, "");
}

// UI -> BD
type PaymentDB = "one_sep" | "two_sep_oct";
function mapPaymentUIToDB(ui: "one_oct" | "two_sep_oct"): PaymentDB {
  return ui === "one_oct" ? "one_sep" : "two_sep_oct";
}

// Converte "YYYY-MM-DD" para Date em UTC (00:00), evitando problemas de fuso
function ymdToDateUTC(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0));
}

/* ================= Action ================= */

export async function createPreRegistration(
  input: PreRegistrationForm,
): Promise<
  | { success: true }
  | {
      success: false;
      error: "VALIDATION_ERROR" | "INVALID_STATUS" | "DB_ERROR";
      issues?: z.inferFlattenedErrors<typeof preRegistrationSchema>;
    }
> {
  // 1) Validação do payload do formulário
  const parsed = preRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      issues: parsed.error.flatten(),
    };
  }
  const data = parsed.data;

  // 2) Status (validação explícita; tem default no schema)
  const s = preStatusSchema.safeParse(data.status);
  if (!s.success) {
    return { success: false, error: "INVALID_STATUS" };
  }

  // 3) Monta os valores para insert (tipado pelo schema do BD)
  const values: NewPreRegistration = {
    studentName: data.studentName.trim(),
    birthDate: ymdToDateUTC(data.birthDate), // Drizzle date(mode:"date") espera Date
    guardianName: data.guardianName.trim(),
    guardianPhone: stripMask(data.guardianPhone),

    targetYear: data.targetYear,
    targetGrade: data.targetGrade,

    serviceId: data.serviceId ?? null,
    valueId: null,
    priceTier: null,
    appliedPriceCents: null,

    paymentOption: mapPaymentUIToDB(data.paymentOption),
    status: s.data, // requer a coluna 'status' em pre_registrations
    // createdAt: defaultNow()
  };

  try {
    await db.insert(preRegistrations).values(values);
    return { success: true };
  } catch (err) {
    console.error("createPreRegistration error", err);
    return { success: false, error: "DB_ERROR" };
  }
}
