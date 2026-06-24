import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { CreateClassDialog } from "@/features/classes/components/create-class-dialog";
import { listClassesOverview } from "@/features/classes/queries";
import { formatShortDate } from "@/lib/format";

export default async function ClassesPage() {
  const classes = await listClassesOverview();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        emoji="🏫"
        title="Classes"
        description="Create teaching groups, monitor roster size, and jump into the day’s work from one place."
        actions={<CreateClassDialog />}
      />

      <section className="grid gap-6 md:grid-cols-2">
        {classes.map((classItem) => (
          <Link
            key={classItem.id}
            href={`/classes/${classItem.id}`}
            className="group block"
          >
            <Card className="h-full border border-border/80 bg-card p-6 transition-all duration-300 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 relative overflow-hidden flex flex-col justify-between">
              {/* Subtle top-right glow decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                    {classItem.name}
                  </h3>
                </div>

                <div className="h-px bg-border/60 w-full" />

                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 block">
                    Last Notebook Check
                  </span>
                  {classItem.latestCheckTopicName ? (
                    <div>
                      <p className="text-sm font-medium text-foreground truncate">
                        {classItem.latestCheckTopicName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Checked on {formatShortDate(classItem.latestCheckDate)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted-foreground/60">
                      No notebook checks recorded yet
                    </p>
                  )}
                </div>
              </div>

              {/* Action indicator at bottom */}
              <div className="mt-6 flex items-center justify-end text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                <span>Open workspace</span>
                <span className="ml-1 text-[10px]">→</span>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
