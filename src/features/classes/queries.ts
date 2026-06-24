import "server-only";

import { and, eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { getCurrentTeacher } from "@/lib/current-teacher";

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
  const teacher = await getCurrentTeacher();
  const classes = await db.query.classes.findMany({
    where: eq(schema.classes.teacherId, teacher.id),
    orderBy: (table, { asc }) => [asc(table.name)],
    with: {
      students: true,
      topics: {
        with: {
          notebookChecks: {
            orderBy: (table, { desc: orderDesc }) => [
              orderDesc(table.checkDate),
            ],
          },
        },
      },
    },
  });

  return classes.map((classItem) => {
    const activeStudents = classItem.students.filter((student) => student.isActive);
    const latestCheck = classItem.topics
      .flatMap((topic) => topic.notebookChecks)
      .sort((left, right) =>
        right.checkDate.localeCompare(left.checkDate),
      )[0];

    return {
      ...classItem,
      studentCount: classItem.students.length,
      activeStudentCount: activeStudents.length,
      topicCount: classItem.topics.length,
      latestCheckDate: latestCheck?.checkDate ?? null,
    };
  });
}

export async function getClassDetail(classId: string) {
  const teacher = await getCurrentTeacher();
  const classItem = await db.query.classes.findFirst({
    where: and(
      eq(schema.classes.id, classId),
      eq(schema.classes.teacherId, teacher.id),
    ),
    with: {
      students: {
        orderBy: (table, { asc }) => [asc(table.rollNumber)],
      },
      topics: {
        orderBy: (table, { desc: orderDesc }) => [orderDesc(table.dateTaught)],
        with: {
          notebookChecks: {
            orderBy: (table, { desc: orderDesc }) => [
              orderDesc(table.checkDate),
            ],
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
    const lastCheck = topic.notebookChecks[0] ?? null;

    return {
      ...topic,
      lastCheckDate: lastCheck?.checkDate ?? null,
      completionRate: lastCheck
        ? calculateCompletionRate(lastCheck.studentRecords)
        : null,
      checkCount: topic.notebookChecks.length,
    };
  });

  return {
    ...classItem,
    activeStudents: classItem.students.filter((student) => student.isActive),
    inactiveStudents: classItem.students.filter((student) => !student.isActive),
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
