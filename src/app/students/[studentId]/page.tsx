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
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        breadcrumbs={[
          { label: "Classes", href: "/classes" },
          { label: student.class.name, href: `/classes/${student.class.id}` },
          { label: "Students" },
          { label: student.name }
        ]}
        emoji="👤"
        title={`${student.rollNumber}. ${student.name}`}
        description={
          student.isActive
            ? "Active student roster member"
            : "Inactive student. Historical records are preserved."
        }
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Submission rate" value={formatPercent(student.submissionRate)} />
        <MetricCard label="Completion rate" value={formatPercent(student.completionRate)} />
        <MetricCard label="Late count" value={student.lateCount} />
      </section>

      <Card className="shadow-none border-border/60 bg-card rounded-2xl overflow-hidden">
        <CardHeader className="p-5 border-b border-border/40">
          <CardTitle className="text-base font-semibold">Timeline Journal</CardTitle>
          <CardDescription className="text-xs text-muted-foreground/80">
            Every notebook check for this student in chronological order.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
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
                    <TableCell className="text-xs font-mono text-muted-foreground/70">
                      {formatShortDate(record.checkDate)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-foreground">{record.topic}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{record.chapter}</p>
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
                    <TableCell className="text-xs text-muted-foreground/80 leading-relaxed font-sans">
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
