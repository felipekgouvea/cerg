// src/lib/validation/pre-registration.ts
import { z } from "zod";

/* ===== Enums (UI) ===== */
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
export type Grade = z.infer<typeof gradeZ>;

export const serviceKeyZ = z.enum([
  "integral",
  "meio_periodo",
  "infantil_vespertino",
  "fundamental_vespertino",
] as const);
export type ServiceKey = z.infer<typeof serviceKeyZ>;

// UI do formulário usa one_oct (mapeamos p/ DB nas actions)
export const paymentUiZ = z.enum(["one_oct", "two_sep_oct"] as const);
export type PaymentUI = z.infer<typeof paymentUiZ>;

// Status usado nas telas/listas
export const preStatusZ = z.enum([
  "realizada",
  "em_conversas",
  "finalizado",
  "cancelado",
] as const);
export type PreStatus = z.infer<typeof preStatusZ>;

/* ===== Schema principal do formulário de PRÉ-MATRÍCULA =====
   birthDate é string "YYYY-MM-DD" (convertemos na action se necessário)
   status tem default "realizada" (mesmo se você não mostrar no form)
============================================================== */
export const preRegistrationSchema = z.object({
  studentName: z.string().min(3, "Informe o nome do aluno"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD"),
  guardianName: z.string().min(3, "Informe o nome do responsável"),
  guardianPhone: z.string().min(10, "Telefone inválido"),

  targetYear: z.number().int().min(2025).default(2026),
  targetGrade: gradeZ,

  // opcional: serviço escolhido já no cadastro (pode ficar vazio)
  serviceId: z.number().int().positive().optional(),

  paymentOption: paymentUiZ.default("one_oct"),

  // Mantemos aqui porque algumas actions/fluxos usam esse valor.
  // Se o seu form não exibir, ele entra com o default "realizada".
  status: preStatusZ.default("realizada"),
});

// Alias usado por outras actions (ex.: updatePreRegistrationStatus)
export const preStatusSchema = preStatusZ;

/* ===== Tipos ===== */
export type PreRegistrationForm = z.infer<typeof preRegistrationSchema>;
