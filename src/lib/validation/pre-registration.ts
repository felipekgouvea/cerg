// src/lib/validation/pre-registration.ts
import { z } from "zod";

export const gradeZ = z.enum([
  "MATERNAL_3",
  "PRE_I_4",
  "PRE_II_5",
  "ANO_1",
  "ANO_2",
  "ANO_3",
  "ANO_4",
  "ANO_5",
] as const);

export const paymentUiZ = z.enum(["one_oct", "two_sep_oct"] as const);
export const preStatusSchema = z.enum([
  "realizada",
  "em_conversas",
  "finalizado",
  "cancelado",
] as const);

// Formulário da UI (navegador) — birthDate é string (YYYY-MM-DD)
export const preRegistrationFormZ = z.object({
  studentName: z.string().min(3, "Informe o nome do aluno"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD"),
  guardianName: z.string().min(3, "Informe o nome do responsável"),
  guardianPhone: z.string().min(10, "Telefone inválido"),
  targetYear: z.coerce.number().int().min(2025).default(2026),
  targetGrade: gradeZ,
  // service é opcional na pré-matrícula
  serviceId: z.coerce.number().int().positive().optional(),
  paymentOption: paymentUiZ.default("one_oct"),
  status: preStatusSchema.default("realizada"),
});

export type PreRegistrationFormClient = z.infer<typeof preRegistrationFormZ>;
export type Grade = z.infer<typeof gradeZ>;
export type PaymentUI = z.infer<typeof paymentUiZ>;
export type PreStatus = z.infer<typeof preStatusSchema>;
