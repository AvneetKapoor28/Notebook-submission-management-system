"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { getCurrentTeacher } from "@/lib/current-teacher";
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

  const teacher = await getCurrentTeacher();
  const topic = await db.query.topics.findFirst({
    where: eq(schema.topics.id, parsed.data.topicId),
    with: {
      class: true,
    },
  });

  if (!topic || topic.class.teacherId !== teacher.id) {
    return failureResult("Topic not found.");
  }

  if (parsed.data.checkType === "CORRECTION_CHECK" && parsed.data.sourceCheckId) {
    const sourceCheck = await db.query.notebookChecks.findFirst({
      where: and(
        eq(schema.notebookChecks.id, parsed.data.sourceCheckId),
        eq(schema.notebookChecks.topicId, topic.id),
      ),
    });

    if (!sourceCheck) {
      return failureResult("Linked source check was not found.");
    }
  }

  const result = await db.transaction(async (tx) => {
    const [check] = await tx
      .insert(schema.notebookChecks)
      .values({
        topicId: parsed.data.topicId,
        checkType: parsed.data.checkType,
        checkDate: parsed.data.checkDate,
        sourceCheckId:
          parsed.data.checkType === "CORRECTION_CHECK"
            ? parsed.data.sourceCheckId
            : null,
      })
      .returning();

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

  return successResult("Notebook check saved.", {
    checkId: result.id,
    topicId: topic.id,
    classId: topic.classId,
  });
}
