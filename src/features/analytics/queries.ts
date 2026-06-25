import "server-only";

import { eq } from "drizzle-orm";

import { db, schema } from "@/db";
import { requireCurrentTeacher } from "@/lib/current-teacher";

export async function getAnalyticsData() {
  const teacher = await requireCurrentTeacher();
  const classes = await db.query.classes.findMany({
    where: eq(schema.classes.teacherId, teacher.id),
    with: {
      students: true,
      topics: {
        with: {
          notebookCheck: {
            with: {
              studentRecords: true,
            },
          },
        },
      },
    },
  });

  // ── Global KPIs ────────────────────────────────────────────────────────────
  const allRecords = classes.flatMap((c) =>
    c.topics.flatMap((t) => (t.notebookCheck ? t.notebookCheck.studentRecords : [])),
  );

  const totalRecords = allRecords.length;
  const totalSubmitted = allRecords.filter((r) => r.submissionStatus === "SUBMITTED").length;
  const totalLate = allRecords.filter((r) => r.submissionStatus === "LATE_SUBMISSION").length;
  const totalAbsent = allRecords.filter((r) => r.submissionStatus === "ABSENT").length;
  const totalMissing = allRecords.filter((r) => r.submissionStatus === "NOT_SUBMITTED").length;
  const completionEligible = allRecords.filter((r) => r.completionStatus !== null);
  const totalComplete = completionEligible.filter((r) => r.completionStatus === "COMPLETE").length;
  const totalIncomplete = completionEligible.filter(
    (r) => r.completionStatus === "INCOMPLETE" || r.completionStatus === "NOT_DONE",
  ).length;

  const kpis = {
    totalChecks: classes.flatMap((c) => c.topics.filter((t) => t.notebookCheck)).length,
    totalStudents: classes.flatMap((c) => c.students).length,
    submissionRate: totalRecords ? Math.round((totalSubmitted / totalRecords) * 100) : 0,
    completionRate: completionEligible.length
      ? Math.round((totalComplete / completionEligible.length) * 100)
      : 0,
  };

  // ── Submission status distribution (pie/donut data) ─────────────────────
  const submissionDistribution = [
    { name: "Submitted", value: totalSubmitted, color: "#22c55e" },
    { name: "Late", value: totalLate, color: "#f59e0b" },
    { name: "Missing", value: totalMissing, color: "#ef4444" },
    { name: "Absent", value: totalAbsent, color: "#94a3b8" },
  ].filter((item) => item.value > 0);

  // ── Completion status distribution ──────────────────────────────────────
  const notDone = completionEligible.filter((r) => r.completionStatus === "NOT_DONE").length;
  const incomplete = completionEligible.filter((r) => r.completionStatus === "INCOMPLETE").length;

  const completionDistribution = [
    { name: "Complete", value: totalComplete, color: "#22c55e" },
    { name: "Incomplete", value: incomplete, color: "#f59e0b" },
    { name: "Not Done", value: notDone, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  // ── Per-class performance ───────────────────────────────────────────────
  const classSeries = classes.map((classItem) => {
    const records = classItem.topics.flatMap((t) =>
      t.notebookCheck ? t.notebookCheck.studentRecords : [],
    );
    const submitted = records.filter((r) => r.submissionStatus === "SUBMITTED").length;
    const late = records.filter((r) => r.submissionStatus === "LATE_SUBMISSION").length;
    const missing = records.filter((r) => r.submissionStatus === "NOT_SUBMITTED").length;
    const eligible = records.filter((r) => r.completionStatus !== null);
    const complete = eligible.filter((r) => r.completionStatus === "COMPLETE").length;

    return {
      name: classItem.name,
      submissionRate: records.length ? Math.round((submitted / records.length) * 100) : 0,
      completionRate: eligible.length ? Math.round((complete / eligible.length) * 100) : 0,
      topicCount: classItem.topics.length,
      checkedTopics: classItem.topics.filter((t) => t.notebookCheck).length,
      studentCount: classItem.students.length,
      totalRecords: records.length,
      submitted,
      late,
      missing,
    };
  });

  // ── Most problematic topics ──────────────────────────────────────────────
  const topicProblemMap = new Map<
    string,
    { name: string; issueCount: number; className: string; totalRecords: number }
  >();

  for (const classItem of classes) {
    for (const topic of classItem.topics) {
      const records = topic.notebookCheck ? topic.notebookCheck.studentRecords : [];
      const issueCount = records.filter(
        (r) =>
          r.submissionStatus === "NOT_SUBMITTED" ||
          r.submissionStatus === "LATE_SUBMISSION" ||
          r.completionStatus === "NOT_DONE" ||
          r.completionStatus === "INCOMPLETE",
      ).length;

      topicProblemMap.set(topic.id, {
        name: topic.title,
        issueCount,
        className: classItem.name,
        totalRecords: records.length,
      });
    }
  }

  const problematicTopics = Array.from(topicProblemMap.values())
    .filter((t) => t.issueCount > 0)
    .sort((a, b) => b.issueCount - a.issueCount)
    .slice(0, 7);

  return {
    kpis,
    classSeries,
    submissionDistribution,
    completionDistribution,
    problematicTopics,
  };
}
