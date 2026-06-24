"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormMessage } from "@/components/app/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTopicAction } from "@/features/topics/actions";
import {
  topicFormSchema,
  type TopicFormValues,
} from "@/features/topics/schemas";

export function TopicForm({ classId }: { classId: string }) {
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
      chapter: "",
      title: "",
      dateTaught: new Date().toISOString().slice(0, 10),
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
        chapter: "",
        title: "",
        dateTaught: new Date().toISOString().slice(0, 10),
      });
      router.refresh();
    });
  });

  return (
    <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={onSubmit}>
      <input type="hidden" value={classId} {...register("classId")} />
      <div className="space-y-2">
        <Label htmlFor="topic-chapter">Chapter</Label>
        <Input id="topic-chapter" placeholder="Chapter 4" {...register("chapter")} />
        <FormMessage message={errors.chapter?.message} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="topic-title">Topic</Label>
        <Input
          id="topic-title"
          placeholder="Photosynthesis"
          {...register("title")}
        />
        <FormMessage message={errors.title?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date-taught">Date taught</Label>
        <Input id="date-taught" type="date" {...register("dateTaught")} />
        <FormMessage message={errors.dateTaught?.message} />
      </div>
      <div className="lg:col-span-4">
        <Button disabled={isPending} type="submit">
          {isPending ? "Saving..." : "Create topic"}
        </Button>
      </div>
    </form>
  );
}
