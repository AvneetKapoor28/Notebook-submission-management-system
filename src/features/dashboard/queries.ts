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
          notebookChecks: {
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
    classItem.topics.flatMap((topic) =>
      topic.notebookChecks.map((check) => ({
        ...check,
        topicTitle: topic.title,
        classId: classItem.id,
        className: classItem.name,
        studentRecords: check.studentRecords,
      })),
    ),
  );

  const recentChecks = allChecks
    .sort((left, right) => right.checkDate.localeCompare(left.checkDate))
    .slice(0, 5);

  const pendingCorrections = allChecks.filter((check) => {
    const hasNeedsCorrection = check.studentRecords.some(
      (record) => record.completionStatus === "NEEDS_CORRECTION",
    );
    if (!hasNeedsCorrection) return false;

    const topicChecks = allChecks.filter((c) => c.topicId === check.topicId);
    const isLatest = topicChecks.every((c) => {
      if (c.id === check.id) return true;
      if (c.checkDate > check.checkDate) return false;
      if (c.checkDate < check.checkDate) return true;
      return c.createdAt.getTime() <= check.createdAt.getTime();
    });

    return isLatest;
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
