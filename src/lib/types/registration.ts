import type { PreStatus } from "@/lib/validation/pre-registration";

export interface Registration {
  id: number;
  studentName: string;
  birthDate: string; // "YYYY-MM-DD"
  guardianName: string;
  guardianPhone: string;
  service:
    | "integral"
    | "meio_periodo"
    | "infantil_vespertino"
    | "fundamental_vespertino";
  grade:
    | "MATERNAL_3"
    | "PRE_I_4"
    | "PRE_II_5"
    | "ANO_1"
    | "ANO_2"
    | "ANO_3"
    | "ANO_4"
    | "ANO_5";
  paymentOption: "one_oct" | "two_sep_oct";
  createdAt: string; // ISO completo (ex.: "2025-08-21T12:34:56.000Z")
  status: PreStatus; // 'realizada' | 'em_conversas' | 'finalizado' | 'cancelado'
}
