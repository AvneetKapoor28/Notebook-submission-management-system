import { notFound } from "next/navigation";

import {
  CompletionStatusBadge,
  SubmissionStatusBadge,
} from "@/components/app/status-badge";
import { MetricCard } from "@/components/app/metric-card";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
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
import { getStudentProfile } from "@/features/students/queries";
import { formatPercent, formatShortDate } from "@/lib/format";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = await getStudentProfile(studentId);

  if (!student) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={student.class.name}
        title={`${student.rollNumber}. ${student.name}`}
        description={
          student.isActive
            ? "Active student"
            : "Inactive student. Historical records are preserved."
        }
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Submission rate" value={formatPercent(student.submissionRate)} />
        <MetricCard label="Completion rate" value={formatPercent(student.completionRate)} />
        <MetricCard label="Late count" value={student.lateCount} />
        <MetricCard label="Correction count" value={student.correctionCount} />
      </section>

      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>
            Every notebook check for this student in chronological order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Submission</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.timeline.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatShortDate(record.checkDate)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.topic}</p>
                        <p className="text-xs text-muted-foreground">{record.chapter}</p>
                      </div>
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
    </div>
  );
}
