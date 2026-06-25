"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";

import { db, schema } from "@/db";
import { requireCurrentTeacher } from "@/lib/current-teacher";
import {
  failureResult,
  fromValidationError,
  successResult,
} from "@/lib/server-action";

import {
  studentFormSchema,
  studentImportSchema,
  studentStatusSchema,
  type StudentFormValues,
  type StudentImportValues,
} from "./schemas";

export async function createStudentAction(values: StudentFormValues) {
  const parsed = studentFormSchema.safeParse(values);

  if (!parsed.success) {
    return fromValidationError(parsed.error);
  }

  const teacher = await requireCurrentTeacher();
  const ownedClass = await db.query.classes.findFirst({
    where: and(
      eq(schema.classes.id, parsed.data.classId),
      eq(schema.classes.teacherId, teacher.id),
    ),
  });

  if (!ownedClass) {
    return failureResult("Class not found.");
  }

  await db.insert(schema.students).values(parsed.data);

  revalidatePath(`/classes/${parsed.data.classId}`);
  revalidatePath("/classes");
  revalidatePath("/dashboard");

  return successResult("Student added.");
}

export async function importStudentsAction(values: StudentImportValues) {
  const parsed = studentImportSchema.safeParse(values);

  if (!parsed.success) {
    return fromValidationError(parsed.error);
  }

  const teacher = await requireCurrentTeacher();
  const ownedClass = await db.query.classes.findFirst({
    where: and(
      eq(schema.classes.id, parsed.data.classId),
      eq(schema.classes.teacherId, teacher.id),
    ),
  });

  if (!ownedClass) {
    return failureResult("Class not found.");
  }

  const rollNumbers = parsed.data.rows.map((row) => row.rollNumber);
  const existing = await db.query.students.findMany({
    where: and(
      eq(schema.students.classId, parsed.data.classId),
      inArray(schema.students.rollNumber, rollNumbers),
    ),
  });

  if (existing.length) {
    return failureResult(
      `Duplicate roll numbers in class: ${existing
        .map((student) => student.rollNumber)
        .join(", ")}.`,
    );
  }

  const duplicateRollNumber = parsed.data.rows.find(
    (row, index, rows) =>
      rows.findIndex((candidate) => candidate.rollNumber === row.rollNumber) !==
      index,
  );

  if (duplicateRollNumber) {
    return failureResult(
      `CSV contains duplicate roll number ${duplicateRollNumber.rollNumber}.`,
    );
  }

  await db.insert(schema.students).values(
    parsed.data.rows.map((row) => ({
      classId: parsed.data.classId,
      rollNumber: row.rollNumber,
      name: row.name,
    })),
  );

  revalidatePath(`/classes/${parsed.data.classId}`);
  revalidatePath("/classes");
  revalidatePath("/dashboard");

  return successResult(`${parsed.data.rows.length} students imported.`);
}

export async function updateStudentActiveStateAction(values: {
  studentId: string;
  isActive: boolean;
}) {
  const parsed = studentStatusSchema.safeParse(values);

  if (!parsed.success) {
    return fromValidationError(parsed.error);
  }

  const teacher = await requireCurrentTeacher();
  const student = await db.query.students.findFirst({
    where: eq(schema.students.id, parsed.data.studentId),
    with: {
      class: true,
    },
  });

  if (!student || student.class.teacherId !== teacher.id) {
    return failureResult("Student not found.");
  }

  await db
    .update(schema.students)
    .set({ isActive: parsed.data.isActive })
    .where(eq(schema.students.id, parsed.data.studentId));

  revalidatePath(`/classes/${student.classId}`);
  revalidatePath(`/students/${student.id}`);
  revalidatePath("/defaulters");

  return successResult(
    parsed.data.isActive ? "Student activated." : "Student marked inactive.",
  );
}
