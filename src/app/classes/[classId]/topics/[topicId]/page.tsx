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

  const lastCheck = topic.notebookChecks[0];
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
    <div className="space-y-6">
      <PageHeader
        eyebrow={topic.class.name}
        title={topic.title}
        description={`Chapter ${topic.chapter}. Last checked ${formatShortDate(lastCheck?.checkDate ?? null)} with completion rate ${formatPercent(lastCompletionRate)}.`}
        actions={
          <Button asChild>
            <Link href={`/classes/${classId}/topics/${topicId}/checks/new`}>
              Start notebook check
            </Link>
          </Button>
        }
      />

      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle>Check history</CardTitle>
          <CardDescription>
            See exactly when this topic was checked and how that check performed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topic.notebookChecks.map((check) => {
            const eligible = check.studentRecords.filter(
              (record) => record.completionStatus !== null,
            );
            const completed = eligible.filter(
              (record) => record.completionStatus === "COMPLETE",
            ).length;
            const completionRate = eligible.length
              ? (completed / eligible.length) * 100
              : null;

            return (
              <div
                key={check.id}
                className="rounded-3xl border border-border/70 bg-background/80 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">
                      {check.checkType === "REGULAR_CHECK"
                        ? "Regular check"
                        : "Correction check"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatShortDate(check.checkDate)} • {check.studentRecords.length} records
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-emerald-700">
                      {formatPercent(completionRate)} complete
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/checks/${check.id}`}>Open check</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {lastCheck ? (
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Latest check snapshot</CardTitle>
            <CardDescription>
              Recent outcomes for quick topic-level follow-up.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                        <TableCell className="font-medium">
                          {record.student.rollNumber}. {record.student.name}
                        </TableCell>
                        <TableCell>
                          <SubmissionStatusBadge status={record.submissionStatus} />
                        </TableCell>
                        <TableCell>
                          {record.completionStatus ? (
                            <CompletionStatusBadge status={record.completionStatus} />
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
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
