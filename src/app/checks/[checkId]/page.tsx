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
    <div className="space-y-8 animate-in fade-in duration-300">
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
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="shadow-none border-border/80 bg-card/40">
          <CardContent className="flex items-center justify-between pt-5 px-5 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Students checked</p>
              <p className="mt-1 font-heading text-2xl font-bold">{check.studentRecords.length}</p>
            </div>
            <span className="text-xl select-none">📋</span>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none border-border/80 bg-card">
        <CardHeader className="p-5">
          <CardTitle className="text-base font-semibold">Roster outcomes</CardTitle>
          <CardDescription className="text-xs">
            Everything saved in one batch, in roll-number order.
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
                  <TableHead className="py-2.5 text-xs font-semibold">Tags</TableHead>
                  <TableHead className="py-2.5 text-xs font-semibold">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {check.studentRecords.map((record) => (
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
                      {record.remarkTags.join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2.5 font-sans">
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
