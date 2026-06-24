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
import { createClassAction } from "@/features/classes/actions";

import {
  classFormSchema,
  type ClassFormValues,
} from "@/features/classes/schemas";

export function ClassForm({
  onSuccess,
  layout = "dialog",
}: {
  onSuccess?: () => void;
  layout?: "dialog" | "grid";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await createClassAction(values);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      reset({ name: "" });
      onSuccess?.();
      router.refresh();
    });
  });

  if (layout === "grid") {
    return (
      <form className="grid gap-4 sm:grid-cols-[2fr_1fr]" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="class-name">Class name</Label>
          <Input id="class-name" placeholder="Grade 8 - A" {...register("name")} />
          <FormMessage message={errors.name?.message} />
        </div>
        <div className="flex items-end">
          <Button className="w-full" disabled={isPending} type="submit">
            {isPending ? "Saving..." : "Create class"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="class-name">Class name</Label>
        <Input id="class-name" placeholder="Grade 8 - A" {...register("name")} />
        <FormMessage message={errors.name?.message} />
      </div>
      <div className="pt-2">
        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Saving..." : "Create class"}
        </Button>
      </div>
    </form>
  );
}
