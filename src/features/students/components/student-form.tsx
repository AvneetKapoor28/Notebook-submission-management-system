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
import { createStudentAction } from "@/features/students/actions";
import {
  studentFormSchema,
  type StudentFormInput,
  type StudentFormValues,
} from "@/features/students/schemas";

export function StudentForm({ classId }: { classId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormInput, unknown, StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      classId,
      rollNumber: 1,
      name: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await createStudentAction(values);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      reset({ classId, rollNumber: values.rollNumber + 1, name: "" });
      router.refresh();
    });
  });

  return (
    <form className="grid gap-4 sm:grid-cols-3" onSubmit={onSubmit}>
      <input type="hidden" value={classId} {...register("classId")} />
      <div className="space-y-2">
        <Label htmlFor="roll-number">Roll number</Label>
        <Input id="roll-number" type="number" min={1} {...register("rollNumber")} />
        <FormMessage message={errors.rollNumber?.message} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="student-name">Student name</Label>
        <Input id="student-name" placeholder="Student name" {...register("name")} />
        <FormMessage message={errors.name?.message} />
      </div>
      <div className="sm:col-span-3">
        <Button disabled={isPending} type="submit">
          {isPending ? "Saving..." : "Add student"}
        </Button>
      </div>
    </form>
  );
}
