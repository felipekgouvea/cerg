"use client";

import { Button } from "@/components/ui/button";
import type { Registration } from "@/lib/types/registration";
import { Download } from "lucide-react";

// Maps -> valor do enum ➜ label legível
const SERVICE_LABEL: Record<Registration["service"], string> = {
  integral: "Integral",
  meio_periodo: "Meio período",
  infantil_vespertino: "Infantil – Vespertino",
  fundamental_vespertino: "Fundamental – Vespertino",
};

const GRADE_LABEL: Record<Registration["grade"], string> = {
  MATERNAL_3: "Maternal (3 anos)",
  PRE_I_4: "Pré I (4 anos)",
  PRE_II_5: "Pré II (5 anos)",
  ANO_1: "1º ano",
  ANO_2: "2º ano",
  ANO_3: "3º ano",
  ANO_4: "4º ano",
  ANO_5: "5º ano",
};

const PAYMENT_LABEL: Record<Registration["paymentOption"], string> = {
  one_oct: "1x (Setembro)",
  two_sep_oct: "2x (Set/Out)",
};

// ⬇️ NOVO: labels de status
const STATUS_LABEL: Record<Registration["status"], string> = {
  realizada: "Realizada",
  em_conversas: "Em conversas",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

// Máscara para exibir no Excel
function formatPhoneBR(value: string): string {
  const d = value.replace(/\D/g, "");
  if (d.length <= 10) {
    const dd = d.padEnd(10, " ");
    return `(${dd.slice(0, 2)}) ${dd.slice(2, 6)}-${dd.slice(6, 10)}`.trim();
  }
  const dd = d.padEnd(11, " ");
  return `(${dd.slice(0, 2)}) ${dd.slice(2, 3)}${dd.slice(3, 7)}-${dd.slice(7, 11)}`.trim();
}

function formatDateBR(ymd: string): string {
  // espera "YYYY-MM-DD"
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

export function ExportButton({ data }: { data: Registration[] }) {
  async function handleExport() {
    const XLSX = await import("xlsx");

    // Monta linhas já "amigáveis" para Excel
    const rows = data.map((r) => ({
      Aluno: r.studentName,
      Nascimento: formatDateBR(r.birthDate),
      Responsável: r.guardianName,
      Telefone: formatPhoneBR(r.guardianPhone),
      Serviço: SERVICE_LABEL[r.service],
      Série: GRADE_LABEL[r.grade],
      Pagamento: PAYMENT_LABEL[r.paymentOption],
      Status: STATUS_LABEL[r.status], // ⬅️ NOVO
      "Criado em": new Date(r.createdAt).toLocaleString("pt-BR"),
    }));

    const headers = [
      "Aluno",
      "Nascimento",
      "Responsável",
      "Telefone",
      "Serviço",
      "Série",
      "Pagamento",
      "Status", // ⬅️ NOVO
      "Criado em",
    ];

    // Cria worksheet e aplica AutoFilter
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

    // Ajusta larguras (1 por coluna)
    ws["!cols"] = [
      { wch: 30 }, // Aluno
      { wch: 12 }, // Nascimento
      { wch: 28 }, // Responsável
      { wch: 18 }, // Telefone
      { wch: 24 }, // Serviço
      { wch: 12 }, // Série
      { wch: 16 }, // Pagamento
      { wch: 16 }, // Status
      { wch: 20 }, // Criado em
    ];

    // AutoFilter no range inteiro
    if (ws["!ref"]) {
      ws["!autofilter"] = { ref: ws["!ref"] };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    XLSX.writeFile(wb, `relatorio-registrations-${yyyy}-${mm}-${dd}.xlsx`);
  }

  return (
    <Button
      className="cursor-pointer"
      variant="outline"
      size="sm"
      onClick={handleExport}
    >
      <Download className="mr-2 h-4 w-4" />
      Exportar Excel
    </Button>
  );
}
