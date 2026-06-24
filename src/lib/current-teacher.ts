import "server-only";

import { eq } from "drizzle-orm";

import { db, schema } from "@/db";

const DEFAULT_TEACHER = {
  name: "Aditi Sharma",
  email: "teacher@notebookflow.local",
};

export async function getCurrentTeacher() {
  const existing = await db.query.teachers.findFirst({
    where: eq(schema.teachers.email, DEFAULT_TEACHER.email),
  });

  if (existing) {
    return existing;
  }

  const [teacher] = await db
    .insert(schema.teachers)
    .values(DEFAULT_TEACHER)
    .returning();

  return teacher;
}
