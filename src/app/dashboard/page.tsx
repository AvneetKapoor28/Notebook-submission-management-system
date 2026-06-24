import Link from "next/link";
import { 
  AlertCircle, 
  BookOpen, 
  Clock3, 
  Users, 
  Plus, 
  Sparkles, 
  ChevronRight, 
  ArrowRight, 
  Compass 
} from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { getDashboardData } from "@/features/dashboard/queries";
import { formatShortDate } from "@/lib/format";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const greeting = "Workspace";

  const getReasonBadgeStyles = (reason: string) => {
    if (reason.includes("missing")) {
      return "bg-rose-50/50 text-rose-700 border-rose-200/50 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/20";
    }
    if (reason.includes("late")) {
      return "bg-amber-50/50 text-amber-700 border-amber-200/50 dark:bg-amber-950/10 dark:text-amber-400 dark:border-amber-900/20";
    }
    if (reason.includes("incomplete")) {
      return "bg-orange-50/50 text-orange-700 border-orange-200/50 dark:bg-orange-950/10 dark:text-orange-400 dark:border-orange-900/20";
    }
    return "bg-blue-50/50 text-blue-700 border-blue-200/50 dark:bg-blue-950/10 dark:text-blue-400 dark:border-blue-900/20";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Notion-style Page Header */}
      <div className="space-y-2">
        <div className="text-4xl sm:text-5xl select-none mt-1 mb-2 leading-none">📓</div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {data.teacherName}’s Workspace
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              A clean space to track class notebook progress, check records, and student defaults.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="self-start sm:self-auto border-border/70 text-xs">
            <Link href="/classes" className="flex items-center gap-1.5">
              <Plus className="size-3.5" />
              <span>Record a check</span>
            </Link>
          </Button>
        </div>
      </div>

      <hr className="border-border/60" />

      {/* Notion-style Callout Box */}
      <div className="flex gap-3.5 rounded-lg border border-border/60 bg-neutral-100/40 dark:bg-neutral-800/10 p-4 text-xs sm:text-sm leading-relaxed text-foreground select-none">
        <span className="text-lg leading-none select-none">💡</span>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Active Workspace Summary</p>
          <p className="text-muted-foreground text-xs sm:text-sm leading-normal">
            You have <strong className="text-foreground font-semibold">{data.totalClasses} active classes</strong> under management, and <strong className="text-foreground font-semibold">{data.defaulterSummary.total} students</strong> have crossed the default limits.
          </p>
        </div>
      </div>

      {/* Workspace Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-3 pt-2">
        {/* Main Feed Column (2/3 width) */}
        <section className="lg:col-span-2 space-y-8">
          {/* Recent Checks list */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span>📓</span>
                <span>Recent checks</span>
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">Last 5 checks</span>
            </div>

            {data.recentChecks.length ? (
              <div className="divide-y divide-border/40">
                {data.recentChecks.map((check) => {
                  const totalRecords = check.studentRecords?.length || 0;
                  const completedRecords = check.studentRecords?.filter(r => r.completionStatus === "COMPLETE").length || 0;
                  const completionRate = totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0;

                  return (
                    <Link
                      key={check.id}
                      href={`/classes/${check.classId}/topics/${check.topicId}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 px-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3 truncate sm:max-w-[55%]">
                        <span className="text-sm select-none shrink-0 text-muted-foreground/80">📓</span>
                        <div className="truncate">
                          <p className="font-medium text-sm text-foreground group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                            {check.topicTitle}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-none">
                            {check.className}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0 sm:self-center">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] text-muted-foreground/90 font-medium">
                            {completedRecords}/{totalRecords} notebooks complete
                          </span>
                          <div className="h-1 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                            <div 
                              className="h-full bg-foreground transition-all duration-500"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 select-none bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                          {formatShortDate(check.checkDate)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
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

          {/* Attention Required List */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span>👤</span>
                <span>Attention required</span>
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">High-risk students</span>
            </div>

            {data.attentionStudents.length ? (
              <div className="divide-y divide-border/40">
                {data.attentionStudents.map((student) => (
                  <Link
                    key={student.studentId}
                    href={`/students/${student.studentId}`}
                    className="group flex flex-col py-3.5 gap-2 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 px-2 rounded transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-sm select-none shrink-0 text-muted-foreground/80">👤</span>
                        <div className="truncate">
                          <p className="font-medium text-sm text-foreground group-hover:text-rose-650 dark:group-hover:text-rose-400 transition-colors leading-tight">
                            {student.studentName}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-none">
                            {student.className}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/40 px-2 py-0.5 rounded dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 shrink-0">
                        {student.score} pts
                      </span>
                    </div>

                    {student.reasons && student.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-6 mt-1">
                        {student.reasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getReasonBadgeStyles(reason)}`}
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
              <p className="text-xs text-muted-foreground py-6 text-center italic">
                No students currently crossing default alert thresholds.
              </p>
            )}
          </div>
        </section>

        {/* Right Sidebar Column (1/3 width) */}
        <section className="space-y-8">
          {/* Quick Links navigation */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Workspace links</h3>
            <div className="space-y-1.5">
              <Link 
                href="/classes" 
                className="flex items-center justify-between rounded-md border border-border/50 p-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-all text-xs font-semibold text-foreground/90"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm select-none">🏫</span>
                  <span>Classes & Topics</span>
                </div>
                <ChevronRight className="size-3 text-muted-foreground" />
              </Link>
              <Link 
                href="/defaulters" 
                className="flex items-center justify-between rounded-md border border-border/50 p-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-all text-xs font-semibold text-foreground/90"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm select-none">⚠️</span>
                  <span>Defaulters Center</span>
                </div>
                <ChevronRight className="size-3 text-muted-foreground" />
              </Link>
              <Link 
                href="/analytics" 
                className="flex items-center justify-between rounded-md border border-border/50 p-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-all text-xs font-semibold text-foreground/90"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm select-none">📊</span>
                  <span>View Analytics</span>
                </div>
                <ChevronRight className="size-3 text-muted-foreground" />
              </Link>
            </div>
          </div>

          {/* Defaulter status callout */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Defaulter summary</h3>
            <div className="rounded-lg border border-border/60 bg-neutral-50/20 dark:bg-neutral-800/5 p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-rose-500" />
                    Missing-heavy
                  </span>
                  <span className="font-semibold text-foreground">{data.defaulterSummary.missing} students</span>
                </div>
                <div className="h-1 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${data.totalStudents > 0 ? (data.defaulterSummary.missing / data.totalStudents) * 100 : 0}%` }} />
                </div>
              </div>

              <Button asChild className="w-full text-xs mt-1 border-border/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/35" variant="outline" size="sm">
                <Link href="/defaulters" className="flex items-center justify-center gap-1">
                  <span>Open defaulters view</span>
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Late Submitters tracker */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Late submitters</h3>
            {data.lateSubmitters.length ? (
              <div className="space-y-2">
                {data.lateSubmitters.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-b-0 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm select-none shrink-0 text-muted-foreground/80">👤</span>
                      <div className="truncate">
                        <p className="font-medium text-foreground truncate">{student.studentName}</p>
                        <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">{student.className}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-250/20 px-1.5 py-0.5 rounded dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 shrink-0">
                      {student.lateCount} late
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic px-1">No recurring late submissions.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
