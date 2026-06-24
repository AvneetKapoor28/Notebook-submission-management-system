import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border border-transparent shadow-none",
  {
    variants: {
      variant: {
        neutral: "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
        green: "bg-green-50 text-green-800 border-green-200/40 dark:bg-green-950/20 dark:text-green-300",
        yellow: "bg-amber-50 text-amber-800 border-amber-200/40 dark:bg-amber-950/20 dark:text-amber-300",
        orange: "bg-orange-50 text-orange-800 border-orange-200/40 dark:bg-orange-950/20 dark:text-orange-300",
        red: "bg-rose-50 text-rose-800 border-rose-200/40 dark:bg-rose-950/20 dark:text-rose-300",
        blue: "bg-sky-50 text-sky-800 border-sky-200/40 dark:bg-sky-950/20 dark:text-sky-300",
        gray: "bg-gray-100 text-gray-700 border-gray-200/40 dark:bg-gray-800/40 dark:text-gray-300",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
