import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function PageHeader({
  eyebrow,
  breadcrumbs,
  title,
  description,
  actions,
  emoji,
}: {
  eyebrow?: string;
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  actions?: ReactNode;
  emoji?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-border/40 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="max-w-3xl space-y-2">
        {/* Notion-style Breadcrumbs */}
        {(breadcrumbs || eyebrow) && (
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground/80 font-medium select-none">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Workspace
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/45" />
            {breadcrumbs ? (
              breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  {item.href ? (
                    <Link href={item.href} className="hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="size-3 text-muted-foreground/45" />
                  )}
                </div>
              ))
            ) : (
              <span>{eyebrow}</span>
            )}
          </nav>
        )}

        {/* Large Notion-style Page Emoji */}
        {emoji && (
          <div className="text-4xl select-none pt-2 pb-1">
            {emoji}
          </div>
        )}

        {/* Page Title */}
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex flex-wrap gap-2 md:self-end">
          {actions}
        </div>
      )}
    </div>
  );
}
