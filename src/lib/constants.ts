export const APP_NAME = "Notebook Flow";

export const DEFAULT_DEFAULTER_THRESHOLDS = {
  missing: 3,
  late: 3,
  incomplete: 3,
} as const;

export const REMARK_TAGS = [
  "Diagram Missing",
  "Homework Incomplete",
  "Corrections Pending",
  "Notebook Not Brought",
  "Untidy Work",
] as const;


export const SUBMISSION_STATUSES = [
  "SUBMITTED",
  "NOT_SUBMITTED",
  "LATE_SUBMISSION",
  "ABSENT",
] as const;

export const COMPLETION_STATUSES = [
  "COMPLETE",
  "INCOMPLETE",
  "NOT_DONE",
] as const;

export const SUBMISSION_STATUS_LABELS: Record<
  (typeof SUBMISSION_STATUSES)[number],
  string
 > = {
  SUBMITTED: "Submitted",
  NOT_SUBMITTED: "Not Submitted",
  LATE_SUBMISSION: "Late Submission",
  ABSENT: "Absent",
};

export const COMPLETION_STATUS_LABELS: Record<
  (typeof COMPLETION_STATUSES)[number],
  string
> = {
  COMPLETE: "Complete",
  INCOMPLETE: "Incomplete",
  NOT_DONE: "Not Done",
};

export const SUBMISSION_STATUS_SHORTCUTS: Record<
  (typeof SUBMISSION_STATUSES)[number],
  string
> = {
  SUBMITTED: "1",
  NOT_SUBMITTED: "2",
  LATE_SUBMISSION: "3",
  ABSENT: "4",
};

export const COMPLETION_STATUS_SHORTCUTS: Record<
  (typeof COMPLETION_STATUSES)[number],
  string
> = {
  COMPLETE: "Q",
  INCOMPLETE: "W",
  NOT_DONE: "E",
};

export const SUBMISSION_STATUS_TONE: Record<
  (typeof SUBMISSION_STATUSES)[number],
  "green" | "yellow" | "red" | "gray"
> = {
  SUBMITTED: "green",
  NOT_SUBMITTED: "red",
  LATE_SUBMISSION: "yellow",
  ABSENT: "gray",
};

export const COMPLETION_STATUS_TONE: Record<
  (typeof COMPLETION_STATUSES)[number],
  "green" | "orange" | "red"
> = {
  COMPLETE: "green",
  INCOMPLETE: "orange",
  NOT_DONE: "red",
};
