import "server-only";

import { and, eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { requireCurrentTeacher } from "@/lib/current-teacher";

function calculateCompletionRate(
  records: Array<{ completionStatus: string | null }>,
) {
  const eligible = records.filter((record) => record.completionStatus !== null);

  if (!eligible.length) {
    return null;
  }

  const completed = eligible.filter(
    (record) => record.completionStatus === "COMPLETE",
  ).length;

  return (completed / eligible.length) * 100;
}

export async function listClassesOverview() {
  const teacher = await requireCurrentTeacher();
  const classes = await db.query.classes.findMany({
    where: eq(schema.classes.teacherId, teacher.id),
    orderBy: (table, { asc }) => [asc(table.name)],
    with: {
      students: true,
      topics: {
        with: {
          notebookCheck: true,
        },
      },
    },
  });

  return classes.map((classItem) => {
    const activeStudents = classItem.students.filter((student) => student.isActive);
    const topicsWithChecks = classItem.topics
      .filter((topic) => topic.notebookCheck !== null)
      .sort((left, right) => {
        const leftDate = left.notebookCheck?.checkDate ?? "";
        const rightDate = right.notebookCheck?.checkDate ?? "";
        return rightDate.localeCompare(leftDate);
      });

    const latestTopic = topicsWithChecks[0] ?? null;

    return {
      ...classItem,
      studentCount: classItem.students.length,
      activeStudentCount: activeStudents.length,
      topicCount: classItem.topics.length,
      latestCheckDate: latestTopic?.notebookCheck?.checkDate ?? null,
      latestCheckTopicName: latestTopic?.title ?? null,
    };
  });
}

export async function getClassDetail(classId: string) {
  const teacher = await requireCurrentTeacher();
  const classItem = await db.query.classes.findFirst({
    where: and(
      eq(schema.classes.id, classId),
      eq(schema.classes.teacherId, teacher.id),
    ),
    with: {
      students: {
        orderBy: (table, { asc }) => [asc(table.rollNumber)],
        with: {
          checkRecords: true,
        },
      },
      topics: {
        orderBy: (table, { desc: orderDesc }) => [orderDesc(table.dateTaught)],
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

  if (!classItem) {
    return null;
  }

  const topics = classItem.topics.map((topic) => {
    const lastCheck = topic.notebookCheck ?? null;

    return {
      ...topic,
      lastCheckDate: lastCheck?.checkDate ?? null,
      completionRate: lastCheck
        ? calculateCompletionRate(lastCheck.studentRecords)
        : null,
      checkCount: lastCheck ? 1 : 0,
    };
  });

  const students = classItem.students.map((student) => {
    const missedSubmissionsCount = student.checkRecords.filter(
      (r) =>
        r.submissionStatus === "NOT_SUBMITTED" ||
        r.submissionStatus === "ABSENT",
    ).length;

    const incompleteSubmissionsCount = student.checkRecords.filter(
      (r) =>
        r.completionStatus === "INCOMPLETE" ||
        r.completionStatus === "NOT_DONE",
    ).length;

    return {
      id: student.id,
      rollNumber: student.rollNumber,
      name: student.name,
      isActive: student.isActive,
      missedSubmissionsCount,
      incompleteSubmissionsCount,
    };
  });

  return {
    ...classItem,
    students,
    activeStudents: students.filter((student) => student.isActive),
    inactiveStudents: students.filter((student) => !student.isActive),
    topics,
  };
}

export async function requireClass(classId: string) {
  const classItem = await getClassDetail(classId);

  if (!classItem) {
    throw new Error("Class not found.");
  }

  return classItem;
}
