"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { requireCurrentTeacher } from "@/lib/current-teacher";
import {
  failureResult,
  fromValidationError,
  successResult,
} from "@/lib/server-action";

import { topicFormSchema, type TopicFormValues } from "./schemas";

export async function createTopicAction(values: TopicFormValues) {
  const parsed = topicFormSchema.safeParse(values);

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

  await db.insert(schema.topics).values(parsed.data);

  revalidatePath(`/classes/${parsed.data.classId}`);
  revalidatePath("/dashboard");

  return successResult("Topic created.");
}
