import { z } from "zod";

export const classFormSchema = z.object({
  name: z.string().trim().min(2, "Class name is required."),
  academicYear: z
    .string()
    .trim()
    .min(4, "Academic year is required.")
    .max(20, "Academic year is too long."),
});

export type ClassFormValues = z.infer<typeof classFormSchema>;
