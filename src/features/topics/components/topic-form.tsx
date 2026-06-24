"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BookOpen, Calendar, Plus } from "lucide-react";

import { FormMessage } from "@/components/app/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTopicAction } from "@/features/topics/actions";
import {
  topicFormSchema,
  type TopicFormValues,
} from "@/features/topics/schemas";
import { ChapterSelect } from "./chapter-select";

export function TopicForm({
  classId,
  existingChapters = [],
}: {
  classId: string;
  existingChapters?: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      classId,
      chapter: "",
      title: "",
      dateTaught: new Date().toISOString().slice(0, 10),
    },
  });

  const chapterValue = watch("chapter");

  React.useEffect(() => {
    register("chapter");
  }, [register]);

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await createTopicAction(values);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      reset({
        classId,
        chapter: "",
        title: "",
        dateTaught: new Date().toISOString().slice(0, 10),
      });
      router.refresh();
    });
  });

  return (
    <form className="grid gap-4 sm:grid-cols-12" onSubmit={onSubmit}>
      <input type="hidden" value={classId} {...register("classId")} />
      
      {/* Chapter (Dropdown / Combobox) */}
      <div className="space-y-1.5 sm:col-span-3">
        <Label htmlFor="topic-chapter" className="text-xs font-semibold text-muted-foreground/90">
          Chapter
        </Label>
        <ChapterSelect
          id="topic-chapter"
          existingChapters={existingChapters}
          value={chapterValue}
          onChange={(val) => setValue("chapter", val, { shouldValidate: true })}
          placeholder="Select or type chapter..."
        />
        <FormMessage message={errors.chapter?.message} />
      </div>

      {/* Topic Title */}
      <div className="space-y-1.5 sm:col-span-4">
        <Label htmlFor="topic-title" className="text-xs font-semibold text-muted-foreground/90">
          Topic Title / Lesson Name
        </Label>
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
          <Input
            id="topic-title"
            placeholder="e.g. Photosynthesis, Trigonometry"
            className="pl-9 h-10 shadow-sm border-border/80 focus:border-primary/50"
            {...register("title")}
          />
        </div>
        <FormMessage message={errors.title?.message} />
      </div>

      {/* Date Taught */}
      <div className="space-y-1.5 sm:col-span-3">
        <Label htmlFor="date-taught" className="text-xs font-semibold text-muted-foreground/90">
          Date Taught
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 pointer-events-none" />
          <Input
            id="date-taught"
            type="date"
            className="pl-9 h-10 shadow-sm border-border/80 focus:border-primary/50 w-full"
            {...register("dateTaught")}
          />
        </div>
        <FormMessage message={errors.dateTaught?.message} />
      </div>

      {/* Submit Button */}
      <div className="sm:col-span-2 flex items-end">
        <Button
          disabled={isPending}
          type="submit"
          className="w-full h-10 gap-2 cursor-pointer shadow-sm"
        >
          {isPending ? (
            <span className="size-3.5 animate-spin border-2 border-primary-foreground border-t-transparent rounded-full" />
          ) : (
            <Plus className="size-4" />
          )}
          <span>{isPending ? "Adding..." : "Add Topic"}</span>
        </Button>
      </div>
    </form>
  );
}

