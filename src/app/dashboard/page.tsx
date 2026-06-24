import Link from "next/link";
import { AlertCircle, BookOpen, Clock3, Users } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { MetricCard } from "@/components/app/metric-card";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardData } from "@/features/dashboard/queries";
import { formatShortDate } from "@/lib/format";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        emoji="📝"
        title="Today’s notebook priorities"
        description="Focus the day around fresh checks, pending corrections, and students who need intervention."
        actions={
          <Button asChild variant="outline">
            <Link href="/classes">Manage classes</Link>
          </Button>
        }
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          detail="Active teaching groups"
          icon={<BookOpen className="size-4" />}
          label="Total classes"
          value={data.totalClasses}
        />
        <MetricCard
          detail="Across all rosters"
          icon={<Users className="size-4" />}
          label="Total students"
          value={data.totalStudents}
        />
        <MetricCard
          detail="Checks waiting for correction"
          icon={<AlertCircle className="size-4" />}
          label="Pending corrections"
          value={data.pendingCorrections.length}
        />
        <MetricCard
          detail="Students above threshold"
          icon={<Clock3 className="size-4" />}
          label="Defaulters"
          value={data.defaulterSummary.total}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 shadow-none border-border/80 bg-card">
          <CardHeader className="p-5">
            <CardTitle className="text-base font-semibold">Recent notebook checks</CardTitle>
            <CardDescription className="text-xs">Jump back into the most recent checks quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-5 pb-5 pt-0">
            {data.recentChecks.length ? (
              data.recentChecks.map((check) => (
                <Link
                  key={check.id}
                  className="flex items-center justify-between rounded border border-border/60 bg-card px-4 py-2.5 transition hover:bg-neutral-50/50 hover:border-neutral-300"
                  href={`/checks/${check.id}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm select-none">📓</span>
                    <div className="truncate">
                      <p className="font-medium text-sm text-foreground leading-none">{check.topicTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-none">{check.className}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {formatShortDate(check.checkDate)}
                  </p>
                </Link>
              ))
            ) : (
              <EmptyState
                actionHref="/classes"
                actionLabel="Create the first class"
                description="Start with classes and topics to unlock notebook checks."
                title="No checks recorded yet"
              />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/80 bg-card">
          <CardHeader className="p-5">
            <CardTitle className="text-base font-semibold">Defaulter summary</CardTitle>
            <CardDescription className="text-xs font-normal">Highest-risk cases based on active thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pb-5 pt-0">
            <div className="rounded border border-border/60 bg-neutral-50/30 px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground/80">Missing-heavy students</p>
              <p className="mt-1 font-heading text-2xl font-bold">{data.defaulterSummary.missing}</p>
            </div>
            <div className="rounded border border-border/60 bg-neutral-50/30 px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground/80">Correction-heavy students</p>
              <p className="mt-1 font-heading text-2xl font-bold">
                {data.defaulterSummary.corrections}
              </p>
            </div>
            <Button asChild className="w-full text-xs" variant="outline" size="sm">
              <Link href="/defaulters">Open defaulters view</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="shadow-none border-border/80 bg-card">
          <CardHeader className="p-5">
            <CardTitle className="text-base font-semibold">Students requiring attention</CardTitle>
            <CardDescription className="text-xs">
              Top students crossing the current intervention threshold.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-5 pb-5 pt-0">
            {data.attentionStudents.length ? (
              data.attentionStudents.map((student) => (
                <Link
                  key={student.studentId}
                  className="block rounded border border-border/60 bg-card px-4 py-3 transition hover:bg-neutral-50/50 hover:border-neutral-300"
                  href={`/students/${student.studentId}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm select-none">👤</span>
                      <div className="truncate">
                        <p className="font-medium text-sm text-foreground leading-none">{student.studentName}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-none">{student.className}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded shrink-0">{student.score} pts</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed pl-6">
                    {student.reasons.join(", ")}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                No students are crossing the current default thresholds yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/80 bg-card">
          <CardHeader className="p-5">
            <CardTitle className="text-base font-semibold">Frequent late submitters</CardTitle>
            <CardDescription className="text-xs font-normal">Useful for quick follow-up before class starts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-5 pb-5 pt-0">
            {data.lateSubmitters.length ? (
              data.lateSubmitters.map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center justify-between rounded border border-border/60 bg-card px-4 py-2.5"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm select-none">👤</span>
                    <div className="truncate">
                      <p className="font-medium text-sm text-foreground leading-none">{student.studentName}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-none">{student.className}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded shrink-0">
                    {student.lateCount} late
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-2">No recurring late submitters yet.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
