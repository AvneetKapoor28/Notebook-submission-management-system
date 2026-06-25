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

export function TopicForm({
  classId,
}: {
  classId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      classId,
      title: "",
      notesGivenOn: new Date().toISOString().slice(0, 10),
    },
  });

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
        title: "",
        notesGivenOn: new Date().toISOString().slice(0, 10),
      });
      router.refresh();
    });
  });

  return (
    <form className="grid gap-4 sm:grid-cols-12" onSubmit={onSubmit}>
      <input type="hidden" value={classId} {...register("classId")} />

      {/* Topic Title */}
      <div className="space-y-1.5 sm:col-span-7">
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

      {/* Notes Given on */}
      <div className="space-y-1.5 sm:col-span-3">
        <Label htmlFor="notes-given-on" className="text-xs font-semibold text-muted-foreground/90">
          Notes Given on
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 pointer-events-none" />
          <Input
            id="notes-given-on"
            type="date"
            className="pl-9 h-10 shadow-sm border-border/80 focus:border-primary/50 w-full"
            {...register("notesGivenOn")}
          />
        </div>
        <FormMessage message={errors.notesGivenOn?.message} />
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

