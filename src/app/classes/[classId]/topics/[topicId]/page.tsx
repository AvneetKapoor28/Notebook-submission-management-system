import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, CheckCircle2, ClipboardList, AlertCircle } from "lucide-react";

import {
  CompletionStatusBadge,
  SubmissionStatusBadge,
} from "@/components/app/status-badge";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/app/metric-card";
import { getTopicByClass } from "@/features/topics/queries";
import { formatPercent, formatShortDate } from "@/lib/format";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ classId: string; topicId: string }>;
}) {
  const { classId, topicId } = await params;
  const topic = await getTopicByClass(classId, topicId);

  if (!topic) {
    notFound();
  }

  const lastCheck = topic.notebookCheck;
  const stats = lastCheck
    ? (() => {
        const total = lastCheck.studentRecords.length;
        const submitted = lastCheck.studentRecords.filter(
          (record) =>
            record.submissionStatus === "SUBMITTED" ||
            record.submissionStatus === "LATE_SUBMISSION",
        ).length;
        const submissionRate = total ? (submitted / total) * 100 : 0;

        const completionEligible = lastCheck.studentRecords.filter(
          (record) => record.completionStatus !== null,
        );
        const completed = completionEligible.filter(
          (record) => record.completionStatus === "COMPLETE",
        ).length;
        const completionRate = completionEligible.length
          ? (completed / completionEligible.length) * 100
          : 0;

        const issuesCount = lastCheck.studentRecords.filter(
          (record) =>
            record.submissionStatus === "NOT_SUBMITTED" ||
            record.submissionStatus === "LATE_SUBMISSION" ||
            record.completionStatus === "NOT_DONE" ||
            record.completionStatus === "INCOMPLETE" ||
            record.completionStatus === "NEEDS_CORRECTION",
        ).length;

        return {
          submissionRate,
          completionRate,
          issuesCount,
          checkDate: lastCheck.checkDate,
        };
      })()
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        breadcrumbs={[
          { label: "Classes", href: "/classes" },
          { label: topic.class.name, href: `/classes/${classId}` },
          { label: "Topics" },
          { label: topic.title },
        ]}
        emoji="📓"
        title={topic.title}
        description={`Chapter ${topic.chapter} • Taught on ${formatShortDate(topic.dateTaught)}`}
        actions={
          <Button asChild size="sm">
            <Link href={`/classes/${classId}/topics/${topicId}/checks/new`}>
              {lastCheck ? "Edit check" : "Start check"}
            </Link>
          </Button>
        }
      />

      {stats ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Completion rate"
              value={formatPercent(stats.completionRate)}
              icon={<CheckCircle2 className="size-4" />}
            />
            <MetricCard
              label="Submission rate"
              value={formatPercent(stats.submissionRate)}
              icon={<ClipboardList className="size-4" />}
            />
            <MetricCard
              label="Checked date"
              value={formatShortDate(stats.checkDate)}
              icon={<Calendar className="size-4" />}
            />
            <MetricCard
              label="Issues found"
              value={stats.issuesCount === 1 ? "1 student" : `${stats.issuesCount} students`}
              icon={<AlertCircle className="size-4" />}
            />
          </section>

          <Card className="shadow-none border-border/60 bg-card rounded-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-border/40">
              <CardTitle className="text-base font-semibold">Check roster & outcomes</CardTitle>
              <CardDescription className="text-xs text-muted-foreground/80">
                Review student status, submission details, and remarks for this topic's check.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Submission</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Remarks & Tags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(lastCheck?.studentRecords ?? [])
                      .sort(
                        (left, right) =>
                          left.student.rollNumber - right.student.rollNumber,
                      )
                      .map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-medium text-muted-foreground/60 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md min-w-[24px] text-center">
                                {record.student.rollNumber}
                              </span>
                              <span className="font-medium text-foreground text-sm">
                                {record.student.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <SubmissionStatusBadge status={record.submissionStatus} />
                          </TableCell>
                          <TableCell>
                            {record.completionStatus ? (
                              <CompletionStatusBadge status={record.completionStatus} />
                            ) : (
                              <span className="text-[11px] font-semibold text-muted-foreground/50 bg-neutral-50 dark:bg-neutral-800/40 border border-border/30 px-1.5 py-0.5 rounded">
                                N/A
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {record.remarkTags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="neutral"
                                  className="text-[10px] px-1.5 py-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-normal border-none"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {record.remarks && (
                                <span className="text-xs text-muted-foreground font-sans">
                                  {record.remarks}
                                </span>
                              )}
                              {!record.remarkTags.length && !record.remarks && (
                                <span className="text-xs text-muted-foreground/45">—</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed border-border/80 bg-neutral-50/20 shadow-none py-12">
          <div className="flex flex-col items-center justify-center text-center px-4">
            <span className="text-3xl mb-3 select-none">📓</span>
            <h3 className="text-base font-semibold text-foreground">No check completed</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Assess submissions and completion to calculate stats for this topic.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href={`/classes/${classId}/topics/${topicId}/checks/new`}>
                Start notebook check
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
