"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef, CellContext } from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

import {
  getContracts,
  type ContractRow,
  type ServiceKey,
} from "@/app/actions/contracts/get-contracts";
import { createContractFromPre } from "@/app/actions/contracts/create-from-pre";

import QuickCreateDialog from "./quick-create-dialog";
import ContractModal from "./contract-modal";
import { Badge } from "@/components/ui/badge";

const SERVICE_LABEL: Record<ServiceKey, string> = {
  integral: "Integral",
  meio_periodo: "Meio período",
  infantil_vespertino: "Infantil – Vespertino",
  fundamental_vespertino: "Fundamental – Vespertino",
};

export default function ContractsTable() {
  const [selected, setSelected] = React.useState<ContractRow | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<ContractRow[]>({
    queryKey: ["contracts", 2026],
    queryFn: () => getContracts(2026),
  });

  const mutation = useMutation({
    mutationFn: (preId: number) =>
      createContractFromPre({ preReenrollmentId: preId }),
    onSuccess: async (r) => {
      if (r.success) {
        toast.success("Contrato gerado a partir da pré-rematrícula!");
        refetch();
      } else toast.error("Não foi possível gerar o contrato.");
    },
  });

  const columns: ColumnDef<ContractRow>[] = [
    { accessorKey: "id", header: "Contrato" },
    { accessorKey: "year", header: "Ano" },
    {
      accessorKey: "studentName",
      header: "Aluno",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.studentName}</span>
      ),
    },
    {
      accessorKey: "serviceKey",
      header: "Serviço",
      cell: ({ row }) =>
        row.original.serviceKey
          ? SERVICE_LABEL[row.original.serviceKey]
          : (row.original.serviceName ?? "—"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="secondary" className="rounded-full capitalize">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }: CellContext<ContractRow, unknown>) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelected(row.original)}
          >
            Abrir
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading)
    return <div className="text-muted-foreground">Carregando…</div>;
  if (isError || !data)
    return <div className="text-destructive">Erro ao carregar.</div>;

  return (
    <div className="min-h-[calc(100vh-12rem)]">
      <div className="mb-4 flex items-center gap-2">
        <QuickCreateDialog
          year={2026}
          isLoading={mutation.isPending}
          onConfirm={(id) => mutation.mutate(id)}
        />
      </div>

      <DataTable columns={columns} data={data} />

      {selected && (
        <ContractModal open row={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
