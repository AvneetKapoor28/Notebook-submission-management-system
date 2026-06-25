import Link from "next/link";
import { 
  AlertCircle, 
  BookOpen, 
  Users, 
  Plus, 
  ChevronRight, 
  ArrowRight, 
  TrendingUp
} from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/app/metric-card";
import { getDashboardData } from "@/features/dashboard/queries";
import { listClassesOverview } from "@/features/classes/queries";
import { formatShortDate } from "@/lib/format";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const classesOverview = await listClassesOverview();

  const getReasonBadgeStyles = (reason: string) => {
    if (reason.includes("missing")) {
      return "bg-rose-50/50 text-rose-750 border-rose-200/50 dark:bg-rose-950/10 dark:text-rose-450 dark:border-rose-900/20";
    }
    if (reason.includes("late")) {
      return "bg-amber-50/50 text-amber-750 border-amber-200/50 dark:bg-amber-950/10 dark:text-amber-450 dark:border-amber-900/20";
    }
    if (reason.includes("incomplete")) {
      return "bg-orange-50/50 text-orange-750 border-orange-200/50 dark:bg-orange-950/10 dark:text-orange-450 dark:border-orange-900/20";
    }
    return "bg-blue-50/50 text-blue-750 border-blue-200/50 dark:bg-blue-950/10 dark:text-blue-450 dark:border-blue-900/20";
  };

  // Calculate overall average completion rate of recent checks
  const recentChecksWithRates = data.recentChecks.map(check => {
    const total = check.studentRecords?.length || 0;
    const completed = check.studentRecords?.filter(r => r.completionStatus === "COMPLETE").length || 0;
    const rate = total > 0 ? (completed / total) * 100 : 0;
    return { ...check, total, completed, rate };
  });

  const avgCompletionRate = recentChecksWithRates.length > 0
    ? Math.round(recentChecksWithRates.reduce((acc, curr) => acc + curr.rate, 0) / recentChecksWithRates.length)
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        emoji="👋"
        title={`Welcome back, ${data.teacherName}`}
        description="Manage your classrooms, record checks, and monitor student defaulters all from one central workspace hub."
        actions={
          <Button asChild className="shadow-xs cursor-pointer">
            <Link href="/classes" className="flex items-center gap-2">
              <Plus className="size-4" />
              <span>Start a Check</span>
            </Link>
          </Button>
        }
      />

      {/* Stats Summary Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active Classes"
          value={data.totalClasses}
          detail="Classes under management"
          icon={<BookOpen className="size-5 text-indigo-500" />}
        />
        <MetricCard
          label="Total Students"
          value={data.totalStudents}
          detail="Active roster enrollment"
          icon={<Users className="size-5 text-emerald-500" />}
        />
        <MetricCard
          label="Defaulters Alert"
          value={data.defaulterSummary.total}
          detail={`${data.defaulterSummary.missing} missing-heavy`}
          icon={<AlertCircle className="size-5 text-rose-500" />}
        />
        <MetricCard
          label="Avg Completion Rate"
          value={avgCompletionRate !== null ? `${avgCompletionRate}%` : "N/A"}
          detail="Across recent checks"
          icon={<TrendingUp className="size-5 text-amber-500" />}
        />
      </div>

      {/* Launchpad Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
          <span>⚡</span>
          <span>Quick Launchpad</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/classes" className="group block">
            <div className="h-full rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md hover:border-indigo-500/50 hover:-translate-y-0.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="mb-4 inline-flex size-9 items-center justify-center rounded-lg bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <BookOpen className="size-5" />
              </div>
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-1">
                Record Notebook Check
                <ArrowRight className="size-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-normal">
                Select a class and topic to log new student submission records.
              </p>
            </div>
          </Link>

          <Link href="/defaulters" className="group block">
            <div className="h-full rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md hover:border-rose-500/50 hover:-translate-y-0.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="mb-4 inline-flex size-9 items-center justify-center rounded-lg bg-rose-50/50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 group-hover:scale-110 transition-transform">
                <AlertCircle className="size-5" />
              </div>
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-1">
                Defaulters Center
                <ArrowRight className="size-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-normal">
                Monitor students crossing thresholds for missing or incomplete work.
              </p>
            </div>
          </Link>

          <Link href="/analytics" className="group block">
            <div className="h-full rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md hover:border-emerald-500/50 hover:-translate-y-0.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="mb-4 inline-flex size-9 items-center justify-center rounded-lg bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="size-5" />
              </div>
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-1">
                Analytics Dashboard
                <ArrowRight className="size-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-normal">
                Analyze class performance metrics and view long-term submission rates.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Active Classes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <span>🏫</span>
            <span>My Active Classrooms</span>
          </h2>
          <Link href="/classes" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Manage Classes →
          </Link>
        </div>

        {classesOverview.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classesOverview.map((cls) => (
              <div
                key={cls.id}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all duration-300 hover:border-border/100"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Users className="size-3.5" />
                        <span>{cls.activeStudentCount} active students</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-muted-foreground px-2 py-0.5 rounded">
                      {cls.topicCount} topics
                    </span>
                  </div>

                  <div className="h-px bg-border/40" />

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 block">
                      Last Check Status
                    </span>
                    {cls.latestCheckTopicName ? (
                      <div>
                        <p className="text-xs font-medium text-foreground truncate">
                          {cls.latestCheckTopicName}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Checked on {formatShortDate(cls.latestCheckDate)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs italic text-muted-foreground/60 leading-normal">
                        No checks recorded yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/40 flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="w-full text-xs h-8 cursor-pointer">
                    <Link href={`/classes/${cls.id}`}>
                      Open Workspace
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No classes setup yet.</p>
            <Button asChild size="sm" className="mt-3 cursor-pointer">
              <Link href="/classes">Create first class</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Feed Column (2/3 width) */}
        <section className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <span>📅</span>
                <span>Recent Check Activity</span>
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">Last 5 checks</span>
            </div>

            {recentChecksWithRates.length ? (
              <div className="relative border-l border-border ml-3.5 pl-6 space-y-6">
                {recentChecksWithRates.map((check) => (
                  <div key={check.id} className="relative group">
                    {/* Timeline Dot Indicator */}
                    <span className="absolute -left-[30.5px] top-1.5 flex size-3.5 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:border-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30">
                      <span className="size-1.5 rounded-full bg-muted-foreground group-hover:bg-indigo-500" />
                    </span>

                    <Link
                      href={`/classes/${check.classId}/topics/${check.topicId}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 rounded-lg border border-border bg-card hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 transition-colors"
                    >
                      <div className="space-y-1.5 truncate max-w-full sm:max-w-[60%]">
                        <p className="font-semibold text-sm text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {check.topicTitle}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground/80">{check.className}</span>
                          <span>•</span>
                          <span>Checked on {formatShortDate(check.checkDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 mt-1 sm:mt-0">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {check.completed}/{check.total} notebooks complete
                          </span>
                          <div className="h-1.5 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-500"
                              style={{ width: `${check.rate}%` }}
                            />
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground/60 group-hover:text-foreground transition-colors hidden sm:block" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                actionHref="/classes"
                actionLabel="Create class"
                description="Start by creating classes and topics to record notebook checks."
                title="No checks recorded yet"
              />
            )}
          </div>
        </section>

        {/* Right Sidebar Column (1/3 width) */}
        <section className="space-y-6">
          {/* Attention Required List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h2 className="font-heading text-sm sm:text-base font-bold text-foreground flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Attention Required</span>
              </h2>
              <Link href="/defaulters" className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 hover:text-rose-500 dark:text-rose-450">
                View All
              </Link>
            </div>

            {data.attentionStudents.length ? (
              <div className="space-y-3">
                {data.attentionStudents.map((student) => (
                  <Link
                    key={student.studentId}
                    href={`/students/${student.studentId}`}
                    className="group block rounded-lg border border-border bg-card p-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="truncate">
                        <p className="font-semibold text-xs text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                          {student.studentName}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {student.className}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200/40 px-1.5 py-0.5 rounded dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 shrink-0">
                        {student.score} pts
                      </span>
                    </div>

                    {student.reasons && student.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {student.reasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center text-[8px] font-semibold px-2 py-0.5 rounded-full border ${getReasonBadgeStyles(reason)}`}
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 p-4 text-center">
                <p className="text-xs text-muted-foreground italic">
                  No students currently crossing alert thresholds.
                </p>
              </div>
            )}
          </div>

          {/* Late Submitters tracker */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="font-heading text-sm sm:text-base font-bold text-foreground flex items-center gap-1.5">
                <span>🕒</span>
                <span>Late Submitters</span>
              </h3>
            </div>

            {data.lateSubmitters.length ? (
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                {data.lateSubmitters.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-b-0 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs select-none shrink-0 text-muted-foreground/80">👤</span>
                      <div className="truncate">
                        <p className="font-medium text-foreground truncate">{student.studentName}</p>
                        <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">{student.className}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-250/20 px-1.5 py-0.5 rounded dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 shrink-0">
                      {student.lateCount} late
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 p-4 text-center">
                <p className="text-xs text-muted-foreground italic">No recurring late submissions.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
