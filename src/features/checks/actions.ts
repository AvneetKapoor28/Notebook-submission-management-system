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

import {
  notebookCheckFormSchema,
  type NotebookCheckFormValues,
} from "./schemas";

export async function createNotebookCheckAction(values: NotebookCheckFormValues) {
  const parsed = notebookCheckFormSchema.safeParse(values);

  if (!parsed.success) {
    return fromValidationError(parsed.error);
  }

  const teacher = await requireCurrentTeacher();
  const topic = await db.query.topics.findFirst({
    where: eq(schema.topics.id, parsed.data.topicId),
    with: {
      class: true,
    },
  });

  if (!topic || topic.class.teacherId !== teacher.id) {
    return failureResult("Topic not found.");
  }

  const existingCheck = await db.query.notebookChecks.findFirst({
    where: eq(schema.notebookChecks.topicId, parsed.data.topicId),
  });
  const isUpdate = !!existingCheck;

  const result = await db.transaction(async (tx) => {
    let check;
    if (isUpdate && existingCheck) {
      [check] = await tx
        .update(schema.notebookChecks)
        .set({
          checkDate: parsed.data.checkDate,
        })
        .where(eq(schema.notebookChecks.id, existingCheck.id))
        .returning();

      await tx
        .delete(schema.studentCheckRecords)
        .where(eq(schema.studentCheckRecords.notebookCheckId, existingCheck.id));
    } else {
      [check] = await tx
        .insert(schema.notebookChecks)
        .values({
          topicId: parsed.data.topicId,
          checkDate: parsed.data.checkDate,
        })
        .returning();
    }

    await tx.insert(schema.studentCheckRecords).values(
      parsed.data.records.map((record) => ({
        notebookCheckId: check.id,
        studentId: record.studentId,
        submissionStatus: record.submissionStatus,
        completionStatus: record.completionStatus,
        remarkTags: record.remarkTags,
        remarks: record.remarks,
      })),
    );

    return check;
  });

  revalidatePath("/dashboard");
  revalidatePath(`/classes/${topic.classId}`);
  revalidatePath(`/classes/${topic.classId}/topics/${topic.id}`);
  revalidatePath("/defaulters");
  revalidatePath("/analytics");

  return successResult(
    isUpdate ? "Notebook check updated." : "Notebook check saved.",
    {
      checkId: result.id,
      topicId: topic.id,
      classId: topic.classId,
    },
  );
}
