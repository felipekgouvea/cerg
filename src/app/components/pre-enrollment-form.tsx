"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// shadcn/ui
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// server action
import { createPreEnrollment } from "@/app/actions/pre-enrollment";
import { toast } from "sonner";

// --- Constantes (séries por modalidade)
const SERIES_INTEGRAL_MEIO = [
  "MATERNAL_3",
  "PRE_I_4",
  "PRE_II_5",
  "ANO_1",
  "ANO_2",
  "ANO_3",
  "ANO_4",
  "ANO_5",
] as const;

const SERIES_INFANTIL_VESP = ["MATERNAL_3", "PRE_I_4", "PRE_II_5"] as const;
const SERIES_FUND_VESP = ["ANO_1", "ANO_2", "ANO_3", "ANO_4", "ANO_5"] as const;

const SERVICE_OPTIONS = [
  { value: "integral", label: "Integral" },
  { value: "meio_periodo", label: "Meio Período" },
  { value: "infantil_vespertino", label: "Infantil - Vespertino" },
  { value: "fundamental_vespertino", label: "Fundamental - Vespertino" },
] as const;

const PAYMENT_OPTIONS = [
  { value: "one_oct", label: "1x em outubro" },
  { value: "two_sep_oct", label: "2x (1ª em setembro e 2ª em outubro)" },
] as const;

// --- Schema Zod
const zPhone = z
  .string({ message: "Informe o telefone do responsável." })
  .min(8, "Telefone inválido.")
  .regex(/^\+?\d[\d\s()-]{7,}$/, "Telefone inválido.");

const zDate = z
  .string({ message: "Informe a data de nascimento." })
  .refine((d) => !Number.isNaN(new Date(d).getTime()), "Data inválida.");

export const preEnrollmentSchema = z
  .object({
    studentName: z
      .string({ message: "Informe o nome do aluno." })
      .min(3, "Digite o nome completo."),
    birthDate: zDate,
    guardianName: z
      .string({ message: "Informe o nome do responsável." })
      .min(3, "Digite o nome completo."),
    guardianPhone: zPhone,
    service: z.enum(
      [
        "integral",
        "meio_periodo",
        "infantil_vespertino",
        "fundamental_vespertino",
      ] as const,
      { message: "Selecione o serviço." },
    ),
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
    paymentOption: z.enum(["one_sep", "two_sep_oct"] as const, {
      message: "Selecione a forma de pagamento da matrícula.",
    }),
  })
  .superRefine((vals, ctx) => {
    // valida série compatível com o serviço
    const mapAllowed: Record<string, readonly string[]> = {
      integral: SERIES_INTEGRAL_MEIO,
      meio_periodo: SERIES_INTEGRAL_MEIO,
      infantil_vespertino: SERIES_INFANTIL_VESP,
      fundamental_vespertino: SERIES_FUND_VESP,
    };
    const allowed = mapAllowed[vals.service] ?? [];
    if (!allowed.includes(vals.grade)) {
      ctx.addIssue({
        path: ["grade"],
        code: z.ZodIssueCode.custom,
        message: "A série escolhida não é permitida para esse serviço.",
      });
    }
  });

type PreEnrollmentForm = z.infer<typeof preEnrollmentSchema>;

// --- Helpers de rótulos
const gradeLabel: Record<PreEnrollmentForm["grade"], string> = {
  MATERNAL_3: "Maternal (3 anos)",
  PRE_I_4: "Pré I (4 anos)",
  PRE_II_5: "Pré II (5 anos)",
  ANO_1: "1º Ano",
  ANO_2: "2º Ano",
  ANO_3: "3º Ano",
  ANO_4: "4º Ano",
  ANO_5: "5º Ano",
};

export default function PreEnrollmentDialog() {
  const [open, setOpen] = React.useState(false);

  const form = useForm<PreEnrollmentForm>({
    resolver: zodResolver(preEnrollmentSchema),
    defaultValues: {
      studentName: "",
      birthDate: "",
      guardianName: "",
      guardianPhone: "",
      service: undefined as unknown as PreEnrollmentForm["service"],
      grade: undefined as unknown as PreEnrollmentForm["grade"],
      paymentOption: undefined as unknown as PreEnrollmentForm["paymentOption"],
    },
    mode: "onChange",
  });

  const service = form.watch("service");

  const allowedGrades =
    service === "integral" || service === "meio_periodo"
      ? SERIES_INTEGRAL_MEIO
      : service === "infantil_vespertino"
        ? SERIES_INFANTIL_VESP
        : service === "fundamental_vespertino"
          ? SERIES_FUND_VESP
          : [];

  async function onSubmit(values: PreEnrollmentForm) {
    const ok = await createPreEnrollment(values);
    if (ok?.success) {
      setOpen(false);
      form.reset();
      toast.success(
        "Pré-matrícula enviada com sucesso! Nossa equipe entrara em contato em breve!",
      );
    } else {
      toast.error("Erro ao enviar. Tente novamente.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl px-6 py-5 text-base">
          Pré-matrícula
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Pré-matrícula 2026</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para solicitar a sua vaga.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Aluno</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone do Responsável</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(27) 99999-9999"
                        {...field}
                        inputMode="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="guardianName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço Solicitado</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(v) => {
                          field.onChange(v as PreEnrollmentForm["service"]);
                          // limpa a série quando muda o serviço
                          form.setValue("grade", undefined as any);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Série</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(v) => field.onChange(v as any)}
                        value={field.value}
                        disabled={!service}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              service
                                ? "Selecione"
                                : "Escolha o serviço primeiro"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedGrades.map((g) => (
                            <SelectItem key={g} value={g}>
                              {gradeLabel[g]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentOption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pagamento da Matrícula</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(v) =>
                        field.onChange(v as PreEnrollmentForm["paymentOption"])
                      }
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Enviar pré-matrícula</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
