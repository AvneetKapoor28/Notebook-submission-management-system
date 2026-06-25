import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/format";

interface OverdueCheckItem {
  topicId: string;
  topicTitle: string;
  classId: string;
  className: string;
  notesGivenOn: string;
  daysPast: number;
}

interface OverdueChecksWidgetProps {
  items: OverdueCheckItem[];
}

export function OverdueChecksWidget({ items }: OverdueChecksWidgetProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-250/70 dark:border-amber-900/30 bg-card shadow-sm transition-all duration-300">
      {/* Premium left highlight bar */}
      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-amber-500 via-orange-500 to-amber-600 rounded-l-xl" />
      
      {/* Header section with distinct amber tint */}
      <div className="bg-amber-50/40 dark:bg-amber-950/20 p-5 pl-7 border-b border-amber-200/40 dark:border-amber-900/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-5.5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-amber-950 dark:text-amber-100 tracking-tight">
                Action Required: Overdue Checks
              </h2>
            </div>
          </div>
          <span className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-200/40 dark:border-amber-850/30 shadow-2xs">
            <Clock className="size-3.5" />
            {items.length} {items.length === 1 ? "Check" : "Checks"} Overdue
          </span>
        </div>
      </div>

      {/* Content section with clean card background */}
      <div className="p-6 pl-8 bg-card">
        <div className="divide-y divide-border/40 dark:divide-border/10">
          {items.map((item) => (
            <div
              key={item.topicId}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="space-y-1.5">
                <div className="flex items-center flex-wrap gap-2.5">
                  <span className="font-sans text-sm md:text-base font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.topicTitle}
                  </span>
                  <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border border-neutral-200/40 dark:border-neutral-700/50">
                    {item.className}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-250/20 px-2 py-0.5 rounded dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
                    {item.daysPast} days overdue
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Notes given on {formatDate(item.notesGivenOn)}
                </div>
              </div>

              <Link
                href={`/classes/${item.classId}/topics/${item.topicId}/checks/new`}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-neutral-100 hover:bg-indigo-50 dark:bg-neutral-800 dark:hover:bg-indigo-950/20 px-4 py-2 rounded-lg border border-border hover:border-indigo-200/60 dark:hover:border-indigo-900/40 transition-all shrink-0 self-start sm:self-auto cursor-pointer shadow-2xs"
              >
                <span>Start Check</span>
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
