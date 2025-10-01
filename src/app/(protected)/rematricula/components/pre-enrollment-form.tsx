"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

import {
  fetchGradesWithStudents,
  fetchStudentsByGrade,
  fetchServices,
  fetchPreReenrolledIds,
  createPreReenrollment,
  type Grade,
  type ServiceKey,
  type PaymentDB,
} from "@/app/actions/pre-enrollment";

/* ========== Tipos / DTOs ========== */
type PaymentUI = "one_oct" | "two_sep_oct";
type ServiceDTO = { id: number; key: ServiceKey; name: string };
type GradeCountDTO = { grade: Grade; count: number };

/* ========== Labels ========== */
const GRADE_LABEL: Record<Grade, string> = {
  MATERNAL_3: "Maternal (3 anos)",
  PRE_I_4: "Pré I (4 anos)",
  PRE_II_5: "Pré II (5 anos)",
  ANO_1: "1º ANO",
  ANO_2: "2º ANO",
  ANO_3: "3º ANO",
  ANO_4: "4º ANO",
  ANO_5: "5º ANO",
};
const SERVICE_LABEL: Record<ServiceKey, string> = {
  integral: "Integral",
  meio_periodo: "Meio período",
  infantil_vespertino: "Infantil – Vespertino",
  fundamental_vespertino: "Fundamental – Vespertino",
};

/* ========== Promo 2025 → 2026 ========== */
const PROMO_25_TO_26: Record<Grade, Grade> = {
  MATERNAL_3: "PRE_I_4",
  PRE_I_4: "PRE_II_5",
  PRE_II_5: "ANO_1",
  ANO_1: "ANO_2",
  ANO_2: "ANO_3",
  ANO_3: "ANO_4",
  ANO_4: "ANO_5",
  ANO_5: "ANO_5",
};

/* ========== Regras por serviço (centavos) ========== */
const SERVICE_PRICES: Record<
  ServiceKey,
  { monthlyFullCents: number; reenrollSeptCents: number }
> = {
  infantil_vespertino: { monthlyFullCents: 55000, reenrollSeptCents: 50000 },
  fundamental_vespertino: { monthlyFullCents: 65000, reenrollSeptCents: 60000 },
  integral: { monthlyFullCents: 141000, reenrollSeptCents: 120000 },
  meio_periodo: { monthlyFullCents: 102000, reenrollSeptCents: 90000 },
};

const MATERIAL_COLETIVO_CENTS = 15000;

/* ========== Utils ========== */
const isInfantil = (g?: Grade | null) =>
  g === "MATERNAL_3" || g === "PRE_I_4" || g === "PRE_II_5";

const centsToBRL = (v?: number | null) =>
  typeof v === "number"
    ? (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "—";

function splitHalfCents(total: number) {
  const first = Math.floor(total / 2);
  const second = total - first;
  return { first, second };
}

function formatInstallmentsLine(totalCents: number, paymentUI: PaymentUI) {
  if (!totalCents) return "—";
  if (paymentUI === "one_oct") {
    return `${centsToBRL(totalCents)} em 05/10/25`;
  }
  const { first, second } = splitHalfCents(totalCents);
  return `${centsToBRL(first)} em setembro + ${centsToBRL(second)} em 05/10/25`;
}

/* ========== Zod / Form ========== */
const gradeZ = z.enum([
  "MATERNAL_3",
  "PRE_I_4",
  "PRE_II_5",
  "ANO_1",
  "ANO_2",
  "ANO_3",
  "ANO_4",
  "ANO_5",
]);

const baseSchema = z.object({
  yearBase: z.literal(2025),
  grade2025: gradeZ,
  studentId: z.coerce.number().int().positive("Selecione o aluno."),
  nextYear: z.literal(2026),
  nextGrade: gradeZ,
  serviceId: z.coerce.number().int().positive("Selecione o serviço."),
  paymentOption: z.custom<PaymentUI>().default("one_oct"),
  priceTier: z.literal("reenrollment").default("reenrollment"),
});
type FormValues = z.output<typeof baseSchema>;

export function PreEnrollmentForm() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);

  /* ===== Queries ===== */
  const gradesQuery = useQuery({
    queryKey: ["grades-2025"],
    queryFn: () => fetchGradesWithStudents(2025),
    staleTime: 60_000,
  });

  const [grade2025, setGrade2025] = React.useState<Grade | undefined>();
  const studentsQuery = useQuery({
    queryKey: ["students-2025", grade2025],
    queryFn: () => fetchStudentsByGrade(2025, grade2025!),
    enabled: !!grade2025,
  });

  const preIdsQuery = useQuery({
    queryKey: ["pre-reenrolled-ids", 2026],
    queryFn: () => fetchPreReenrolledIds(2026),
    staleTime: 60_000,
  });

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
    staleTime: 5 * 60_000,
  });

  const [nextGrade, setNextGrade] = React.useState<Grade | undefined>();
  const [serviceId, setServiceId] = React.useState<number | undefined>();

  /* ===== Mapas ===== */
  const idToService = React.useMemo(() => {
    const m = new Map<number, ServiceDTO>();
    (servicesQuery.data ?? []).forEach((s) => m.set(s.id, s));
    return m;
  }, [servicesQuery.data]);

  /* ===== Schema com validação compatível série/serviço ===== */
  const schema = React.useMemo(
    () =>
      baseSchema.superRefine((val, ctx) => {
        const svc = idToService.get(val.serviceId);
        if (!svc) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Serviço inválido.",
            path: ["serviceId"],
          });
          return;
        }
        const infantil = isInfantil(val.nextGrade);
        if (infantil && svc.key === "fundamental_vespertino") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Para turmas do Infantil em 2026, selecione um serviço Infantil (ou Integral/Meio período).",
            path: ["serviceId"],
          });
        }
        if (!infantil && svc.key === "infantil_vespertino") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Para turmas do Fundamental em 2026, selecione um serviço Fundamental (ou Integral/Meio período).",
            path: ["serviceId"],
          });
        }
      }),
    [idToService],
  );

  const formResolver: Resolver<FormValues> = zodResolver(
    schema,
  ) as unknown as Resolver<FormValues>;
  const form = useForm<FormValues>({
    resolver: formResolver,
    defaultValues: {
      yearBase: 2025,
      nextYear: 2026,
      paymentOption: "one_oct",
      priceTier: "reenrollment",
    },
  });

  const paymentUI = form.watch("paymentOption");

  /* ===== Efeitos ===== */
  React.useEffect(() => {
    if (!grade2025) return;
    const ng = PROMO_25_TO_26[grade2025];
    setNextGrade(ng);
    form.setValue("nextGrade", ng);
    form.resetField("studentId");
    setServiceId(undefined);
    form.resetField("serviceId");
  }, [grade2025]); // eslint-disable-line

  const filteredStudents = React.useMemo(() => {
    const list = studentsQuery.data ?? [];
    const blocked = new Set<number>(preIdsQuery.data ?? []);
    return list.filter((s) => !blocked.has(s.id));
  }, [studentsQuery.data, preIdsQuery.data]);

  const allowedServices = React.useMemo(() => {
    const list = servicesQuery.data ?? [];
    if (!nextGrade) return list;
    const infantil = isInfantil(nextGrade);
    return list.filter((svc) => {
      if (infantil && svc.key === "fundamental_vespertino") return false;
      if (!infantil && svc.key === "infantil_vespertino") return false;
      return true;
    });
  }, [servicesQuery.data, nextGrade]);

  /* ===== Cálculos por serviço selecionado ===== */
  const svcKey = serviceId ? idToService.get(serviceId)?.key : undefined;
  const monthlyFullCents = svcKey
    ? (SERVICE_PRICES[svcKey]?.monthlyFullCents ?? null)
    : null;
  const reenrollSeptCents = svcKey
    ? (SERVICE_PRICES[svcKey]?.reenrollSeptCents ?? null)
    : null;
  const totalReenrollCents =
    reenrollSeptCents != null
      ? reenrollSeptCents + MATERIAL_COLETIVO_CENTS
      : null;

  /* ===== Submit ===== */
  const submitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!svcKey || totalReenrollCents == null) {
        throw new Error("Selecione o serviço para calcular os valores.");
      }
      const paymentDB: PaymentDB =
        paymentUI === "one_oct" ? "one_sep" : "two_sep_oct";
      return await createPreReenrollment({
        studentId: values.studentId,
        currentYear: values.yearBase,
        currentGrade: values.grade2025,
        nextYear: values.nextYear,
        nextGrade: values.nextGrade,
        serviceId: values.serviceId,
        valueId: null, // não usamos valor referenciado; tabela fixa local
        priceTier: "reenrollment",
        appliedPriceCents: totalReenrollCents, // total (desconto set + material)
        paymentOption: paymentDB,
      });
    },
    onSuccess: async () => {
      toast.success("Pré-rematrícula enviada!");
      qc.invalidateQueries({ queryKey: ["pre-reenrollments"] });
      qc.invalidateQueries({ queryKey: ["pre-reenrolled-ids", 2026] });
      setOpen(false);
      form.reset({
        yearBase: 2025,
        nextYear: 2026,
        paymentOption: "one_oct",
        priceTier: "reenrollment",
      });
      setGrade2025(undefined);
      setNextGrade(undefined);
      setServiceId(undefined);
    },
    onError: () => toast.error("Não foi possível enviar. Tente novamente."),
  });

  const onSubmit = (v: FormValues) => submitMutation.mutate(v);

  /* ========== UI com SCROLL interno (header/rodapé fixos) ========== */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="mt-10 w-full cursor-pointer rounded-2xl px-6 py-5 text-base"
          disabled
        >
          FAÇA AQUI SUA PRÉ-REMATRÍCULA (2026)
        </Button>
      </DialogTrigger>

      {/* p-0 + overflow-hidden para controlar o layout interno */}
      <DialogContent className="overflow-hidden p-0 sm:max-w-2xl">
        <Form {...form}>
          {/* altura limitada + layout em coluna */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-[min(85vh,calc(100vh-5rem))] flex-col"
          >
            {/* Header fixo */}
            <DialogHeader className="bg-background sticky top-0 z-10 border-b px-6 py-4">
              <DialogTitle>FORMULÁRIO DE PRÉ-REMATRÍCULA • 2026</DialogTitle>
            </DialogHeader>

            {/* Corpo rolável */}
            <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-4 [-webkit-overflow-scrolling:touch]">
              {/* Bloco: Turma 2025 + Aluno */}
              <div className="rounded-2xl border p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    name="grade2025"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Turma em 2025</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ?? ""}
                            onValueChange={(v) => {
                              field.onChange(v as Grade);
                              setGrade2025(v as Grade);
                            }}
                            disabled={gradesQuery.isLoading}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  gradesQuery.isLoading
                                    ? "Carregando..."
                                    : "Selecione"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {(gradesQuery.data ?? []).map(
                                (g: GradeCountDTO) => (
                                  <SelectItem key={g.grade} value={g.grade}>
                                    {GRADE_LABEL[g.grade]}{" "}
                                    {g.count ? `(${g.count})` : ""}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="studentId"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aluno</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={(v) => field.onChange(Number(v))}
                            disabled={!grade2025 || studentsQuery.isLoading}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  !grade2025
                                    ? "Selecione a turma de 2025"
                                    : studentsQuery.isLoading
                                      ? "Carregando..."
                                      : filteredStudents.length
                                        ? "Selecione"
                                        : "Nenhum aluno disponível"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredStudents.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                  {s.name}
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
              </div>

              <Separator />

              {/* Bloco: Turma 2026 + Serviço + Pagamento + Resumo único */}
              <div className="rounded-2xl border p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <FormField
                    name="nextGrade"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel>Turma em 2026</FormLabel>
                        <Input
                          value={field.value ? GRADE_LABEL[field.value] : ""}
                          disabled
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="serviceId"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Serviço (2026)</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={(v) => {
                              const id = Number(v);
                              setServiceId(id);
                              field.onChange(id);
                            }}
                            disabled={servicesQuery.isLoading}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  servicesQuery.isLoading
                                    ? "Carregando..."
                                    : "Selecione"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {allowedServices.map((svc) => (
                                <SelectItem key={svc.id} value={String(svc.id)}>
                                  {SERVICE_LABEL[svc.key] ?? svc.name}
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
                    name="paymentOption"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel>Forma de Pagamento</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(v) =>
                              field.onChange(v as PaymentUI)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="one_oct">
                                1x (Outubro)
                              </SelectItem>
                              <SelectItem value="two_sep_oct">
                                2x (Set/Out)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Resumo ÚNICO de valores */}
                <div className="mt-4">
                  <div className="rounded-xl border p-3 text-sm">
                    <div className="mb-1 font-medium">Resumo de valores</div>
                    {svcKey ? (
                      <div className="grid gap-1">
                        <div>
                          Mensalidade 2026:{" "}
                          <strong>{centsToBRL(monthlyFullCents ?? 0)}</strong>
                        </div>
                        <div>
                          Rematrícula com desconto em setembro:{" "}
                          <strong>{centsToBRL(reenrollSeptCents ?? 0)}</strong>
                        </div>
                        <div>
                          Material coletivo:{" "}
                          <strong>{centsToBRL(MATERIAL_COLETIVO_CENTS)}</strong>
                        </div>
                        <div>
                          Total rematrícula:{" "}
                          <strong>{centsToBRL(totalReenrollCents ?? 0)}</strong>
                        </div>
                        <div className="mt-1">
                          Parcelas:{" "}
                          <strong>
                            {totalReenrollCents != null
                              ? formatInstallmentsLine(
                                  totalReenrollCents,
                                  paymentUI,
                                )
                              : "—"}
                          </strong>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        Selecione o serviço para ver os valores.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé fixo */}
            <div className="bg-background sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset({
                    yearBase: 2025,
                    nextYear: 2026,
                    paymentOption: "one_oct",
                    priceTier: "reenrollment",
                  });
                  setOpen(false);
                  setGrade2025(undefined);
                  setNextGrade(undefined);
                  setServiceId(undefined);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar pré-rematrícula"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
