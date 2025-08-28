"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// shadcn/ui
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  User,
  Calendar,
  Phone,
  GraduationCap,
  HandCoins,
} from "lucide-react";

// actions
import { createPreRegistration } from "@/app/actions/create-pre-registration";
import { fetchServices } from "@/app/actions/pre-enrollment";

/* ================== Tipos UI ================== */
type Grade =
  | "MATERNAL_3"
  | "PRE_I_4"
  | "PRE_II_5"
  | "ANO_1"
  | "ANO_2"
  | "ANO_3"
  | "ANO_4"
  | "ANO_5";

type ServiceKey =
  | "integral"
  | "meio_periodo"
  | "infantil_vespertino"
  | "fundamental_vespertino";

type PaymentUI = "one_oct" | "two_sep_oct";
type PreStatus = "realizada" | "em_conversas" | "finalizado" | "cancelado";

type ServiceDTO = {
  id: number;
  key: ServiceKey;
  name: string;
  active?: number;
};

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

/* ================== Utils ================== */
const isInfantil = (g?: Grade | null) =>
  g === "MATERNAL_3" || g === "PRE_I_4" || g === "PRE_II_5";

function maskPhoneBR(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{1})(\d{4})(\d{4})$/, "$1.$2-$3");
}

/* ================== Zod (ano fixo 2026, sem status no UI) ================== */
const formZ = z.object({
  studentName: z.string().min(3, "Informe o nome do aluno"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD"),
  guardianName: z.string().min(3, "Informe o nome do responsável"),
  guardianPhone: z.string().min(10, "Telefone inválido"),

  targetYear: z.literal(2026), // ano fixo
  targetGrade: z.enum([
    "MATERNAL_3",
    "PRE_I_4",
    "PRE_II_5",
    "ANO_1",
    "ANO_2",
    "ANO_3",
    "ANO_4",
    "ANO_5",
  ] as const),

  // opcional
  serviceId: z.coerce.number().int().positive().optional(),

  paymentOption: z.enum(["one_oct", "two_sep_oct"] as const).default("one_oct"),
});

type FormValues = z.infer<typeof formZ>;
const resolver: Resolver<FormValues> = zodResolver(
  formZ,
) as Resolver<FormValues>;

/* ================== Componente ================== */
export default function PreRegistrationFormDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);

  // Serviços
  const { data: services, isLoading: loadingServices } = useQuery<ServiceDTO[]>(
    {
      queryKey: ["services"],
      queryFn: fetchServices,
      staleTime: 5 * 60_000,
    },
  );

  const form = useForm<FormValues>({
    resolver,
    defaultValues: {
      targetYear: 2026,
      paymentOption: "one_oct",
    },
  });

  const targetGrade = form.watch("targetGrade");

  // Filtra serviços conforme a série (deixa Integral e Meio período sempre)
  const allowedServices = React.useMemo(() => {
    const list = services ?? [];
    if (!targetGrade) return list;
    const infantil = isInfantil(targetGrade);
    return list.filter((svc) => {
      if (infantil && svc.key === "fundamental_vespertino") return false;
      if (!infantil && svc.key === "infantil_vespertino") return false;
      return true;
    });
  }, [services, targetGrade]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // normaliza telefone para dígitos (salva limpo)
      const payload = {
        ...values,
        guardianPhone: values.guardianPhone.replace(/\D/g, ""),
        // 🔴 IMPORTANTE: envia status default, já que a action espera "status"
        status: "realizada" as PreStatus,
      };
      return await createPreRegistration(payload);
    },
    onSuccess: (res: any) => {
      if (res?.success) {
        toast.success("Pré-matrícula enviada com sucesso!");
        qc.invalidateQueries({ queryKey: ["pre-registrations"] });
        form.reset({
          targetYear: 2026,
          paymentOption: "one_oct",
        });
        setOpen(false);
      } else {
        toast.error(
          "Não foi possível salvar. Verifique os dados e tente novamente.",
        );
      }
    },
    onError: () => toast.error("Erro ao salvar a pré-matrícula."),
  });

  const onSubmit = (vals: FormValues) => mutation.mutate(vals);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled
          className="w-full cursor-pointer rounded-2xl px-6 py-5 text-base lg:mt-10 lg:mb-10"
        >
          FAÇA AQUI SUA PRÉ-MATRÍCULA (2026)
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pré-matrícula • 2026</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            {/* Bloco 1: Aluno */}
            <div className="rounded-2xl border p-4">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-4 w-4 opacity-70" />
                <h3 className="text-sm font-semibold">Dados do aluno</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  name="studentName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do aluno</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="Nome completo"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="birthDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nascimento</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 opacity-60" />
                          <Input
                            type="date"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bloco 2: Responsável */}
            <div className="rounded-2xl border p-4">
              <div className="mb-4 flex items-center gap-2">
                <Phone className="h-4 w-4 opacity-70" />
                <h3 className="text-sm font-semibold">Responsável</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  name="guardianName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do responsável</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="Nome completo"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="guardianPhone"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={maskPhoneBR(field.value ?? "")}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            field.onChange(raw);
                          }}
                          inputMode="numeric"
                          maxLength={16}
                          placeholder="(00) 0.0000-0000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bloco 3: Preferências 2026 */}
            <div className="rounded-2xl border p-4">
              <div className="mb-4 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 opacity-70" />
                <h3 className="text-sm font-semibold">
                  Série e serviço • 2026
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Ano FIXO 2026 */}
                <div className="col-span-1">
                  <FormLabel>Ano letivo</FormLabel>
                  <Input value="2026" disabled />
                  <input
                    type="hidden"
                    {...form.register("targetYear")}
                    value={2026}
                  />
                </div>

                <FormField
                  name="targetGrade"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-1">
                      <FormLabel>Série pretendida</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(v) => field.onChange(v as Grade)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a série" />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(GRADE_LABEL) as Grade[]).map((g) => (
                              <SelectItem key={g} value={g}>
                                {GRADE_LABEL[g]}
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
                  name="serviceId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-1">
                      <FormLabel>Serviço (opcional)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(v) => field.onChange(Number(v))}
                          disabled={loadingServices}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                loadingServices ? "Carregando..." : "Selecione"
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
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  name="paymentOption"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-2 flex items-center gap-2">
                        <HandCoins className="h-4 w-4 opacity-70" />
                        <FormLabel>Opção de pagamento</FormLabel>
                      </div>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(v) => field.onChange(v as PaymentUI)}
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
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  form.reset({
                    targetYear: 2026,
                    paymentOption: "one_oct",
                  })
                }
              >
                Limpar
              </Button>

              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mutation.isPending ? "Enviando..." : "Enviar pré-matrícula"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
