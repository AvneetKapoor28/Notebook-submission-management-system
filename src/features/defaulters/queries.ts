import "server-only";

import { eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { getCurrentTeacher } from "@/lib/current-teacher";

import { summarizeAttentionRecords } from "./logic";

export async function getDefaultersData() {
  const teacher = await getCurrentTeacher();
  const classes = await db.query.classes.findMany({
    where: eq(schema.classes.teacherId, teacher.id),
    with: {
      students: true,
    },
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  const records = await db.query.studentCheckRecords.findMany({
    with: {
      student: {
        with: {
          class: true,
        },
      },
    },
  });

  const filteredRecords = records.filter(
    (record) =>
      record.student.isActive && record.student.class.teacherId === teacher.id,
  );

  return {
    classes: classes.map((classItem) => ({
      id: classItem.id,
      name: classItem.name,
    })),
    defaulters: summarizeAttentionRecords(
      filteredRecords.map((record) => ({
        studentId: record.studentId,
        studentName: record.student.name,
        classId: record.student.classId,
        className: record.student.class.name,
        submissionStatus: record.submissionStatus,
        completionStatus: record.completionStatus,
      })),
    ),
  };
}
