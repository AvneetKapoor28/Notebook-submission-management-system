import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted/60 text-foreground",
        green: "border-emerald-200 bg-emerald-50 text-emerald-700",
        yellow: "border-amber-200 bg-amber-50 text-amber-700",
        orange: "border-orange-200 bg-orange-50 text-orange-700",
        red: "border-rose-200 bg-rose-50 text-rose-700",
        blue: "border-sky-200 bg-sky-50 text-sky-700",
        gray: "border-slate-200 bg-slate-100 text-slate-700",
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
