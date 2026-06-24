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
    <div className="space-y-8 animate-in fade-in duration-300">
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
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Submission rate" value={formatPercent(student.submissionRate)} />
        <MetricCard label="Completion rate" value={formatPercent(student.completionRate)} />
        <MetricCard label="Late count" value={student.lateCount} />
        <MetricCard label="Correction count" value={student.correctionCount} />
      </section>

      <Card className="shadow-none border-border/80 bg-card">
        <CardHeader className="p-5">
          <CardTitle className="text-base font-semibold">Timeline Journal</CardTitle>
          <CardDescription className="text-xs">
            Every notebook check for this student in chronological order.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto border-t border-border/40">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50/50">
                  <TableHead className="py-2.5 text-xs font-semibold">Date</TableHead>
                  <TableHead className="py-2.5 text-xs font-semibold">Topic</TableHead>
                  <TableHead className="py-2.5 text-xs font-semibold">Submission</TableHead>
                  <TableHead className="py-2.5 text-xs font-semibold">Completion</TableHead>
                  <TableHead className="py-2.5 text-xs font-semibold">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.timeline.map((record) => (
                  <TableRow key={record.id} className="hover:bg-neutral-50/40">
                    <TableCell className="text-xs text-muted-foreground py-2.5">{formatShortDate(record.checkDate)}</TableCell>
                    <TableCell className="py-2.5">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{record.topic}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{record.chapter}</p>
                      </div>
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
                    <TableCell className="text-xs text-muted-foreground py-2.5 leading-relaxed font-sans">
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
