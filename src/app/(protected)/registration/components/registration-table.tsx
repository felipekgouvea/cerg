// src/app/(protected)/pre-registrations/components/registration-table.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getPreRegistrations,
  type PreRegistrationRow,
} from "@/app/actions/get-pre-registrations";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default function RegistrationTable() {
  const { data, isLoading, isError } = useQuery<PreRegistrationRow[]>({
    queryKey: ["pre-registrations"],
    queryFn: () => getPreRegistrations(),
  });

  if (isLoading)
    return (
      <div className="text-muted-foreground">Carregando pré-matrículas...</div>
    );
  if (isError || !data)
    return (
      <div className="text-destructive">Erro ao carregar pré-matrículas.</div>
    );

  return <DataTable columns={columns} data={data} />;
}
