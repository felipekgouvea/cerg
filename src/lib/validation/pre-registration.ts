import { z } from "zod";

// enums/constantes compartilhadas
export const SERIES_INTEGRAL_MEIO = [
  "MATERNAL_3",
  "PRE_I_4",
  "PRE_II_5",
  "ANO_1",
  "ANO_2",
  "ANO_3",
  "ANO_4",
  "ANO_5",
] as const;

export const SERIES_INFANTIL_VESP = [
  "MATERNAL_3",
  "PRE_I_4",
  "PRE_II_5",
] as const;
export const SERIES_FUND_VESP = [
  "ANO_1",
  "ANO_2",
  "ANO_3",
  "ANO_4",
  "ANO_5",
] as const;

export const SERVICE_VALUES = [
  "integral",
  "meio_periodo",
  "infantil_vespertino",
  "fundamental_vespertino",
] as const;

export const PAYMENT_VALUES = ["one_sep", "two_sep_oct"] as const;

export type Service = (typeof SERVICE_VALUES)[number];
export type Grade =
  | (typeof SERIES_INTEGRAL_MEIO)[number]
  | (typeof SERIES_INFANTIL_VESP)[number]
  | (typeof SERIES_FUND_VESP)[number];

export const gradeLabel: Record<Grade, string> = {
  MATERNAL_3: "Maternal (3 anos)",
  PRE_I_4: "Pré I (4 anos)",
  PRE_II_5: "Pré II (5 anos)",
  ANO_1: "1º Ano",
  ANO_2: "2º Ano",
  ANO_3: "3º Ano",
  ANO_4: "4º Ano",
  ANO_5: "5º Ano",
};

export function allowedGradesByService(service?: Service) {
  if (service === "integral" || service === "meio_periodo")
    return SERIES_INTEGRAL_MEIO;
  if (service === "infantil_vespertino") return SERIES_INFANTIL_VESP;
  if (service === "fundamental_vespertino") return SERIES_FUND_VESP;
  return [] as const;
}

const zPhone = z
  .string({ message: "Informe o telefone do responsável." })
  .min(8, "Telefone inválido.")
  .regex(/^\+?\d[\d\s()-]{7,}$/, "Telefone inválido.");

const zDate = z
  .string({ message: "Informe a data de nascimento." })
  .refine((d) => !Number.isNaN(new Date(d).getTime()), "Data inválida.");

export const preRegistrationSchema = z
  .object({
    studentName: z
      .string({ message: "Informe o nome do aluno." })
      .min(3, "Digite o nome completo."),
    birthDate: zDate,
    guardianName: z
      .string({ message: "Informe o nome do responsável." })
      .min(3, "Digite o nome completo."),
    guardianPhone: zPhone,
    service: z.enum(SERVICE_VALUES, { message: "Selecione o serviço." }),
    grade: z.enum(
      [
        "MATERNAL_3",
        "PRE_I_4",
        "PRE_II_5",
        "ANO_1",
        "ANO_2",
        "ANO_3",
        "ANO_4",
        "ANO_5",
      ] as const,
      { message: "Selecione a série." },
    ),
    paymentOption: z.enum(PAYMENT_VALUES, {
      message: "Selecione a forma de pagamento da matrícula.",
    }),
  })
  .superRefine((vals, ctx) => {
    const allowed = allowedGradesByService(vals.service);
    // if (!allowed.includes(vals.grade as any)) {
    //   ctx.addIssue({
    //     path: ["grade"],
    //     code: z.ZodIssueCode.custom,
    //     message: "A série escolhida não é permitida para esse serviço.",
    //   });
    // }
  });

export type PreRegistrationForm = z.infer<typeof preRegistrationSchema>;
