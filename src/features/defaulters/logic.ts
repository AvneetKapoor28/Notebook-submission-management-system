import { DEFAULT_DEFAULTER_THRESHOLDS } from "@/lib/constants";

type AttentionRecord = {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  submissionStatus: string;
  completionStatus: string | null;
};

export type StudentAttentionSummary = {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  missingCount: number;
  lateCount: number;
  incompleteCount: number;
  score: number;
  reasons: string[];
};

export function summarizeAttentionRecords(records: AttentionRecord[]) {
  const map = new Map<string, StudentAttentionSummary>();

  for (const record of records) {
    const existing =
      map.get(record.studentId) ??
      ({
        studentId: record.studentId,
        studentName: record.studentName,
        classId: record.classId,
        className: record.className,
        missingCount: 0,
        lateCount: 0,
        incompleteCount: 0,
        score: 0,
        reasons: [],
      } satisfies StudentAttentionSummary);

    if (record.submissionStatus === "NOT_SUBMITTED") {
      existing.missingCount += 1;
    }

    if (record.submissionStatus === "LATE_SUBMISSION") {
      existing.lateCount += 1;
    }

    if (
      record.completionStatus === "INCOMPLETE" ||
      record.completionStatus === "NOT_DONE"
    ) {
      existing.incompleteCount += 1;
    }

    map.set(record.studentId, existing);
  }

  return Array.from(map.values())
    .map((summary) => {
      const reasons: string[] = [];

      if (summary.missingCount >= DEFAULT_DEFAULTER_THRESHOLDS.missing) {
        reasons.push(`${summary.missingCount} missing submissions`);
      }

      if (summary.lateCount >= DEFAULT_DEFAULTER_THRESHOLDS.late) {
        reasons.push(`${summary.lateCount} late submissions`);
      }

      if (summary.incompleteCount >= DEFAULT_DEFAULTER_THRESHOLDS.incomplete) {
        reasons.push(`${summary.incompleteCount} incomplete checks`);
      }

      return {
        ...summary,
        score:
          summary.missingCount * 3 +
          summary.lateCount * 2 +
          summary.incompleteCount * 2,
        reasons,
      };
    })
    .filter((summary) => summary.reasons.length > 0)
    .sort((left, right) => right.score - left.score);
}
