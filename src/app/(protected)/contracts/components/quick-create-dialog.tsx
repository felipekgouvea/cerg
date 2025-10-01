// app/(protected)/contracts/components/quick-create-dialog.tsx
"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  getPreReOptions,
  type Grade,
  type PreReOption,
} from "@/app/actions/contracts/get-pre-for-contracts";

const GRADE_LABEL: Record<Grade | "ALL", string> = {
  ALL: "Todas",
  MATERNAL_3: "Maternal (3 anos)",
  PRE_I_4: "Pré I (4 anos)",
  PRE_II_5: "Pré II (5 anos)",
  ANO_1: "1º ANO",
  ANO_2: "2º ANO",
  ANO_3: "3º ANO",
  ANO_4: "4º ANO",
  ANO_5: "5º ANO",
};

const uiSchema = z.object({
  grade: z
    .enum([
      "ALL",
      "MATERNAL_3",
      "PRE_I_4",
      "PRE_II_5",
      "ANO_1",
      "ANO_2",
      "ANO_3",
      "ANO_4",
      "ANO_5",
    ] as const)
    .default("ALL"),
  preId: z.string().min(1, "Selecione um aluno"),
});
type UIForm = z.infer<typeof uiSchema>;

export default function QuickCreateDialog(props: {
  year: number;
  isLoading?: boolean;
  onConfirm: (preId: number) => void | Promise<void>;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  const { data: options = [], isLoading } = useQuery<PreReOption[]>({
    queryKey: ["pre-for-contract", props.year],
    queryFn: () => getPreReOptions(props.year),
    staleTime: 60_000,
  });

  // TIPAGEM DO FORM + RESOLVER EXPLÍCITO
  const form = useForm<UIForm>({
    resolver: zodResolver(uiSchema) as Resolver<UIForm>,
    defaultValues: { grade: "ALL", preId: "" },
  });

  const grade = form.watch("grade");
  const filtered = React.useMemo(() => {
    if (grade === "ALL") return options;
    return options.filter((o) => o.grade === grade);
  }, [options, grade]);

  // HANDLER TIPADO COM SubmitHandler<UIForm>
  const onSubmit: SubmitHandler<UIForm> = async (values) => {
    const preId = Number(values.preId);
    await props.onConfirm(preId);
    setOpen(false);
    form.reset({ grade: "ALL", preId: "" });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !props.isLoading && setOpen(v)}>
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button variant="default" className="cursor-pointer">
            Matricular de uma Pré
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Gerar contrato a partir da Pré-Rematrícula (2026)
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              name="grade"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turma (filtrar)</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(v) =>
                        field.onChange(v as UIForm["grade"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.keys(
                            GRADE_LABEL,
                          ) as (keyof typeof GRADE_LABEL)[]
                        ).map((g) => (
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
              name="preId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aluno (Pré-rematrícula 2026)</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o aluno" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {filtered.length === 0 ? (
                          <div className="text-muted-foreground p-2 text-sm">
                            Nenhum aluno disponível para a turma selecionada.
                          </div>
                        ) : (
                          filtered.map((o) => (
                            <SelectItem key={o.id} value={String(o.id)}>
                              {GRADE_LABEL[o.grade]} — {o.studentName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                disabled={props.isLoading}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={props.isLoading}>
                {props.isLoading ? "Processando..." : "Gerar contrato"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
