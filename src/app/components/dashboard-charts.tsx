"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

type KV = { key: string; value: number };

type Props = {
  byGrade?: KV[] | null | undefined;
  byService?: KV[] | null | undefined;
  byMonth?: KV[] | null | undefined;
  labelMap?: Record<string, string>;
};

const COLORS = [
  "#6366F1", // indigo-500
  "#22C55E", // green-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#06B6D4", // cyan-500
  "#8B5CF6", // violet-500
  "#84CC16", // lime-500
  "#EC4899", // pink-500
  "#14B8A6", // teal-500
  "#F97316", // orange-500
];

function mapWithLabels(data: KV[] = [], labelMap?: Record<string, string>) {
  return data.map((d) => ({
    key: d.key,
    name: labelMap?.[d.key] ?? d.key,
    value: d.value ?? 0,
  }));
}

function formatMonthKey(key: string) {
  // Espera "YYYY-MM"; se não bater, retorna como veio.
  const m = /^(\d{4})-(\d{2})$/.exec(key);
  if (!m) return key;
  const [_, y, mm] = m;
  const date = new Date(Number(y), Number(mm) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

export default function DashboardCharts({
  byGrade,
  byService,
  byMonth,
  labelMap,
}: Props) {
  const gradeData = React.useMemo(
    () => mapWithLabels(Array.isArray(byGrade) ? byGrade : [], labelMap),
    [byGrade, labelMap],
  );

  const serviceData = React.useMemo(
    () => mapWithLabels(Array.isArray(byService) ? byService : [], labelMap),
    [byService, labelMap],
  );

  const monthData = React.useMemo(() => {
    const arr = Array.isArray(byMonth) ? byMonth : [];
    // ordena por chave "YYYY-MM"
    const sorted = [...arr].sort((a, b) =>
      a.key < b.key ? -1 : a.key > b.key ? 1 : 0,
    );
    return sorted.map((d) => ({
      key: d.key,
      name: formatMonthKey(d.key),
      value: d.value ?? 0,
    }));
  }, [byMonth]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Por turma (BarChart) */}
      <div className="rounded-2xl border p-4">
        <div className="mb-2 text-sm font-medium">Por turma</div>
        {gradeData.length === 0 ? (
          <div className="text-muted-foreground text-sm">Sem dados</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gradeData}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Qtde">
                  {gradeData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {/* Por serviço (PieChart) */}
      <div className="rounded-2xl border p-4">
        <div className="mb-2 text-sm font-medium">Por serviço</div>
        {serviceData.length === 0 ? (
          <div className="text-muted-foreground text-sm">Sem dados</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={serviceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {serviceData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
