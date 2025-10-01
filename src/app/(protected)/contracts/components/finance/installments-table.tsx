"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addInstallment,
  deleteInstallment,
  updateInstallment,
} from "@/app/actions/contracts/installments";
import { toast } from "sonner";

type Row = {
  id: number;
  seq: number;
  dueDate: string | Date;
  amountCents: number;
  discountCents: number;
  status: "open" | "paid" | "cancelled";
  paidAt: string | Date | null;
  paidAmountCents: number | null;
};

function centsToBRL(x: number) {
  return (x / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function InstallmentsTable({
  contractId,
  rows,
}: {
  contractId: number;
  rows: Row[];
}) {
  const qc = useQueryClient();

  const mAdd = useMutation({
    mutationFn: (payload: { dueDate: string; amountCents: number }) =>
      addInstallment({ contractId, ...payload }),
    onSuccess: () => {
      toast.success("Parcela adicionada.");
      qc.invalidateQueries({ queryKey: ["contract-detail", contractId] });
    },
  });

  const mUpd = useMutation({
    mutationFn: (patch: any) => updateInstallment(patch),
    onSuccess: () => {
      toast.success("Parcela atualizada.");
      qc.invalidateQueries({ queryKey: ["contract-detail", contractId] });
    },
  });

  const mDel = useMutation({
    mutationFn: (id: number) => deleteInstallment(id),
    onSuccess: () => {
      toast.success("Parcela excluída.");
      qc.invalidateQueries({ queryKey: ["contract-detail", contractId] });
    },
  });

  // form simples para add
  const [newDue, setNewDue] = React.useState("");
  const [newAmt, setNewAmt] = React.useState("");

  return (
    <div className="space-y-4">
      {/* Add parcela */}
      <div className="flex flex-wrap items-end gap-2 rounded-md border p-3">
        <div>
          <label className="text-muted-foreground text-xs">Vencimento</label>
          <Input
            type="date"
            value={newDue}
            onChange={(e) => setNewDue(e.target.value)}
          />
        </div>
        <div>
          <label className="text-muted-foreground text-xs">Valor (R$)</label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={newAmt}
            onChange={(e) => setNewAmt(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            if (!newDue || !newAmt) return;
            const cents = Math.round(parseFloat(newAmt) * 100);
            mAdd.mutate({ dueDate: newDue, amountCents: cents });
            setNewDue("");
            setNewAmt("");
          }}
        >
          Adicionar parcela
        </Button>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <table className="w-full table-auto text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Vencimento</th>
              <th className="px-3 py-2 text-left">Valor</th>
              <th className="px-3 py-2 text-left">Desconto</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const due =
                typeof r.dueDate === "string"
                  ? r.dueDate
                  : new Date(r.dueDate).toISOString().slice(0, 10);
              return (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.seq}</td>
                  <td className="px-3 py-2">
                    <Input
                      type="date"
                      defaultValue={due}
                      onBlur={(e) =>
                        mUpd.mutate({
                          installmentId: r.id,
                          dueDate: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={(r.amountCents / 100).toFixed(2)}
                      onBlur={(e) =>
                        mUpd.mutate({
                          installmentId: r.id,
                          amountCents: Math.round(
                            parseFloat(e.target.value) * 100,
                          ),
                        })
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={(r.discountCents / 100).toFixed(2)}
                      onBlur={(e) =>
                        mUpd.mutate({
                          installmentId: r.id,
                          discountCents: Math.round(
                            parseFloat(e.target.value) * 100,
                          ),
                        })
                      }
                    />
                  </td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-2">
                      {r.status !== "paid" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            mUpd.mutate({
                              installmentId: r.id,
                              markPaid: { paidAt: new Date().toISOString() },
                            })
                          }
                        >
                          Baixar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => mDel.mutate(r.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                    {r.status === "paid" && r.paidAmountCents != null && (
                      <div className="text-muted-foreground text-xs">
                        Pago: {centsToBRL(r.paidAmountCents)}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-muted-foreground px-3 py-8 text-center"
                >
                  Sem parcelas. Adicione acima.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
