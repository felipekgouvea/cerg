"use server";

import { db } from "@/db";
import { preRegistrations } from "@/db/schema";
import {
  preRegistrationSchema,
  type PreRegistrationForm,
} from "@/lib/validation/pre-registration";

// opcional: normaliza telefone removendo máscara
function stripMask(phone: string) {
  return phone.replace(/\D/g, "");
}

// status válidos (mesmo que o Zod ainda não tenha)
type PreStatus = "realizada" | "em_conversas" | "finalizado" | "cancelado";
const VALID_STATUS = new Set<PreStatus>([
  "realizada",
  "em_conversas",
  "finalizado",
  "cancelado",
]);

export async function createPreRegistration(input: PreRegistrationForm) {
  // valida o que já existe no seu schema atual
  const parsed = preRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    console.error(
      "createPreRegistration validation error",
      parsed.error.format(),
    );
    return {
      success: false,
      error: "VALIDATION_ERROR",
      issues: parsed.error.flatten(),
    };
  }

  const data = parsed.data;

  // lê 'status' direto do input (pode não existir no seu Zod ainda)
  const requestedStatus = (input as any)?.status as string | undefined;
  const status =
    requestedStatus && VALID_STATUS.has(requestedStatus as PreStatus)
      ? (requestedStatus as PreStatus)
      : undefined; // deixa DB default se não vier

  // Salva data como string "YYYY-MM-DD" para evitar -1 dia por timezone.
  const birthDateStr =
    typeof data.birthDate === "string"
      ? data.birthDate
      : (() => {
          const d = new Date(data.birthDate as any);
          const y = d.getUTCFullYear();
          const m = String(d.getUTCMonth() + 1).padStart(2, "0");
          const dd = String(d.getUTCDate()).padStart(2, "0");
          return `${y}-${m}-${dd}`;
        })();

  try {
    // monta valores base
    const values: any = {
      studentName: data.studentName.trim(),
      birthDate: birthDateStr, // Drizzle date(..., { mode: "string" })
      guardianName: data.guardianName.trim(),
      guardianPhone: stripMask(data.guardianPhone),
      service: data.service,
      grade: data.grade,
      paymentOption: data.paymentOption,
    };

    // adiciona status se veio válido (senão DB usa default)
    if (status) values.status = status;

    await db.insert(preRegistrations).values(values);

    return { success: true };
  } catch (err) {
    console.error("createPreRegistration db error", err);
    return { success: false, error: "DB_ERROR" };
  }
}
