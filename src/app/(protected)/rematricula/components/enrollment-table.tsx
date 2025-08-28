"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getPreEnrollments,
  type PreEnrollmentRow,
} from "@/app/actions/get-pre-enrollments";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default function EnrollmentTable() {
  const { data, isLoading, isError } = useQuery<PreEnrollmentRow[]>({
    queryKey: ["enrollment"],
    queryFn: () => getPreEnrollments(),
  });

  if (isLoading)
    return (
      <div className="text-muted-foreground">
        Carregando pré-rematrículas...
      </div>
    );
  if (isError || !data)
    return (
      <div className="text-destructive">Erro ao carregar pré-rematrículas.</div>
    );

  return (
    <DataTable
      columns={columns}
      data={data}
      filterColumn="studentName"
      placeholder="Filtrar por aluno..."
      pageSize={20}
    />
  );
}
