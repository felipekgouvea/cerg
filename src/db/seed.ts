/* eslint-disable no-console */
// Execute com:  npx tsx src/db/seed.ts
import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import * as XLSX from "xlsx";
import { db } from "@/db";
import {
  students,
  enrollments,
  services,
  serviceValues,
  // preRegistrations,
  // preReenrollments,
} from "@/db/schema";
import { asc, sql } from "drizzle-orm";

/** ===================== Tipos ===================== */

type Grade =
  | "MATERNAL_3"
  | "PRE_I_4"
  | "PRE_II_5"
  | "ANO_1"
  | "ANO_2"
  | "ANO_3"
  | "ANO_4"
  | "ANO_5";

type ServiceKey =
  | "integral"
  | "meio_periodo"
  | "infantil_vespertino"
  | "fundamental_vespertino";

/** ===================== Config ===================== */

const EXCEL_PATH = path.resolve(process.cwd(), "src/db/data/alunos.xlsx");
const YEAR_2025 = 2025;
const YEAR_2026 = 2026;

// Valores reais 2026 (em centavos)
const PRICE_2026: Record<
  ServiceKey,
  { list: number; punctual: number; reenroll: number }
> = {
  integral: { list: 141000, punctual: 130000, reenroll: 120000 },
  meio_periodo: { list: 102000, punctual: 95000, reenroll: 90000 },
  infantil_vespertino: { list: 55000, punctual: 53000, reenroll: 50000 },
  fundamental_vespertino: { list: 65000, punctual: 63000, reenroll: 60000 },
};

// (se precisar depois)
const PROMO_25_TO_26: Record<Grade, Grade> = {
  MATERNAL_3: "PRE_I_4",
  PRE_I_4: "PRE_II_5",
  PRE_II_5: "ANO_1",
  ANO_1: "ANO_2",
  ANO_2: "ANO_3",
  ANO_3: "ANO_4",
  ANO_4: "ANO_5",
  ANO_5: "ANO_5",
};

/** ===================== Utils ===================== */

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number} ]/gu, "")
    .trim();

const onlyDigits = (s: string) => (s ?? "").replace(/\D/g, "");

function toDateUTCFromYMD(ymd: string): Date {
  return new Date(`${ymd}T00:00:00.000Z`);
}

function parseExcelDateToDate(raw: any): Date | null {
  if (!raw) return null;
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return new Date(
      Date.UTC(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate()),
    );
  }
  if (typeof raw === "number") {
    const d = XLSX.SSF.parse_date_code(raw);
    if (d) return new Date(Date.UTC(d.y, (d.m ?? 1) - 1, d.d ?? 1));
  }
  if (typeof raw === "string") {
    const s = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return toDateUTCFromYMD(s);
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return toDateUTCFromYMD(`${m[3]}-${m[2]}-${m[1]}`);
    const d = new Date(s);
    if (!isNaN(d.getTime()))
      return new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      );
  }
  return null;
}

function guessGradeFromText(s: string): Grade | null {
  const t = norm(s);
  if (/(mater|matern)/.test(t)) return "MATERNAL_3";
  if (/(pre ?i\b|pre 1\b|4 anos|pre i 4)/.test(t)) return "PRE_I_4";
  if (/(pre ?ii\b|pre 2\b|5 anos|pre ii 5)/.test(t)) return "PRE_II_5";
  if (/(^|[^0-9])1(º|o)? ?ano\b/.test(t) || /\bano[ _-]?1\b/.test(t))
    return "ANO_1";
  if (/(^|[^0-9])2(º|o)? ?ano\b/.test(t) || /\bano[ _-]?2\b/.test(t))
    return "ANO_2";
  if (/(^|[^0-9])3(º|o)? ?ano\b/.test(t) || /\bano[ _-]?3\b/.test(t))
    return "ANO_3";
  if (/(^|[^0-9])4(º|o)? ?ano\b/.test(t) || /\bano[ _-]?4\b/.test(t))
    return "ANO_4";
  if (/(^|[^0-9])5(º|o)? ?ano\b/.test(t) || /\bano[ _-]?5\b/.test(t))
    return "ANO_5";
  return null;
}

function fallbackBirthForGrade2025(g: Grade): Date {
  const mapYear: Record<Grade, number> = {
    MATERNAL_3: 2022,
    PRE_I_4: 2021,
    PRE_II_5: 2020,
    ANO_1: 2019,
    ANO_2: 2018,
    ANO_3: 2017,
    ANO_4: 2016,
    ANO_5: 2015,
  };
  const y = mapYear[g];
  const m = ((y + 3) % 12) + 1;
  const d = ((y + 11) % 28) + 1;
  return toDateUTCFromYMD(
    `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
  );
}

function serviceForGrade2025(g: Grade): ServiceKey {
  return g === "MATERNAL_3" || g === "PRE_I_4" || g === "PRE_II_5"
    ? "infantil_vespertino"
    : "fundamental_vespertino";
}

/** ===================== Excel → JSON ===================== */

type ParsedRow = {
  studentName: string;
  guardianName: string;
  guardianPhone: string; // só dígitos
  birthDate: Date | null;
  grade2025: Grade | null;
};

function readAllStudentsFromExcel(): ParsedRow[] {
  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`Arquivo Excel não encontrado em: ${EXCEL_PATH}`);
  }

  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, {
    defval: null,
    raw: true,
  });
  if (!rawRows.length) return [];

  const headers = Object.keys(rawRows[0]).map((h) => [h, norm(h)] as const);

  const pick = (
    row: Record<string, any>,
    predicate: (normHeader: string) => boolean,
  ) => {
    const found = headers.find(([_, n]) => predicate(n));
    return found ? row[found[0]] : null;
  };

  const pickIncludes = (row: Record<string, any>, ...cands: string[]) =>
    pick(row, (n) => cands.some((c) => n.includes(c)));

  const parsed: ParsedRow[] = rawRows
    .map((row) => {
      const nome =
        pickIncludes(row, "aluno", "estudante", "nome") ??
        row["Aluno"] ??
        row["Nome"];
      if (!nome) return null;

      const resp =
        pickIncludes(row, "responsavel", "responsaveis", "mae", "pai") ??
        row["Responsável"] ??
        row["Responsavel"];

      const fone =
        pickIncludes(
          row,
          "telefone",
          "whatsapp",
          "celular",
          "fone",
          "contato",
        ) ??
        row["Telefone"] ??
        row["Whatsapp"];

      const nasc =
        pickIncludes(row, "nascimento", "data de nascimento", "nasc") ??
        row["Nascimento"];

      // *** PRIORIDADE: "Cursa em 2025" ***
      const turmaCursa2025 = pick(
        row,
        (n) => n.includes("cursa") && n.includes("2025"),
      );

      // Fallbacks antigos (Turma 2025 / Turma / Série / Etapa / Ano)
      const turmaFallback =
        pickIncludes(
          row,
          "turma 2025",
          "turma",
          "serie",
          "série",
          "etapa",
          "ano",
        ) ??
        row["Turma 2025"] ??
        row["Série"];

      const turmaFonte = turmaCursa2025 ?? turmaFallback;

      const studentName = String(nome).trim();
      const guardianName = resp
        ? String(resp).trim()
        : "Responsável não informado";
      const guardianPhone = fone ? onlyDigits(String(fone)) : "";
      const birthDate = parseExcelDateToDate(nasc);
      const grade2025 = turmaFonte
        ? guessGradeFromText(String(turmaFonte))
        : null;

      return {
        studentName,
        guardianName,
        guardianPhone,
        birthDate,
        grade2025,
      } as ParsedRow;
    })
    .filter(Boolean) as ParsedRow[];

  return parsed;
}

/** ===================== DB helpers ===================== */

async function clearAll() {
  console.log("Limpando tabelas…");
  await db.execute(sql`
    TRUNCATE TABLE
      "enrollments",
      "service_values",
      "services",
      "students"
    RESTART IDENTITY CASCADE;
  `);
  // Se quiser limpar também pré-matrículas:
  // await db.execute(sql`
  //   TRUNCATE TABLE
  //     "pre_reenrollments",
  //     "pre_registrations"
  //   RESTART IDENTITY CASCADE;
  // `);
}

async function upsertServices() {
  console.log("Upsert services…");
  // Se 'active' for boolean no schema, troque 1 -> true
  await db
    .insert(services)
    .values([
      { key: "integral", name: "Integral", active: 1 },
      { key: "meio_periodo", name: "Meio período", active: 1 },
      { key: "infantil_vespertino", name: "Infantil – Vespertino", active: 1 },
      {
        key: "fundamental_vespertino",
        name: "Fundamental – Vespertino",
        active: 1,
      },
    ] as any)
    .onConflictDoNothing({ target: [services.key] });

  const svc = await db
    .select({ id: services.id, key: services.key })
    .from(services)
    .orderBy(asc(services.id));
  const map = new Map<ServiceKey, number>();
  svc.forEach((r) => map.set(r.key as ServiceKey, r.id));
  return map;
}

async function upsertValues2026(serviceIdByKey: Map<ServiceKey, number>) {
  console.log("Upsert valores 2026…");
  const allGrades: Grade[] = [
    "MATERNAL_3",
    "PRE_I_4",
    "PRE_II_5",
    "ANO_1",
    "ANO_2",
    "ANO_3",
    "ANO_4",
    "ANO_5",
  ];

  const payload = (Object.keys(PRICE_2026) as ServiceKey[]).flatMap(
    (svcKey) => {
      const svcId = serviceIdByKey.get(svcKey)!;
      const p = PRICE_2026[svcKey];
      return allGrades.map((g) => ({
        serviceId: svcId,
        year: YEAR_2026,
        grade: g,
        listPriceCents: p.list,
        punctualPriceCents: p.punctual,
        reenrollPriceCents: p.reenroll,
      }));
    },
  );

  await db
    .insert(serviceValues)
    .values(payload as any)
    .onConflictDoUpdate({
      target: [
        serviceValues.serviceId,
        serviceValues.year,
        serviceValues.grade,
      ],
      set: {
        listPriceCents: sql`excluded.list_price_cents`,
        punctualPriceCents: sql`excluded.punctual_price_cents`,
        reenrollPriceCents: sql`excluded.reenroll_price_cents`,
      },
    });
}

async function insertAllStudentsAndEnrollments2025(
  serviceIdByKey: Map<ServiceKey, number>,
) {
  console.log("Lendo planilha…", EXCEL_PATH);
  const parsed = readAllStudentsFromExcel();
  console.log(`Encontrados ${parsed.length} alunos na planilha.`);

  if (!parsed.length) {
    console.warn("Nenhum aluno encontrado. Abortando.");
    return;
  }

  // Inserir alunos
  console.log("Inserindo alunos…");
  const inserted = await db
    .insert(students)
    .values(
      parsed.map((p) => {
        const g: Grade = p.grade2025 ?? "PRE_I_4";
        const birth: Date = p.birthDate ?? fallbackBirthForGrade2025(g);
        return {
          name: p.studentName,
          birthDate: birth, // Date (coluna date(mode:"date"))
          guardianName: p.guardianName,
          guardianPhone: p.guardianPhone, // só dígitos
        };
      }) as any,
    )
    .returning({ id: students.id });

  // Matrículas 2025
  console.log("Criando matrículas 2025…");
  await db.insert(enrollments).values(
    inserted.map((row, i) => {
      const src = parsed[i];
      const grade: Grade = src.grade2025 ?? "PRE_I_4";
      const svcKey: ServiceKey = serviceForGrade2025(grade);
      const svcId = serviceIdByKey.get(svcKey) ?? null;
      return { studentId: row.id, year: YEAR_2025, grade, serviceId: svcId };
    }) as any,
  );
}

/** ===================== Main ===================== */

async function main() {
  console.log("—— SEED: importar TODOS os alunos (usando “Cursa em 2025”) ——");
  await clearAll();
  const serviceIdByKey = await upsertServices();
  await upsertValues2026(serviceIdByKey);
  await insertAllStudentsAndEnrollments2025(serviceIdByKey);
  console.log("✅ Seed concluído.");
}

main().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
