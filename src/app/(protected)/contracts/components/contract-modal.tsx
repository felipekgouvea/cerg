"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ContractRow,
  ServiceKey,
} from "@/app/actions/contracts/get-contracts";

const SERVICE_LABEL: Record<ServiceKey, string> = {
  integral: "Integral",
  meio_periodo: "Meio período",
  infantil_vespertino: "Infantil – Vespertino",
  fundamental_vespertino: "Fundamental – Vespertino",
};

export default function ContractModal({
  open,
  onClose,
  row,
}: {
  open: boolean;
  onClose: () => void;
  row: ContractRow;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <DialogContent className="max-h-[95vh] w-[95vw] max-w-5xl overflow-auto">
        <DialogHeader>
          <DialogTitle>
            Contrato #{row.id} • {row.year}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dados" className="mt-2">
          <TabsList className="w-full justify-start overflow-auto">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="observacoes">Observações</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          </TabsList>

          {/* Aba: Dados (cards) */}
          <TabsContent value="dados" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base">Aluno</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome: </span>
                    <strong>{row.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Responsável: </span>
                    <strong>{row.guardianName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefone: </span>
                    <strong>{row.guardianPhone}</strong>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base">Serviço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Plano: </span>
                    <strong>
                      {row.serviceKey
                        ? SERVICE_LABEL[row.serviceKey]
                        : (row.serviceName ?? "—")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status: </span>
                    <Badge
                      variant="secondary"
                      className="rounded-full capitalize"
                    >
                      {row.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Endereço</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  Não cadastrado.
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba: Observações */}
          <TabsContent value="observacoes" className="mt-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  (Futuro: salvar/editar observações do contrato)
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Financeiro */}
          <TabsContent value="financeiro" className="mt-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  (Futuro: exibir/gerenciar parcelas, descontos, baixas, etc.)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
