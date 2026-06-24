import Link from "next/link";
import { notFound } from "next/navigation";

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
import { getClassDetail } from "@/features/classes/queries";
import { StudentImportForm } from "@/features/students/components/student-import-form";
import { StudentForm } from "@/features/students/components/student-form";
import { StudentsTable } from "@/features/students/components/students-table";
import { TopicForm } from "@/features/topics/components/topic-form";
import { formatPercent, formatShortDate } from "@/lib/format";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const classItem = await getClassDetail(classId);

  if (!classItem) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        breadcrumbs={[{ label: "Classes", href: "/classes" }, { label: classItem.name }]}
        emoji="🏫"
        title={classItem.name}
        description={`Academic year ${classItem.academicYear}. Manage the roster, create topics, and start checks without leaving the workflow.`}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-none border-border/80 bg-card">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-semibold">Students Roster</CardTitle>
            <CardDescription className="text-xs">
              Prefer deactivation over deletion so historical checks stay intact.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5 pt-0">
            {/* Collapsible Student Forms Container */}
            <details className="group border border-border/70 bg-neutral-50/15 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden mb-2 transition-all duration-150">
              <summary className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-neutral-50/40 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">➕</span>
                  <span className="font-semibold text-xs text-foreground">Add students to roster</span>
                </div>
                <span className="text-[10px] text-muted-foreground/60 transition-transform duration-150 group-open:rotate-180">▼</span>
              </summary>
              <div className="p-4 border-t border-border/40 bg-card space-y-4">
                <StudentForm classId={classItem.id} />
                <hr className="border-border/40" />
                <StudentImportForm classId={classItem.id} />
              </div>
            </details>

            <StudentsTable
              data={classItem.students.map((student) => ({
                id: student.id,
                rollNumber: student.rollNumber,
                name: student.name,
                isActive: student.isActive,
              }))}
            />
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/80 bg-card h-fit">
          <CardHeader className="p-5">
            <CardTitle className="text-base font-semibold">Create topic</CardTitle>
            <CardDescription className="text-xs">
              Add the lesson and make it immediately available for a notebook check.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <TopicForm classId={classItem.id} />
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-none border-border/80 bg-card">
        <CardHeader className="p-5">
          <CardTitle className="text-base font-semibold">Topics Database</CardTitle>
          <CardDescription className="text-xs">
            Each row shows whether the topic was already checked and how the latest check went.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto border-t border-border/40">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50/50">
                  <TableHead className="py-2.5 text-xs font-semibold">Topic</TableHead>
                  <TableHead className="py-2.5 text-xs font-semibold">Chapter</TableHead>
                  <TableHead className="py-2.5 text-xs font-semibold">Date taught</TableHead>
                  <TableHead className="py-2.5 text-xs font-semibold">Last checked</TableHead>
                  <TableHead className="py-2.5 text-xs font-semibold">Completion rate</TableHead>
                  <TableHead className="py-2.5 text-xs font-semibold">Status</TableHead>
                  <TableHead className="py-2.5 text-xs font-semibold text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classItem.topics.map((topic) => (
                  <TableRow key={topic.id} className="hover:bg-neutral-50/40">
                    <TableCell className="font-semibold text-sm py-2.5">{topic.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2.5">{topic.chapter}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2.5">{formatShortDate(topic.dateTaught)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2.5">{formatShortDate(topic.lastCheckDate)}</TableCell>
                    <TableCell className="py-2.5">
                      {topic.completionRate !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/40 shrink-0">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${topic.completionRate}%` }} />
                          </div>
                          <span className="text-xs font-bold text-emerald-800 bg-green-50 border border-green-200/50 px-1 py-0.2 rounded shrink-0">{formatPercent(topic.completionRate)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5">
                      {topic.checkCount > 0 ? (
                        <Badge variant="green">Checked</Badge>
                      ) : (
                        <Badge variant="neutral">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 text-right pr-6">
                      <div className="flex justify-end gap-1.5">
                        <Button asChild size="xs" variant="outline">
                          <Link href={`/classes/${classItem.id}/topics/${topic.id}`}>
                            Open topic
                          </Link>
                        </Button>
                        <Button asChild size="xs" variant={topic.checkCount > 0 ? "outline" : "default"}>
                          <Link
                            href={`/classes/${classItem.id}/topics/${topic.id}/checks/new`}
                          >
                            {topic.checkCount > 0 ? "Edit check" : "Start check"}
                          </Link>
                        </Button>
                      </div>
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
