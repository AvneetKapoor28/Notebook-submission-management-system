"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateStudentActiveStateAction } from "@/features/students/actions";

export function StudentStatusToggle({
  studentId,
  isActive,
}: {
  studentId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await updateStudentActiveStateAction({
            studentId,
            isActive: !isActive,
          });

          if (!result.ok) {
            toast.error(result.message);
            return;
          }

          toast.success(result.message);
          router.refresh();
        })
      }
      size="sm"
      type="button"
      variant={isActive ? "outline" : "default"}
    >
      {isPending ? "Saving..." : isActive ? "Mark inactive" : "Reactivate"}
    </Button>
  );
}
