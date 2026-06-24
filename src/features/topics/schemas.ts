import { z } from "zod";

export const topicFormSchema = z.object({
  classId: z.string().uuid(),
  chapter: z.string().trim().min(1, "Chapter is required."),
  title: z.string().trim().min(2, "Topic name is required."),
  dateTaught: z.string().min(1, "Date taught is required."),
});

export type TopicFormValues = z.infer<typeof topicFormSchema>;
