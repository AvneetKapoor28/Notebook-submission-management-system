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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teacher dashboard"
        title="Today’s notebook priorities"
        description="Focus the day around fresh checks, pending corrections, and students who need intervention."
        actions={
          <Button asChild>
            <Link href="/classes">Manage classes</Link>
          </Button>
        }
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          detail="Active teaching groups"
          icon={<BookOpen className="size-5" />}
          label="Total classes"
          value={data.totalClasses}
        />
        <MetricCard
          detail="Across all rosters"
          icon={<Users className="size-5" />}
          label="Total students"
          value={data.totalStudents}
        />
        <MetricCard
          detail="Checks still waiting for follow-up"
          icon={<AlertCircle className="size-5" />}
          label="Pending corrections"
          value={data.pendingCorrections.length}
        />
        <MetricCard
          detail="Students above default thresholds"
          icon={<Clock3 className="size-5" />}
          label="Defaulters"
          value={data.defaulterSummary.total}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="bg-white/90 xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent notebook checks</CardTitle>
            <CardDescription>Jump back into the most recent work quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentChecks.length ? (
              data.recentChecks.map((check) => (
                <Link
                  key={check.id}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/60"
                  href={`/checks/${check.id}`}
                >
                  <div>
                    <p className="font-medium">{check.topicTitle}</p>
                    <p className="text-sm text-muted-foreground">{check.className}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
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

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Defaulter summary</CardTitle>
            <CardDescription>Highest-risk cases based on default thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-muted/30 px-4 py-3">
              <p className="text-sm text-muted-foreground">Missing-heavy students</p>
              <p className="mt-1 text-2xl font-semibold">{data.defaulterSummary.missing}</p>
            </div>
            <div className="rounded-2xl bg-muted/30 px-4 py-3">
              <p className="text-sm text-muted-foreground">Correction-heavy students</p>
              <p className="mt-1 text-2xl font-semibold">
                {data.defaulterSummary.corrections}
              </p>
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link href="/defaulters">Open defaulters view</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Students requiring attention</CardTitle>
            <CardDescription>
              Top students crossing the current intervention threshold.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.attentionStudents.length ? (
              data.attentionStudents.map((student) => (
                <Link
                  key={student.studentId}
                  className="block rounded-2xl border border-border/70 bg-background/80 px-4 py-3 transition hover:border-amber-200 hover:bg-amber-50/50"
                  href={`/students/${student.studentId}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{student.studentName}</p>
                      <p className="text-sm text-muted-foreground">{student.className}</p>
                    </div>
                    <p className="text-sm font-medium text-amber-700">{student.score} pts</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {student.reasons.join(", ")}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No students are crossing the current default thresholds yet.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Frequent late submitters</CardTitle>
            <CardDescription>Useful for quick follow-up before class starts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.lateSubmitters.length ? (
              data.lateSubmitters.map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{student.studentName}</p>
                    <p className="text-sm text-muted-foreground">{student.className}</p>
                  </div>
                  <p className="text-sm font-medium text-amber-700">
                    {student.lateCount} late
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recurring late submitters yet.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
