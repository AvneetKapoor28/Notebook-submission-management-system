import "server-only";

import { eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { requireCurrentTeacher } from "@/lib/current-teacher";

import { summarizeAttentionRecords } from "@/features/defaulters/logic";

export async function getDashboardData() {
  const teacher = await requireCurrentTeacher();
  const classes = await db.query.classes.findMany({
    where: eq(schema.classes.teacherId, teacher.id),
    with: {
      students: true,
      topics: {
        with: {
          notebookCheck: {
            with: {
              studentRecords: true,
            },
          },
        },
      },
    },
  });

  const allStudents = classes.flatMap((classItem) => classItem.students);
  const allChecks = classes.flatMap((classItem) =>
    classItem.topics
      .map((topic) =>
        topic.notebookCheck
          ? {
              ...topic.notebookCheck,
              topicTitle: topic.title,
              classId: classItem.id,
              className: classItem.name,
              studentRecords: topic.notebookCheck.studentRecords,
            }
          : null,
      )
      .filter((check): check is NonNullable<typeof check> => check !== null),
  );

  const recentChecks = allChecks
    .sort((left, right) => right.checkDate.localeCompare(left.checkDate))
    .slice(0, 5);

  const attentionRecords = allChecks.flatMap((check) =>
    check.studentRecords.map((record) => {
      const student = allStudents.find((item) => item.id === record.studentId);

      return student
        ? {
            studentId: student.id,
            studentName: student.name,
            classId: student.classId,
            className: classes.find((classItem) => classItem.id === student.classId)
              ?.name ?? "Class",
            submissionStatus: record.submissionStatus,
            completionStatus: record.completionStatus,
          }
        : null;
    }),
  );

  const defaulters = summarizeAttentionRecords(
    attentionRecords.filter((record) => record !== null),
  );

  const lateSubmitters = defaulters
    .filter((student) => student.lateCount > 0)
    .sort((left, right) => right.lateCount - left.lateCount)
    .slice(0, 5);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(todayStr + "T00:00:00Z");

  const overduePendingChecks = classes.flatMap((classItem) =>
    classItem.topics
      .filter((topic) => {
        if (topic.notebookCheck) return false;

        const givenDate = new Date(topic.notesGivenOn + "T00:00:00Z");
        const diffTime = todayDate.getTime() - givenDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 3;
      })
      .map((topic) => {
        const givenDate = new Date(topic.notesGivenOn + "T00:00:00Z");
        const diffTime = todayDate.getTime() - givenDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          topicId: topic.id,
          topicTitle: topic.title,
          classId: classItem.id,
          className: classItem.name,
          notesGivenOn: topic.notesGivenOn,
          daysPast: diffDays,
        };
      })
  ).sort((left, right) => right.daysPast - left.daysPast);

  return {
    teacherName: teacher.name,
    totalClasses: classes.length,
    totalStudents: allStudents.length,
    recentChecks,
    attentionStudents: defaulters.slice(0, 5),
    lateSubmitters,
    defaulterSummary: {
      total: defaulters.length,
      missing: defaulters.filter((student) => student.missingCount > 0).length,
    },
    overduePendingChecks,
  };
}
