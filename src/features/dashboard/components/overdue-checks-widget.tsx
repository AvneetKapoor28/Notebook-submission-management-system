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
    <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-amber-500/[0.03] dark:border-amber-900/30 dark:bg-amber-950/[0.08] shadow-xs transition-all duration-300">
      {/* Premium left highlight bar */}
      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-amber-500 via-orange-500 to-amber-600 rounded-l-xl" />
      
      <div className="p-5 pl-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200/50 dark:border-amber-900/20">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-4.5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                Action Required: Overdue Checks
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {items.length === 1
                  ? "A notebook check is pending for a topic taught more than 3 days ago."
                  : `${items.length} notebook checks are pending for topics taught more than 3 days ago.`}
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-amber-150 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 px-2.5 py-1 rounded-md border border-amber-200/40 dark:border-amber-900/30">
            <Clock className="size-3" />
            {items.length} {items.length === 1 ? "Check" : "Checks"} Overdue
          </span>
        </div>

        <div className="mt-4 divide-y divide-amber-200/20 dark:divide-amber-900/10">
          {items.map((item) => (
            <div
              key={item.topicId}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-semibold text-xs md:text-sm text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {item.topicTitle}
                  </span>
                  <span className="inline-block text-[10px] font-medium px-2 py-0.2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border border-neutral-200/40 dark:border-neutral-700/50">
                    {item.className}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Notes given on {formatDate(item.notesGivenOn)}</span>
                  <span>•</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-450">
                    {item.daysPast} days ago
                  </span>
                </div>
              </div>

              <Link
                href={`/classes/${item.classId}/topics/${item.topicId}/checks/new`}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 bg-amber-100/50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 px-3 py-1.5 rounded-md border border-amber-200/30 dark:border-amber-900/20 transition-all shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>Start Check</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
