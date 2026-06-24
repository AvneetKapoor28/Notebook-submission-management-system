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
    <div className="space-y-8 animate-in fade-in duration-300">
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
        <CardHeader className="p-5">
          <CardTitle className="text-base font-semibold">Notebook check status</CardTitle>
          <CardDescription className="text-xs">
            {lastCheck
              ? "A notebook check has been completed for this topic."
              : "No notebook check has been recorded yet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {lastCheck ? (
            <div className="rounded border border-border/60 bg-card p-3.5 hover:bg-neutral-50/30 transition-colors">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm select-none">📅</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground leading-none">
                      Notebook check completed
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-none">
                      Checked on {formatShortDate(lastCheck.checkDate)} • {lastCheck.studentRecords.length} records
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {lastCompletionRate !== null && (
                    <span className="text-xs font-bold text-emerald-800 bg-green-50 border border-green-200/50 px-1.5 py-0.5 rounded">
                      {formatPercent(lastCompletionRate)} complete
                    </span>
                  )}
                  <Button asChild size="xs" variant="outline" className="mr-1.5">
                    <Link href={`/checks/${lastCheck.id}`}>Open details</Link>
                  </Button>
                  <Button asChild size="xs">
                    <Link href={`/classes/${classId}/topics/${topicId}/checks/new`}>
                      Edit check
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center rounded border border-dashed border-border/60 bg-neutral-50/10">
              <span className="text-3xl mb-2 select-none">📓</span>
              <p className="text-sm font-semibold text-foreground">No checks completed</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Assess submissions and completion to calculate stats for this topic.
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link href={`/classes/${classId}/topics/${topicId}/checks/new`}>
                  Start check
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {lastCheck ? (
        <Card className="shadow-none border-border/80 bg-card">
          <CardHeader className="p-5">
            <CardTitle className="text-base font-semibold">Latest check snapshot</CardTitle>
            <CardDescription className="text-xs">
              Recent outcomes for quick topic-level follow-up.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto border-t border-border/40">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50/50">
                    <TableHead className="py-2.5 text-xs font-semibold">Student</TableHead>
                    <TableHead className="py-2.5 text-xs font-semibold">Submission</TableHead>
                    <TableHead className="py-2.5 text-xs font-semibold">Completion</TableHead>
                    <TableHead className="py-2.5 text-xs font-semibold">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastCheck.studentRecords
                    .sort(
                      (left, right) =>
                        left.student.rollNumber - right.student.rollNumber,
                    )
                    .map((record) => (
                      <TableRow key={record.id} className="hover:bg-neutral-50/40">
                        <TableCell className="font-semibold text-sm py-2.5">
                          {record.student.rollNumber}. {record.student.name}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <SubmissionStatusBadge status={record.submissionStatus} />
                        </TableCell>
                        <TableCell className="py-2.5">
                          {record.completionStatus ? (
                            <CompletionStatusBadge status={record.completionStatus} />
                          ) : (
                            <span className="text-xs font-semibold text-muted-foreground bg-gray-50 border border-gray-200/50 px-1.5 py-0.5 rounded">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-2.5">
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
