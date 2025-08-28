// src/app/(protected)/dashboard/page.tsx
import {
  PageContainer,
  PageDescription,
  PageHeader,
  PageHeaderContent,
} from "@/app/components/page-container";
import {
  getDashboardMetrics,
  type MetricsMode,
} from "@/app/actions/get-dashboard-metrics";
import { getDashboardStudents } from "@/app/actions/get-dashboard-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, Wallet, CalendarRange } from "lucide-react";
import Link from "next/link";
import DashboardCharts from "@/app/components/dashboard-charts";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/* ==== Tipagem compatível com Next 14.2+/15 (Promise ou objeto) ==== */
type SearchParamsLike =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>;

type PageProps = {
  searchParams?: SearchParamsLike;
};

/* ==== Utils p/ resolver searchParams e normalizar ==== */
async function resolveSearchParams<T extends Record<string, any>>(
  sp?: T | Promise<T>,
): Promise<T> {
  if (!sp) return {} as T;
  const maybe: any = sp;
  return typeof maybe?.then === "function"
    ? await (sp as Promise<T>)
    : (sp as T);
}
const pickStr = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : (v ?? undefined);

/* Converte quaisquer inputs -> sempre KV[] (sem Object.entries) */
type KV = { key: string; value: number };
function toKVArray(input: any): KV[] {
  const out: KV[] = [];

  if (Array.isArray(input)) {
    for (const it of input) {
      if (it && typeof it === "object") {
        if ("key" in it)
          out.push({ key: String(it.key), value: Number(it.value ?? 0) });
        else if ("bucket" in it)
          out.push({ key: String(it.bucket), value: Number(it.value ?? 0) });
      }
    }
    return out;
  }

  if (input && typeof input === "object") {
    // eslint-disable-next-line guard-for-in
    for (const k in input) {
      if (Object.prototype.hasOwnProperty.call(input, k)) {
        out.push({ key: String(k), value: Number((input as any)[k] ?? 0) });
      }
    }
  }

  return out;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  // ✅ Aguarda searchParams (Next >=14.2 exige await)
  const sp = await resolveSearchParams(searchParams);

  const from = pickStr(sp.from);
  const to = pickStr(sp.to);
  const modeParam = pickStr(sp.mode);
  const mode: MetricsMode =
    modeParam === "enrollment" ? "enrollment" : "registration";

  /* ===== Carrega métricas com defaults seguros ===== */
  const raw = await getDashboardMetrics({ from, to, mode });
  const metrics = {
    total: raw?.total ?? 0,
    byGrade: toKVArray(raw?.byGrade),
    byService: toKVArray(raw?.byService),
    byPayment: toKVArray(raw?.byPayment),
    byMonth: toKVArray(raw?.byMonth),
  };

  // Labels
  const GRADE_LABEL: Record<string, string> = {
    MATERNAL_3: "Maternal (3 anos)",
    PRE_I_4: "Pré I (4 anos)",
    PRE_II_5: "Pré II (5 anos)",
    ANO_1: "1º ANO",
    ANO_2: "2º ANO",
    ANO_3: "3º ANO",
    ANO_4: "4º ANO",
    ANO_5: "5º ANO",
  };
  const SERVICE_LABEL: Record<string, string> = {
    integral: "Integral",
    meio_periodo: "Meio período",
    infantil_vespertino: "Infantil – Vespertino",
    fundamental_vespertino: "Fundamental – Vespertino",
  };
  // Aceita tanto 'one_oct' (UI) quanto 'one_sep' (BD), para segurança
  const PAYMENT_LABEL: Record<string, string> = {
    one_oct: "1x (Outubro)",
    one_sep: "1x (Outubro)",
    two_sep_oct: "2x (Set/Out)",
  };

  // helper p/ montar href preservando filtros
  const buildHref = (nextMode: MetricsMode) => {
    const params = new URLSearchParams();
    params.set("mode", nextMode);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/dashboard?${params.toString()}`;
  };

  const title =
    mode === "enrollment"
      ? "Dashboard de Pré-Rematrículas"
      : "Dashboard de Pré-Matrículas";

  /* ===== Alunos agrupados por turma/serviço ===== */
  const students = (await getDashboardStudents({ from, to, mode })) ?? [];

  type Grouped = Record<
    string, // grade
    Record<string, { id: number; studentName: string; guardianName: string }[]>
  >;

  const grouped: Grouped = {};
  for (const s of students as any[]) {
    const g = s?.grade ?? "";
    const sv = s?.service ?? "";
    if (!grouped[g]) grouped[g] = {};
    if (!grouped[g][sv]) grouped[g][sv] = [];
    grouped[g][sv].push({
      id: s.id,
      studentName: s.studentName,
      guardianName: s.guardianName,
    });
  }

  const sortedGrades = Object.keys(grouped).sort((a, b) =>
    (GRADE_LABEL[a] ?? a).localeCompare(GRADE_LABEL[b] ?? b, "pt-BR"),
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="w-full">
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">
                  Acompanhe as métricas gerais e por segmento.{" "}
                  {from || to ? `Período aplicado.` : `Todos os períodos.`}
                </p>
              </div>

              {/* Toggle de modalidade */}
              <div className="inline-flex rounded-md border p-1">
                <Button
                  asChild
                  variant={mode === "registration" ? "default" : "ghost"}
                  size="sm"
                >
                  <Link href={buildHref("registration")}>Pré-Matrículas</Link>
                </Button>
                <Button
                  asChild
                  variant={mode === "enrollment" ? "default" : "ghost"}
                  size="sm"
                >
                  <Link href={buildHref("enrollment")}>Pré-Rematrículas</Link>
                </Button>
              </div>
            </div>

            <div className="w-full space-y-6">
              {/* KPIs principais */}
              <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
                <Card className="rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                    <Users className="text-muted-foreground h-5 w-5" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{metrics.total}</div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Por serviço
                    </CardTitle>
                    <GraduationCap className="text-muted-foreground h-5 w-5" />
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {metrics.byService.length === 0 ? (
                      <span className="text-muted-foreground text-sm">
                        Sem dados
                      </span>
                    ) : (
                      metrics.byService.map((s) => (
                        <Badge
                          key={s.key}
                          variant="secondary"
                          className="rounded-full"
                        >
                          {(SERVICE_LABEL[s.key] ?? s.key) + ":"}{" "}
                          <span className="ml-1 font-semibold">{s.value}</span>
                        </Badge>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Opções de pagamento
                    </CardTitle>
                    <Wallet className="text-muted-foreground h-5 w-5" />
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {metrics.byPayment.length === 0 ? (
                      <span className="text-muted-foreground text-sm">
                        Sem dados
                      </span>
                    ) : (
                      metrics.byPayment.map((p) => (
                        <Badge
                          key={p.key}
                          variant="secondary"
                          className="rounded-full"
                        >
                          {(PAYMENT_LABEL[p.key] ?? p.key) + ":"}{" "}
                          <span className="ml-1 font-semibold">{p.value}</span>
                        </Badge>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos */}
              <h2 className="text-lg font-semibold">Gráficos</h2>
              <DashboardCharts
                byGrade={metrics.byGrade}
                byService={metrics.byService}
                byMonth={metrics.byMonth}
                labelMap={{ ...GRADE_LABEL, ...SERVICE_LABEL }}
              />

              {/* Alunos por turma e serviço */}
              <h2 className="mt-8 text-lg font-semibold">
                Alunos por turma e serviço
              </h2>

              {students.length === 0 ? (
                <Card className="mt-3 rounded-2xl">
                  <CardContent className="py-6">
                    <span className="text-muted-foreground text-sm">
                      Sem registros para o período/modo selecionado.
                    </span>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {sortedGrades.map((gradeKey) => {
                    const services = grouped[gradeKey];
                    const gradeTotal = Object.values(services).reduce(
                      (acc, arr) => acc + arr.length,
                      0,
                    );

                    const sortedServices = Object.keys(services).sort((a, b) =>
                      (SERVICE_LABEL[a] ?? a).localeCompare(
                        SERVICE_LABEL[b] ?? b,
                        "pt-BR",
                      ),
                    );

                    return (
                      <Card key={gradeKey} className="rounded-2xl">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">
                              {GRADE_LABEL[gradeKey] ?? gradeKey}
                            </CardTitle>
                            <Badge variant="secondary" className="rounded-full">
                              {gradeTotal} aluno{gradeTotal === 1 ? "" : "s"}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-5">
                          {sortedServices.map((serviceKey) => {
                            const list = services[serviceKey];

                            return (
                              <div key={serviceKey} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">
                                    {SERVICE_LABEL[serviceKey] ?? serviceKey}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="rounded-full"
                                  >
                                    {list.length}
                                  </Badge>
                                </div>

                                <ul className="max-h-64 overflow-auto rounded-md border p-3 text-sm">
                                  {list.map((st) => (
                                    <li
                                      key={st.id}
                                      className="flex items-center justify-between py-1"
                                    >
                                      <span className="font-medium">
                                        {st.studentName}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {st.guardianName}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </PageHeaderContent>
      </PageHeader>
    </PageContainer>
  );
}
