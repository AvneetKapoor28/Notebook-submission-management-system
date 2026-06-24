import "server-only";

import { eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { getCurrentTeacher } from "@/lib/current-teacher";

export async function getAnalyticsData() {
  const teacher = await getCurrentTeacher();
  const classes = await db.query.classes.findMany({
    where: eq(schema.classes.teacherId, teacher.id),
    with: {
      topics: {
        with: {
          notebookChecks: {
            with: {
              studentRecords: true,
            },
          },
        },
      },
    },
  });

  const classSeries = classes.map((classItem) => {
    const records = classItem.topics.flatMap((topic) =>
      topic.notebookChecks.flatMap((check) => check.studentRecords),
    );
    const completionEligible = records.filter(
      (record) => record.completionStatus !== null,
    );
    const completed = completionEligible.filter(
      (record) => record.completionStatus === "COMPLETE",
    ).length;
    const submitted = records.filter(
      (record) => record.submissionStatus === "SUBMITTED",
    ).length;

    return {
      name: classItem.name,
      submissionRate: records.length ? (submitted / records.length) * 100 : 0,
      completionRate: completionEligible.length
        ? (completed / completionEligible.length) * 100
        : 0,
      topicCount: classItem.topics.length,
    };
  });

  const topicProblemMap = new Map<
    string,
    { name: string; issueCount: number; className: string }
  >();

  for (const classItem of classes) {
    for (const topic of classItem.topics) {
      const records = topic.notebookChecks.flatMap((check) => check.studentRecords);
      const issueCount = records.filter(
        (record) =>
          record.submissionStatus === "NOT_SUBMITTED" ||
          record.submissionStatus === "LATE_SUBMISSION" ||
          record.completionStatus === "NOT_DONE" ||
          record.completionStatus === "INCOMPLETE" ||
          record.completionStatus === "NEEDS_CORRECTION",
      ).length;

      topicProblemMap.set(topic.id, {
        name: topic.title,
        issueCount,
        className: classItem.name,
      });
    }
  }

  return {
    classSeries,
    problematicTopics: Array.from(topicProblemMap.values())
      .sort((left, right) => right.issueCount - left.issueCount)
      .slice(0, 6),
  };
}
