"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchReportRows } from "@/app/actions/reports";
import type {
  ReportDataset,
  ReportFilters,
  ReportRow,
  Grade,
  ServiceKey,
  PreStatus,
  PaymentUI,
} from "@/app/actions/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

/** ===== Constantes do PDF ===== */
const schoolName = "CERG";
const logoUrl = "/logo.png"; // coloque seu logo em public/logo.png ou ajuste este caminho

/** ===== Opções ===== */
const ALL = "ALL" as const;

const gradeOptions = [
  "MATERNAL_3",
  "PRE_I_4",
  "PRE_II_5",
  "ANO_1",
  "ANO_2",
  "ANO_3",
  "ANO_4",
  "ANO_5",
] as const;

const serviceOptions = [
  "integral",
  "meio_periodo",
  "infantil_vespertino",
  "fundamental_vespertino",
] as const;

const statusOptions = [
  "realizada",
  "em_conversas",
  "finalizado",
  "cancelado",
] as const;

const paymentOptions = ["one_oct", "two_sep_oct"] as const;

type GradeFilter = typeof ALL | (typeof gradeOptions)[number];
type ServiceFilter = typeof ALL | (typeof serviceOptions)[number];
type StatusFilter = typeof ALL | (typeof statusOptions)[number];
type PaymentFilter = typeof ALL | (typeof paymentOptions)[number];

const GRADE_LABEL: Record<Grade, string> = {
  MATERNAL_3: "Maternal (3 anos)",
  PRE_I_4: "Pré I (4 anos)",
  PRE_II_5: "Pré II (5 anos)",
  ANO_1: "1º ANO",
  ANO_2: "2º ANO",
  ANO_3: "3º ANO",
  ANO_4: "4º ANO",
  ANO_5: "5º ANO",
};

const SERVICE_LABEL: Record<ServiceKey, string> = {
  integral: "Integral",
  meio_periodo: "Meio período",
  infantil_vespertino: "Infantil – Vespertino",
  fundamental_vespertino: "Fundamental – Vespertino",
};

const PAYMENT_LABEL: Record<PaymentUI, string> = {
  one_oct: "1x (Outubro)",
  two_sep_oct: "2x (Set/Out)",
};

/** ===== Campos exportáveis ===== */
type CommonField =
  | "id"
  | "studentName"
  | "guardianName"
  | "guardianPhone"
  | "service"
  | "paymentOption"
  | "status"
  | "createdAt";

type RegistrationField = "targetYear" | "targetGrade";
type ReenrollmentField =
  | "currentYear"
  | "currentGrade"
  | "nextYear"
  | "nextGrade";

type VisibleKey = CommonField | RegistrationField | ReenrollmentField;

const commonFieldLabels: Record<CommonField, string> = {
  id: "ID",
  studentName: "Aluno",
  guardianName: "Responsável",
  guardianPhone: "Telefone",
  service: "Serviço",
  paymentOption: "Pagamento",
  status: "Status",
  createdAt: "Criado em",
};

const registrationFieldLabels: Record<RegistrationField, string> = {
  targetYear: "Ano letivo (alvo)",
  targetGrade: "Série (alvo)",
};

const reenrollmentFieldLabels: Record<ReenrollmentField, string> = {
  currentYear: "Ano atual",
  currentGrade: "Série atual",
  nextYear: "Ano seguinte",
  nextGrade: "Série seguinte",
};

function getLabelForKey(key: VisibleKey): string {
  if (key in commonFieldLabels) return commonFieldLabels[key as CommonField];
  if (key in registrationFieldLabels)
    return registrationFieldLabels[key as RegistrationField];
  if (key in reenrollmentFieldLabels)
    return reenrollmentFieldLabels[key as ReenrollmentField];
  return key;
}

type FilterState = {
  dataset: ReportDataset;
  grade: GradeFilter;
  service: ServiceFilter;
  status: StatusFilter;
  payment: PaymentFilter;
  from?: string;
  to?: string;
};

const defaultFilters: FilterState = {
  dataset: "reenrollment",
  grade: ALL,
  service: ALL,
  status: ALL,
  payment: ALL,
};

export default function ReportBuilder() {
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);

  // seleção de campos
  const [commonFields, setCommonFields] = React.useState<CommonField[]>([
    "studentName",
    "guardianName",
    "guardianPhone",
    "service",
    "paymentOption",
    "status",
    "createdAt",
  ]);
  const [regFields, setRegFields] = React.useState<RegistrationField[]>([]);
  const [reenFields, setReenFields] = React.useState<ReenrollmentField[]>([
    "nextGrade",
  ]);

  const query = useQuery({
    queryKey: ["report-rows", filters],
    queryFn: () => fetchReportRows(filters as ReportFilters),
  });

  const rows = query.data ?? [];

  function toggleCommonField(k: CommonField, on: boolean) {
    setCommonFields((prev) =>
      on ? Array.from(new Set([...prev, k])) : prev.filter((f) => f !== k),
    );
  }
  function toggleRegField(k: RegistrationField, on: boolean) {
    setRegFields((prev) =>
      on ? Array.from(new Set([...prev, k])) : prev.filter((f) => f !== k),
    );
  }
  function toggleReenField(k: ReenrollmentField, on: boolean) {
    setReenFields((prev) =>
      on ? Array.from(new Set([...prev, k])) : prev.filter((f) => f !== k),
    );
  }

  const visibleFields = React.useMemo<VisibleKey[]>(() => {
    const base: VisibleKey[] = [...commonFields];
    if (filters.dataset === "registration") base.push(...regFields);
    if (filters.dataset === "reenrollment") base.push(...reenFields);
    return base;
  }, [commonFields, regFields, reenFields, filters.dataset]);

  function cellValue(row: ReportRow, key: VisibleKey): string {
    switch (key) {
      case "service":
        return row.service ? SERVICE_LABEL[row.service] : "—";
      case "paymentOption":
        return row.paymentOption ? PAYMENT_LABEL[row.paymentOption] : "—";
      case "targetGrade":
      case "currentGrade":
      case "nextGrade": {
        const g = row[key as "targetGrade" | "currentGrade" | "nextGrade"] as
          | Grade
          | null
          | undefined;
        return g ? GRADE_LABEL[g] : "—";
      }
      default: {
        const val = row[key as keyof ReportRow];
        if (val == null) return "—";
        return String(val);
      }
    }
  }

  function exportCSV() {
    const headers = visibleFields.map((k) => getLabelForKey(k));
    const csvRows = [
      ["Conjunto", ...headers],
      ...rows.map((r) => [
        r.dataset === "registration" ? "Pré-Matrículas" : "Pré-Rematrículas",
        ...visibleFields.map((k) => String(cellValue(r, k))),
      ]),
    ];
    const csv = csvRows
      .map((arr) =>
        arr
          .map((v) => {
            const s = String(v ?? "");
            if (s.includes('"') || s.includes(",") || s.includes(";"))
              return `"${s.replace(/"/g, '""')}"`;
            return s;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `relatorio-${filters.dataset}-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** ===== Util: carrega imagem como DataURL para o cabeçalho ===== */
  async function loadImageAsDataURL(url: string): Promise<string | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  /** ===== Exportar PDF (duas colunas verticais) ===== */
  async function exportPDF() {
    if (rows.length === 0) return;

    const [{ jsPDF }, logoDataUrl] = await Promise.all([
      import("jspdf"),
      loadImageAsDataURL(logoUrl),
    ]);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 36; // 0.5"
    const gutter = 16;
    const colWidth = (pageWidth - margin * 2 - gutter) / 2;

    // Cabeçalho (repetido por página)
    const headerHeight = 64;

    function drawHeader() {
      const y = margin;
      // logo
      if (logoDataUrl) {
        const logoSize = 42;
        doc.addImage(logoDataUrl, "PNG", margin, y, logoSize, logoSize);
      }
      // nome e subtítulo
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(schoolName, margin + (logoDataUrl ? 52 : 0), y + 18);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        filters.dataset === "registration"
          ? "Relatório de Pré-Matrículas"
          : "Relatório de Pré-Rematrículas",
        margin + (logoDataUrl ? 52 : 0),
        y + 36,
      );
      // linha
      doc.setDrawColor(180);
      doc.line(
        margin,
        y + headerHeight - 10,
        pageWidth - margin,
        y + headerHeight - 10,
      );
    }

    drawHeader();

    let col = 0; // 0 (esquerda) | 1 (direita)
    let cursorY = margin + headerHeight;

    const boxPadding = 8;
    const lineHeight = 14;
    const titleHeight = 16;

    // Campos a imprimir
    const fields: VisibleKey[] = visibleFields.length
      ? visibleFields
      : (["studentName", "guardianName", "guardianPhone"] as VisibleKey[]);

    // Renderiza cartão (box) por registro
    function renderCard(r: ReportRow) {
      const lines = 1 + fields.length; // título + campos
      const boxHeight = boxPadding * 2 + titleHeight + lines * lineHeight;

      // quebra para próxima coluna / página
      if (cursorY + boxHeight > pageHeight - margin) {
        if (col === 0) {
          col = 1;
          cursorY = margin + headerHeight;
        } else {
          doc.addPage();
          drawHeader();
          col = 0;
          cursorY = margin + headerHeight;
        }
      }

      const x = margin + col * (colWidth + gutter);
      const y = cursorY;

      // moldura
      doc.setDrawColor(210);
      doc.roundedRect(x, y, colWidth, boxHeight, 6, 6);

      // título (dataset)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const title =
        r.dataset === "registration" ? "Pré-Matrícula" : "Pré-Rematrícula";
      doc.text(title, x + boxPadding, y + boxPadding + 12);

      // campos
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      let ly = y + boxPadding + titleHeight;

      fields.forEach((k) => {
        const label = getLabelForKey(k);
        const value = cellValue(r, k);
        const composed = `${label}: ${value}`;
        const wrapped = doc.splitTextToSize(
          composed,
          colWidth - boxPadding * 2,
        );
        doc.text(wrapped as unknown as string[], x + boxPadding, ly);
        ly += lineHeight * (Array.isArray(wrapped) ? wrapped.length : 1);
      });

      cursorY += boxHeight + 10;
    }

    rows.forEach((r) => renderCard(r));

    // download
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    doc.save(`relatorio-${filters.dataset}-${stamp}.pdf`);
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="rounded-2xl border p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          {/* Conjunto */}
          <div>
            <label className="text-muted-foreground mb-1 block text-sm">
              Conjunto
            </label>
            <Select
              value={filters.dataset}
              onValueChange={(v: ReportDataset) =>
                setFilters((s) => ({ ...s, dataset: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reenrollment">Pré-Rematrículas</SelectItem>
                <SelectItem value="registration">Pré-Matrículas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Turma */}
          <div>
            <label className="text-muted-foreground mb-1 block text-sm">
              Turma
            </label>
            <Select
              value={filters.grade}
              onValueChange={(v: GradeFilter) =>
                setFilters((s) => ({ ...s, grade: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas</SelectItem>
                {gradeOptions.map((g) => (
                  <SelectItem key={g} value={g}>
                    {GRADE_LABEL[g as Grade]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Serviço */}
          <div>
            <label className="text-muted-foreground mb-1 block text-sm">
              Serviço
            </label>
            <Select
              value={filters.service}
              onValueChange={(v: ServiceFilter) =>
                setFilters((s) => ({ ...s, service: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {serviceOptions.map((k) => (
                  <SelectItem key={k} value={k}>
                    {SERVICE_LABEL[k as ServiceKey]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <label className="text-muted-foreground mb-1 block text-sm">
              Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(v: StatusFilter) =>
                setFilters((s) => ({ ...s, status: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {statusOptions.map((sOpt) => (
                  <SelectItem key={sOpt} value={sOpt}>
                    {sOpt === "em_conversas"
                      ? "Em conversas"
                      : sOpt[0].toUpperCase() + sOpt.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pagamento */}
          <div>
            <label className="text-muted-foreground mb-1 block text-sm">
              Pagamento
            </label>
            <Select
              value={filters.payment}
              onValueChange={(v: PaymentFilter) =>
                setFilters((s) => ({ ...s, payment: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {paymentOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PAYMENT_LABEL[p as PaymentUI]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Período */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-muted-foreground mb-1 block text-sm">
                De
              </label>
              <Input
                type="date"
                value={filters.from ?? ""}
                onChange={(e) =>
                  setFilters((s) => ({
                    ...s,
                    from: e.target.value || undefined,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-sm">
                Até
              </label>
              <Input
                type="date"
                value={filters.to ?? ""}
                onChange={(e) =>
                  setFilters((s) => ({ ...s, to: e.target.value || undefined }))
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Campos */}
      <div className="rounded-2xl border p-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Campos comuns</legend>
            <div className="space-y-2">
              {(
                Object.keys(commonFieldLabels) as Array<
                  keyof typeof commonFieldLabels
                >
              ).map((k) => (
                <label key={k} className="flex items-center gap-2">
                  <Checkbox
                    checked={commonFields.includes(k)}
                    onCheckedChange={(on) => toggleCommonField(k, Boolean(on))}
                  />
                  <span className="text-sm">{commonFieldLabels[k]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Pré-Matrículas</legend>
            <div className="space-y-2">
              {(
                Object.keys(registrationFieldLabels) as Array<
                  keyof typeof registrationFieldLabels
                >
              ).map((k) => (
                <label key={k} className="flex items-center gap-2">
                  <Checkbox
                    checked={regFields.includes(k)}
                    onCheckedChange={(on) => toggleRegField(k, Boolean(on))}
                    disabled={filters.dataset !== "registration"}
                  />
                  <span className="text-sm">{registrationFieldLabels[k]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              Pré-Rematrículas
            </legend>
            <div className="space-y-2">
              {(
                Object.keys(reenrollmentFieldLabels) as Array<
                  keyof typeof reenrollmentFieldLabels
                >
              ).map((k) => (
                <label key={k} className="flex items-center gap-2">
                  <Checkbox
                    checked={reenFields.includes(k)}
                    onCheckedChange={(on) => toggleReenField(k, Boolean(on))}
                    disabled={filters.dataset !== "reenrollment"}
                  />
                  <span className="text-sm">{reenrollmentFieldLabels[k]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setFilters(defaultFilters);
            setCommonFields([
              "studentName",
              "guardianName",
              "guardianPhone",
              "service",
              "paymentOption",
              "status",
              "createdAt",
            ]);
            setRegFields([]);
            setReenFields(["nextGrade"]);
          }}
        >
          Limpar
        </Button>
        <Button onClick={exportCSV} disabled={rows.length === 0}>
          Exportar CSV
        </Button>
        <Button onClick={exportPDF} disabled={rows.length === 0}>
          Exportar PDF
        </Button>
      </div>

      {/* Preview */}
      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conjunto</TableHead>
              {visibleFields.map((k) => (
                <TableHead key={k}>{getLabelForKey(k)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={1 + visibleFields.length}
                  className="text-center"
                >
                  Sem resultados.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={`${r.dataset}-${r.id}`}>
                  <TableCell className="whitespace-nowrap">
                    {r.dataset === "registration"
                      ? "Pré-Matrículas"
                      : "Pré-Rematrículas"}
                  </TableCell>
                  {visibleFields.map((k) => (
                    <TableCell key={k} className="whitespace-nowrap">
                      {cellValue(r, k)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
