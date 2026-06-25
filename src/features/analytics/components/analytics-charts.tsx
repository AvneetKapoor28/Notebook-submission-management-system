"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// ── Types ──────────────────────────────────────────────────────────────────
type KpiData = {
  totalChecks: number;
  totalStudents: number;
  submissionRate: number;
  completionRate: number;
};

type ClassSeries = {
  name: string;
  submissionRate: number;
  completionRate: number;
  topicCount: number;
  checkedTopics: number;
  studentCount: number;
  totalRecords: number;
  submitted: number;
  late: number;
  missing: number;
};

type DistributionItem = { name: string; value: number; color: string };

type ChapterSeries = {
  chapter: string;
  submissionRate: number;
  issueCount: number;
};

type ProblematicTopic = {
  name: string;
  issueCount: number;
  className: string;
  totalRecords: number;
};

// ── Tooltip helpers ────────────────────────────────────────────────────────
function PercentTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: entry.fill }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{Math.round(entry.value)}%</span>
        </div>
      ))}
    </div>
  );
}

function CountTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: entry.fill }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-sm">
      <div className="flex items-center gap-2">
        <span
          className="inline-block size-2 rounded-full"
          style={{ background: entry.payload.color }}
        />
        <span className="text-muted-foreground">{entry.name}:</span>
        <span className="font-medium text-foreground">{entry.value}</span>
      </div>
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${accent ?? "currentColor"} 0%, transparent 70%)`,
        }}
      />
      <CardContent className="pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              {label}
            </p>
            <p className="text-3xl font-bold text-foreground leading-none" style={{ color: accent }}>
              {value}
            </p>
            {sub && (
              <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
            )}
          </div>
          <span className="text-2xl shrink-0 opacity-80">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Radial progress ────────────────────────────────────────────────────────
function RadialProgress({ value, color, label }: { value: number; color: string; label: string }) {
  const data = [{ value, fill: color }];
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-24">
        <RadialBarChart
          width={96}
          height={96}
          cx={48}
          cy={48}
          innerRadius={32}
          outerRadius={44}
          barSize={10}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar dataKey="value" cornerRadius={5} background={{ fill: "var(--border)" }} />
        </RadialBarChart>
        <span
          className="absolute inset-0 flex items-center justify-center text-base font-bold"
          style={{ color }}
        >
          {value}%
        </span>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function AnalyticsCharts({
  kpis,
  classSeries,
  submissionDistribution,
  completionDistribution,
  chapterSeries,
  problematicTopics,
}: {
  kpis: KpiData;
  classSeries: ClassSeries[];
  submissionDistribution: DistributionItem[];
  completionDistribution: DistributionItem[];
  chapterSeries: ChapterSeries[];
  problematicTopics: ProblematicTopic[];
}) {
  const hasChecks = kpis.totalChecks > 0;

  return (
    <div className="space-y-6">
      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          icon="📋"
          label="Notebook Checks"
          value={kpis.totalChecks}
          sub="checks conducted so far"
          accent="#6366f1"
        />
        <KpiCard
          icon="🎓"
          label="Total Students"
          value={kpis.totalStudents}
          sub="across all classes"
          accent="#8b5cf6"
        />
        <KpiCard
          icon="✅"
          label="Submission Rate"
          value={`${kpis.submissionRate}%`}
          sub="of all notebook records"
          accent="#22c55e"
        />
        <KpiCard
          icon="📝"
          label="Completion Rate"
          value={`${kpis.completionRate}%`}
          sub="among submitted notebooks"
          accent="#f59e0b"
        />
      </div>

      {!hasChecks && (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-lg font-semibold text-foreground">No check data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Conduct some notebook checks to start seeing analytics.
            </p>
          </CardContent>
        </Card>
      )}

      {hasChecks && (
        <>
          {/* ── Row 2: Class performance + Distribution ─────────────────── */}
          <div className="grid gap-4 xl:grid-cols-5">
            {/* Class performance bar chart */}
            <Card className="xl:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle>Class performance</CardTitle>
                <CardDescription>
                  Submission and completion rates per class
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={classSeries}
                    margin={{ top: 4, right: 8, bottom: 4, left: -8 }}
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<PercentTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                          {value}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="submissionRate"
                      name="Submission rate"
                      fill="#6366f1"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="completionRate"
                      name="Completion rate"
                      fill="#22c55e"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Submission distribution pie */}
            <Card className="xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Submission breakdown</CardTitle>
                <CardDescription>Overall status across all records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="shrink-0" style={{ width: 160, height: 160 }}>
                    <PieChart width={160} height={160}>
                      <Pie
                        data={submissionDistribution}
                        cx={75}
                        cy={75}
                        innerRadius={48}
                        outerRadius={72}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="var(--card)"
                      >
                        {submissionDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltipContent />} />
                    </PieChart>
                  </div>
                  <div className="flex flex-col gap-2 min-w-0">
                    {submissionDistribution.map((item) => {
                      const total = submissionDistribution.reduce((s, i) => s + i.value, 0);
                      const pct = total ? Math.round((item.value / total) * 100) : 0;
                      return (
                        <div key={item.name} className="flex items-center gap-2 min-w-0">
                          <span
                            className="shrink-0 size-2.5 rounded-full"
                            style={{ background: item.color }}
                          />
                          <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                          <span className="ml-auto text-xs font-semibold text-foreground shrink-0">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Completion distribution below */}
                {completionDistribution.length > 0 && (
                  <>
                    <div className="my-4 h-px bg-border" />
                    <p className="text-sm font-semibold text-foreground mb-3">Completion quality</p>
                    <div className="flex items-center justify-around">
                      {completionDistribution.map((item) => {
                        const total = completionDistribution.reduce((s, i) => s + i.value, 0);
                        const pct = total ? Math.round((item.value / total) * 100) : 0;
                        return (
                          <RadialProgress
                            key={item.name}
                            value={pct}
                            color={item.color}
                            label={item.name}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Row 3: Chapter issues + Problematic topics ──────────────── */}
          <div className="grid gap-4 xl:grid-cols-2">
            {/* Chapter-level issues */}
            {chapterSeries.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Issues by chapter</CardTitle>
                  <CardDescription>
                    Chapters ranked by number of student issues
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={chapterSeries}
                      margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="chapter"
                        width={90}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: string) =>
                          v.length > 14 ? v.slice(0, 13) + "…" : v
                        }
                      />
                      <Tooltip content={<CountTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
                      <Bar
                        dataKey="issueCount"
                        name="Issues"
                        fill="#f59e0b"
                        radius={[0, 5, 5, 0]}
                        maxBarSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Most problematic topics */}
            {problematicTopics.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Struggling topics</CardTitle>
                  <CardDescription>
                    Topics with the most student issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {problematicTopics.map((topic, i) => {
                      const rate = topic.totalRecords
                        ? Math.round((topic.issueCount / topic.totalRecords) * 100)
                        : 0;
                      const intensity =
                        rate >= 60 ? "#ef4444" : rate >= 35 ? "#f59e0b" : "#6366f1";
                      return (
                        <div key={i} className="group relative">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {topic.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{topic.className}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-bold" style={{ color: intensity }}>
                                {topic.issueCount} issues
                              </p>
                              <p className="text-xs text-muted-foreground">{rate}% affected</p>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-border overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${rate}%`, background: intensity }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Row 4: Per-class summary table ──────────────────────────── */}
          {classSeries.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Class summary</CardTitle>
                <CardDescription>Detailed breakdown of submission outcomes by class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Class", "Students", "Topics", "Checked", "Submitted", "Late", "Missing", "Sub. Rate", "Comp. Rate"].map(
                          (h) => (
                            <th
                              key={h}
                              className="py-2 px-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground first:pl-0 last:pr-0"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {classSeries.map((cls) => (
                        <tr key={cls.name} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 pl-0 pr-3 font-medium text-foreground">{cls.name}</td>
                          <td className="py-3 px-3 text-muted-foreground">{cls.studentCount}</td>
                          <td className="py-3 px-3 text-muted-foreground">{cls.topicCount}</td>
                          <td className="py-3 px-3 text-muted-foreground">{cls.checkedTopics}</td>
                          <td className="py-3 px-3">
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {cls.submitted}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              {cls.late}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              {cls.missing}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-14 rounded-full bg-border overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-indigo-500"
                                  style={{ width: `${cls.submissionRate}%` }}
                                />
                              </div>
                              <span className="text-foreground font-medium tabular-nums">
                                {cls.submissionRate}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pl-3 pr-0">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-14 rounded-full bg-border overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-green-500"
                                  style={{ width: `${cls.completionRate}%` }}
                                />
                              </div>
                              <span className="text-foreground font-medium tabular-nums">
                                {cls.completionRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
