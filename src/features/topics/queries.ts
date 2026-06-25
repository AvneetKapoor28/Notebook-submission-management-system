import "server-only";

import { and, eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { requireCurrentTeacher } from "@/lib/current-teacher";

export async function getTopicDetail(topicId: string) {
  const teacher = await requireCurrentTeacher();
  const topic = await db.query.topics.findFirst({
    where: eq(schema.topics.id, topicId),
    with: {
      class: true,
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

  return topic;
}

export async function getTopicByClass(classId: string, topicId: string) {
  const teacher = await requireCurrentTeacher();
  const topic = await db.query.topics.findFirst({
    where: and(eq(schema.topics.id, topicId), eq(schema.topics.classId, classId)),
    with: {
      class: true,
      notebookCheck: {
        with: {
          studentRecords: {
            with: {
              student: true,
            },
          },
        },
      },
    },
  });

  if (!topic || topic.class.teacherId !== teacher.id) {
    return null;
  }

  return topic;
}
