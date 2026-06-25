import "server-only";

import { eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { requireCurrentTeacher } from "@/lib/current-teacher";

export async function getNotebookCheckSetup(topicId: string) {
  const teacher = await requireCurrentTeacher();
  const topic = await db.query.topics.findFirst({
    where: eq(schema.topics.id, topicId),
    with: {
      class: {
        with: {
          students: {
            where: eq(schema.students.isActive, true),
            orderBy: (table, { asc }) => [asc(table.rollNumber)],
          },
        },
      },
      notebookCheck: {
        with: {
          studentRecords: true,
        },
      },
    },
  });

  if (!topic || topic.class.teacherId !== teacher.id) {
    return null;
  }

  return {
    topic,
    students: topic.class.students,
  };
}

export async function getNotebookCheckDetail(checkId: string) {
  const teacher = await requireCurrentTeacher();
  const check = await db.query.notebookChecks.findFirst({
    where: eq(schema.notebookChecks.id, checkId),
    with: {
      topic: {
        with: {
          class: true,
        },
      },

      studentRecords: {
        with: {
          student: true,
        },
        orderBy: (table, { asc }) => [asc(table.studentId)],
      },
    },
  });

  if (!check || check.topic.class.teacherId !== teacher.id) {
    return null;
  }

  const orderedRecords = [...check.studentRecords].sort(
    (left, right) => left.student.rollNumber - right.student.rollNumber,
  );

  return {
    ...check,
    studentRecords: orderedRecords,
  };
}
