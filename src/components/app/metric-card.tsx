import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="border border-border/50 bg-card/40 shadow-none">
      <CardContent className="flex items-start justify-between pt-5 px-5 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{label}</p>
          <p className="mt-2.5 font-heading text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {detail ? <p className="mt-1.5 text-xs text-muted-foreground">{detail}</p> : null}
        </div>
        {icon ? <div className="text-muted-foreground/75 mt-0.5">{icon}</div> : null}
      </CardContent>
    </Card>
  );
}
