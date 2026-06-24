import * as React from "react";

import { cn } from "@/lib/utils";

export function Table({
  className,
  ...props
}: React.ComponentProps<"table">) {
  return <table className={cn("w-full caption-bottom text-sm border-collapse", className)} {...props} />;
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b bg-neutral-50/45 dark:bg-muted/10", className)} {...props} />;
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-border/40 transition-colors duration-200 hover:bg-neutral-50/50 dark:hover:bg-muted/20",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-10 px-4 first:pl-6 last:pr-6 text-left align-middle text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3.5 first:pl-6 last:pr-6 align-middle", className)} {...props} />;
}

