// app/(protected)/dashboard/page.tsx
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, Wallet, CalendarRange } from "lucide-react";
import Link from "next/link";
import DashboardCharts from "@/app/components/dashboard-charts";
import { getDashboardStudents } from "@/app/actions/get-dashboard-students";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Tipagens/labels locais (iguais às que você já usa)
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
const PAYMENT_LABEL: Record<string, string> = {
  one_oct: "1x (Outubro)",
  two_sep_oct: "2x (Set/Out)",
};

// 👇 Tipagem correta para Next 15
type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  // 👇 Aguarde o objeto
  const sp = (await searchParams) ?? {};
  const from = typeof sp.from === "string" ? sp.from : undefined;
  const to = typeof sp.to === "string" ? sp.to : undefined;
  const modeParam = typeof sp.mode === "string" ? sp.mode : undefined;
  const mode: MetricsMode =
    modeParam === "enrollment" ? "enrollment" : "registration";

  const metrics = await getDashboardMetrics({ from, to, mode });

  const totalByService = (metrics.byService ?? []).map((s) => ({
    name: SERVICE_LABEL[s.key] ?? s.key,
    value: s.value,
  }));
  const totalByPayment = (metrics.byPayment ?? []).map((p) => ({
    name: PAYMENT_LABEL[p.key] ?? p.key,
    value: p.value,
  }));

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

  // ======== Alunos (lista para seção nova) ========
  const students = await getDashboardStudents({ from, to, mode });

  type Grouped = Record<
    string,
    Record<string, { id: number; studentName: string; guardianName: string }[]>
  >;

  const grouped: Grouped = {};
  for (const s of students ?? []) {
    if (!grouped[s.grade]) grouped[s.grade] = {};
    if (!grouped[s.grade][s.service]) grouped[s.grade][s.service] = [];
    grouped[s.grade][s.service].push({
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
          <PageDescription>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
          </PageDescription>

          <div className="space-y-6">
            {/* Filtro de período */}
            <form
              method="GET"
              className="grid grid-cols-1 gap-3 sm:grid-cols-6"
            >
              <input type="hidden" name="mode" value={mode} />
              <div className="sm:col-span-2">
                <label className="text-muted-foreground mb-1 block text-sm">
                  De
                </label>
                <input
                  type="date"
                  name="from"
                  defaultValue={from}
                  className="bg-background w-full rounded-md border px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-muted-foreground mb-1 block text-sm">
                  Até
                </label>
                <input
                  type="date"
                  name="to"
                  defaultValue={to}
                  className="bg-background w-full rounded-md border px-3 py-2"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" className="w-full sm:w-auto">
                  <CalendarRange className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
                {(from || to) && (
                  <Button variant="outline" asChild>
                    <Link href={buildHref(mode)}>Limpar</Link>
                  </Button>
                )}
              </div>
            </form>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Users className="text-muted-foreground h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.total ?? 0}</div>
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
                  {(totalByService ?? []).length === 0 ? (
                    <span className="text-muted-foreground text-sm">
                      Sem dados
                    </span>
                  ) : (
                    totalByService.map((s) => (
                      <Badge
                        key={s.name}
                        variant="secondary"
                        className="rounded-full"
                      >
                        {s.name}:{" "}
                        <span className="ml-1 font-semibold">{s.value}</span>
                      </Badge>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pagamentos
                  </CardTitle>
                  <Wallet className="text-muted-foreground h-5 w-5" />
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {(totalByPayment ?? []).length === 0 ? (
                    <span className="text-muted-foreground text-sm">
                      Sem dados
                    </span>
                  ) : (
                    totalByPayment.map((p) => (
                      <Badge
                        key={p.name}
                        variant="secondary"
                        className="rounded-full"
                      >
                        {p.name}:{" "}
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
              byGrade={metrics.byGrade ?? []}
              byService={metrics.byService ?? []}
              byMonth={metrics.byMonth ?? []}
              labelMap={{ ...GRADE_LABEL, ...SERVICE_LABEL }}
            />

            {/* Agrupamento por turma/serviço */}
            <h2 className="mt-8 text-lg font-semibold">
              Alunos por turma e serviço
            </h2>

            {(students ?? []).length === 0 ? (
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
        </PageHeaderContent>
      </PageHeader>
    </PageContainer>
  );
}
