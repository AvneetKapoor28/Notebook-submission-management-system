import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CompletionStatusBadge,
  SubmissionStatusBadge,
} from "@/components/app/status-badge";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
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
import { getNotebookCheckDetail } from "@/features/checks/queries";
import { formatShortDate } from "@/lib/format";

export default async function NotebookCheckDetailPage({
  params,
}: {
  params: Promise<{ checkId: string }>;
}) {
  const { checkId } = await params;
  const check = await getNotebookCheckDetail(checkId);

  if (!check) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        breadcrumbs={[
          { label: "Classes", href: "/classes" },
          { label: check.topic.class.name, href: `/classes/${check.topic.class.id}` },
          { label: check.topic.title, href: `/classes/${check.topic.class.id}/topics/${check.topic.id}` },
          { label: `Check ${formatShortDate(check.checkDate)}` }
        ]}
        emoji="📓"
        title={check.topic.title}
        description={`Check recorded on ${formatShortDate(check.checkDate)}.`}
        actions={
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/classes/${check.topic.class.id}/topics/${check.topic.id}`}>
                Back to topic
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/classes/${check.topic.class.id}/topics/${check.topic.id}/checks/new`}>
                Edit check
              </Link>
            </Button>
          </div>
        }
      />

      <Card className="shadow-none border-border/60 bg-card rounded-2xl overflow-hidden">
        <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0 border-b border-border/40">
          <div>
            <CardTitle className="text-base font-semibold">Roster outcomes</CardTitle>
            <CardDescription className="text-xs mt-0.5 text-muted-foreground/80">
              Everything saved in one batch, in roll-number order.
            </CardDescription>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Students Checked</span>
            <span className="text-lg font-bold text-foreground leading-none mt-0.5 block">{check.studentRecords.length}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submission</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {check.studentRecords.map((record) => (
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
                    <TableCell className="text-xs text-muted-foreground/90">
                      {record.remarkTags.join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground/80 font-sans">
                      {record.remarks || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
