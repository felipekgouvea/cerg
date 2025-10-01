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
    <div className="w-full">
      <DataTable
        columns={columns}
        data={data}
        searchFildes={[
          "studentName",
          "guardianName",
          "service",
          "grade",
          "paymentOption",
          "status",
        ]}
        placeholder="Filtrar..."
        pageSize={10}
      />
    </div>
  );
}
