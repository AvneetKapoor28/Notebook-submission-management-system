import { z } from "zod";

export const topicFormSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().trim().min(2, "Topic name is required."),
  notesGivenOn: z.string().min(1, "Notes Given on is required."),
});

export type TopicFormValues = z.infer<typeof topicFormSchema>;
