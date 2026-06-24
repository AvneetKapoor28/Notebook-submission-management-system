import { z } from "zod";

import {
  COMPLETION_STATUSES,
  NOTEBOOK_CHECK_TYPES,
  REMARK_TAGS,
  SUBMISSION_STATUSES,
} from "@/lib/constants";

export const notebookCheckRecordSchema = z
  .object({
    studentId: z.string().uuid(),
    submissionStatus: z.enum(SUBMISSION_STATUSES),
    completionStatus: z.enum(COMPLETION_STATUSES).nullable(),
    remarkTags: z.array(z.enum(REMARK_TAGS)),
    remarks: z.string().trim().max(240, "Remarks are too long.").nullable(),
  })
  .superRefine((value, context) => {
    if (value.submissionStatus === "ABSENT" && value.completionStatus !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["completionStatus"],
        message: "Absent students must not have a completion status.",
      });
    }

    if (value.submissionStatus !== "ABSENT" && value.completionStatus === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["completionStatus"],
        message: "Completion status is required unless the student is absent.",
      });
    }
  });

export const notebookCheckFormSchema = z
  .object({
    topicId: z.string().uuid(),
    checkType: z.enum(NOTEBOOK_CHECK_TYPES),
    checkDate: z.string().min(1, "Check date is required."),
    sourceCheckId: z.string().uuid().nullable(),
    records: z
      .array(notebookCheckRecordSchema)
      .min(1, "At least one student is required."),
  })
  .superRefine((value, context) => {
    if (value.checkType === "CORRECTION_CHECK" && !value.sourceCheckId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sourceCheckId"],
        message: "Correction checks must link to the earlier check.",
      });
    }

    if (value.checkType === "REGULAR_CHECK" && value.sourceCheckId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sourceCheckId"],
        message: "Regular checks cannot link to an earlier correction.",
      });
    }
  });

export type NotebookCheckFormValues = z.infer<typeof notebookCheckFormSchema>;
