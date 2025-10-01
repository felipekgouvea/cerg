"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { PreEnrollmentRow } from "@/app/actions/get-pre-enrollments";
import dynamic from "next/dynamic";
import StatusBadgeMenuEnrollment from "./status-badge-menu-enrollment";
import { formatPhoneBR, whatsappLink } from "@/lib/formatters";

/** Modal de parcelas (import dinâmico para evitar SSR/hidratação) */
const PrePaymentModal = dynamic<{
  preId: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}>(
  () =>
    import("./pre-payment-modal").then(
      (m: any) => m.default ?? m.PrePaymentModal,
    ),
  { ssr: false },
);

/* ===================== Labels ===================== */
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

type PaymentOpt = NonNullable<PreEnrollmentRow["paymentOption"]>;
export const PAYMENT_LABEL: Record<PaymentOpt, string> = {
  one_oct: "1x (Outubro)",
  two_sep_oct: "2x (Set/Out)",
};

/* =============== Botão de ação + Modal (sem JSX) =============== */
function ActionCell({ preId }: { preId: number }) {
  const [open, setOpen] = React.useState(false);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setOpen(true),
        className:
          "inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      },
      "Gerar/Editar parcelas",
    ),
    React.createElement(PrePaymentModal, {
      preId,
      open,
      onOpenChange: setOpen,
    }),
  );
}

/* ===================== Colunas ===================== */
export const columns: ColumnDef<PreEnrollmentRow>[] = [
  { accessorKey: "studentName", header: "Aluno" },

  { accessorKey: "guardianName", header: "Responsável" },

  {
    accessorKey: "guardianPhone",
    header: "Telefone",
    cell: ({ row }) => {
      const phone = row.original.guardianPhone;
      const link = whatsappLink(phone);
      const label = formatPhoneBR(phone);
      return React.createElement(
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
    cell: ({ row }) =>
      row.original.paymentOption
        ? PAYMENT_LABEL[row.original.paymentOption as PaymentOpt]
        : "—",
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      React.createElement(StatusBadgeMenuEnrollment as any, {
        id: row.original.id,
        status: row.original.status as any,
      }),
  },

  {
    id: "actions",
    header: "Ações",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) =>
      React.createElement(ActionCell, { preId: row.original.id }),
  },
];
