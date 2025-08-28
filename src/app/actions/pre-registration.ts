"use server";

import { db } from "@/db";
import { preRegistrations, type NewPreRegistration } from "@/db/schema";
import {
  preRegistrationSchema,
  preStatusSchema,
  type PreRegistrationForm,
} from "@/lib/validation/pre-registration";
import { z } from "zod";

/* ============== Helpers ============== */

function stripMask(phone: string): string {
  return phone.replace(/\D/g, "");
}

type PaymentDB = "one_sep" | "two_sep_oct";
function mapPaymentUIToDB(ui: "one_oct" | "two_sep_oct"): PaymentDB {
  // UI mostra "one_oct" (paga em outubro), mas no BD usamos "one_sep"
  return ui === "one_oct" ? "one_sep" : "two_sep_oct";
}

// Converte "YYYY-MM-DD" para Date em UTC (00:00)
function ymdToDateUTC(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0));
}

/* ============== Action ============== */

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
  // 1) Validação do payload do formulário (birthDate: string)
  const parsed = preRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      issues: parsed.error.flatten(),
    };
  }
  const data = parsed.data;

  // 2) Status válido (seu Zod já define defaults/enum)
  const statusParse = preStatusSchema.safeParse(data.status);
  if (!statusParse.success) {
    return { success: false, error: "INVALID_STATUS" };
  }

  // 3) Monta valores compatíveis com o schema do BD
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
    status: statusParse.data, // ex.: "realizada" (default do Zod/BD)
    // createdAt usa defaultNow()
  };

  try {
    await db.insert(preRegistrations).values(values);
    return { success: true };
  } catch (err) {
    console.error("createPreRegistration db error", err);
    return { success: false, error: "DB_ERROR" };
  }
}
