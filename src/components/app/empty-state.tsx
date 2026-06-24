import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="border-dashed border-border/80 bg-neutral-50/20 shadow-none">
      <CardHeader className="p-5">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">{description}</CardDescription>
      </CardHeader>
      {actionHref && actionLabel ? (
        <CardContent className="px-5 pb-5 pt-0">
          <Button asChild size="sm" variant="outline">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
