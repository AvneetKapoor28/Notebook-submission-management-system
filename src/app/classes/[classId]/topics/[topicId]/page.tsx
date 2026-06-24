import Link from "next/link";
import { notFound } from "next/navigation";

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
  const lastCompletionRate = lastCheck
    ? (() => {
        const eligible = lastCheck.studentRecords.filter(
          (record) => record.completionStatus !== null,
        );
        const completed = eligible.filter(
          (record) => record.completionStatus === "COMPLETE",
        ).length;

        return eligible.length ? (completed / eligible.length) * 100 : null;
      })()
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        breadcrumbs={[
          { label: "Classes", href: "/classes" },
          { label: topic.class.name, href: `/classes/${classId}` },
          { label: "Topics" },
          { label: topic.title }
        ]}
        emoji="📓"
        title={topic.title}
        description={`Chapter ${topic.chapter}. Last checked ${formatShortDate(lastCheck?.checkDate ?? null)} with completion rate ${formatPercent(lastCompletionRate)}.`}
        actions={
          <Button asChild size="sm" variant={lastCheck ? "outline" : "default"}>
            <Link href={`/classes/${classId}/topics/${topicId}/checks/new`}>
              {lastCheck ? "Edit notebook check" : "Start notebook check"}
            </Link>
          </Button>
        }
      />

      <Card className="shadow-none border-border/80 bg-card">
        <CardContent className="p-5">
          {lastCheck ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl select-none leading-none">📅</span>
                <div>
                  <p className="font-semibold text-sm text-foreground leading-tight">
                    Notebook check completed
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-none">
                    Checked on {formatShortDate(lastCheck.checkDate)} • {lastCheck.studentRecords.length} records
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {lastCompletionRate !== null && (
                  <span className="text-xs font-semibold text-emerald-800 bg-green-50 border border-green-200/50 px-1.5 py-0.5 rounded mr-1">
                    {formatPercent(lastCompletionRate)} complete
                  </span>
                )}
                <Button asChild size="xs" variant="outline">
                  <Link href={`/checks/${lastCheck.id}`}>Open details</Link>
                </Button>
                <Button asChild size="xs">
                  <Link href={`/classes/${classId}/topics/${topicId}/checks/new`}>
                    Edit check
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="text-2xl mb-1.5 select-none">📓</span>
              <p className="text-sm font-semibold text-foreground">No checks completed</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
                Assess submissions and completion to calculate stats for this topic.
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link href={`/classes/${classId}/topics/${topicId}/checks/new`}>
                  Start check
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {lastCheck ? (
        <Card className="shadow-none border-border/60 bg-card rounded-2xl overflow-hidden">
          <CardHeader className="p-5 border-b border-border/40">
            <CardTitle className="text-base font-semibold">Latest check snapshot</CardTitle>
            <CardDescription className="text-xs text-muted-foreground/80">
              Recent outcomes for quick topic-level follow-up.
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
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastCheck.studentRecords
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
                            <span className="text-[11px] font-semibold text-muted-foreground/50 bg-neutral-50 dark:bg-neutral-800/40 border border-border/30 px-1.5 py-0.5 rounded">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground/80">
                          {[...record.remarkTags, record.remarks]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
