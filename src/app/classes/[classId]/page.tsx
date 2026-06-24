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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Class workspace"
        title={classItem.name}
        description={`Academic year ${classItem.academicYear}. Manage the roster, create topics, and start checks without leaving the workflow.`}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              Prefer deactivation over deletion so historical checks stay intact.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <StudentForm classId={classItem.id} />
            <StudentImportForm classId={classItem.id} />
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

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Create topic</CardTitle>
            <CardDescription>
              Add the lesson and make it immediately available for a notebook check.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopicForm classId={classItem.id} />
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle>Topics</CardTitle>
          <CardDescription>
            Each row shows whether the topic was already checked and how the latest check went.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Chapter</TableHead>
                  <TableHead>Date taught</TableHead>
                  <TableHead>Last checked</TableHead>
                  <TableHead>Completion rate</TableHead>
                  <TableHead>Checks</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classItem.topics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium">{topic.title}</TableCell>
                    <TableCell>{topic.chapter}</TableCell>
                    <TableCell>{formatShortDate(topic.dateTaught)}</TableCell>
                    <TableCell>{formatShortDate(topic.lastCheckDate)}</TableCell>
                    <TableCell>{formatPercent(topic.completionRate)}</TableCell>
                    <TableCell>
                      <Badge variant="neutral">{topic.checkCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm">
                          <Link href={`/classes/${classItem.id}/topics/${topic.id}`}>
                            Open topic
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/classes/${classItem.id}/topics/${topic.id}/checks/new`}
                          >
                            Start check
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
