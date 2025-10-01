// src/app/(protected)/rematricula/components/pre-payment-modal.tsx
"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPrePaymentInfo,
  listPreInstallments,
  generatePreInstallments,
  createPreInstallment,
  updatePreInstallment,
  deletePreInstallment,
  settlePreInstallment,
  type Plan,
  type PaymentInfo,
  type PaymentRow,
} from "@/app/actions/pre-payments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ========== Helpers ========== */
const centsToBRL = (v: number) =>
  (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function parseCurrencyToCents(s: string): number {
  // aceita "1234,56" / "1.234,56" / "1234.56"
  const clean = s.replace(/\./g, "").replace(",", ".");
  const num = Number(clean);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}

const PLAN_LABEL: Record<Plan, string> = {
  "1_sep": "1x (setembro)",
  "1_oct": "1x (05/out)",
  "2_sep_oct": "2x (set/out)",
  "3_sep_oct_nov": "3x (set/out/nov)",
};

const INFO_LABELS = {
  grade: (g?: string) =>
    (
      ({
        MATERNAL_3: "Maternal (3 anos)",
        PRE_I_4: "Pré I (4 anos)",
        PRE_II_5: "Pré II (5 anos)",
        ANO_1: "1º ANO",
        ANO_2: "2º ANO",
        ANO_3: "3º ANO",
        ANO_4: "4º ANO",
        ANO_5: "5º ANO",
      }) as Record<string, string>
    )[g ?? ""] ??
    g ??
    "—",
  service: (k?: string | null) =>
    (
      ({
        integral: "Integral",
        meio_periodo: "Meio período",
        infantil_vespertino: "Infantil – Vespertino",
        fundamental_vespertino: "Fundamental – Vespertino",
      }) as Record<string, string>
    )[k ?? ""] ?? "—",
};

/* ========== Componente ========== */
export default function PrePaymentModal(props: {
  preId: number;
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();

  // Info base (valores)
  const infoQ = useQuery<PaymentInfo | null>({
    queryKey: ["pre-pay-info", props.preId],
    queryFn: () => getPrePaymentInfo(props.preId),
  });

  // Parcelas
  const itemsQ = useQuery<PaymentRow[]>({
    queryKey: ["pre-installments", props.preId],
    queryFn: () => listPreInstallments(props.preId),
    enabled: !!infoQ.data,
  });

  // Plano selecionado (UI)
  const [plan, setPlan] = React.useState<Plan>("1_oct");

  /* ===== Mutations ===== */
  const mGenerate = useMutation({
    mutationFn: async () => {
      if (!infoQ.data) throw new Error("Sem dados");
      const r = await generatePreInstallments({
        preId: props.preId,
        plan,
        replace: true,
      });
      return r;
    },
    onSuccess: () => {
      toast.success("Parcelas geradas com sucesso.");
      qc.invalidateQueries({ queryKey: ["pre-installments", props.preId] });
    },
    onError: () => toast.error("Não foi possível gerar as parcelas."),
  });

  const mCreate = useMutation({
    mutationFn: (p: { dueDate: string; amountCents: number }) =>
      createPreInstallment({ preId: props.preId, ...p }),
    onSuccess: () => {
      toast.success("Parcela criada.");
      qc.invalidateQueries({ queryKey: ["pre-installments", props.preId] });
    },
    onError: () => toast.error("Erro ao criar parcela."),
  });

  const mUpdate = useMutation({
    mutationFn: (p: {
      id: number;
      dueDate?: string;
      amountCents?: number;
      discountCents?: number;
    }) => updatePreInstallment(p),
    onSuccess: () => {
      toast.success("Parcela atualizada.");
      qc.invalidateQueries({ queryKey: ["pre-installments", props.preId] });
    },
    onError: () => toast.error("Erro ao atualizar parcela."),
  });

  const mDelete = useMutation({
    mutationFn: (id: number) => deletePreInstallment(id),
    onSuccess: () => {
      toast.success("Parcela excluída.");
      qc.invalidateQueries({ queryKey: ["pre-installments", props.preId] });
    },
    onError: () => toast.error("Erro ao excluir parcela."),
  });

  const mSettle = useMutation({
    mutationFn: (p: { id: number; paidAt: string; paidAmountCents: number }) =>
      settlePreInstallment(p),
    onSuccess: () => {
      toast.success("Baixa registrada.");
      qc.invalidateQueries({ queryKey: ["pre-installments", props.preId] });
    },
    onError: () => toast.error("Erro ao registrar baixa."),
  });

  const info = infoQ.data ?? undefined;
  const items = itemsQ.data ?? [];

  // Somas
  const totalParcs = items.reduce((acc, it) => acc + it.amountCents, 0);
  const totalDesc = items.reduce((acc, it) => acc + it.discountCents, 0);
  const totalLiquido = totalParcs - totalDesc;

  return (
    <Dialog
      open={props.open}
      onOpenChange={(v) =>
        !mGenerate.isPending && v === false && props.onClose()
      }
    >
      <DialogContent className="w-[95vw] max-w-4xl overflow-hidden p-0">
        {/* Header fixo */}
        <DialogHeader className="bg-background sticky top-0 z-10 border-b px-6 py-4">
          <DialogTitle>PAGAMENTO DA PRÉ-REMATRÍCULA</DialogTitle>
        </DialogHeader>

        {/* Corpo rolável */}
        <div className="max-h-[80vh] space-y-6 overflow-y-auto px-6 py-6">
          {/* Cards de informações */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Turma/Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Ano: </span>
                  <strong>{info?.nextYear ?? "—"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Série: </span>
                  <strong>{INFO_LABELS.grade(info?.nextGrade)}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Serviço: </span>
                  <strong>
                    {INFO_LABELS.service(info?.serviceKey ?? null)}
                  </strong>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Valores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Rematrícula (BD):{" "}
                  </span>
                  <strong>{info ? centsToBRL(info.reenrollCents) : "—"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Material coletivo:{" "}
                  </span>
                  <strong>{info ? centsToBRL(info.materialCents) : "—"}</strong>
                </div>
                <Separator className="my-1" />
                <div>
                  <span className="text-muted-foreground">Total: </span>
                  <strong className="text-base">
                    {info ? centsToBRL(info.totalCents) : "—"}
                  </strong>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Parcelas (lançadas)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Bruto: </span>
                  <strong>{centsToBRL(totalParcs)}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Descontos: </span>
                  <strong>{centsToBRL(totalDesc)}</strong>
                </div>
                <Separator className="my-1" />
                <div>
                  <span className="text-muted-foreground">Líquido: </span>
                  <strong className="text-base">
                    {centsToBRL(totalLiquido)}
                  </strong>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gerador por plano */}
          <div className="rounded-2xl border p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
              <div>
                <Label className="mb-1 block text-sm">Plano de pagamento</Label>
                <Select value={plan} onValueChange={(v) => setPlan(v as Plan)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PLAN_LABEL) as Plan[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {PLAN_LABEL[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 md:col-span-2 md:justify-end">
                <Button
                  variant="outline"
                  onClick={() => mGenerate.mutate()}
                  disabled={mGenerate.isPending || !info}
                >
                  {mGenerate.isPending
                    ? "Gerando..."
                    : "Gerar/Atualizar parcelas"}
                </Button>
                <Button
                  variant="default"
                  onClick={() =>
                    mCreate.mutate({
                      dueDate: new Date().toISOString().slice(0, 10),
                      amountCents: info?.totalCents ?? 0,
                    })
                  }
                  disabled={!info}
                >
                  Nova parcela
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de parcelas */}
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                Nenhuma parcela lançada ainda.
              </div>
            ) : (
              items.map((it) => {
                const [due, setDue] = React.useState(it.dueDate);
                const [amount, setAmount] = React.useState(
                  centsToBRL(it.amountCents),
                );
                const [discount, setDiscount] = React.useState(
                  centsToBRL(it.discountCents),
                );
                const amountCents = parseCurrencyToCents(amount);
                const discountCents = parseCurrencyToCents(discount);
                const net = Math.max(0, amountCents - discountCents);

                const saving =
                  it.dueDate !== due ||
                  it.amountCents !== amountCents ||
                  it.discountCents !== discountCents;

                return (
                  <Card key={it.id} className="rounded-2xl">
                    <CardContent className="grid gap-3 p-4 md:grid-cols-12 md:items-end">
                      <div className="md:col-span-3">
                        <Label>Vencimento</Label>
                        <Input
                          type="date"
                          value={due}
                          onChange={(e) => setDue(e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-3">
                        <Label>Valor</Label>
                        <Input
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <Label>Desconto</Label>
                        <Input
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <Label>Líquido</Label>
                        <div className="bg-muted/50 rounded-md border px-3 py-2 text-sm font-medium">
                          {centsToBRL(net)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1 md:col-span-12">
                        <Button
                          size="sm"
                          variant="default"
                          disabled={!saving}
                          onClick={() =>
                            mUpdate.mutate({
                              id: it.id,
                              dueDate: due,
                              amountCents,
                              discountCents,
                            })
                          }
                        >
                          Salvar
                        </Button>

                        {!it.paidAt && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              mSettle.mutate({
                                id: it.id,
                                paidAt: new Date().toISOString(),
                                paidAmountCents: net,
                              })
                            }
                          >
                            Baixar
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => mDelete.mutate(it.id)}
                        >
                          Excluir
                        </Button>

                        <div className="text-muted-foreground ml-auto text-xs">
                          {it.paidAt
                            ? `Pago em ${new Date(it.paidAt).toLocaleDateString("pt-BR")}`
                            : "Em aberto"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-background sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={props.onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
