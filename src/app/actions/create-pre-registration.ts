"use server";

import { db } from "@/db";
import { preRegistrations } from "@/db/schema";
import {
  preRegistrationFormZ,
  type PreRegistrationFormClient,
  preStatusSchema,
} from "@/lib/validation/pre-registration";

// Remove máscara do telefone
function stripMask(phone: string) {
  return phone.replace(/\D/g, "");
}

// UI -> BD
function mapPaymentUIToDB(ui: "one_oct" | "two_sep_oct") {
  return ui === "one_oct" ? "one_sep" : "two_sep_oct";
}

// Converte "YYYY-MM-DD" para Date em UTC (00:00)
function ymdToDateUTC(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  // Date.UTC(year, monthIndex, day) -> evita problemas de fuso
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0));
}

export async function createPreRegistration(
  input: PreRegistrationFormClient,
): Promise<
  { success: true } | { success: false; error: string; issues?: any }
> {
  // 1) Validação do formulário (onde birthDate é string)
  const parsed = preRegistrationFormZ.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      issues: parsed.error.flatten(),
    };
  }
  const data = parsed.data;

  // 2) Valida status explicitamente (definido no seu schema)
  const s = preStatusSchema.safeParse(data.status);
  if (!s.success) {
    return { success: false, error: "INVALID_STATUS" };
  }

  // 3) Monta os valores para Drizzle
  //    -> birthDate precisa ser Date porque no schema está mode: "date"
  const values = {
    studentName: data.studentName.trim(),
    birthDate: ymdToDateUTC(data.birthDate), // <-- Date (corrige o erro)
    guardianName: data.guardianName.trim(),
    guardianPhone: stripMask(data.guardianPhone),
    targetYear: data.targetYear,
    targetGrade: data.targetGrade,
    serviceId: data.serviceId ?? null,
    paymentOption: mapPaymentUIToDB(data.paymentOption) as any, // ("one_sep" | "two_sep_oct")
    status: s.data, // requer a coluna "status" no seu schema
    // valueId / priceTier / appliedPriceCents: permanecem nulos na pré-matrícula
  };

  try {
    await db.insert(preRegistrations).values(values);
    return { success: true };
  } catch (err) {
    console.error("createPreRegistration error", err);
    return { success: false, error: "DB_ERROR" };
  }
}
