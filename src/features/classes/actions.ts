"use server";

import { revalidatePath } from "next/cache";

import { db, schema } from "@/db";
import { requireCurrentTeacher } from "@/lib/current-teacher";
import { fromValidationError, successResult } from "@/lib/server-action";

import { classFormSchema, type ClassFormValues } from "./schemas";

export async function createClassAction(values: ClassFormValues) {
  const parsed = classFormSchema.safeParse(values);

  if (!parsed.success) {
    return fromValidationError(parsed.error);
  }

  const teacher = await requireCurrentTeacher();

  await db.insert(schema.classes).values({
    teacherId: teacher.id,
    name: parsed.data.name,
  });

  revalidatePath("/classes");
  revalidatePath("/dashboard");

  return successResult("Class created.");
}
