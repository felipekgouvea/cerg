import { z } from "zod";

export const preStatusSchema = z.enum([
  "realizada",
  "em_conversas",
  "finalizado",
  "cancelado",
]);
export type PreStatus = z.infer<typeof preStatusSchema>;

export const serviceSchema = z.enum([
  "integral",
  "meio_periodo",
  "infantil_vespertino",
  "fundamental_vespertino",
]);

export const gradeSchema = z.enum([
  "MATERNAL_3",
  "PRE_I_4",
  "PRE_II_5",
  "ANO_1",
  "ANO_2",
  "ANO_3",
  "ANO_4",
  "ANO_5",
]);

export const paymentSchema = z.enum(["one_oct", "two_sep_oct"]);

export const preEnrollmentSchema = z.object({
  studentName: z.string().min(1),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // "YYYY-MM-DD"
  guardianName: z.string().min(1),
  guardianPhone: z.string().min(8),
  service: serviceSchema,
  grade: gradeSchema,
  paymentOption: paymentSchema,
  status: preStatusSchema.optional(), // default do DB se não vier
});

export type PreEnrollmentForm = z.infer<typeof preEnrollmentSchema>;
