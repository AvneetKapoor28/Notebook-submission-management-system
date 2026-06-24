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
    <div className="space-y-6">
      <PageHeader
        eyebrow={check.topic.class.name}
        title={check.topic.title}
        description={`Check from ${formatShortDate(check.checkDate)}.`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/classes/${check.topic.class.id}/topics/${check.topic.id}`}>
              Back to topic
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="bg-white/90">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Students recorded</p>
            <p className="mt-2 text-3xl font-semibold">{check.studentRecords.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle>Roster outcomes</CardTitle>
          <CardDescription>
            Everything saved in one batch, in roll-number order.
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
                  <TableHead>Tags</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {check.studentRecords.map((record) => (
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
                        <Badge variant="gray">N/A</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.remarkTags.join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
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
