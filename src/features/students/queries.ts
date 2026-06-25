import "server-only";

import { and, eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { requireCurrentTeacher } from "@/lib/current-teacher";

export async function getStudentProfile(studentId: string) {
  const teacher = await requireCurrentTeacher();
  const student = await db.query.students.findFirst({
    where: eq(schema.students.id, studentId),
    with: {
      class: true,
      checkRecords: {
        with: {
          notebookCheck: {
            with: {
              topic: true,
            },
          },
        },
      },
    },
  });

  if (!student || student.class.teacherId !== teacher.id) {
    return null;
  }

  const timeline = student.checkRecords
    .map((record) => ({
      id: record.id,
      checkDate: record.notebookCheck.checkDate,
      topic: record.notebookCheck.topic.title,
      chapter: record.notebookCheck.topic.chapter,
      submissionStatus: record.submissionStatus,
      completionStatus: record.completionStatus,
      remarks: record.remarks,
      remarkTags: record.remarkTags,
    }))
    .sort((left, right) => right.checkDate.localeCompare(left.checkDate));

  const total = timeline.length || 1;
  const submittedCount = timeline.filter(
    (record) => record.submissionStatus === "SUBMITTED",
  ).length;
  const lateCount = timeline.filter(
    (record) => record.submissionStatus === "LATE_SUBMISSION",
  ).length;
  const completionEligible = timeline.filter(
    (record) => record.completionStatus !== null,
  );
  const completedCount = completionEligible.filter(
    (record) => record.completionStatus === "COMPLETE",
  ).length;

  return {
    ...student,
    timeline,
    submissionRate: (submittedCount / total) * 100,
    completionRate: completionEligible.length
      ? (completedCount / completionEligible.length) * 100
      : 0,
    lateCount,
  };
}

export async function listStudentsForClass(classId: string) {
  const teacher = await requireCurrentTeacher();

  return db.query.students.findMany({
    where: and(
      eq(schema.students.classId, classId),
      eq(schema.classes.teacherId, teacher.id),
    ),
    orderBy: (table, { asc }) => [asc(table.rollNumber)],
    with: {
      class: true,
    },
  });
}
