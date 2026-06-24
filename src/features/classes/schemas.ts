import { z } from "zod";

export const classFormSchema = z.object({
  name: z.string().trim().min(2, "Class name is required."),
});

export type ClassFormValues = z.infer<typeof classFormSchema>;
