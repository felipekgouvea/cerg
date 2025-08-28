// src/app/(protected)/pre-registrations/components/columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { PreRegistrationRow } from "@/app/actions/get-pre-registrations";
import React, { createElement } from "react";
import { formatPhoneBR } from "@/lib/formatters";
import StatusBadgeMenuRegistration from "./status-badge-menu-registration";

const SERVICE_LABEL: Record<
  NonNullable<PreRegistrationRow["service"]>,
  string
> = {
  integral: "Integral",
  meio_periodo: "Meio período",
  infantil_vespertino: "Infantil – Vespertino",
  fundamental_vespertino: "Fundamental – Vespertino",
};
const GRADE_LABEL: Record<PreRegistrationRow["grade"], string> = {
  MATERNAL_3: "Maternal (3 anos)",
  PRE_I_4: "Pré I (4 anos)",
  PRE_II_5: "Pré II (5 anos)",
  ANO_1: "1º ANO",
  ANO_2: "2º ANO",
  ANO_3: "3º ANO",
  ANO_4: "4º ANO",
  ANO_5: "5º ANO",
};
const PAYMENT_LABEL: Record<
  NonNullable<PreRegistrationRow["paymentOption"]>,
  string
> = {
  one_oct: "1x (Outubro)",
  two_sep_oct: "2x (Set/Out)",
};

// link do WhatsApp com texto
function whatsappMessageLink(rawPhone: string, text: string) {
  const digits = rawPhone.replace(/\D/g, "");
  const withCC = digits.length === 11 ? `55${digits}` : digits; // garante DDI
  const base = `https://wa.me/${withCC}`;
  return `${base}?text=${encodeURIComponent(text)}`;
}

// mensagem para enviar
function buildWhatsAppMessage(r: PreRegistrationRow) {
  const [y, m, d] = r.birthDate.split("-");
  const nasc = `${d}/${m}/${y}`;
  const svc = r.service ? SERVICE_LABEL[r.service] : "—";
  const pay = r.paymentOption ? PAYMENT_LABEL[r.paymentOption] : "—";

  return [
    `Olá, ${r.guardianName}! Aqui é do CERG 👋`,
    ``,
    `Recebemos a PRÉ-MATRÍCULA de *${r.studentName}* para *${GRADE_LABEL[r.grade]} (${r.createdAt.slice(0, 10)})*.`,
    ``,
    `**Dados enviados:**`,
    `• Nascimento: ${nasc}`,
    `• Série pretendida: ${GRADE_LABEL[r.grade]}`,
    `• Serviço: ${svc}`,
    `• Pagamento: ${pay}`,
    ``,
    `Em breve retornaremos com mais detalhes. Se preferir, você pode responder por aqui mesmo. ✅`,
  ].join("\n");
}

export const columns: ColumnDef<PreRegistrationRow>[] = [
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
    header: "WhatsApp",
    cell: ({ row }) => {
      const link = whatsappMessageLink(
        row.original.guardianPhone,
        buildWhatsAppMessage(row.original),
      );
      const label = formatPhoneBR(row.original.guardianPhone);
      return createElement(
        "a",
        {
          href: link,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-green-600 hover:text-green-700",
          title: "Enviar mensagem no WhatsApp",
        },
        label,
      );
    },
  },
  {
    accessorKey: "grade",
    header: "Série",
    cell: ({ row }) => GRADE_LABEL[row.original.grade],
  },
  {
    accessorKey: "service",
    header: "Serviço",
    cell: ({ row }) =>
      row.original.service ? SERVICE_LABEL[row.original.service] : "—",
  },
  {
    accessorKey: "paymentOption",
    header: "Pagamento",
    cell: ({ row }) =>
      row.original.paymentOption
        ? PAYMENT_LABEL[row.original.paymentOption]
        : "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      createElement(StatusBadgeMenuRegistration, {
        id: row.original.id,
        status: row.original.status,
      }),
  },
];
