"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { PreEnrollmentRow } from "@/app/actions/get-pre-enrollments";
import React, { createElement } from "react";
import StatusBadgeMenuEnrollment from "./status-badge-menu-enrollment";
import {
  formatPhoneBR,
  whatsappLink,
  formatDateTimeBR,
} from "@/lib/formatters";

export const SERVICE_LABEL: Record<PreEnrollmentRow["service"], string> = {
  integral: "Integral",
  meio_periodo: "Meio período",
  infantil_vespertino: "Infantil – Vespertino",
  fundamental_vespertino: "Fundamental – Vespertino",
};
export const GRADE_LABEL: Record<PreEnrollmentRow["grade"], string> = {
  MATERNAL_3: "Maternal (3 anos)",
  PRE_I_4: "Pré I (4 anos)",
  PRE_II_5: "Pré II (5 anos)",
  ANO_1: "1º ANO",
  ANO_2: "2º ANO",
  ANO_3: "3º ANO",
  ANO_4: "4º ANO",
  ANO_5: "5º ANO",
};
export const PAYMENT_LABEL: Record<PreEnrollmentRow["paymentOption"], string> =
  {
    one_oct: "1x (Outubro)",
    two_sep_oct: "2x (Set/Out)",
  };

export const columns: ColumnDef<PreEnrollmentRow>[] = [
  { accessorKey: "studentName", header: "Aluno" },
  {
    accessorKey: "birthDate",
    header: "Nascimento",
    cell: ({ row }) => {
      const [y, m, d] = row.original.birthDate.split("-");
      return `${d}/${m}/${y}`;
    },
  },
  { accessorKey: "guardianName", header: "Responsável" },
  {
    accessorKey: "guardianPhone",
    header: "Telefone",
    cell: ({ row }) => {
      const phone = row.original.guardianPhone;
      const link = whatsappLink(phone);
      const label = formatPhoneBR(phone);
      return createElement(
        "a",
        {
          href: link,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-green-600 hover:text-green-700",
          title: "Conversar no WhatsApp",
        },
        label,
      );
    },
  },
  {
    accessorKey: "service",
    header: "Serviço",
    cell: ({ row }) =>
      SERVICE_LABEL[row.original.service] ?? row.original.service,
  },
  {
    accessorKey: "grade",
    header: "Série",
    cell: ({ row }) => GRADE_LABEL[row.original.grade] ?? row.original.grade,
  },
  {
    accessorKey: "paymentOption",
    header: "Pagamento",
    cell: ({ row }) => PAYMENT_LABEL[row.original.paymentOption],
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      createElement(StatusBadgeMenuEnrollment, {
        id: row.original.id,
        status: row.original.status as any,
      }),
  },
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) => formatDateTimeBR(row.original.createdAt),
  },
];
