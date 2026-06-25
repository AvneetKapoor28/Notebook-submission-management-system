import "server-only";

import { eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { getSession } from "@/lib/session";

export async function getCurrentTeacher() {
  const session = await getSession();
  if (!session) return null;

  const teacher = await db.query.teachers.findFirst({
    where: eq(schema.teachers.id, session.teacherId),
  });

  return teacher ?? null;
}

/** Use this in server actions and queries that require authentication. Throws if not authenticated. */
export async function requireCurrentTeacher() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    throw new Error("Not authenticated.");
  }
  return teacher;
}
