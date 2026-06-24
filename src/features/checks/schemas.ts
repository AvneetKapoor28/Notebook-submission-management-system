import { z } from "zod";

import {
  COMPLETION_STATUSES,
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

export const notebookCheckFormSchema = z.object({
  topicId: z.string().uuid(),
  checkDate: z.string().min(1, "Check date is required."),
  records: z
    .array(notebookCheckRecordSchema)
    .min(1, "At least one student is required."),
});

export type NotebookCheckFormValues = z.infer<typeof notebookCheckFormSchema>;
