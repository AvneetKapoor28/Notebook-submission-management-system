import { z } from "zod";

export const studentFormSchema = z.object({
  classId: z.string().uuid(),
  rollNumber: z.coerce
    .number()
    .int("Roll number must be a whole number.")
    .positive("Roll number must be positive."),
  name: z.string().trim().min(2, "Student name is required."),
});

export const csvStudentRowSchema = z.object({
  rollNumber: z.coerce
    .number()
    .int("Roll number must be a whole number.")
    .positive("Roll number must be positive."),
  name: z.string().trim().min(2, "Student name is required."),
});

export const studentImportSchema = z.object({
  classId: z.string().uuid(),
  rows: z.array(csvStudentRowSchema).min(1, "Add at least one CSV row."),
});

export const studentStatusSchema = z.object({
  studentId: z.string().uuid(),
  isActive: z.boolean(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
export type StudentFormInput = z.input<typeof studentFormSchema>;
export type StudentImportValues = z.infer<typeof studentImportSchema>;
