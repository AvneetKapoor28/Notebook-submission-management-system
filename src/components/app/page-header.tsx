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
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="max-w-3xl flex flex-col gap-1.5">
        {/* Notion-style Breadcrumbs */}
        {(breadcrumbs || eyebrow) && (
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground/80 font-medium select-none mb-1">
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
          <div className="text-4xl select-none mt-1 mb-1.5 leading-none">
            {emoji}
          </div>
        )}

        {/* Page Title */}
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground/85">
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex flex-wrap gap-2 sm:self-start pt-1.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
