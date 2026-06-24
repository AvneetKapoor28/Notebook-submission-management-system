import "server-only";

import { eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { getCurrentTeacher } from "@/lib/current-teacher";

import { summarizeAttentionRecords } from "@/features/defaulters/logic";

export async function getDashboardData() {
  const teacher = await getCurrentTeacher();
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

  const pendingCorrections = allChecks.filter((check) => {
    return check.studentRecords.some(
      (record) => record.completionStatus === "NEEDS_CORRECTION",
    );
  });

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

  return {
    totalClasses: classes.length,
    totalStudents: allStudents.length,
    recentChecks,
    pendingCorrections,
    attentionStudents: defaulters.slice(0, 5),
    lateSubmitters,
    defaulterSummary: {
      total: defaulters.length,
      missing: defaulters.filter((student) => student.missingCount > 0).length,
      corrections: defaulters.filter((student) => student.correctionCount > 0)
        .length,
    },
  };
}
